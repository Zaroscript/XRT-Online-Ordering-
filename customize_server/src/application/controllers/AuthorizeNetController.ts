import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { BusinessRepository } from '../../infrastructure/repositories/BusinessRepository';
import { BusinessSettingsRepository } from '../../infrastructure/repositories/BusinessSettingsRepository';

/**
 * Authorize.Net Accept Hosted Controller
 * Handles generation of secure payment tokens for IFrame integration.
 */

// Use require for max compatibility with the SDK
const AuthorizeNet = require('authorizenet');

export class AuthorizeNetController {
  getIframeToken = asyncHandler(async (req: Request, res: Response) => {
    const logPrefix = '💳 [Authorize.Net]';
    
    try {
      const { amount, customer, delivery } = req.body;
      
      console.log(`${logPrefix} Token Request Received for amount: ${amount}`);

      // 1. Validate Request Body
      if (!amount || isNaN(parseFloat(amount))) {
        console.error(`${logPrefix} Validation Error: Invalid or missing amount`);
        return res.status(400).json({ success: false, message: 'Valid amount is required' });
      }

      if (!customer || !customer.email) {
        console.error(`${logPrefix} Validation Error: Customer email missing`);
        return res.status(400).json({ success: false, message: 'Customer email is required' });
      }

      // 2. Fetch Credentials from Database
      console.log(`${logPrefix} Fetching credentials from database...`);
      const businessRepository = new BusinessRepository();
      const settingsRepository = new BusinessSettingsRepository();
      
      const business = await businessRepository.findOne();
      if (!business) {
        console.error(`${logPrefix} Database Error: Business record not found`);
        return res.status(404).json({ success: false, message: 'System configuration error: Business record missing.' });
      }

      const settings = await settingsRepository.findByBusinessId(business.id);
      const loginId = settings?.authorizeNetApiLoginId;
      const transKey = settings?.authorizeNetTransactionKey;
      const env = settings?.authorizeNetEnvironment || 'sandbox';

      // 3. Validate Credentials
      if (!loginId || !transKey) {
        console.error(`${logPrefix} Configuration Error: API Login ID or Transaction Key missing in DB`);
        return res.status(400).json({ success: false, message: 'Authorize.Net is not configured. Please check dashboard settings.' });
      }

      console.log(`${logPrefix} Using Credentials: ${loginId.substring(0, 4)}*** | Env: ${env}`);

      // 4. Setup SDK Objects
      const pkg = AuthorizeNet; 
      const merchantAuth = new pkg.APIContracts.MerchantAuthenticationType();
      merchantAuth.setName(loginId);
      merchantAuth.setTransactionKey(transKey);

      const transRequest = new pkg.APIContracts.TransactionRequestType();
      transRequest.setTransactionType(pkg.APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
      transRequest.setAmount(parseFloat(String(amount)).toFixed(2));

      const custData = new pkg.APIContracts.CustomerDataType();
      custData.setEmail(customer.email);
      transRequest.setCustomer(custData);

      // 5. Domain Logic (Consistently use localhost for local dev)
      const originHeader = req.get('origin');
      const refererHeader = req.get('referer');
      
      let baseSiteUrl = 'https://localhost:5174'; 
      if (originHeader && originHeader !== 'null') {
        baseSiteUrl = originHeader;
      } else if (refererHeader) {
        try { baseSiteUrl = new URL(refererHeader).origin; } catch(e) {}
      }
      
      // Strict enforcement for local dev consistency
      if (baseSiteUrl.includes('127.0.0.1')) {
          baseSiteUrl = baseSiteUrl.replace('127.0.0.1', 'localhost');
      }
      // If it's localhost but http, force https if requested by user (though browser might block it if cert is missing)
      if (baseSiteUrl.includes('localhost') && !baseSiteUrl.startsWith('https')) {
          baseSiteUrl = baseSiteUrl.replace('http://', 'https://');
      }

      const cleanOrigin = baseSiteUrl.replace(/\/$/, '');
      const communicatorUrl = `${cleanOrigin}/communicator.html`;
      
      console.log(`${logPrefix} Communicator URL registered: ${communicatorUrl}`);

      // 6. Set Hosted Page Options
      const settingsArray: any[] = [];
      const addSetting = (name: string, value: any) => {
        const s = new pkg.APIContracts.SettingType();
        s.setSettingName(name);
        s.setSettingValue(JSON.stringify(value));
        settingsArray.push(s);
      };

      addSetting('hostedPaymentButtonOptions', { text: "Pay" });
      addSetting('hostedPaymentOrderOptions', { show: false });
      addSetting('hostedPaymentPaymentOptions', { cardCodeRequired: true, showCreditCard: true });
      addSetting('hostedPaymentIFrameCommunicatorUrl', { url: communicatorUrl });
      addSetting('hostedPaymentReturnOptions', { showReceipt: false });

      const alist = new pkg.APIContracts.ArrayOfSetting();
      alist.setSetting(settingsArray);

      const getRequest = new pkg.APIContracts.GetHostedPaymentPageRequest();
      getRequest.setMerchantAuthentication(merchantAuth);
      getRequest.setTransactionRequest(transRequest);
      getRequest.setHostedPaymentSettings(alist);

      // 7. Determine API Endpoint
      const apiEndpoint = env === 'production' 
        ? 'https://api2.authorize.net/xml/v1/request.api'
        : 'https://apitest.authorize.net/xml/v1/request.api';

      // 8. Token Generation with Timeout
      console.log(`${logPrefix} Contacting Authorize.Net Gateway...`);
      
      const token: string = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Gateway Timeout: Authorize.Net did not respond within 10 seconds.'));
        }, 10000);

        try {
          const ctrl = new pkg.APIControllers.GetHostedPaymentPageController(getRequest.getJSON());
          ctrl.setEnvironment(apiEndpoint);
          
          ctrl.execute(() => {
            clearTimeout(timeout);
            const apiResponse = ctrl.getResponse();
            
            if (!apiResponse) {
              return reject(new Error('No response data received from Authorize.Net.'));
            }

            const response = new pkg.APIContracts.GetHostedPaymentPageResponse(apiResponse);
            const resultMessages = response.getMessages();

            if (resultMessages && resultMessages.getResultCode() === pkg.APIContracts.MessageTypeEnum.OK) {
              console.log(`${logPrefix} ✅ Success: Token generated`);
              resolve(response.getToken());
            } else {
              const errorMsg = (resultMessages && resultMessages.getMessage() && resultMessages.getMessage().length > 0) 
                ? resultMessages.getMessage()[0].getText() 
                : 'Unknown Gateway Error';
              console.error(`${logPrefix} ❌ Gateway Error: ${errorMsg}`);
              reject(new Error(errorMsg));
            }
          });
        } catch (sdkError: any) {
          clearTimeout(timeout);
          console.error(`${logPrefix} 💥 SDK Execution Error:`, sdkError.message);
          reject(sdkError);
        }
      });

      return sendSuccess(res, 'Token generated', { token, environment: env });

    } catch (err: any) {
      console.error(`${logPrefix} 💥 Critical Failure:`, err.message);
      return res.status(500).json({ 
        success: false, 
        message: err.message || 'Payment session failed.',
        details: process.env.NODE_ENV === 'development' ? err.toString() : undefined
      });
    }
  });
}

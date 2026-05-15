import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';
import { getIframeToken } from '../../api/orders';

const AuthorizeNetIframe = ({
  amount,
  customer,
  delivery,
  onSuccess,
  onError
}) => {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeError, setIframeError] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const formRef = useRef(null);
  const hasFiredSuccess = useRef(false);
  
  // We determine the secure hosted form URL dynamically based on the backend environment
  const [actionUrl, setActionUrl] = useState("https://accept.authorize.net/payment/payment");
  const fetchInitiatedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    if (fetchInitiatedRef.current) return;
    fetchInitiatedRef.current = true;
    
    // Fetch the token from our backend
    const fetchToken = async () => {
      try {
        const response = await getIframeToken({ amount, customer, delivery });
        if (isMounted) {
          if (response?.data?.token) {
            setToken(response.data.token);
            if (response.data.environment === 'sandbox') {
              setActionUrl("https://test.authorize.net/payment/payment");
            } else {
              setActionUrl("https://accept.authorize.net/payment/payment");
            }
          } else {
            setIframeError("Failed to initialize secure payment session.");
            onError("Payment initialization failed.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setIframeError(err?.response?.data?.message || "Could not connect to payment gateway.");
          onError("Could not connect to payment gateway.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchToken();
    
    return () => {
      isMounted = false;
    };
  }, [amount, customer, delivery, onError]);

  // Once token is established, submit the hidden form into the iframe only ONCE.
  const hasSubmittedRef = useRef(false);
  useEffect(() => {
    if (token && formRef.current && !hasSubmittedRef.current && !formSubmitted) {
        hasSubmittedRef.current = true;
        formRef.current.submit();
        setFormSubmitted(true);
    }
  }, [token, formSubmitted]);

  // Listen for messages from Authorize.net communicator HTML
  useEffect(() => {
      /**
       * Strictly validated origins for security and CSP compliance.
       * We accept messages ONLY from the payment provider or our own app origin.
       */
      const allowedOrigins = new Set([
          window.location.origin,
          'https://accept.authorize.net',
          'https://test.authorize.net',
      ]);

      const handleMessage = (event) => {
          // 1. Safety first: Skip empty data or messages from untrusted origins
          if (!event.data) return;
          if (event.origin && !allowedOrigins.has(event.origin)) return;
          
          const rawData = event.data;
          let transId = null;
          let response = {};

          // 2. Data Extraction: Handle both modern JSON objects and legacy query strings
          if (typeof rawData === "object") {
              const payload = rawData.payload || rawData.response || rawData;
              transId = payload.transId || payload.transactionId;
              response = payload;
          } 
          else if (typeof rawData === "string") {
              // Ignore background noise from browser extensions or Vite internal signals
              if (!rawData.includes('transactResponse') && !rawData.includes('transId=')) return;

              try {
                  const params = new URLSearchParams(rawData);
                  transId = params.get('transId');
                  const respStr = params.get('response');
                  if (respStr) response = JSON.parse(respStr);
              } catch (e) {
                  return; // Silent fail for malformed signals
              }
          }

          // 3. Prevent duplicate success triggers
          if (transId && transId !== '0') {
              if (hasFiredSuccess.current) return;
              hasFiredSuccess.current = true;

              console.log('✅ [Auth.Net] Transaction Success Confirmed:', transId);
              
              onSuccess({ 
                  token: transId, 
                  method: 'authorize_net_iframe',
                  cardType: response.accountType || response.cardType,
                  last4: response.accountNumber ? response.accountNumber.slice(-4) : undefined
              });
              return;
          }

          // 4. Handle cancellation signal
          if (typeof rawData === 'string' && rawData.includes('cancel')) {
              onError("Payment was cancelled.");
          }
      };

      window.addEventListener('message', handleMessage, false);
      return () => {
          window.removeEventListener('message', handleMessage, false);
      };
  }, [onSuccess, onError]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 font-medium">Securing payment connection...</p>
      </div>
    );
  }

  if (iframeError) {
    return (
      <div className="flex flex-col items-center py-8 text-center px-4">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
          <ShieldCheck size={24} />
        </div>
        <p className="text-sm font-bold text-red-600 uppercase tracking-widest">Connection Failed</p>
        <p className="text-xs text-red-500 mt-1">{iframeError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
        >
            Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-700">
      <div className="w-full flex items-center justify-center gap-2 mb-4">
          <Lock size={16} className="text-green-600" />
          <span className="text-[10px] uppercase tracking-widest font-black text-green-700 font-['Poppins']">Secure Hosted Form</span>
      </div>
      
      {/* Hidden form to POST the token to the iframe */}
      {token && !formSubmitted && (
        <form 
          method="post" 
          action={actionUrl} 
          target="add_payment" 
          ref={formRef}
          className="hidden"
        >
          <input type="hidden" name="token" value={token} />
        </form>
      )}

      {/* The iframe where the Authorize.net secure form will load */}
      <div className="w-full max-w-2xl mx-auto h-[620px] border border-gray-100 rounded-[2rem] overflow-hidden bg-white shadow-xl shadow-gray-200/50 payment-iframe-container">
          <iframe 
            id="add_payment" 
            name="add_payment" 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no"
            title="Secure Payment Form"
            className="w-full h-full overflow-hidden"
          >
              <p className="text-center mt-10 text-gray-500 text-sm">Your browser does not support iframes.</p>
          </iframe>
      </div>
      
      <p className="text-center mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest max-w-sm">
          Payment processing is secured with 256-bit encryption.
      </p>
    </div>
  );
};

export default AuthorizeNetIframe;

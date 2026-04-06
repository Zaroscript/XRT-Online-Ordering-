import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { NmiPayments } from '@nmipayments/nmi-pay-react';
import AuthorizeNetPayment from '../components/payment/AuthorizeNetPayment';
import AuthorizeNetIframe from '../components/payment/AuthorizeNetIframe';
import { useSiteSettingsQuery } from '../api/hooks/useSiteSettings';
import { createOrder } from '../api/orders';
import { useCart } from '../context/CartContext';

// Shared Colors
const COLORS = {
  primary: '#3D6642', 
  primaryLight: '#f1f8e9',
  accent: '#FFA900',
  textPrimary: '#1a1a1a',
  textSecondary: '#666666',
};

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { data: siteSettings, isLoading: isSettingsLoading } = useSiteSettingsQuery();

  // Retrieve the prepared order payload from Checkout.jsx
  const orderPayload = location.state?.orderPayload;
  
  // Apple/Google Pay require a secure context (HTTPS) to initialize without crashing.
  const isSecureContext = window.location.protocol === 'https:';
  const supportedMethods = isSecureContext ? ['card', 'ach', 'apple-pay', 'google-pay'] : ['card', 'ach', "google-pay"];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Protect the route from direct access without an order payload
  if (!orderPayload) {
    return <Navigate to="/checkout" replace />;
  }

  // Handle successful NMI tokenization and dispatch the final order
  const handlePaymentSuccess = async (event) => {
    if (!event || !event.token) {
      setSubmitError("Failed to retrieve payment token. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Inject the token into the payload money object
      // Identify payment type dynamically
      let paymentType = 'nmi';
      if (event.type === 'authorize_net_iframe') {
        paymentType = 'authorize_net_iframe';
      } else if (event.type === 'authorize_net') {
        paymentType = 'authorize_net';
      } else if (event.type === 'nmi') {
        paymentType = 'nmi';
      }

      const finalizedPayload = {
        ...orderPayload,
        authNetMethod: event.method,
        cardDetails: {
           cardType: event.cardType || event.type_name || (event.card && event.card.brand),
           last4: event.last4 || (event.card && event.card.last4)
        },
        money: {
          ...orderPayload.money,
          payment: paymentType,
          paymentToken: event.token
        }
      };

      const result = await createOrder(finalizedPayload);
      const orderNumber = result?.data?.order_number || result?.order_number || '';
      
      // Clear cart on success
      clearCart();
      
      navigate('/order-success', { state: { orderNumber } });

    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to place order. Please try again.';
      setSubmitError(message);
      setIsSubmitting(false);
    }
  };

  if (isSettingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-(--primary)" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 pt-32 pb-20 px-4 md:px-8 font-['Inter']"
      style={{ 
        '--primary': COLORS.primary, 
        '--primary-light': COLORS.primaryLight,
        '--accent': COLORS.accent,
        '--text-primary': COLORS.textPrimary,
        '--text-secondary': COLORS.textSecondary 
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-start">
        {/* Left Column: Summary */}
        <div className="w-full lg:w-5/12 space-y-8 lg:sticky lg:top-32">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-(--text-secondary) hover:text-(--primary) font-black text-[10px] uppercase tracking-widest transition-all mb-4 font-['Poppins']"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Details
          </button>

          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm shadow-gray-200/50 p-8 space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-(--text-primary) tracking-tight font-['Poppins']">Order Summary</h2>
              <div className="h-1 w-12 bg-(--primary) rounded-full" />
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center py-4 border-b border-gray-50">
                 <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Currency</span>
                 <span className="text-sm font-black text-(--text-primary) font-['Poppins']">{orderPayload.money.currency || 'USD'}</span>
              </div>
              
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Amount</span>
                <span className="text-4xl font-black text-(--text-primary) tracking-tighter font-['Poppins']">
                  ${orderPayload.money.total_amount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50">
               <div className="flex items-center gap-4 p-4 bg-(--primary)/5 rounded-2xl border border-(--primary)/10">
                  <div className="w-10 h-10 rounded-xl bg-(--primary) flex items-center justify-center text-white shadow-lg shadow-(--primary)/20">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-(--primary) uppercase tracking-widest font-['Poppins']">PCI Level 1 Compliant</p>
                     <p className="text-[9px] font-medium text-(--primary)/50 uppercase tracking-tighter">Your data is fully encrypted</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Gateway */}
        <div className="w-full lg:w-7/12">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden">
            <div className="p-10 lg:p-12">
              <div className="mb-10">
                <h1 className="text-3xl font-black text-(--text-primary) tracking-tight mb-3 font-['Poppins']">
                  Payment Method
                </h1>
                <p className="text-(--text-secondary) font-medium">
                  Securely process your transaction via our verified partner.
                </p>
              </div>

              {submitError && (
                <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-medium text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {submitError}
                </div>
              )}

              {isSubmitting ? (
                <div className="py-24 flex flex-col items-center justify-center gap-6">
                  <Loader2 size={56} className="animate-spin text-(--primary) opacity-20" />
                  <div className="text-center">
                    <p className="text-xl font-black text-(--text-primary) tracking-tight font-['Poppins']">Processing Payment</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 font-['Inter']">Connecting to secure gateway...</p>
                  </div>
                </div>
              ) : (
                <div className="authorize-net-container">
                  {siteSettings?.authorizeNetPublicKey && siteSettings?.authorizeNetApiLoginId ? (
                    <div className="space-y-6">
                      <div className="flex bg-gray-50 p-4 border border-gray-100 rounded-2xl mb-8 items-center gap-3">
                        <ShieldCheck className="text-(--primary)" size={20} />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest font-['Poppins']">
                          {siteSettings.authorizeNetMode === 'iframe' ? 'Hosted Secure Checkout' : 'Standard Secure Checkout'}
                        </span>
                      </div>

                      {(!siteSettings.authorizeNetMode || siteSettings.authorizeNetMode === 'ui') ? (
                        <AuthorizeNetPayment 
                          clientKey={siteSettings.authorizeNetPublicKey}
                          apiLoginId={siteSettings.authorizeNetApiLoginId}
                          amount={orderPayload.money.total_amount.toFixed(2)}
                          primaryColor={COLORS.primary}
                          onSuccess={(event) => handlePaymentSuccess({ ...event, type: 'authorize_net' })}
                          onError={(errMsg) => setSubmitError(errMsg)}
                        />
                      ) : (
                        <AuthorizeNetIframe
                          amount={orderPayload.money.total_amount.toFixed(2)}
                          customer={orderPayload.customer}
                          delivery={orderPayload.delivery}
                          primaryColor={COLORS.primary}
                          onSuccess={(event) => handlePaymentSuccess({ ...event, type: 'authorize_net_iframe' })}
                          onError={(errMsg) => setSubmitError(errMsg)}
                        />
                      )}
                    </div>
                  ) : siteSettings?.nmiPublicKey ? (
                    <div className="nmi-container [&_button]:w-full [&_button]:py-5 [&_button]:bg-(--primary) [&_button]:text-white [&_button]:font-black [&_button]:uppercase [&_button]:tracking-widest [&_button]:rounded-2xl [&_button]:shadow-xl [&_button]:shadow-(--primary)/20 font-['Poppins']">
                      <NmiPayments
                        tokenizationKey={siteSettings.nmiPublicKey}
                        paymentMethods={supportedMethods}
                        expressCheckoutConfig={{
                          amount: orderPayload.money.total_amount.toString(),
                          currency: orderPayload.money.currency || 'USD',
                          countryCode: 'US'
                        }}
                        appearance={{
                          theme: 'light',
                          radiusSize: 'default',
                          customTheme: {
                            colors: {
                              primary: {
                                default: COLORS.primary,
                                foreground: '#ffffff',
                                100: '#e8f5e9',
                                200: '#c8e6c9'
                              }
                            }
                          }
                        }}
                        onPay={(event) => handlePaymentSuccess({ ...event, type: 'nmi' })}
                      />
                    </div>
                  ) : (
                    <div className="py-12 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                       <p className="text-amber-800 font-black uppercase tracking-widest text-xs">Gateway Configuration Missing</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-12 py-8 bg-gray-50/50 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-center gap-6">
               <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">© 256-bit SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

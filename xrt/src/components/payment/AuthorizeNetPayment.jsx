import React, { useState, useEffect } from 'react';
import { Loader2, CreditCard, Landmark, Smartphone, ShieldCheck } from 'lucide-react';
import { getAuthorizeNetEnv } from '../../api/orders';

const AuthorizeNetPayment = ({ 
  apiLoginId, 
  clientKey, 
  amount, 
  onSuccess, 
  onError,
  primaryColor = '#3D6642' 
}) => {
  const [isAcceptJsLoaded, setIsAcceptJsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'bank', 'apple_pay', 'google_pay'
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cardCode: ''
  });

  const [bankData, setBankData] = useState({
    routingNumber: '',
    accountNumber: '',
    nameOnAccount: '',
    accountType: 'checking' // checking, savings, businessChecking
  });

  useEffect(() => {
    let isMounted = true;
    let scriptElement = null;

    const loadScript = async () => {
      try {
        const response = await getAuthorizeNetEnv();
        if (!isMounted) return;

        const isSandbox = response?.data?.environment === 'sandbox';
        const scriptUrl = isSandbox 
            ? 'https://jstest.authorize.net/v1/Accept.js'
            : 'https://js.authorize.net/v1/Accept.js';
        
        if (document.querySelector(`script[src="${scriptUrl}"]`)) {
          setIsAcceptJsLoaded(true);
          return;
        }

        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        script.onload = () => {
            if (isMounted) setIsAcceptJsLoaded(true);
        };
        script.onerror = () => {
            if (isMounted) onError('Failed to load payment gateway provider.');
        };
        document.body.appendChild(script);
        scriptElement = script;
      } catch (err) {
        if (isMounted) onError('Failed to configure payment environment.');
      }
    };

    loadScript();

    return () => {
      isMounted = false;
      if (!isAcceptJsLoaded && scriptElement && document.body.contains(scriptElement)) {
        document.body.removeChild(scriptElement);
      }
    };
  }, [onError, isAcceptJsLoaded]);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === 'apple_pay' || paymentMethod === 'google_pay') {
        return;
    }

    if (!isAcceptJsLoaded || !window.Accept) {
      onError('Payment gateway is still loading. Please try again in a moment.');
      return;
    }

    setIsProcessing(true);

    const secureData = {
      authData: {
        clientKey: clientKey,
        apiLoginID: apiLoginId
      }
    };

    if (paymentMethod === 'card') {
      secureData.cardData = {
        cardNumber: cardData.cardNumber.replace(/\s/g, ''),
        month: cardData.expMonth,
        year: cardData.expYear,
        cardCode: cardData.cardCode
      };
    } else if (paymentMethod === 'bank') {
      secureData.bankData = {
        accountNumber: bankData.accountNumber,
        routingNumber: bankData.routingNumber,
        nameOnAccount: bankData.nameOnAccount,
        accountType: bankData.accountType
      };
    }

    window.Accept.dispatchData(secureData, responseHandler);
  };

  const responseHandler = (response) => {
    if (response.messages.resultCode === "Error") {
      setIsProcessing(false);
      let errorText = '';
      for (let i = 0; i < response.messages.message.length; i++) {
        errorText += response.messages.message[i].text + " ";
      }
      onError(errorText.trim());
    } else {
      const paymentNonce = response.opaqueData.dataValue;
      onSuccess({ token: paymentNonce, method: paymentMethod });
    }
  };

  if (!isAcceptJsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Loading secure payment gateway...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Payment Method Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'card', label: 'Credit Card', sub: 'Debit or Credit', icon: CreditCard },
          { id: 'bank', label: 'Bank Account', sub: 'Direct ACH', icon: Landmark },
          { id: 'apple_pay', label: 'Apple Pay', sub: 'One-Tap Pay', icon: Smartphone },
          { id: 'google_pay', label: 'Google Pay', sub: 'Pay with Google', icon: Smartphone },
        ].map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => setPaymentMethod(method.id)}
            className={`
              group relative flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all duration-300 text-center
              ${paymentMethod === method.id 
                ? "border-(--primary) bg-(--primary)/5 shadow-lg shadow-(--primary)/10 scale-[1.02]" 
                : "border-gray-100 hover:border-gray-200 hover:bg-gray-50 bg-white shadow-sm"
              }
            `}
          >
            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
              ${paymentMethod === method.id ? "bg-(--primary) text-white shadow-lg shadow-(--primary)/20" : "bg-gray-100 text-gray-400 group-hover:text-(--primary)"}
            `}>
              <method.icon size={24} strokeWidth={paymentMethod === method.id ? 2.5 : 2} />
            </div>
            
            <div className="flex flex-col items-center">
              <span className={`text-[10px] font-black uppercase tracking-widest font-['Poppins'] ${
                paymentMethod === method.id ? "text-(--primary)" : "text-gray-400"
              }`}>
                {method.label}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-tighter mt-0.5 opacity-60 font-['Inter'] ${
                paymentMethod === method.id ? "text-(--primary) opacity-70" : "text-gray-400"
              }`}>
                {method.sub}
              </span>
            </div>

            {paymentMethod === method.id && (
              <div className="absolute top-3 right-3 flex items-center justify-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-(--primary) animate-pulse" />
              </div>
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {(paymentMethod === 'card' || paymentMethod === 'bank') && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {paymentMethod === 'card' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest font-['Poppins'] px-1">Card Number</label>
                    <div className="relative group/input">
                      <input
                        type="text"
                        name="cardNumber"
                        className="w-full px-6 py-5 rounded-2xl border-2 border-gray-100 bg-gray-50/30 focus:bg-white focus:border-(--primary) outline-none transition-all duration-300 text-base font-bold placeholder:text-gray-200 font-['Inter']"
                        placeholder="0000 0000 0000 0000"
                        value={cardData.cardNumber}
                        onChange={handleCardChange}
                        maxLength="19"
                        required
                      />
                      <CreditCard className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within/input:text-(--primary) transition-colors" size={20} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest font-['Poppins'] px-1">Expiry Date</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        name="expMonth"
                        className="w-full px-4 py-5 rounded-2xl border-2 border-gray-100 bg-gray-50/30 focus:bg-white focus:border-(--primary) outline-none transition-all text-center text-base font-bold font-['Inter']"
                        placeholder="MM"
                        maxLength="2"
                        value={cardData.expMonth}
                        onChange={handleCardChange}
                        required
                      />
                      <span className="text-gray-200 font-black">/</span>
                      <input
                        type="text"
                        name="expYear"
                        className="w-full px-4 py-5 rounded-2xl border-2 border-gray-100 bg-gray-50/30 focus:bg-white focus:border-(--primary) outline-none transition-all text-center text-base font-bold font-['Inter']"
                        placeholder="YY"
                        maxLength="2"
                        value={cardData.expYear}
                        onChange={handleCardChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest font-['Poppins'] px-1">CVC Code</label>
                    <input
                      type="text"
                      name="cardCode"
                      className="w-full px-6 py-5 rounded-2xl border-2 border-gray-100 bg-gray-50/30 focus:bg-white focus:border-(--primary) outline-none transition-all text-base font-bold font-['Inter']"
                      placeholder="123"
                      maxLength="4"
                      value={cardData.cardCode}
                      onChange={handleCardChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest font-['Poppins'] px-1">Account Holder</label>
                    <input
                      type="text"
                      name="nameOnAccount"
                      className="w-full px-6 py-5 rounded-2xl border-2 border-gray-100 bg-gray-50/30 focus:bg-white focus:border-(--primary) outline-none transition-all text-base font-bold font-['Inter']"
                      placeholder="Full Name"
                      value={bankData.nameOnAccount}
                      onChange={handleBankChange}
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest font-['Poppins'] px-1">Account Type</label>
                    <div className="relative">
                      <select
                        name="accountType"
                        className="w-full px-6 py-5 rounded-2xl border-2 border-gray-100 bg-gray-50/30 focus:bg-white focus:border-(--primary) outline-none transition-all text-base font-bold appearance-none font-['Inter']"
                        value={bankData.accountType}
                        onChange={handleBankChange}
                        required
                      >
                        <option value="checking">Personal Checking</option>
                        <option value="savings">Personal Savings</option>
                        <option value="businessChecking">Business Checking</option>
                      </select>
                      <Landmark className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={18} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest font-['Poppins'] px-1">Routing Number</label>
                    <input
                      type="text"
                      name="routingNumber"
                      className="w-full px-6 py-5 rounded-2xl border-2 border-gray-100 bg-gray-50/30 focus:bg-white focus:border-(--primary) outline-none transition-all text-base font-bold font-['Inter']"
                      placeholder="000 000 000"
                      maxLength="9"
                      value={bankData.routingNumber}
                      onChange={handleBankChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest font-['Poppins'] px-1">Account Number</label>
                    <input
                      type="text"
                      name="accountNumber"
                      className="w-full px-6 py-5 rounded-2xl border-2 border-gray-100 bg-gray-50/30 focus:bg-white focus:border-(--primary) outline-none transition-all text-base font-bold font-['Inter']"
                      placeholder="000 000 000"
                      value={bankData.accountNumber}
                      onChange={handleBankChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className={`
                w-full py-5 rounded-4xl font-black uppercase tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-3 font-['Poppins'] mt-10
                ${isProcessing 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-(--primary) text-white shadow-xl shadow-(--primary)/10 hover:shadow-2xl hover:shadow-(--primary)/20 hover:-translate-y-0.5 active:translate-y-0"
                }
              `}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  <span>Pay ${amount} Securely</span>
                </>
              )}
            </button>
          </div>
        )}

        {(paymentMethod === 'apple_pay' || paymentMethod === 'google_pay') && (
          <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in duration-700 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
             <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-8 border border-gray-100 shadow-sm relative">
                <Smartphone size={32} className="text-gray-200" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                   <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                </div>
             </div>
              <p className="text-xl font-black text-(--text-primary) tracking-tight font-['Poppins']">Coming Very Soon</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 font-['Inter'] max-w-[280px]">
                Express {paymentMethod === 'apple_pay' ? 'Apple Pay' : 'Google Pay'} integration is being finalized for your security.
              </p>
              <button 
                type="button"
                onClick={() => setPaymentMethod('card')}
                className="mt-8 px-8 py-3 bg-white border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-(--primary) hover:border-(--primary) transition-all font-['Poppins'] shadow-sm"
              >
                Use Credit Card instead
              </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default AuthorizeNetPayment;

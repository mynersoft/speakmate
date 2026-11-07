import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  ArrowRight,
  Receipt,
  Copy,
  Check
} from 'lucide-react';
import { paymentService } from '../services/paymentService';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  item, // { id, title, price_bdt, purpose: 'subscription' | 'course' | 'class', mentorId }
  user,
  onSuccess 
}) {
  const [selectedGateway, setSelectedGateway] = useState('bkash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [step, setStep] = useState('select'); // 'select' | 'instructions' | 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [receiptData, setReceiptData] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const gateways = [
    {
      id: 'bkash',
      name: 'bKash',
      badge: 'Most Popular',
      color: 'bg-pink-600',
      accountNumber: '01700-SPEAKMATE (01700773256)',
      merchantType: 'Merchant / Personal Send Money',
      logo: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&q=80&w=120',
      instruction: 'Go to your bKash app or dial *247# -> Select "Make Payment" or "Send Money" to the number above. Enter your reference and copy the 10-character TrxID.',
    },
    {
      id: 'nagad',
      name: 'Nagad',
      badge: 'Instant',
      color: 'bg-orange-600',
      accountNumber: '01800-SPEAKMATE (01800994321)',
      merchantType: 'Merchant Pay',
      logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=120',
      instruction: 'Go to Nagad app or dial *167# -> Select "Merchant Pay" -> Enter SpeakMate number -> Confirm PIN and enter TrxID below.',
    },
    {
      id: 'rocket',
      name: 'Rocket (DBBL)',
      badge: 'MFS',
      color: 'bg-purple-600',
      accountNumber: '01900-SPEAKMATE-8',
      merchantType: 'Biller Code 8820',
      logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=120',
      instruction: 'Dial *322# or open Rocket app -> Select Payment -> Biller ID 8820 -> Submit transaction ID.',
    },
    {
      id: 'card',
      name: 'Debit / Credit Card',
      badge: 'Visa / Mastercard',
      color: 'bg-blue-600',
      accountNumber: 'Instant Gateway',
      merchantType: 'SSL / Global Gateway',
      logo: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=120',
      instruction: 'Secured with 256-bit encryption. Enter your 16-digit card number, MM/YY, and CVV below for instant authorization.',
    }
  ];

  const currentGateway = gateways.find((g) => g.id === selectedGateway);

  const handleProceedToPayment = () => {
    if (selectedGateway === 'card') {
      // Direct instant card simulation
      setStep('verifying');
      setTimeout(async () => {
        try {
          const res = await paymentService.verifyPayment({
            paymentId: `card_${Date.now()}`,
            transactionId: `CARD-TX-${Date.now().toString().slice(-8)}`,
            phoneNumber: '01700000000',
            fallbackData: {
              purpose: item.purpose,
              itemId: item.id,
              amountBdt: item.price_bdt,
              gateway: 'card',
            }
          });
          setReceiptData(res);
          setStep('success');
          if (onSuccess) onSuccess(res);
        } catch (err) {
          setErrorMessage(err.message || 'Payment failed.');
          setStep('error');
        }
      }, 1500);
      return;
    }

    setStep('instructions');
  };

  const handleVerifyTrx = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setErrorMessage('Please enter the Transaction ID received via SMS/app.');
      return;
    }

    setErrorMessage('');
    setStep('verifying');

    try {
      const initiateRes = await paymentService.initiatePayment({
        userId: user?.id || 'guest',
        purpose: item.purpose || 'subscription',
        itemId: item.id,
        itemTitle: item.title,
        amountBdt: item.price_bdt,
        gateway: selectedGateway,
        phoneNumber,
        mentorId: item.mentorId,
      });

      const verifyRes = await paymentService.verifyPayment({
        paymentId: initiateRes.paymentId,
        transactionId: transactionId.trim(),
        phoneNumber,
        fallbackData: {
          invoiceNumber: initiateRes.invoiceNumber,
          purpose: item.purpose,
          itemId: item.id,
          amountBdt: item.price_bdt,
          gateway: selectedGateway,
        }
      });

      setReceiptData(verifyRes);
      setStep('success');
      if (onSuccess) onSuccess(verifyRes);
    } catch (err) {
      setErrorMessage(err.message || 'Payment verification failed. Please check the TrxID.');
      setStep('instructions');
    }
  };

  const handleCopyAccount = () => {
    if (currentGateway) {
      navigator.clipboard.writeText(currentGateway.accountNumber.split(' ')[0]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              SpeakMate Secure Checkout
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Order Summary Ribbon */}
          <div className="p-4 mb-6 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700 capitalize">
                {item.purpose === 'subscription' ? 'Membership Plan' : item.purpose === 'class' ? 'Live Class Admission' : 'Course Enrollment'}
              </p>
              <h4 className="text-sm font-bold text-slate-900 max-w-[280px] truncate">
                {item.title}
              </h4>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Amount</span>
              <p className="text-lg font-extrabold text-blue-900">
                {item.price_bdt === 0 ? 'FREE' : `৳${item.price_bdt} BDT`}
              </p>
            </div>
          </div>

          {/* STEP 1: SELECT GATEWAY */}
          {step === 'select' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Payment Method
              </label>

              <div className="grid grid-cols-2 gap-3">
                {gateways.map((gw) => (
                  <button
                    key={gw.id}
                    type="button"
                    onClick={() => setSelectedGateway(gw.id)}
                    className={`relative p-3.5 rounded-xl border-2 text-left transition-all ${
                      selectedGateway === gw.id
                        ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-900">{gw.name}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {gw.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{gw.merchantType}</p>
                  </button>
                ))}
              </div>

              {selectedGateway === 'card' && (
                <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">MM / YY</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength="4"
                        placeholder="•••"
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  Proceed with {currentGateway?.name}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: INSTRUCTIONS & TRANSACTION ID ENTRY */}
          {step === 'instructions' && currentGateway && (
            <form onSubmit={handleVerifyTrx} className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {currentGateway.name} Payment Number
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-800"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy Number'}
                  </button>
                </div>
                <div className="font-mono text-base font-bold text-slate-900 bg-white p-2.5 rounded-lg border border-slate-200">
                  {currentGateway.accountNumber}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentGateway.instruction}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your {currentGateway.name} Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction ID (TrxID)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9B3K76F8M1"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono uppercase tracking-wider text-sm font-bold"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Find the TrxID in the confirmation SMS or in your statement.
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="w-1/3 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Verify & Confirm Payment
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: VERIFYING SPINNER */}
          {step === 'verifying' && (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h4 className="font-bold text-slate-900 text-sm">Verifying with Payment Gateway...</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Validating transaction ledger and confirming admission. Please do not close this window.
              </p>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'success' && receiptData && (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Payment Verified!</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Your access has been activated successfully.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice:</span>
                  <span className="font-mono font-bold text-slate-800">{receiptData.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono font-bold text-slate-800">{receiptData.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-bold text-emerald-700">৳{receiptData.amountBdt} BDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span className="font-semibold uppercase text-slate-700">{receiptData.gateway}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
              >
                Access Your Content Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

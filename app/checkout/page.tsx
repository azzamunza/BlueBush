'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/CartContext';
import { formatPrice } from '@/lib/products';
import { ChevronRight, CheckCircle2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [orderNumber] = useState(`BB${Date.now().toString().slice(-6)}`);

  const subtotal = getTotalPrice();
  const shipping = subtotal >= 150 ? 0 : 15;
  const total = subtotal + shipping;

  // Form data
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postcode: '',
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  if (items.length === 0 && currentStep !== 'confirmation') {
    return (
      <main className="min-h-screen bg-white py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-12 text-center">
          <h1 className="text-4xl font-bold text-deep-forest mb-4">Your cart is empty</h1>
          <p className="text-lg text-gray-600 mb-8">Add some items to your cart before checking out</p>
          <a href="/shop" className="inline-block bg-deep-forest text-white px-8 py-4 rounded-full font-medium hover:bg-emerald transition-colors no-underline">
            Continue Shopping
          </a>
        </div>
      </main>
    );
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment processing
    setTimeout(() => {
      clearCart();
      setCurrentStep('confirmation');
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-paperbark py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { key: 'shipping', label: 'Shipping' },
              { key: 'payment', label: 'Payment' },
              { key: 'confirmation', label: 'Confirmation' },
            ].map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      currentStep === step.key
                        ? 'bg-deep-forest text-white'
                        : index < ['shipping', 'payment', 'confirmation'].indexOf(currentStep)
                        ? 'bg-emerald text-white'
                        : 'bg-white text-gray-400'
                    }`}
                  >
                    {index < ['shipping', 'payment', 'confirmation'].indexOf(currentStep) ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="ml-3 font-medium text-deep-forest hidden sm:inline">
                    {step.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className="flex-1 h-1 mx-4 bg-white" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Shipping Step */}
              {currentStep === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-lg p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-deep-forest mb-6">
                    Shipping Information
                  </h2>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-deep-forest mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          required
                          value={shippingData.firstName}
                          onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                          className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-deep-forest mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          required
                          value={shippingData.lastName}
                          onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                          className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-deep-forest mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={shippingData.email}
                        onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-deep-forest mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        required
                        value={shippingData.phone}
                        onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-deep-forest mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        id="address"
                        required
                        value={shippingData.address}
                        onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                        className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-deep-forest mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          id="city"
                          required
                          value={shippingData.city}
                          onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                          className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-deep-forest mb-2">
                          State *
                        </label>
                        <select
                          id="state"
                          required
                          value={shippingData.state}
                          onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                          className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                        >
                          <option value="">Select State</option>
                          <option value="NSW">NSW</option>
                          <option value="VIC">VIC</option>
                          <option value="QLD">QLD</option>
                          <option value="SA">SA</option>
                          <option value="WA">WA</option>
                          <option value="TAS">TAS</option>
                          <option value="NT">NT</option>
                          <option value="ACT">ACT</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="postcode" className="block text-sm font-medium text-deep-forest mb-2">
                        Postcode *
                      </label>
                      <input
                        type="text"
                        id="postcode"
                        required
                        pattern="[0-9]{4}"
                        value={shippingData.postcode}
                        onChange={(e) => setShippingData({ ...shippingData, postcode: e.target.value })}
                        className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-deep-forest text-white py-4 rounded-full font-medium hover:bg-emerald transition-colors flex items-center justify-center gap-2"
                    >
                      Continue to Payment
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-lg p-6 md:p-8"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Lock className="w-5 h-5 text-emerald" />
                    <h2 className="text-2xl font-bold text-deep-forest">
                      Payment Details
                    </h2>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-6">
                    This is a demonstration checkout. No real payment will be processed.
                  </p>

                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-deep-forest mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        required
                        placeholder="4111 1111 1111 1111"
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                        className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="cardName" className="block text-sm font-medium text-deep-forest mb-2">
                        Name on Card *
                      </label>
                      <input
                        type="text"
                        id="cardName"
                        required
                        value={paymentData.cardName}
                        onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                        className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiry" className="block text-sm font-medium text-deep-forest mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          id="expiry"
                          required
                          placeholder="MM/YY"
                          value={paymentData.expiry}
                          onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                          className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-deep-forest mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          required
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                          className="w-full px-4 py-3 border border-soft-sandstone rounded-lg focus:border-emerald focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep('shipping')}
                        className="flex-1 bg-white border-2 border-deep-forest text-deep-forest py-4 rounded-full font-medium hover:bg-paperbark transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-deep-forest text-white py-4 rounded-full font-medium hover:bg-emerald transition-colors flex items-center justify-center gap-2"
                      >
                        Place Order
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Confirmation Step */}
              {currentStep === 'confirmation' && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg p-6 md:p-8 text-center"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald text-white rounded-full mb-6">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-bold text-deep-forest mb-4">
                    Order Confirmed!
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Thank you for your order. Your order number is <strong>#{orderNumber}</strong>
                  </p>
                  <p className="text-gray-600 mb-8">
                    We've sent a confirmation email to {shippingData.email}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => router.push('/shop')}
                      className="bg-deep-forest text-white px-8 py-4 rounded-full font-medium hover:bg-emerald transition-colors"
                    >
                      Continue Shopping
                    </button>
                    <button
                      onClick={() => router.push('/account')}
                      className="bg-white border-2 border-deep-forest text-deep-forest px-8 py-4 rounded-full font-medium hover:bg-paperbark transition-colors"
                    >
                      View Orders
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          {currentStep !== 'confirmation' && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 sticky top-24">
                <h3 className="text-xl font-bold text-deep-forest mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.variant}`} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.name} ({item.variant}) × {item.quantity}
                      </span>
                      <span className="font-medium text-deep-forest">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-soft-sandstone pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-deep-forest">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-deep-forest">
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  {subtotal < 150 && (
                    <p className="text-xs text-gray-500 italic">
                      Spend {formatPrice(150 - subtotal)} more for free shipping
                    </p>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-soft-sandstone">
                    <span className="text-deep-forest">Total</span>
                    <span className="text-deep-forest">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

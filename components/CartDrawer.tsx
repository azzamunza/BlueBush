'use client';

import React from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { formatPrice } from '@/lib/products';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, getTotalPrice, isCartOpen, toggleCart } = useCart();
  const total = getTotalPrice();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/50 z-50"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-soft-sandstone/30">
              <h2 className="text-2xl font-bold text-deep-forest">Your Cart</h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-paperbark rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="w-6 h-6 text-deep-forest" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-soft-sandstone mb-4" />
                  <p className="text-lg text-gray-600 mb-2">Your cart is empty</p>
                  <p className="text-sm text-gray-500">Add some sustainable homewares to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.variant}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex gap-4 p-4 bg-paperbark/30 rounded-lg"
                    >
                      {/* Product Image Placeholder */}
                      <div className="w-20 h-20 bg-soft-sandstone rounded-lg flex-shrink-0 flex items-center justify-center">
                        <span className="text-xs text-gray-500">Image</span>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-deep-forest truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600">{item.variant}</p>
                        <p className="text-sm font-medium text-emerald mt-1">
                          {formatPrice(item.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)}
                            className="p-1 hover:bg-white rounded transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4 text-deep-forest" />
                          </button>
                          <span className="w-8 text-center font-medium text-deep-forest">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}
                            className="p-1 hover:bg-white rounded transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4 text-deep-forest" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id, item.variant)}
                            className="ml-auto text-sm text-red-600 hover:text-red-700 transition-colors underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-soft-sandstone/30 p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium text-deep-forest">Subtotal</span>
                  <span className="font-bold text-deep-forest">{formatPrice(total)}</span>
                </div>

                {/* Checkout Button */}
                <Link href="/checkout" onClick={toggleCart}>
                  <button className="w-full bg-deep-forest text-white py-4 rounded-full font-medium hover:bg-emerald transition-colors">
                    Proceed to Checkout
                  </button>
                </Link>

                <p className="text-xs text-center text-gray-500">
                  Shipping calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

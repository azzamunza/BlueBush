'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Product, formatPrice, getStockStatus } from '@/lib/products';
import { useCart } from '@/lib/CartContext';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

const MAX_VISIBLE_VARIANTS = 4;

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.static_data.variants[0]);
  const { addItem } = useCart();
  const stockStatus = getStockStatus(product.dynamic_data.stock_level);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.dynamic_data.price_aud,
      variant: selectedVariant,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link href={`/product/${product.id}`}>
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
          {/* Product Image Placeholder */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-emerald/20 to-deep-teal/20 flex items-center justify-center">
                  <ShoppingCart className="w-10 h-10 text-emerald/40" />
                </div>
                <span className="text-gray-400 text-sm font-medium">Product Image</span>
              </div>
            </div>
            
            {/* Eco Badge */}
            {product.static_data.eco_badge && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald to-deep-teal text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                🌿 {product.static_data.eco_badge}
              </div>
            )}

            {/* Stock Status */}
            {product.dynamic_data.stock_level <= 15 && (
              <div className={`absolute top-4 right-4 ${stockStatus.color} bg-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
                {stockStatus.text}
              </div>
            )}

            {/* Quick Add Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="absolute bottom-4 right-4 bg-deep-forest text-white p-4 rounded-full shadow-xl hover:bg-emerald transition-all duration-300 opacity-0 group-hover:opacity-100"
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Product Details */}
          <div className="p-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold">
              {product.category}
            </p>
            <h3 className="font-bold text-lg text-deep-forest mb-3 line-clamp-2 group-hover:text-emerald transition-colors leading-tight">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
              {product.content_triage.marketing_hook}
            </p>

            {/* Variants */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {product.static_data.variants.slice(0, MAX_VISIBLE_VARIANTS).map((variant) => (
                <button
                  key={variant}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedVariant(variant);
                  }}
                  className={`px-3 py-1.5 text-xs rounded-full border-2 transition-all duration-200 font-semibold ${
                    selectedVariant === variant
                      ? 'bg-deep-forest text-white border-deep-forest shadow-md'
                      : 'bg-white text-deep-forest border-gray-200 hover:border-emerald hover:bg-emerald/5'
                  }`}
                  aria-label={`Select ${variant} variant`}
                >
                  {variant}
                </button>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-2xl font-bold text-deep-forest">
                {formatPrice(product.dynamic_data.price_aud)}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {product.static_data.origin.split(',')[0]}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

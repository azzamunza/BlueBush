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
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link href={`/product/${product.id}`}>
        <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
          {/* Product Image Placeholder */}
          <div className="relative aspect-square bg-gradient-to-br from-soft-sandstone to-paperbark overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Product Image</span>
            </div>
            
            {/* Eco Badge */}
            {product.static_data.eco_badge && (
              <div className="absolute top-3 left-3 bg-emerald text-white px-3 py-1 rounded-full text-xs font-medium">
                {product.static_data.eco_badge}
              </div>
            )}

            {/* Stock Status */}
            {product.dynamic_data.stock_level <= 15 && (
              <div className={`absolute top-3 right-3 ${stockStatus.color} bg-white px-3 py-1 rounded-full text-xs font-medium shadow-md`}>
                {stockStatus.text}
              </div>
            )}

            {/* Quick Add Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 right-4 bg-deep-forest text-white p-3 rounded-full shadow-lg hover:bg-emerald transition-colors opacity-0 group-hover:opacity-100"
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Product Details */}
          <div className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {product.category}
            </p>
            <h3 className="font-semibold text-deep-forest mb-2 line-clamp-2 group-hover:text-emerald transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.content_triage.marketing_hook}
            </p>

            {/* Variants */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {product.static_data.variants.slice(0, 5).map((variant) => (
                <button
                  key={variant}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedVariant(variant);
                  }}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    selectedVariant === variant
                      ? 'bg-deep-forest text-white border-deep-forest'
                      : 'bg-white text-deep-forest border-soft-sandstone hover:border-emerald'
                  }`}
                  aria-label={`Select ${variant} variant`}
                >
                  {variant}
                </button>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-deep-forest">
                {formatPrice(product.dynamic_data.price_aud)}
              </span>
              <span className="text-xs text-gray-500">
                {product.static_data.origin.split(',')[0]}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

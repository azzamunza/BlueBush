'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/lib/CartContext';
import { formatPrice, getStockStatus, Product } from '@/lib/products';
import { ShoppingCart, Check, Truck, Shield, Leaf } from 'lucide-react';
import Link from 'next/link';

interface ProductDetailClientProps {
  product: Product | undefined;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState(product?.static_data.variants[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  if (!product) {
    return (
      <main className="min-h-screen bg-white py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-12 text-center">
          <h1 className="text-4xl font-bold text-deep-forest mb-4">Product Not Found</h1>
          <p className="text-lg text-gray-600 mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-deep-forest text-white px-8 py-4 rounded-full font-medium hover:bg-emerald transition-colors no-underline"
          >
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  const stockStatus = getStockStatus(product.dynamic_data.stock_level);

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.dynamic_data.price_aud,
        variant: selectedVariant,
      },
      quantity
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  return (
    <main className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-600">
          <Link href="/" className="hover:text-emerald">
            Home
          </Link>
          {' / '}
          <Link href="/shop" className="hover:text-emerald">
            Shop
          </Link>
          {' / '}
          <Link href={`/shop?category=${product.category}`} className="hover:text-emerald">
            {product.category}
          </Link>
          {' / '}
          <span className="text-deep-forest">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="aspect-square bg-gradient-to-br from-soft-sandstone to-paperbark rounded-lg flex items-center justify-center text-gray-400 text-lg">
              Product Image
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-4 gap-4">
              {product.static_data.variants.slice(0, 4).map((variant) => (
                <button
                  key={variant}
                  onClick={() => setSelectedVariant(variant)}
                  className={`aspect-square bg-gradient-to-br from-soft-sandstone to-paperbark rounded-lg flex items-center justify-center text-xs transition-all ${
                    selectedVariant === variant
                      ? 'ring-2 ring-emerald scale-95'
                      : 'hover:scale-95'
                  }`}
                >
                  {variant}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category & Eco Badge */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 uppercase tracking-wide">
                {product.category}
              </span>
              {product.static_data.eco_badge && (
                <span className="bg-emerald text-white px-3 py-1 rounded-full text-xs font-medium">
                  {product.static_data.eco_badge}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-deep-forest">
              {product.name}
            </h1>

            {/* Price & Stock */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-deep-forest">
                {formatPrice(product.dynamic_data.price_aud)}
              </span>
              <span className={`text-sm font-medium ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
            </div>

            {/* Marketing Hook */}
            <p className="text-lg text-gray-700 leading-relaxed">
              {product.content_triage.marketing_hook}
            </p>

            {/* Variants */}
            <div>
              <label className="block text-sm font-medium text-deep-forest mb-3">
                Select Colour
              </label>
              <div className="flex gap-3 flex-wrap">
                {product.static_data.variants.map((variant) => (
                  <button
                    key={variant}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      selectedVariant === variant
                        ? 'bg-deep-forest text-white'
                        : 'bg-paperbark text-deep-forest hover:bg-soft-sandstone'
                    }`}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-deep-forest mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-soft-sandstone rounded-lg hover:bg-paperbark transition-colors"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="text-xl font-medium text-deep-forest w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-10 h-10 border border-soft-sandstone rounded-lg hover:bg-paperbark transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.dynamic_data.stock_level === 0}
              className={`w-full py-4 rounded-full font-medium text-lg transition-all flex items-center justify-center gap-3 ${
                addedToCart
                  ? 'bg-emerald text-white'
                  : product.dynamic_data.stock_level === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-deep-forest text-white hover:bg-emerald'
              }`}
            >
              {addedToCart ? (
                <>
                  <Check className="w-6 h-6" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="w-6 h-6" />
                  {product.dynamic_data.stock_level === 0 ? 'Out of Stock' : 'Add to Cart'}
                </>
              )}
            </button>

            {/* Product Benefits */}
            <div className="border-t border-soft-sandstone pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Truck className="w-6 h-6 text-emerald flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-deep-forest">Free Shipping Over $150</p>
                  <p className="text-sm text-gray-600">Australia-wide delivery</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-emerald flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-deep-forest">100% Satisfaction Guarantee</p>
                  <p className="text-sm text-gray-600">30-day returns policy</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Leaf className="w-6 h-6 text-emerald flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-deep-forest">Carbon Neutral Delivery</p>
                  <p className="text-sm text-gray-600">We plant a tree with every order</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <div className="border-t border-soft-sandstone pt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Technical Specs */}
            <div>
              <h2 className="text-2xl font-bold text-deep-forest mb-6">
                Technical Specifications
              </h2>
              <ul className="space-y-3">
                {product.content_triage.technical_specs.map((spec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{spec}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 bg-paperbark rounded-lg p-6">
                <h3 className="font-bold text-deep-forest mb-3">Origin</h3>
                <p className="text-gray-700">{product.static_data.origin}</p>
                
                {product.static_data.dimensions_cm && (
                  <>
                    <h3 className="font-bold text-deep-forest mt-4 mb-3">Dimensions</h3>
                    <ul className="space-y-1 text-gray-700">
                      {Object.entries(product.static_data.dimensions_cm).map(([key, value]) => (
                        <li key={key}>
                          {key.replace('_', ' ')}: {value} cm
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <h3 className="font-bold text-deep-forest mt-4 mb-3">Weight</h3>
                <p className="text-gray-700">{product.static_data.weight_kg} kg</p>
              </div>
            </div>

            {/* Care Instructions */}
            <div>
              <h2 className="text-2xl font-bold text-deep-forest mb-6">
                Care Instructions
              </h2>
              <ul className="space-y-3">
                {product.rag_resources.care_instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 bg-vibrant-aqua/10 border border-vibrant-aqua/30 rounded-lg p-6">
                <h3 className="font-bold text-deep-forest mb-3">Care Tip</h3>
                <p className="text-gray-700">{product.rag_resources.manual_excerpt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

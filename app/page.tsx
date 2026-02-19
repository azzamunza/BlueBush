'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Truck, Award, Heart } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import productsData from '@/source/BlueBush-Product-Catalog-V1.json';
import { Product } from '@/lib/products';

const products = productsData as Product[];

export default function Home() {
  // Get featured products (first 4 from different categories)
  const featuredProducts = products.slice(0, 4);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] bg-gradient-to-br from-deep-forest via-emerald to-deep-teal text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 md:px-6 lg:px-12 h-full flex items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Sustainable Living,<br />
              <span className="text-vibrant-aqua">Beautifully Simple</span>
            </h1>
            <p className="text-xl md:text-2xl text-paperbark mb-8 leading-relaxed">
              Discover premium Australian homewares that honour the earth 
              and elevate your everyday
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-deep-forest px-8 py-4 rounded-full font-medium hover:bg-vibrant-aqua transition-colors inline-flex items-center gap-2"
                >
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/our-story">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-deep-forest transition-colors"
                >
                  Our Story
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-paperbark">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Leaf,
                title: '100% Sustainable',
                description: 'Ethically sourced materials from Australian suppliers',
              },
              {
                icon: Truck,
                title: 'Free Shipping',
                description: 'On orders over $150 Australia-wide',
              },
              {
                icon: Award,
                title: 'Premium Quality',
                description: 'Handcrafted pieces built to last generations',
              },
              {
                icon: Heart,
                title: 'Carbon Neutral',
                description: 'Every order plants a native Australian tree',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald text-white rounded-full mb-4">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-deep-forest mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-deep-forest mb-4">
              Featured Collection
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Carefully curated essentials that bring sustainable luxury to every room
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-deep-forest text-white px-8 py-4 rounded-full font-medium hover:bg-emerald transition-colors inline-flex items-center gap-2"
              >
                View All Products
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gradient-to-br from-soft-sandstone to-paperbark">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="aspect-square bg-gradient-to-br from-emerald to-deep-teal rounded-lg flex items-center justify-center text-white text-2xl">
                Our Story Image
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-deep-forest mb-6">
                Australian Grown.<br />
                Sustainably Made.
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Born from a love of the Australian landscape and a commitment to sustainable living, 
                BlueBush creates homewares that honour our environment whilst elevating everyday moments.
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Every piece is thoughtfully designed, ethically sourced, and built to last – 
                because quality and sustainability should never be compromised.
              </p>
              <Link href="/our-story">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-deep-forest text-white px-8 py-4 rounded-full font-medium hover:bg-emerald transition-colors inline-flex items-center gap-2"
                >
                  Read Our Story
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-deep-forest text-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join the BlueBush Community
            </h2>
            <p className="text-lg text-paperbark mb-8">
              Subscribe to receive sustainable living tips, new product releases, 
              and exclusive offers
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-6 py-3 rounded-full text-deep-forest focus:outline-none focus:ring-2 focus:ring-vibrant-aqua"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="bg-vibrant-aqua text-deep-forest px-8 py-3 rounded-full font-medium hover:bg-white transition-colors"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}


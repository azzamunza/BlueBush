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
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative h-[650px] md:h-[750px] bg-gradient-to-br from-deep-forest via-emerald to-deep-teal overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(80,200,120,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(0,255,255,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="container mx-auto px-4 md:px-6 lg:px-12 h-full flex items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block mb-6"
            >
              <span className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-semibold tracking-wide border border-white/30">
                🌿 Premium Australian Homewares
              </span>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">
              Sustainable Living,<br />
              <span className="text-vibrant-aqua drop-shadow-lg">Beautifully Simple</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed max-w-2xl">
              Discover premium Australian homewares that honour the earth 
              and elevate your everyday moments
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-deep-forest px-10 py-4 rounded-full font-bold text-lg hover:bg-vibrant-aqua hover:text-white transition-all duration-300 inline-flex items-center gap-3 shadow-xl"
                >
                  Shop Now
                  <ArrowRight className="w-6 h-6" />
                </motion.button>
              </Link>
              <Link href="/our-story">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-deep-forest transition-all duration-300 backdrop-blur-sm shadow-xl"
                >
                  Our Story
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-sm flex flex-col items-center gap-2"
        >
          <span className="font-medium">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 md:px-6 lg:px-12 relative">
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
                whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald to-deep-teal text-white rounded-2xl mb-6 shadow-lg">
                  <feature.icon className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-xl text-deep-forest mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block bg-emerald/10 text-emerald px-6 py-2 rounded-full text-sm font-bold tracking-wide mb-4">
              FEATURED COLLECTION
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-deep-forest mb-6">
              Curated for Your Home
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Carefully selected essentials that bring sustainable luxury to every room
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
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
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-deep-forest text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald transition-all duration-300 inline-flex items-center gap-3 shadow-xl"
              >
                View All Products
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald/5 to-transparent" />
        <div className="container mx-auto px-4 md:px-6 lg:px-12 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-emerald to-deep-teal rounded-3xl shadow-2xl flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)]" />
                <span className="relative">Our Story</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <span className="inline-block bg-emerald/10 text-emerald px-6 py-2 rounded-full text-sm font-bold tracking-wide mb-6">
                ABOUT BLUEBUSH
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-deep-forest mb-6 leading-tight">
                Australian Grown.<br />
                Sustainably Made.
              </h2>
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                Born from a love of the Australian landscape and a commitment to sustainable living, 
                BlueBush creates homewares that honour our environment whilst elevating everyday moments.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Every piece is thoughtfully designed, ethically sourced, and built to last – 
                because quality and sustainability should never be compromised.
              </p>
              <Link href="/our-story">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-deep-forest text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald transition-all duration-300 inline-flex items-center gap-3 shadow-xl"
                >
                  Read Our Story
                  <ArrowRight className="w-6 h-6" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gradient-to-br from-deep-forest via-emerald to-deep-teal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(80,200,120,0.3),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(0,255,255,0.2),transparent_70%)]" />
        
        <div className="container mx-auto px-4 md:px-6 lg:px-12 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Join the BlueBush Community
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Subscribe to receive sustainable living tips, new product releases, 
              and exclusive offers
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-8 py-4 rounded-full text-deep-forest focus:outline-none focus:ring-4 focus:ring-white/30 text-lg shadow-xl"
                aria-label="Email address"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-deep-forest px-10 py-4 rounded-full font-bold text-lg hover:bg-vibrant-aqua transition-all duration-300 shadow-xl"
              >
                Subscribe
              </motion.button>
            </form>
            <p className="text-white/70 text-sm mt-6">
              🔒 We respect your privacy. Unsubscribe at any time.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}


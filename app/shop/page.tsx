'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';
import productsData from '@/source/BlueBush-Product-Catalog-V1.json';
import { Product } from '@/lib/products';

const products = productsData as Product[];

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(cats).sort()];
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.dynamic_data.price_aud - b.dynamic_data.price_aud);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.dynamic_data.price_aud - a.dynamic_data.price_aud);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // featured - keep original order
        break;
    }

    return sorted;
  }, [selectedCategory, sortBy]);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-deep-forest via-emerald to-deep-teal text-white py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Shop Sustainable Homewares
            </h1>
            <p className="text-lg md:text-xl text-paperbark max-w-2xl mx-auto">
              Discover our curated collection of ethically sourced, beautifully crafted 
              essentials for every room in your home
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-20 z-40 bg-white/95 backdrop-blur-sm border-b border-soft-sandstone/30 py-4 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-deep-forest text-white'
                      : 'bg-paperbark text-deep-forest hover:bg-soft-sandstone'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <label htmlFor="sort" className="text-sm font-medium text-deep-forest whitespace-nowrap">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-soft-sandstone rounded-full bg-white text-deep-forest focus:border-emerald focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 md:px-6 lg:px-12 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">No products found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="bg-paperbark py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-deep-forest mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Get in touch with our team and we'll help you find the perfect sustainable solution for your home
          </p>
          <Link
            href="/contact"
            className="inline-block bg-deep-forest text-white px-8 py-4 rounded-full font-medium hover:bg-emerald transition-colors no-underline"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}

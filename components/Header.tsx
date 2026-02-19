'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { getTotalItems, toggleCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const totalItems = getTotalItems();

  const navigation = [
    { name: 'Shop', href: '/shop' },
    { name: 'Our Story', href: '/our-story' },
    { name: 'Journal', href: '/journal' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-deep-forest via-emerald to-vibrant-aqua flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
              <span className="text-white font-bold text-xl">BB</span>
            </div>
            <span className="text-2xl font-bold text-deep-forest hidden sm:inline tracking-tight">
              BlueBush
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-deep-forest hover:text-emerald hover:bg-paperbark transition-all duration-200 font-semibold no-underline px-4 py-2 rounded-lg"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side - Search, User, Cart */}
          <div className="flex items-center space-x-2">
            {/* Search Bar - Desktop */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 lg:w-64 px-4 py-2 pl-10 rounded-full border border-gray-200 focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/20 bg-gray-50 hover:bg-white transition-all duration-200"
                  aria-label="Search products"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>

            {/* User Profile */}
            <Link
              href="/account"
              className="p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200 hover:shadow-md"
              aria-label="User account"
            >
              <User className="w-5 h-5 text-deep-forest" />
            </Link>

            {/* Shopping Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200 hover:shadow-md"
              aria-label={`Shopping cart with ${totalItems} items`}
            >
              <ShoppingCart className="w-5 h-5 text-deep-forest" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-emerald text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-deep-forest" />
              ) : (
                <Menu className="w-6 h-6 text-deep-forest" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4 pt-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 rounded-full border border-gray-200 focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/20 bg-gray-50"
              aria-label="Search products"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 bg-white shadow-lg"
          >
            <nav className="container mx-auto px-4 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-deep-forest hover:bg-gray-100 rounded-lg transition-all duration-200 font-semibold no-underline"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import React from 'react';
import { Leaf, Search, User, ShoppingCart } from 'lucide-react';

export const NavigationPreview: React.FC = () => {
  return (
    <div className="w-full bg-white border-t border-b border-gray-200 py-4 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo - Left */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-deep-teal via-emerald to-vibrant-aqua p-2 rounded-full">
            <Leaf className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <span className="text-xl font-bold text-deep-forest hidden sm:block">BlueBush</span>
        </div>

        {/* Centre Menu */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          <a href="#shop" className="text-deep-forest hover:text-emerald transition-colors font-medium no-underline">
            Shop
          </a>
          <a href="#story" className="text-deep-forest hover:text-emerald transition-colors font-medium no-underline">
            Our Story
          </a>
          <a href="#journal" className="text-deep-forest hover:text-emerald transition-colors font-medium no-underline">
            Journal
          </a>
          <a href="#contact" className="text-deep-forest hover:text-emerald transition-colors font-medium no-underline">
            Contact
          </a>
        </nav>

        {/* Icons - Right */}
        <div className="flex items-center gap-4 md:gap-6">
          <button
            className="text-deep-forest hover:text-emerald transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" strokeWidth={2} />
          </button>
          <button
            className="text-deep-forest hover:text-emerald transition-colors"
            aria-label="User profile"
          >
            <User className="w-5 h-5" strokeWidth={2} />
          </button>
          <button
            className="text-deep-forest hover:text-emerald transition-colors relative"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={2} />
            <span className="absolute -top-2 -right-2 bg-vibrant-aqua text-deep-forest text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              0
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavigationPreview;

import React from 'react';
import { Leaf } from 'lucide-react';

export const BrandHeader: React.FC = () => {
  return (
    <div className="text-center py-12 md:py-16">
      {/* Logo - Stylised leaf with gradient */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-deep-teal via-emerald to-vibrant-aqua rounded-full blur-xl opacity-30"></div>
          <div className="relative bg-gradient-to-br from-deep-teal via-emerald to-vibrant-aqua p-6 rounded-full">
            <Leaf className="w-16 h-16 md:w-20 md:h-20 text-white" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Brand Name */}
      <h1 className="text-4xl md:text-6xl font-bold text-deep-forest mb-4 tracking-tight">
        BlueBush
      </h1>

      {/* Tagline */}
      <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto px-4">
        Sustainable Homewares. Australian Grown. Down-to-earth Professional.
      </p>
    </div>
  );
};

export default BrandHeader;

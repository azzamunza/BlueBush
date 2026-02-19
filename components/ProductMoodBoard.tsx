'use client';

import React from 'react';
import Image from 'next/image';

interface ProductImage {
  id: string;
  name: string;
  variation: string;
  description: string;
}

interface ProductMoodBoardProps {
  images: ProductImage[];
}

export const ProductMoodBoard: React.FC<ProductMoodBoardProps> = ({ images }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {images.map((image, index) => (
        <div 
          key={`${image.id}-${image.variation}`}
          className="relative aspect-square bg-paperbark rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
        >
          {/* Placeholder for product images */}
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-soft-sandstone to-paperbark">
            <div className="text-center p-8">
              <p className="text-lg md:text-xl font-semibold text-deep-forest mb-2">
                {image.name}
              </p>
              <p className="text-sm text-outback-ochre font-medium mb-1">
                {image.variation}
              </p>
              <p className="text-xs text-gray-600 italic">
                {image.description}
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Product ID: {image.id}
              </p>
            </div>
          </div>
          
          {/* This section would be used if actual images exist in ./product_images */}
          {/* The naming pattern: [Product ID]-[Product Name]-[Variation].png */}
          {/* Example: BED-001-Maireana French Flax Linen Sheet Set-Sage.png */}
        </div>
      ))}
    </div>
  );
};

export default ProductMoodBoard;

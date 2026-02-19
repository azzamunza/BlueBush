import React from 'react';
import BrandHeader from '@/components/BrandHeader';
import { PaletteGrid } from '@/components/PaletteSwatch';
import TypographyHierarchy from '@/components/TypographyHierarchy';
import ProductMoodBoard from '@/components/ProductMoodBoard';
import UIComponentLibrary from '@/components/UIComponentLibrary';
import NavigationPreview from '@/components/NavigationPreview';

export default function Home() {
  // BlueBush Brand Colours
  const brandColours = [
    {
      name: 'Deep Forest Green',
      hex: '#1B3022',
      description: 'Primary'
    },
    {
      name: 'Vibrant Aqua',
      hex: '#00FFFF',
      description: 'Accent'
    },
    {
      name: 'Soft Sandstone',
      hex: '#D7C4BB',
      description: 'Neutral 1'
    },
    {
      name: 'Outback Ochre',
      hex: '#AE653F',
      description: 'Neutral 2'
    },
    {
      name: 'Paperbark',
      hex: '#E5E1D8',
      description: 'Neutral 3'
    }
  ];

  // Product imagery data
  // These reference the product_images directory following the naming convention:
  // [Product ID]-[Product Name]-[Variation].png
  const productImages = [
    {
      id: 'BED-001',
      name: 'Maireana French Flax Linen Sheet Set',
      variation: 'Sage',
      description: 'Textured linen in soft sage green'
    },
    {
      id: 'DIN-001',
      name: 'Saltbush Ceramic Bowl',
      variation: 'Natural',
      description: 'Handmade ceramic on timber'
    },
    {
      id: 'LIV-001',
      name: 'Eucalyptus Branch',
      variation: 'Fresh',
      description: 'Eucalyptus in glass vase'
    },
    {
      id: 'BTH-001',
      name: 'Native Botanicals Soap Bar',
      variation: 'Morning Light',
      description: 'Organic soap in natural sunlight'
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Section 1: Brand Identity */}
      <section className="container mx-auto px-6 md:px-12 lg:px-24 py-12">
        <BrandHeader />
      </section>

      {/* Divider */}
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <hr className="border-gray-200" />
      </div>

      {/* Section 2: Colour Palette Swatches */}
      <section className="container mx-auto px-6 md:px-12 lg:px-24 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-deep-forest mb-8 text-center">
          Brand Colour Palette
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Our colour palette draws inspiration from the Australian landscape, balancing earthy neutrals with fresh, vibrant accents.
        </p>
        <PaletteGrid colours={brandColours} />
      </section>

      {/* Divider */}
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <hr className="border-gray-200" />
      </div>

      {/* Section 3: Typography Hierarchy */}
      <section className="container mx-auto px-6 md:px-12 lg:px-24 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-deep-forest mb-8 text-center">
          Typography System
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          We pair modern, bold Montserrat headings with humanist Lora serif for body text, creating a balance of contemporary and approachable.
        </p>
        <TypographyHierarchy />
      </section>

      {/* Divider */}
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <hr className="border-gray-200" />
      </div>

      {/* Section 4: Product Imagery & Texture Mood Board */}
      <section className="container mx-auto px-6 md:px-12 lg:px-24 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-deep-forest mb-8 text-center">
          Product Mood Board
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          High-end editorial imagery showcasing natural textures, handcrafted details, and the beauty of sustainable materials.
        </p>
        <ProductMoodBoard images={productImages} />
        <p className="text-center text-sm text-gray-500 mt-8 italic">
          Note: Product images are sourced from ./product_images following the pattern: [Product ID]-[Product Name]-[Variation].png
        </p>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <hr className="border-gray-200" />
      </div>

      {/* Section 5: UI Component Library */}
      <section className="container mx-auto px-6 md:px-12 lg:px-24 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-deep-forest mb-8 text-center">
          UI Component Library
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Interactive elements designed with accessibility and usability in mind, featuring pill-shaped buttons and minimalist form inputs.
        </p>
        <UIComponentLibrary />
      </section>

      {/* Divider */}
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <hr className="border-gray-200" />
      </div>

      {/* Section 6: Website Header Mockup */}
      <section className="py-16">
        <div className="container mx-auto px-6 md:px-12 lg:px-24 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-deep-forest mb-8 text-center">
            Navigation Preview
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Clean, minimalist navigation with logo left, centre menu, and utility icons right.
          </p>
        </div>
        <NavigationPreview />
      </section>

      {/* Footer */}
      <footer className="bg-deep-forest text-white py-12 mt-16">
        <div className="container mx-auto px-6 md:px-12 lg:px-24 text-center">
          <p className="text-paperbark mb-4">
            © 2026 BlueBush. Sustainable Homewares. Australian Grown.
          </p>
          <p className="text-sm text-soft-sandstone">
            This style guide demonstrates WCAG 2.1 AA compliance with proper colour contrast and accessible interactive elements.
          </p>
        </div>
      </footer>
    </main>
  );
}

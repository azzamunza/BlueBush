import React from 'react';

export const TypographyHierarchy: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Headings - Sofia Pro (using Montserrat as alternative) */}
      <div>
        <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">
          Headings — Montserrat (Sofia Pro Alternative)
        </p>
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-deep-forest">
            Heading 1 — Bold
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold text-deep-forest">
            Heading 2 — Bold
          </h2>
          <h3 className="text-3xl md:text-4xl font-medium text-deep-forest">
            Heading 3 — Medium
          </h3>
          <h4 className="text-2xl md:text-3xl font-medium text-deep-forest">
            Heading 4 — Medium
          </h4>
        </div>
      </div>

      {/* Body Text - Lora */}
      <div>
        <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">
          Body Text — Lora Serif
        </p>
        <div className="space-y-4 max-w-3xl">
          <p className="text-lg text-deep-forest font-lora">
            <strong>Regular:</strong> BlueBush brings sustainable homewares to Australian homes. Our carefully curated collection balances natural materials with contemporary design, creating pieces that honour the earth while elevating your everyday rituals.
          </p>
          <p className="text-lg text-deep-forest font-lora italic">
            <strong>Italic:</strong> Each product is thoughtfully sourced, with an emphasis on biodegradable materials, ethical production, and timeless aesthetics that transcend fleeting trends.
          </p>
          <p className="text-base text-deep-forest font-lora">
            <strong>Body Copy:</strong> From French flax linen to handcrafted ceramics, our range celebrates the beauty of natural imperfection. We believe in transparency, quality, and building a connection between maker and home.
          </p>
        </div>
      </div>

      {/* Font Pairing Example */}
      <div className="bg-paperbark p-8 rounded-lg">
        <h3 className="text-3xl font-bold text-deep-forest mb-4">
          Sustainable Living Starts at Home
        </h3>
        <p className="text-base text-deep-forest font-lora leading-relaxed">
          Our commitment to sustainability extends beyond our products. Every decision we make considers environmental impact, from packaging materials to shipping methods. We're proud to be Australian-owned, supporting local artisans and maintaining transparent supply chains that you can trust.
        </p>
      </div>
    </div>
  );
};

export default TypographyHierarchy;

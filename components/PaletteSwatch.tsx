import React from 'react';

interface PaletteSwatchProps {
  name: string;
  hex: string;
  description?: string;
}

export const PaletteSwatch: React.FC<PaletteSwatchProps> = ({ name, hex, description }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        className="w-24 h-24 md:w-32 md:h-32 rounded-full shadow-lg border-2 border-gray-100"
        style={{ backgroundColor: hex }}
        role="img"
        aria-label={`${name} colour swatch`}
      />
      <div className="text-center">
        <h3 className="font-semibold text-sm md:text-base">{name}</h3>
        <p className="text-xs md:text-sm text-gray-600 font-mono">{hex}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1 max-w-[120px]">{description}</p>
        )}
      </div>
    </div>
  );
};

interface PaletteGridProps {
  colours: Array<{
    name: string;
    hex: string;
    description?: string;
  }>;
}

export const PaletteGrid: React.FC<PaletteGridProps> = ({ colours }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 justify-items-center">
      {colours.map((colour) => (
        <PaletteSwatch key={colour.hex} {...colour} />
      ))}
    </div>
  );
};

'use client';

import React from 'react';

export const PrimaryButton: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-8 py-3 bg-deep-teal text-white rounded-full font-medium hover:bg-emerald transition-colours duration-300 focus:outline-none focus:ring-2 focus:ring-vibrant-aqua focus:ring-offset-2"
      aria-label={typeof children === 'string' ? children : 'Primary button'}
    >
      {children}
    </button>
  );
};

export const SecondaryButton: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-8 py-3 bg-white text-deep-teal border-2 border-deep-teal rounded-full font-medium hover:bg-paperbark transition-colours duration-300 focus:outline-none focus:ring-2 focus:ring-vibrant-aqua focus:ring-offset-2"
      aria-label={typeof children === 'string' ? children : 'Secondary button'}
    >
      {children}
    </button>
  );
};

export const FormInput: React.FC<{
  label: string;
  type?: string;
  placeholder?: string;
  id: string;
}> = ({ label, type = 'text', placeholder, id }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor={id} className="text-sm font-medium text-deep-forest">
        {label}
      </label>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        className="px-4 py-3 border-b-2 border-gray-300 bg-transparent focus:border-deep-teal focus:outline-none transition-colours duration-300"
        aria-label={label}
      />
    </div>
  );
};

export const UIComponentLibrary: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Buttons */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-deep-forest">Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <PrimaryButton>Shop Now</PrimaryButton>
          <SecondaryButton>Learn More</SecondaryButton>
        </div>
      </div>

      {/* Form Inputs */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-deep-forest">Form Elements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <FormInput label="Email Address" type="email" placeholder="your@email.com" id="email" />
          <FormInput label="Full Name" type="text" placeholder="Your Name" id="name" />
        </div>
      </div>
    </div>
  );
};

export default UIComponentLibrary;

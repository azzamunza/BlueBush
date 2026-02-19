export interface Product {
  id: string;
  name: string;
  category: string;
  dynamic_data: {
    price_aud: number;
    stock_level: number;
    status: string;
    next_shipment_eta: string | null;
    active_promotions: string[];
  };
  static_data: {
    origin: string;
    weight_kg: number;
    variants: string[];
    eco_badge: string;
    dimensions_cm?: Record<string, string>;
  };
  content_triage: {
    marketing_hook: string;
    technical_specs: string[];
  };
  rag_resources: {
    care_instructions: string[];
    manual_excerpt: string;
  };
}

export const getProductImagePath = (productId: string, productName: string, variant: string): string => {
  // Returns the path following the naming convention: [Product ID]-[Product Name]-[Variation].png
  return `/product_images/${productId}-${productName}-${variant}.png`;
};

export const getProductImages = (product: Product): string[] => {
  return product.static_data.variants.map((variant) => 
    getProductImagePath(product.id, product.name, variant)
  );
};

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const getStockStatus = (stockLevel: number): { text: string; color: string } => {
  if (stockLevel === 0) {
    return { text: 'Out of Stock', color: 'text-red-600' };
  } else if (stockLevel <= 5) {
    return { text: `Only ${stockLevel} left`, color: 'text-orange-600' };
  } else if (stockLevel <= 15) {
    return { text: 'Low Stock', color: 'text-yellow-600' };
  }
  return { text: 'In Stock', color: 'text-emerald' };
};

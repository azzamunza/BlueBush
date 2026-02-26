import React from 'react';
import productsData from '@/source/BlueBush-Product-Catalog-V1.json';
import { Product } from '@/lib/products';
import ProductDetailClient from './ProductDetailClient';

const products = productsData as Product[];

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);
  
  return <ProductDetailClient product={product} />;
}

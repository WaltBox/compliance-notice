'use client';

import React from 'react';
import type { ProgramProduct } from '@/types';

interface ProgramProductCardProps {
  product: ProgramProduct;
}

/**
 * Product card component for Beagle program
 * Displays product name, description, price, and bullet points
 */
export default function ProgramProductCard({ product }: ProgramProductCardProps) {
  return (
    <div className="border border-beagle-orange rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
      {/* Product name */}
      <h4 className="text-lg sm:text-xl font-bold text-beagle-dark mb-2">
        {product.name}
      </h4>

      {/* Price label (if present) */}
      {product.priceLabel && (
        <p className="text-beagle-orange font-semibold text-sm mb-3">
          {product.priceLabel}
        </p>
      )}

      {/* Short description */}
      <p className="text-beagle-dark text-sm sm:text-base leading-relaxed mb-4">
        {product.shortDescription}
      </p>

      {/* Bullet points (if present) */}
      {product.bulletPoints && product.bulletPoints.length > 0 && (
        <ul className="space-y-2 text-sm sm:text-base text-beagle-dark">
          {product.bulletPoints.map((bullet, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-beagle-orange font-bold mt-1">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


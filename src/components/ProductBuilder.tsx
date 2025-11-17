'use client';

import React, { useState } from 'react';
import type { ProgramProduct } from '@/types';

interface ProductBuilderProps {
  products: ProgramProduct[];
  onChange: (products: ProgramProduct[]) => void;
}

/**
 * Dynamic product list editor with add/remove/reorder capabilities
 */
export default function ProductBuilder({ products, onChange }: ProductBuilderProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const generateId = () => {
    // Simple ID generator (in production, use crypto-random or similar)
    return 'prod_' + Math.random().toString(36).substr(2, 9);
  };

  const addProduct = () => {
    const newProduct: ProgramProduct = {
      id: generateId(),
      name: '',
      shortDescription: '',
      priceLabel: '',
      bulletPoints: [],
    };
    onChange([...products, newProduct]);
    setEditingId(newProduct.id);
  };

  const removeProduct = (id: string) => {
    onChange(products.filter((p) => p.id !== id));
  };

  const updateProduct = (id: string, updates: Partial<ProgramProduct>) => {
    onChange(
      products.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )
    );
  };

  const moveProduct = (id: string, direction: 'up' | 'down') => {
    const index = products.findIndex((p) => p.id === id);
    if ((direction === 'up' && index <= 0) || (direction === 'down' && index >= products.length - 1)) {
      return;
    }

    const newProducts = [...products];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newProducts[index], newProducts[swapIndex]] = [newProducts[swapIndex], newProducts[index]];
    onChange(newProducts);
  };

  const addBulletPoint = (productId: string) => {
    updateProduct(productId, {
      bulletPoints: [...(products.find((p) => p.id === productId)?.bulletPoints || []), ''],
    });
  };

  const updateBulletPoint = (productId: string, index: number, value: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const bullets = [...(product.bulletPoints || [])];
    bullets[index] = value;
    updateProduct(productId, { bulletPoints: bullets });
  };

  const removeBulletPoint = (productId: string, index: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const bullets = (product.bulletPoints || []).filter((_, i) => i !== index);
    updateProduct(productId, { bulletPoints: bullets });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-beagle-dark">Program Products</h3>
        <button
          onClick={addProduct}
          className="bg-beagle-orange text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90"
        >
          + Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-3">No products yet</p>
          <button
            onClick={addProduct}
            className="text-beagle-orange font-semibold hover:underline"
          >
            Add your first product
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product, idx) => (
            <div
              key={product.id}
              className="border border-gray-300 rounded-lg p-4 bg-gray-50"
            >
              {/* Product Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                    placeholder="Product name (e.g., Tenant Liability Waiver)"
                    className="w-full px-3 py-2 border border-gray-300 rounded font-montserrat font-semibold mb-2"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-beagle-dark mb-1">
                  Short Description
                </label>
                <textarea
                  value={product.shortDescription}
                  onChange={(e) => updateProduct(product.id, { shortDescription: e.target.value })}
                  placeholder="One or two sentences explaining the product"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded font-montserrat text-sm"
                />
              </div>

              {/* Price Label */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-beagle-dark mb-1">
                  Price Label (Optional)
                </label>
                <input
                  type="text"
                  value={product.priceLabel || ''}
                  onChange={(e) => updateProduct(product.id, { priceLabel: e.target.value })}
                  placeholder="e.g., $13 / month"
                  className="w-full px-3 py-2 border border-gray-300 rounded font-montserrat text-sm"
                />
              </div>

              {/* Bullet Points */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-beagle-dark">
                    Bullet Points (Optional)
                  </label>
                  <button
                    onClick={() => addBulletPoint(product.id)}
                    className="text-beagle-orange text-xs font-semibold hover:underline"
                  >
                    + Add
                  </button>
                </div>

                {product.bulletPoints && product.bulletPoints.length > 0 && (
                  <div className="space-y-2">
                    {product.bulletPoints.map((bullet, bulletIdx) => (
                      <div key={bulletIdx} className="flex gap-2 items-start">
                        <span className="text-beagle-orange font-bold mt-2">•</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) =>
                            updateBulletPoint(product.id, bulletIdx, e.target.value)
                          }
                          placeholder="Bullet point"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded font-montserrat text-sm"
                        />
                        <button
                          onClick={() => removeBulletPoint(product.id, bulletIdx)}
                          className="text-red-600 font-semibold hover:underline px-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Controls: Move and Delete */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => moveProduct(product.id, 'up')}
                  disabled={idx === 0}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ↑ Up
                </button>
                <button
                  onClick={() => moveProduct(product.id, 'down')}
                  disabled={idx === products.length - 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ↓ Down
                </button>
                <button
                  onClick={() => removeProduct(product.id)}
                  className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


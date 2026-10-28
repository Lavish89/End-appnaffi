import React from 'react';
import { Store, ExternalLink, ShoppingCart, Star } from 'lucide-react';
import { CATALOG_PRODUCTS } from '../data/ecommerceData';

export const StorefrontView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <div className="text-xs font-mono text-amber-400">STOREFRONT · VORSCHAU</div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">Shop-Vorschau (Staging)</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          So präsentieren sich deine freigegebenen Produkte im Shop. Vorschau auf Basis des Staging-Katalogs –
          der echte Live-Shop liegt auf goalsforce.store.
        </p>
      </div>

      <a
        href="https://goalsforce.store"
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3.5 py-2 rounded-lg"
      >
        <Store className="w-4 h-4" /> Live-Shop öffnen <ExternalLink className="w-3.5 h-3.5" />
      </a>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATALOG_PRODUCTS.map((p) => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="h-44 bg-slate-950 overflow-hidden">
              <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1">
              <div className="text-[11px] text-slate-500">{p.category}</div>
              <h3 className="text-sm font-semibold text-slate-100 leading-snug">{p.title}</h3>
              <div className="flex items-center gap-1 text-[11px] text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" /> {p.rating} ({p.reviewCount})
              </div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="font-mono">
                  <span className="text-white font-bold">{p.price.toFixed(2)} €</span>
                  <span className="text-slate-500 line-through text-[11px] ml-1.5">{p.compareAtPrice.toFixed(2)} €</span>
                </div>
                <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 px-2.5 py-1.5 rounded-lg">
                  <ShoppingCart className="w-3.5 h-3.5" /> Kaufen
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

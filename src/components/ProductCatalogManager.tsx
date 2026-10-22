import React, { useState } from 'react';
import { 
  Package, 
  Tag, 
  CheckCircle2, 
  ShieldAlert, 
  Code2, 
  FileEdit, 
  Lock, 
  Plus, 
  Eye, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { CATALOG_PRODUCTS } from '../data/ecommerceData';
import { CatalogProduct } from '../types';

export const ProductCatalogManager: React.FC = () => {
  const [products, setProducts] = useState<CatalogProduct[]>(CATALOG_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct>(CATALOG_PRODUCTS[0]);
  const [showJsonLd, setShowJsonLd] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const handleUpdateStatus = (id: string, newStatus: CatalogProduct['approvalStatus']) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, approvalStatus: newStatus } : p));
    if (selectedProduct.id === id) {
      setSelectedProduct(prev => ({ ...prev, approvalStatus: newStatus }));
    }
    setStatusNotification(`Status für "${selectedProduct.title}" geändert zu: ${newStatus}`);
    setTimeout(() => setStatusNotification(null), 3000);
  };

  // Google Rich Snippets JSON-LD Schema
  const jsonLdSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": selectedProduct.title,
    "image": [selectedProduct.image],
    "description": selectedProduct.seoDescription,
    "sku": selectedProduct.sku,
    "gtin13": selectedProduct.ean,
    "brand": {
      "@type": "Brand",
      "name": "Aura"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://aura-workspace.myshopify.com/products/${selectedProduct.id}`,
      "priceCurrency": "EUR",
      "price": selectedProduct.price,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Aura Studio GmbH"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": selectedProduct.rating,
      "reviewCount": selectedProduct.reviewCount
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-amber-400">PHASE 5 · PRODUKTKATALOG & STAGING-WORKFLOW</div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Shopify Produktkatalog & Freigabe-Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Vollständige Stammdaten: SKUs, EAN-Barcodes, Einkaufspreise, Verkaufspreise, Variantenmatrizen, Bestände und suchmaschinenoptimierte Meta-Tags mit Google Rich Snippets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            Katalog: <strong className="text-amber-400">{products.length} Produkte gestaged</strong>
          </span>
        </div>
      </div>

      {statusNotification && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* Main split: Product List Left, Product Editor/Inspector Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product List */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-300">Vorbereitete Flaggschiff-Artikel</div>
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedProduct(p)}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                selectedProduct.id === p.id
                  ? 'bg-slate-900 border-amber-500 shadow-md ring-1 ring-amber-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex gap-3">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-14 h-14 object-cover rounded-lg bg-slate-950 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-slate-100 truncate">{p.title}</h4>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">SKU: {p.sku}</div>
                  <div className="flex items-center justify-between mt-1 text-xs font-mono">
                    <span className="text-white font-bold">{p.price.toFixed(2)} €</span>
                    <span className="text-emerald-400">Bestand: {p.inventory}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{p.category}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  p.approvalStatus === 'Freigegeben_Staging'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {p.approvalStatus.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Master Data, SEO & Approval Workflow */}
        <div className="lg:col-span-2 space-y-5 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-amber-400">SKU: {selectedProduct.sku} · EAN: {selectedProduct.ean}</span>
              <h3 className="text-lg font-bold text-white mt-0.5">{selectedProduct.title}</h3>
            </div>

            {/* Approval status selector obeying autonomy guardrails */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status:</span>
              <select
                value={selectedProduct.approvalStatus}
                onChange={(e) => handleUpdateStatus(selectedProduct.id, e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="Entwurf">Entwurf (Draft)</option>
                <option value="Freigabe_angefordert">Freigabe beantragt</option>
                <option value="Freigegeben_Staging">Freigegeben für Staging</option>
                <option value="Live_Gesperrt" disabled>Live im Shopify Store (Gesperrt ohne Freigabe)</option>
              </select>
            </div>
          </div>

          {/* Pricing & Margin Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <div className="text-slate-500 text-[11px]">Einkaufspreis (EK)</div>
              <div className="text-slate-200 font-semibold text-sm mt-0.5">{selectedProduct.costOfGoods.toFixed(2)} €</div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Verkaufspreis (VK)</div>
              <div className="text-white font-semibold text-sm mt-0.5">{selectedProduct.price.toFixed(2)} €</div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Streichpreis (UVP)</div>
              <div className="text-slate-400 line-through text-sm mt-0.5">{selectedProduct.compareAtPrice.toFixed(2)} €</div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Rohgewinn (Marge)</div>
              <div className="text-emerald-400 font-bold text-sm mt-0.5">
                {(selectedProduct.price - selectedProduct.costOfGoods).toFixed(2)} € ({Math.round(((selectedProduct.price - selectedProduct.costOfGoods) / selectedProduct.price) * 100)}%)
              </div>
            </div>
          </div>

          {/* Variants and Options */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-200">Eingerichtete Varianten</h4>
            <div className="space-y-2">
              {selectedProduct.variants.map((v) => (
                <div key={v.name} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="font-semibold text-slate-300">{v.name}:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {v.options.map((opt) => (
                      <span key={opt} className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-slate-300 font-mono text-[11px]">
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Metadata Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200">Google Suchergebnis-Vorschau (SERP)</h4>
              <button
                onClick={() => setShowJsonLd(!showJsonLd)}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
              >
                <Code2 className="w-3.5 h-3.5" />
                {showJsonLd ? 'SERP anzeigen' : 'Schema.org JSON-LD'}
              </button>
            </div>

            {showJsonLd ? (
              <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-amber-300 overflow-x-auto max-h-56">
                {JSON.stringify(jsonLdSchema, null, 2)}
              </pre>
            ) : (
              <div className="space-y-1">
                <div className="text-sky-400 text-sm font-medium hover:underline cursor-pointer">
                  {selectedProduct.seoTitle}
                </div>
                <div className="text-emerald-500 text-xs font-mono">
                  https://aura-workspace.myshopify.com/products/{selectedProduct.id}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedProduct.seoDescription}
                </p>
                <div className="text-[11px] text-amber-400 font-mono pt-1">
                  ★★★★★ {selectedProduct.rating} ({selectedProduct.reviewCount} Bewertungen) · {selectedProduct.price.toFixed(2)} € · Auf Lager
                </div>
              </div>
            )}
          </div>

          {/* Autonomous Approval Safeguard */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-xs text-slate-400">
                <strong className="text-slate-200">Schutz vor unautorisierter Veröffentlichung:</strong>
                <br />Produkte werden erst dann in den echten Live-Shop geschoben, wenn du den Staging-Katalog freigegeben hast.
              </div>
            </div>
            <button
              onClick={() => handleUpdateStatus(selectedProduct.id, 'Freigegeben_Staging')}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg whitespace-nowrap transition-colors"
            >
              Für Staging freigeben
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

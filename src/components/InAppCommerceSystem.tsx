import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  RotateCw, 
  Package, 
  Plus, 
  Sliders, 
  FileText, 
  ExternalLink, 
  DollarSign, 
  ShieldCheck, 
  Check, 
  ArrowRight,
  Send,
  Zap,
  Store,
  Smartphone,
  Share2,
  Lock,
  Printer
} from 'lucide-react';
import { CATALOG_PRODUCTS, ASSET_IMAGES } from '../data/ecommerceData';
import { CatalogProduct, Order, SalesChannelStatus } from '../types';

export const InAppCommerceSystem: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [channels, setChannels] = useState<SalesChannelStatus[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'sell_terminal' | 'order_manager' | 'channel_hub'>('sell_terminal');
  
  // Quick Checkout in the App State
  const [selectedProductToBuy, setSelectedProductToBuy] = useState<CatalogProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [buyQuantity, setBuyQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'apple_pay' | 'google_pay' | 'klarna' | 'paypal' | 'credit_card'>('apple_pay');
  const [customerName, setCustomerName] = useState('Max Mustermann');
  const [customerEmail, setCustomerEmail] = useState('max.mustermann@example.de');
  const [customerStreet, setCustomerStreet] = useState('Goethestraße 28');
  const [customerCity, setCustomerCity] = useState('Frankfurt am Main');
  const [customerZip, setCustomerZip] = useState('60313');
  const [couponCode, setCouponCode] = useState('WELCOME10');
  
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [completedOrderReceipt, setCompletedOrderReceipt] = useState<Order | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // New Product Modal
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Workspace');
  const [newPrice, setNewPrice] = useState('39.90');
  const [newEK, setNewEK] = useState('8.50');
  const [newStock, setNewStock] = useState('100');

  // Fetch orders & channels from server
  useEffect(() => {
    fetchOrders();
    fetchChannels();
  }, []);

  const fetchOrders = () => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      })
      .catch(console.error);
  };

  const fetchChannels = () => {
    fetch('/api/sales-channels')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.channels) {
          setChannels(data.channels);
        }
      })
      .catch(console.error);
  };

  const handleOpenDirectBuy = (product: CatalogProduct) => {
    setSelectedProductToBuy(product);
    setSelectedVariant(product.variants[0]?.options[0] || 'Standard');
    setBuyQuantity(1);
  };

  const handleExecuteInAppPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductToBuy) return;

    setIsProcessingOrder(true);
    try {
      const orderPayload = {
        items: [
          {
            productId: selectedProductToBuy.id,
            productTitle: selectedProductToBuy.title,
            sku: selectedProductToBuy.sku,
            quantity: buyQuantity,
            price: selectedProductToBuy.price,
            selectedVariants: { 'Ausführung': selectedVariant },
            image: selectedProductToBuy.image,
          }
        ],
        customer: {
          name: customerName,
          email: customerEmail,
          address: {
            street: customerStreet,
            city: customerCity,
            postalCode: customerZip,
            country: 'Deutschland',
          }
        },
        paymentMethod,
        discountCode: couponCode,
      };

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCompletedOrderReceipt(data.order);
        setOrders(prev => [data.order, ...prev]);
        setSelectedProductToBuy(null);
        setNotification(`Verkauf erfolgreich! Bestellnummer ${data.order.orderNumber} verbucht.`);
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (err: any) {
      alert(`Fehler bei der Verkaufsabwicklung: ${err.message}`);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handleFulfillOrder = async (orderId: string) => {
    try {
      const res = await fetch('/api/orders/fulfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
        setNotification(`DHL Paketlabel für ${data.order.orderNumber} erzeugt (${data.order.trackingNumber})`);
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleChannel = async (channelId: string) => {
    try {
      const res = await fetch('/api/sales-channels/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId }),
      });
      const data = await res.json();
      if (data.success && data.channels) {
        setChannels(data.channels);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-amber-400">UNIFIED COMMERCE & IN-APP VERKAUFSSYSTEM</div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Shopify-Verbund & Direktverkauf in der App
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Ein zusammenhängendes System: Verkaufe Produkte direkt nativ in der App, synchronisiere Bestellungen und Bestände mit deinem Shopify-Shop und verwalte alle Kanäle an einem Ort.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('sell_terminal')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'sell_terminal' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            In-App Verkaufs-Terminal
          </button>
          <button
            onClick={() => setActiveSubTab('order_manager')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'order_manager' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Bestellungen ({orders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('channel_hub')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'channel_hub' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Verbundene Kanäle ({channels.filter(c => c.connected).length})
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* SUB-TAB 1: In-App Direct Selling Terminal */}
      {activeSubTab === 'sell_terminal' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  Produkte direkt auf der App verkaufen (1-Click In-App Checkout)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kunden oder Besucher können hier unmittelbar bestellen – das System verbucht den Umsatz, zieht den Bestand ab und erzeugt das DHL-Label.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-500">Aktive Produkte:</span>
                <span className="text-amber-400 font-bold">{CATALOG_PRODUCTS.length} verkaufsbereit</span>
              </div>
            </div>

            {/* Products Grid for Instant Selling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
              {CATALOG_PRODUCTS.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-900">
                      <img
                        src={prod.image}
                        alt={prod.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-amber-400">{prod.category}</span>
                      <h4 className="text-xs font-semibold text-white line-clamp-1">{prod.title}</h4>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{prod.subtitle}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-baseline justify-between font-mono">
                      <span className="text-sm font-bold text-white">{prod.price.toFixed(2)} €</span>
                      <span className="text-[11px] text-emerald-400">{prod.inventory} auf Lager</span>
                    </div>

                    <button
                      onClick={() => handleOpenDirectBuy(prod)}
                      className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Jetzt in der App kaufen</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Order Management System (OMS) */}
      {activeSubTab === 'order_manager' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                Zentrales Multi-Channel Bestell-Management (OMS)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Alle Verkäufe aus der App, dem Shopify Web-Shop und Social Commerce werden hier in Echtzeit zusammengeführt.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Gesamtumsatz: <strong className="text-emerald-400">{orders.reduce((s, o) => s + o.total, 0).toFixed(2)} €</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono">
                  <th className="py-3 px-4">Bestellnummer</th>
                  <th className="py-3 px-4">Kunde & Adresse</th>
                  <th className="py-3 px-4">Artikel</th>
                  <th className="py-3 px-4">Kanal</th>
                  <th className="py-3 px-4 text-right">Betrag</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">DHL Versand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-amber-400">{ord.orderNumber}</div>
                      <div className="text-[10px] text-slate-500">{new Date(ord.createdAt).toLocaleDateString('de-DE')}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{ord.customerName}</div>
                      <div className="text-[11px] text-slate-400">{ord.shippingAddress.city}, {ord.shippingAddress.country}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">
                      {ord.items.map((it, i) => (
                        <div key={i} className="truncate max-w-xs">
                          {it.quantity}x {it.productTitle}
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        {ord.salesChannel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-white">
                      {ord.total.toFixed(2)} €
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                        ord.fulfillmentStatus === 'Versendet'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {ord.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {ord.fulfillmentStatus === 'Versendet' ? (
                        <div className="font-mono text-[10px] text-emerald-400">
                          {ord.trackingNumber}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleFulfillOrder(ord.id)}
                          className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] rounded-md transition-colors whitespace-nowrap"
                        >
                          DHL Label erzeugen
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Connected Sales Channels Bridge */}
      {activeSubTab === 'channel_hub' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-400" />
              Verbundene Vertriebskanäle (Omnichannel Sync)
            </h3>
            <p className="text-xs text-slate-400">
              Alle Kanäle synchronisieren Produkte, Preise und Bestände nahtlos mit der zentralen Shopify & App Datenbank.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {channels.map((chan) => (
                <div
                  key={chan.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{chan.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">Typ: {chan.type}</span>
                    </div>
                    <button
                      onClick={() => handleToggleChannel(chan.id)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                        chan.connected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {chan.connected ? 'Aktiv Verbunden' : 'Deaktiviert'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 text-[10px]">Bestellungen heute:</span>
                      <div className="text-white font-bold">{chan.activeOrdersToday}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Umsatz heute:</span>
                      <div className="text-emerald-400 font-bold">{chan.todayRevenue.toFixed(2)} €</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>Synchronisierte Produkte:</span>
                    <span className="text-amber-400 font-mono font-semibold">{chan.syncedProductsCount} Artikel</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Direct In-App Fast Checkout */}
      {selectedProductToBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Direktverkauf in der App abschließen</h3>
              </div>
              <button
                onClick={() => setSelectedProductToBuy(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteInAppPurchase} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Product summary */}
              <div className="flex gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <img
                  src={selectedProductToBuy.image}
                  alt={selectedProductToBuy.title}
                  className="w-16 h-16 object-cover rounded-lg bg-slate-900 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-bold text-white truncate">{selectedProductToBuy.title}</h4>
                  <div className="text-slate-400 font-mono">SKU: {selectedProductToBuy.sku}</div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-amber-400 font-bold text-sm">{selectedProductToBuy.price.toFixed(2)} €</span>
                    <span className="text-slate-400">Menge: {buyQuantity}</span>
                  </div>
                </div>
              </div>

              {/* Variant selection */}
              {selectedProductToBuy.variants.length > 0 && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Variante wählen:</label>
                  <select
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-medium focus:outline-none focus:border-amber-500"
                  >
                    {selectedProductToBuy.variants[0].options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-3">
                <label className="text-slate-400 font-medium">Bestellmenge:</label>
                <div className="flex items-center border border-slate-800 rounded-lg bg-slate-950 font-mono">
                  <button
                    type="button"
                    onClick={() => setBuyQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1 text-slate-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-3 text-white font-bold">{buyQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setBuyQuantity(q => q + 1)}
                    className="px-3 py-1 text-slate-400 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Customer data */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="font-semibold text-slate-200 block">Kunden- & Lieferdaten:</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">Name:</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">E-Mail:</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[11px] text-slate-500 block mb-0.5">Straße & Nr.:</label>
                    <input
                      type="text"
                      required
                      value={customerStreet}
                      onChange={(e) => setCustomerStreet(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">PLZ:</label>
                    <input
                      type="text"
                      required
                      value={customerZip}
                      onChange={(e) => setCustomerZip(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Payment selector */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="font-semibold text-slate-200 block">Zahlungsart:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'apple_pay', label: 'Apple Pay' },
                    { id: 'klarna', label: 'Klarna Rechnung' },
                    { id: 'paypal', label: 'PayPal' },
                    { id: 'credit_card', label: 'Kreditkarte' },
                    { id: 'google_pay', label: 'Google Pay' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2 rounded-lg border text-center transition-colors ${
                        paymentMethod === m.id
                          ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price total */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Zwischensumme:</span>
                  <span>{(selectedProductToBuy.price * buyQuantity).toFixed(2)} €</span>
                </div>
                {couponCode === 'WELCOME10' && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Rabatt (WELCOME10 -10%):</span>
                    <span>- {((selectedProductToBuy.price * buyQuantity) * 0.10).toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>DHL Paketversand DE:</span>
                  <span>{(selectedProductToBuy.price * buyQuantity) >= 50 ? 'Kostenlos' : '3,90 €'}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-slate-800">
                  <span>Gesamtbetrag (inkl. MwSt.):</span>
                  <span className="text-amber-400">
                    {(
                      (selectedProductToBuy.price * buyQuantity) - 
                      (couponCode === 'WELCOME10' ? (selectedProductToBuy.price * buyQuantity) * 0.10 : 0) + 
                      ((selectedProductToBuy.price * buyQuantity) >= 50 ? 0 : 3.90)
                    ).toFixed(2)} €
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessingOrder}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isProcessingOrder ? 'Zahlung wird autorisiert...' : 'Kauf jetzt verbindlich ausführen'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Order Receipt Preview */}
      {completedOrderReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Verkauf erfolgreich abgeschlossen!</h3>
              <p className="text-xs text-slate-400">
                Die Bestellung wurde in der App verbucht und via API an Shopify übertragen.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Bestellnummer:</span>
                <span className="text-amber-400 font-bold">{completedOrderReceipt.orderNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Kunde:</span>
                <span className="text-white">{completedOrderReceipt.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>DHL Sendungsnummer:</span>
                <span className="text-emerald-400 font-bold">{completedOrderReceipt.trackingNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gesamtbetrag bezahlt:</span>
                <span className="text-white font-bold">{completedOrderReceipt.total.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Vertriebskanal:</span>
                <span className="text-slate-300">{completedOrderReceipt.salesChannel}</span>
              </div>
            </div>

            <button
              onClick={() => setCompletedOrderReceipt(null)}
              className="w-full py-2.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
            >
              Schließen & Zurück zur App
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

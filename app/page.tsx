'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DishImage from '@/components/DishImage';

export default function CustomerMenu() {
  const [menu, setMenu] = useState<any[]>([]);
  const [cart, setCart] = useState<Record<string, any>>({});
  const [step, setStep] = useState<'MENU' | 'CHECKOUT'>('MENU');
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Customer & Order States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showGateway, setShowGateway] = useState(false);
  const [paymentError, setPaymentError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const syncCustomerOrders = (savedPhone: string, savedActiveNo: string | null) => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((all) => {
        const mine = all.filter((o: any) => o.phone === savedPhone).reverse();
        setPastOrders(mine);
        if (savedActiveNo) {
          const current = mine.find((o: any) => o.order_no === savedActiveNo);
          if (current) setActiveOrder(current);
        }
      });
  };

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((data) => setMenu(data.filter((i: any) => i.in_stock)));

    const savedName = localStorage.getItem('cust_name');
    const savedPhone = localStorage.getItem('cust_phone');
    const savedActiveOrder = localStorage.getItem('active_order_no');

    if (savedName) setName(savedName);
    if (savedPhone) {
      setPhone(savedPhone);
      syncCustomerOrders(savedPhone, savedActiveOrder);
      const interval = setInterval(() => {
        syncCustomerOrders(savedPhone, localStorage.getItem('active_order_no'));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  // Extract unique categories dynamically
  const categories = ['All', ...Array.from(new Set(menu.map((item) => item.category)))];

  // Filtered Menu
  const filteredMenu = menu.filter((item) => {
    const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchVeg = !vegOnly || item.type === 'VEG';
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchVeg && matchSearch;
  });

  const addToCart = (item: any) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: { ...item, qty: (prev[item.id]?.qty || 0) + 1 },
    }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const currentItem = prev[id];
      if (!currentItem) return prev;
      if (currentItem.qty > 1) {
        return { ...prev, [id]: { ...currentItem, qty: currentItem.qty - 1 } };
      } else {
        const { [id]: _, ...rest } = prev;
        if (Object.keys(rest).length === 0) setStep('MENU');
        return rest;
      }
    });
  };

  const cartItems = Object.values(cart);
  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  const openPaymentGateway = () => {
    if (!name.trim() || phone.length < 10) {
      return alert('Please enter valid Name and 10-digit Phone Number');
    }
    setPaymentError(false);
    setShowGateway(true);
  };

  const handlePaymentSuccess = async () => {
    setLoading(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ name, phone, items: cartItems, total }),
    });
    const data = await res.json();

    localStorage.setItem('cust_name', name.trim());
    localStorage.setItem('cust_phone', phone);
    localStorage.setItem('active_order_no', data.order_no);

    router.push(`/order/${data.order_no}`);
  };

  const handlePaymentFailed = () => {
    setShowGateway(false);
    setPaymentError(true);
  };

  const handleReviewSubmit = () => {
    setReviewSubmitted(true);
    setTimeout(() => {
      localStorage.removeItem('active_order_no');
      setActiveOrder(null);
      setShowReviewModal(false);
      setReviewSubmitted(false);
      setReviewText('');
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-28 font-sans min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">🍽️ Counter Order</h1>
          <p className="text-xs text-gray-500">Order fresh, pay online & pick up at counter</p>
        </div>
        {pastOrders.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded-xl font-bold shadow-sm hover:bg-gray-100"
          >
            📜 My Orders ({pastOrders.length})
          </button>
        )}
      </div>

      {/* Active Order Banner */}
      {activeOrder && activeOrder.status === 'PREPARING' && (
        <Link
          href={`/order/${activeOrder.order_no}`}
          className="block mb-4 bg-orange-50 border-2 border-orange-400 p-3.5 rounded-2xl shadow-sm flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">🍳</span>
            <div>
              <p className="text-xs font-bold text-orange-700 uppercase">Active Order #{activeOrder.order_no}</p>
              <p className="text-sm font-extrabold text-gray-900">Your order is getting prepared</p>
            </div>
          </div>
          <span className="text-xs bg-orange-600 text-white px-3 py-1.5 rounded-lg font-bold">Track →</span>
        </Link>
      )}

      {activeOrder && activeOrder.status === 'READY' && (
        <div className="mb-4 bg-green-50 border-2 border-green-500 p-3.5 rounded-2xl shadow-sm flex justify-between items-center gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="text-xs font-bold text-green-700 uppercase">Order #{activeOrder.order_no} Ready!</p>
              <p className="text-sm font-extrabold text-gray-900">Pick up & share your feedback</p>
            </div>
          </div>
          <button
            onClick={() => setShowReviewModal(true)}
            className="text-xs bg-green-600 hover:bg-green-700 text-white px-3.5 py-2 rounded-xl font-extrabold shadow shrink-0"
          >
            ⭐ Give Review
          </button>
        </div>
      )}

      {/* Past Orders Drawer */}
      {showHistory && (
        <div className="mb-5 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-extrabold text-sm">Order History ({phone})</h3>
            <button onClick={() => setShowHistory(false)} className="text-xs text-gray-500 font-bold">Close ✕</button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {pastOrders.map((o) => (
              <div key={o.order_no} className="p-2.5 bg-gray-50 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-sm">Order #{o.order_no} • ₹{o.total}</p>
                  <p className="text-gray-500">{o.items.map((i: any) => `${i.name} x${i.qty}`).join(', ')}</p>
                </div>
                <Link href={`/order/${o.order_no}`} className="bg-black text-white px-3 py-1.5 rounded-lg font-bold">View</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'MENU' ? (
        <>
          {/* Search + Veg Only Filter Bar */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="🔍 Search burgers, rolls, drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-black"
            />
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-3 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition ${
                vegOnly ? 'bg-green-50 border-green-600 text-green-700' : 'bg-white border-gray-200 text-gray-600'
              }`}
            >
              <span className="w-3.5 h-3.5 border-2 border-green-600 flex items-center justify-center rounded-sm">
                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
              </span>
              Veg Only
            </button>
          </div>

          {/* Horizontal Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items List */}
          <div className="space-y-3">
            {filteredMenu.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">No items match your filter.</p>
            ) : (
              filteredMenu.map((item) => (
                <div key={item.id} className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center gap-3">
                  <DishImage src={item.image_url} category={item.category} alt={item.name} />

                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      {/* Indian Veg / Non-Veg Symbol */}
                      {item.type === 'VEG' ? (
                        <span title="Veg" className="w-3.5 h-3.5 border border-green-600 flex items-center justify-center rounded-sm">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        </span>
                      ) : (
                        <span title="Non-Veg" className="w-3.5 h-3.5 border border-red-600 flex items-center justify-center rounded-sm">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                        </span>
                      )}
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-base mt-1 leading-snug">{item.name}</h3>
                    <p className="text-gray-800 font-extrabold mt-0.5">₹{item.price}</p>
                  </div>

                  <div className="shrink-0">
                    {cart[item.id] ? (
                      <div className="flex items-center gap-3 bg-green-600 text-white px-3 py-1.5 rounded-xl font-bold shadow-sm">
                        <button onClick={() => removeFromCart(item.id)} className="px-1 text-lg leading-none">-</button>
                        <span>{cart[item.id].qty}</span>
                        <button onClick={() => addToCart(item)} className="px-1 text-lg leading-none">+</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="border-2 border-green-600 text-green-700 hover:bg-green-50 px-4 py-1.5 rounded-xl font-bold text-sm"
                      >
                        + ADD
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-green-600 text-white p-4 rounded-2xl shadow-xl flex justify-between items-center z-10">
              <div>
                <p className="text-xs opacity-90">{cartItems.reduce((s, i) => s + i.qty, 0)} Items added</p>
                <p className="text-xl font-extrabold">₹{total}</p>
              </div>
              <button onClick={() => setStep('CHECKOUT')} className="bg-white text-green-700 px-5 py-2.5 rounded-xl font-extrabold shadow">
                Review & Pay →
              </button>
            </div>
          )}
        </>
      ) : (
        /* Checkout Screen (Pre-payment Edit) */
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold">Review & Edit Order</h2>
            <button onClick={() => setStep('MENU')} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-bold">
              + Add More Items
            </button>
          </div>

          {paymentError && (
            <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-xl text-sm flex justify-between items-center">
              <span>❌ <strong>Payment Failed!</strong> Amount was not deducted.</span>
              <button onClick={() => setPaymentError(false)} className="text-xs underline font-bold">Dismiss</button>
            </div>
          )}

          <div className="border rounded-xl p-3.5 bg-gray-50 space-y-3">
            {cartItems.map((i) => (
              <div key={i.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2.5">
                  <DishImage src={i.image_url} category={i.category} alt={i.name} className="w-10 h-10 rounded-lg" />
                  <div>
                    <p className="font-bold">{i.name}</p>
                    <p className="text-xs text-gray-500">₹{i.price} each</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-2 bg-white border px-2.5 py-1 rounded-lg font-bold">
                    <button onClick={() => removeFromCart(i.id)} className="text-red-600 px-1">-</button>
                    <span>{i.qty}</span>
                    <button onClick={() => addToCart(i)} className="text-green-600 px-1">+</button>
                  </div>
                  <span className="font-bold w-12 text-right">₹{i.price * i.qty}</span>
                </div>
              </div>
            ))}
            <div className="flex justify-between font-extrabold text-lg border-t pt-2.5">
              <span>Total Payable</span>
              <span>₹{total}</span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <h3 className="font-bold text-sm text-gray-700">Customer Details</h3>
            <input
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-black"
            />
            <input
              placeholder="Phone Number (10 digits)"
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-black"
            />
          </div>

          <button
            onClick={openPaymentGateway}
            className="w-full bg-black hover:bg-gray-900 text-white py-3.5 rounded-xl font-extrabold text-lg shadow-md"
          >
            Proceed to Pay ₹{total}
          </button>
        </div>
      )}

      {/* Test Payment Gateway Modal */}
      {showGateway && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="text-xs text-gray-500 font-semibold">TEST PAYMENT GATEWAY</p>
                <h3 className="text-xl font-extrabold">Pay ₹{total}</h3>
              </div>
              <button onClick={() => setShowGateway(false)} className="text-gray-400 hover:text-black text-xl font-bold">✕</button>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600 space-y-1">
              <p><strong>Customer:</strong> {name} ({phone})</p>
              <p><strong>Methods:</strong> UPI (GPay / PhonePe) • Cards • NetBanking</p>
            </div>
            <div className="space-y-2.5 pt-2">
              <button disabled={loading} onClick={handlePaymentSuccess} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow">
                {loading ? 'Confirming Order...' : '✅ Simulate Payment Success'}
              </button>
              <button disabled={loading} onClick={handlePaymentFailed} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow">
                ❌ Simulate Payment Failed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            {reviewSubmitted ? (
              <div className="py-6 space-y-2">
                <div className="text-5xl">🙌</div>
                <h3 className="text-xl font-extrabold text-green-700">Thank You for Your Review!</h3>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-extrabold">Rate Order #{activeOrder?.order_no}</h3>
                  <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-black font-bold">✕</button>
                </div>
                <div className="flex justify-center gap-2 text-3xl py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  placeholder="Write a quick review (optional)..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:outline-none focus:border-black"
                />
                <button onClick={handleReviewSubmit} className="w-full bg-black text-white py-3 rounded-xl font-bold shadow">
                  Submit Feedback
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
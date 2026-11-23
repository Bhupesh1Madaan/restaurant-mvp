'use client';
import { useEffect, useState, useRef } from 'react';
import DishImage from '@/components/DishImage';

export default function KitchenAdmin() {
  // Simple PIN Protection
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');

  const [orders, setOrders] = useState<any[]>([]);
  const [menu, setMenu] = useState<any[]>([]);
  const [tab, setTab] = useState<'ORDERS' | 'INVENTORY'>('ORDERS');
  
  // Add New Dish Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Burgers');
  const [newType, setNewType] = useState<'VEG' | 'NON-VEG'>('VEG');
  const [newImage, setNewImage] = useState('');
  const [savingDish, setSavingDish] = useState(false);

  const prevCount = useRef(0);

  const loadData = async () => {
    const ordRes = await fetch('/api/orders');
    const ordData = await ordRes.json();

    if (prevCount.current > 0 && ordData.length > prevCount.current) {
      new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(() => {});
    }
    prevCount.current = ordData.length;
    setOrders([...ordData].reverse());

    const menuRes = await fetch('/api/menu');
    setMenu(await menuRes.json());
  };

  useEffect(() => {
    if (!unlocked) return;
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [unlocked]);

  const markReady = async (rowIndex: number) => {
    await fetch('/api/orders', {
      method: 'PATCH',
      body: JSON.stringify({ rowIndex, status: 'READY' }),
    });
    loadData();
  };

  const toggleStock = async (rowIndex: number, current: boolean) => {
    await fetch('/api/menu', {
      method: 'PATCH',
      body: JSON.stringify({ rowIndex, in_stock: !current }),
    });
    loadData();
  };

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) return alert('Enter dish name and price');
    setSavingDish(true);
    await fetch('/api/menu', {
      method: 'POST',
      body: JSON.stringify({
        name: newName.trim(),
        price: Number(newPrice),
        category: newCategory,
        type: newType,
        image_url: newImage.trim(),
      }),
    });
    setNewName('');
    setNewPrice('');
    setNewImage('');
    setSavingDish(false);
    setShowAddForm(false);
    loadData();
  };

  // PIN Lock Screen
  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-6 rounded-2xl shadow-md border max-w-xs w-full text-center space-y-4">
          <div className="text-4xl">🔐</div>
          <h1 className="text-xl font-extrabold">Kitchen Staff Login</h1>
          <p className="text-xs text-gray-500">Enter 4-digit PIN (Demo PIN: 1234)</p>
          <input
            type="password"
            maxLength={4}
            placeholder="••••"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-full border p-3 rounded-xl text-center text-2xl tracking-widest font-bold"
          />
          <button
            onClick={() => (pinInput === '1234' ? setUnlocked(true) : alert('Wrong PIN! Use 1234'))}
            className="w-full bg-black text-white py-3 rounded-xl font-bold"
          >
            Unlock Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      {/* Header & Quick Stats */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">👨‍🍳 Kitchen Admin Portal</h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Total Orders: <span className="text-black font-bold">{orders.length}</span> • Total Sales: <span className="text-green-700 font-bold">₹{totalRevenue}</span>
          </p>
        </div>
        <div className="space-x-2">
          <button onClick={() => setTab('ORDERS')} className={`px-4 py-2 rounded-xl font-bold text-sm ${tab === 'ORDERS' ? 'bg-black text-white' : 'bg-gray-200'}`}>
            Live Orders ({orders.filter((o) => o.status === 'PREPARING').length})
          </button>
          <button onClick={() => setTab('INVENTORY')} className={`px-4 py-2 rounded-xl font-bold text-sm ${tab === 'INVENTORY' ? 'bg-black text-white' : 'bg-gray-200'}`}>
            Menu & Stock ({menu.length})
          </button>
        </div>
      </div>

      {tab === 'ORDERS' ? (
        <div className="grid md:grid-cols-2 gap-4">
          {orders.map((o) => (
            <div key={o.order_no} className={`p-5 rounded-2xl border-2 ${o.status === 'READY' ? 'bg-green-50 border-green-400' : 'bg-white border-orange-400 shadow'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xl font-black">#{o.order_no}</span>
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${o.status === 'READY' ? 'bg-green-600 text-white' : 'bg-orange-500 text-white'}`}>
                  {o.status}
                </span>
              </div>
              <p className="font-bold text-gray-800">{o.name} • <span className="text-gray-500 text-sm">{o.phone}</span></p>
              <div className="my-3 border-t border-b py-2 space-y-1">
                {o.items.map((item: any, idx: number) => (
                  <p key={idx} className="font-semibold text-base">• {item.name} × {item.qty}</p>
                ))}
              </div>
              {o.status === 'PREPARING' && (
                <button onClick={() => markReady(o.rowIndex)} className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold">
                  ✅ Mark Order Ready
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Add New Dish Button / Form */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-black text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow"
            >
              {showAddForm ? 'Cancel ✕' : '+ Add New Dish to Menu'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddDish} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-lg">Add New Item</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Dish Name (e.g., Aloo Tikki Burger)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border p-2.5 rounded-xl text-sm"
                />
                <input
                  required
                  type="number"
                  placeholder="Price in ₹ (e.g., 120)"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="border p-2.5 rounded-xl text-sm"
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="border p-2.5 rounded-xl text-sm bg-white"
                >
                  <option value="Burgers">Burgers</option>
                  <option value="Rolls">Rolls</option>
                  <option value="Wraps">Wraps</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Sides">Sides</option>
                  <option value="Dessert">Dessert</option>
                </select>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('VEG')}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold border ${newType === 'VEG' ? 'bg-green-50 border-green-600 text-green-700' : 'bg-white text-gray-500'}`}
                  >
                    🟢 VEG
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('NON-VEG')}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold border ${newType === 'NON-VEG' ? 'bg-red-50 border-red-600 text-red-700' : 'bg-white text-gray-500'}`}
                  >
                    🔴 NON-VEG
                  </button>
                </div>
              </div>
              <input
                placeholder="Image URL (Optional - leave blank for auto Category SVG)"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className="w-full border p-2.5 rounded-xl text-sm"
              />
              <button disabled={savingDish} type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold">
                {savingDish ? 'Saving to Menu...' : 'Save Item to Live Menu'}
              </button>
            </form>
          )}

          {/* Inventory List */}
          <div className="bg-white rounded-2xl shadow divide-y">
            {menu.map((m) => (
              <div key={m.id} className="p-4 flex justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <DishImage src={m.image_url} category={m.category} alt={m.name} className="w-12 h-12 rounded-lg" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${m.type === 'VEG' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                      <p className="font-bold">{m.name}</p>
                    </div>
                    <p className="text-xs text-gray-500">₹{m.price} • {m.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleStock(m.rowIndex, m.in_stock)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 ${m.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                  {m.in_stock ? 'IN STOCK' : 'OUT OF STOCK'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
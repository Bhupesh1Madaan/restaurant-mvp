'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderStatus() {
  const params = useParams();
  const orderNo = params?.orderNo as string;
  const [order, setOrder] = useState<any>(null);

  const fetchOrder = async () => {
    if (!orderNo) return;
    const res = await fetch('/api/orders');
    const all = await res.json();
    const found = all.find((o: any) => o.order_no === orderNo);
    setOrder(found);
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 4000);
    return () => clearInterval(interval);
  }, [orderNo]);

  if (!order) {
    return (
      <div className="max-w-md mx-auto p-10 text-center font-sans">
        <div className="text-5xl animate-bounce mb-3">🍳</div>
        <p className="font-bold text-gray-700">Confirming Order #{orderNo}...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-5 text-center font-sans min-h-screen">
      <div className="text-left mb-3">
        <Link href="/" className="text-xs font-bold text-gray-600 hover:text-black">
          ← Back to Menu
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-bold">
          ORDER #{order.order_no}
        </span>
        <h2 className="text-xl font-bold mt-3">{order.name}</h2>
        <p className="text-xs text-gray-400">{order.phone}</p>

        {order.status === 'PREPARING' ? (
          <div className="my-6 bg-orange-50 p-5 rounded-2xl border border-orange-200">
            <div className="text-6xl animate-bounce mb-3">🍳</div>
            <span className="bg-orange-500 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Status: Preparing
            </span>
            <h1 className="text-2xl font-extrabold text-orange-700 mt-3">
              Your order is getting prepared!
            </h1>
            <p className="text-gray-600 text-sm mt-1">Estimated time: 5–10 mins</p>
          </div>
        ) : (
          <div className="my-6 bg-green-100 p-5 rounded-2xl border-2 border-green-500">
            <div className="text-5xl mb-2">✅</div>
            <span className="bg-green-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Status: Ready
            </span>
            <h1 className="text-2xl font-extrabold text-green-800 mt-3">Order Ready!</h1>
            <p className="text-green-700 font-medium mt-1">
              Please pick your order from the counter
            </p>
          </div>
        )}

        <div className="text-left border-t border-b py-3 my-4 space-y-1.5">
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{item.name} × {item.qty}</span>
              <span className="font-semibold">₹{item.price * item.qty}</span>
            </div>
          ))}
          <div className="flex justify-between font-extrabold text-base pt-2 border-t">
            <span>Total Paid</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        <Link
          href={`/invoice/${order.order_no}`}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow"
        >
          📄 View / Download Invoice
        </Link>
      </div>
    </div>
  );
}
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function InvoicePage() {
  const params = useParams();
  const orderNo = params?.orderNo as string;
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!orderNo) return;
    fetch('/api/orders').then((r) => r.json()).then((all) => {
      setOrder(all.find((o: any) => o.order_no === orderNo));
    });
  }, [orderNo]);

  if (!order) return <div className="p-10 text-center">Generating Invoice...</div>;

  return (
    <div className="max-w-sm mx-auto p-6 bg-white border rounded-xl shadow-sm my-6 font-mono text-sm">
      <div className="text-center border-b pb-3 mb-3">
        <h1 className="text-xl font-bold">THE CAFE COUNTER</h1>
        <p className="text-xs text-gray-500">Tax Invoice / Order Receipt</p>
      </div>
      <p><strong>Order No:</strong> #{order.order_no}</p>
      <p><strong>Date:</strong> {order.timestamp}</p>
      <p><strong>Customer:</strong> {order.name} ({order.phone})</p>

      <div className="border-t border-b my-3 py-2 space-y-1">
        {order.items.map((i: any, idx: number) => (
          <div key={idx} className="flex justify-between">
            <span>{i.name} x{i.qty}</span>
            <span>₹{i.price * i.qty}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between font-bold text-base">
        <span>GRAND TOTAL</span>
        <span>₹{order.total}</span>
      </div>
      <p className="text-center text-xs text-gray-500 mt-4">Paid Online • Thank You!</p>

      <button onClick={() => window.print()} className="mt-6 w-full bg-black text-white py-2.5 rounded-lg font-sans font-bold print:hidden">
        ⬇️ Save / Print PDF Invoice
      </button>
    </div>
  );
}
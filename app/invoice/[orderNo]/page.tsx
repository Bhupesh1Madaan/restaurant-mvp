'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function InvoicePage() {
  const params = useParams();
  const orderNo = params?.orderNo as string;
  const [order, setOrder] = useState<any>(null);
  const [info, setInfo] = useState<any>({});

  useEffect(() => {
    if (!orderNo) return;
    fetch('/api/orders').then((r) => r.json()).then((all) => {
      setOrder(all.find((o: any) => o.order_no === orderNo));
    });
    fetch('/api/settings').then((r) => r.json()).then(setInfo);
  }, [orderNo]);

  if (!order) return <div className="p-10 text-center font-sans">Generating GST Invoice...</div>;

  // 5% GST Reverse Calculation (Inclusive of GST)
  const baseAmount = Number((order.total / 1.05).toFixed(2));
  const cgst = Number(((order.total - baseAmount) / 2).toFixed(2));
  const sgst = Number(((order.total - baseAmount) / 2).toFixed(2));

  return (
    <div className="max-w-sm mx-auto p-6 bg-white border rounded-xl shadow-sm my-6 font-mono text-xs text-gray-800">
      <div className="text-center border-b border-dashed pb-3 mb-3 space-y-1">
        <h1 className="text-lg font-extrabold tracking-wide">{info.restaurant_name || 'THE URBAN COUNTER'}</h1>
        <p className="text-[11px] text-gray-500">{info.address || 'Shop 12, Connaught Place, New Delhi'}</p>
        <p className="text-[10px] text-gray-500">GSTIN: {info.gstin || '07AABCU9603R1ZM'} | FSSAI: {info.fssai || '13324001000987'}</p>
        <p className="font-bold pt-1 text-xs">TAX INVOICE</p>
      </div>

      <div className="space-y-0.5 mb-3">
        <p><strong>Invoice / Order No:</strong> #{order.order_no}</p>
        <p><strong>Date:</strong> {order.timestamp}</p>
        <p><strong>Customer:</strong> {order.name} ({order.phone})</p>
      </div>

      <div className="border-t border-b border-dashed my-3 py-2 space-y-1.5">
        {order.items.map((i: any, idx: number) => (
          <div key={idx} className="flex justify-between">
            <span>{i.name} × {i.qty}</span>
            <span>₹{(i.price * i.qty).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* GST Split Breakdown */}
      <div className="space-y-1 text-[11px] text-gray-600 pb-2 border-b border-dashed">
        <div className="flex justify-between">
          <span>Item Subtotal</span>
          <span>₹{baseAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>CGST (2.5%)</span>
          <span>₹{cgst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>SGST (2.5%)</span>
          <span>₹{sgst.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between font-extrabold text-sm pt-2">
        <span>GRAND TOTAL</span>
        <span>₹{order.total.toFixed(2)}</span>
      </div>

      <p className="text-center text-[11px] text-gray-500 mt-4">Paid Online • Thank You for Ordering!</p>

      <button onClick={() => window.print()} className="mt-5 w-full bg-black text-white py-2.5 rounded-lg font-sans font-bold text-sm print:hidden">
        ⬇️ Save / Print PDF Invoice
      </button>
    </div>
  );
}
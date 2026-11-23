import { NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/sheets';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

export async function GET() {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Orders!A2:G',
  });
  const rows = res.data.values || [];
  const orders = rows.map((r, i) => ({
    rowIndex: i + 2,
    order_no: r[0],
    timestamp: r[1],
    name: r[2],
    phone: r[3],
    items: JSON.parse(r[4] || '[]'),
    total: Number(r[5]),
    status: r[6],
  }));
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const { name, phone, items, total } = await req.json();
  const sheets = await getSheetsClient();

  const ordRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Orders!A2:A',
  });
  const orderCount = (ordRes.data.values?.length || 0) + 101;
  const orderNo = String(orderCount);
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Orders!A:G',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[orderNo, timestamp, name, phone, JSON.stringify(items), total, 'PREPARING']],
    },
  });

  const custRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Customers!A2:D',
  });
  const customers = custRes.data.values || [];
  const existingIdx = customers.findIndex((c) => c[0] === phone);
  const newOrderSummary = { order_no: orderNo, date: timestamp, items, total };

  if (existingIdx !== -1) {
    const rowNum = existingIdx + 2;
    const prevOrdersCount = Number(customers[existingIdx][2] || 0) + 1;
    const prevHistory = JSON.parse(customers[existingIdx][3] || '[]');
    prevHistory.push(newOrderSummary);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Customers!B${rowNum}:D${rowNum}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[name, prevOrdersCount, JSON.stringify(prevHistory)]] },
    });
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Customers!A:D',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[phone, name, 1, JSON.stringify([newOrderSummary])]] },
    });
  }

  return NextResponse.json({ order_no: orderNo });
}

export async function PATCH(req: Request) {
  const { rowIndex, status } = await req.json();
  const sheets = await getSheetsClient();

  if (status) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Orders!G${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[status]] },
    });
  }

  return NextResponse.json({ success: true });
}
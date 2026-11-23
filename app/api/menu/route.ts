import { NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

export async function GET() {
  try {
    if (!SHEET_ID || !process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Missing Google Sheets environment variables on Vercel' },
        { status: 500 }
      );
    }

    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Menu!A2:G',
    });
    const rows = res.data.values || [];
    const menu = rows.map((r, index) => ({
      rowIndex: index + 2,
      id: r[0],
      name: r[1],
      category: r[2] || 'General',
      price: Number(r[3]),
      in_stock: r[4] === 'TRUE',
      image_url: r[5] || '',
      type: (r[6] || 'VEG').toUpperCase(),
    }));
    return NextResponse.json(menu);
  } catch (err: any) {
    console.error('MENU API ERROR:', err);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, category, price, image_url, type } = await req.json();
    const sheets = await getSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Menu!A2:A',
    });
    const nextId = String((res.data.values?.length || 0) + 1);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Menu!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[nextId, name, category, Number(price), 'TRUE', image_url || '', type || 'VEG']],
      },
    });

    return NextResponse.json({ success: true, id: nextId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { rowIndex, in_stock } = await req.json();
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Menu!E${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[in_stock ? 'TRUE' : 'FALSE']] },
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/sheets';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

export async function POST(req: Request) {
  try {
    const { order_no, name, phone, rating, comment } = await req.json();
    const sheets = await getSheetsClient();
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Reviews!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[order_no, timestamp, name, phone, rating, comment || '']],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
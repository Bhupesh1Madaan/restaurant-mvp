import { NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/sheets';

export const dynamic = 'force-dynamic';
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

export async function GET() {
  try {
    const sheets = await getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Settings!A2:B',
    });
    const rows = res.data.values || [];
    const settings: Record<string, string> = {};
    rows.forEach((r) => {
      if (r[0]) settings[r[0].trim()] = r[1] || '';
    });
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({
      admin_pin: '1234',
      restaurant_name: 'THE URBAN COUNTER',
      address: 'Shop 12, Main Market, New Delhi',
      gstin: '07AABCU9603R1ZM',
      fssai: '13324001000987',
    });
  }
}
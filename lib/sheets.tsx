import { google } from 'googleapis';

export async function getSheetsClient() {
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
  const cleanedKey = rawKey
    .replace(/^"|"$/g, '')
    .replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL?.trim(),
      private_key: cleanedKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}
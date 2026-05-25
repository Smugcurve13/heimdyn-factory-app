import { NextResponse } from 'next/server';
import data from '@/data/sales/summary.json';

export async function GET() {
  return NextResponse.json(data);
}

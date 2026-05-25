import { NextResponse } from 'next/server';
import data from '@/data/sales/order-size.json';

export async function GET() {
  return NextResponse.json(data);
}

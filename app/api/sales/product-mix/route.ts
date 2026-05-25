import { NextResponse } from 'next/server';
import data from '@/data/sales/product-mix.json';

export async function GET() {
  return NextResponse.json(data);
}

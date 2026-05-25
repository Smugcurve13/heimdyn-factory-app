import { NextResponse } from 'next/server';
import data from '@/data/analysis/yield-by-product-line.json';

export async function GET() {
  return NextResponse.json(data);
}

import { NextResponse } from 'next/server';
import data from '@/data/sales/top-distributors.json';

export async function GET() {
  return NextResponse.json(data);
}

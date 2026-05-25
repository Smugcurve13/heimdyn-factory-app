import { NextResponse } from 'next/server';
import data from '@/data/sales/available-days.json';

export async function GET() {
  return NextResponse.json(data);
}

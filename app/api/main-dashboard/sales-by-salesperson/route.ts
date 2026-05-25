import { NextResponse } from 'next/server';
import data from '@/data/main-dashboard/sales-by-rep.json';

export async function GET() {
  return NextResponse.json(data);
}

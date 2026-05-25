import { NextResponse } from 'next/server';
import data from '@/data/main-dashboard/monthly-trend.json';

export async function GET() {
  return NextResponse.json(data);
}

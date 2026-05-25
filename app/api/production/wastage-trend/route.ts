import { NextResponse } from 'next/server';
import data from '@/data/production/scrap-trend.json';

export async function GET() {
  return NextResponse.json(data);
}

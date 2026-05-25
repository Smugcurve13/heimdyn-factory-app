import { NextResponse } from 'next/server';
import data from '@/data/analysis/day-of-week.json';

export async function GET() {
  return NextResponse.json(data);
}

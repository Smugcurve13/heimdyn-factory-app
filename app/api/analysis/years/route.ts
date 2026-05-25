import { NextResponse } from 'next/server';
import data from '@/data/analysis/years.json';

export async function GET() {
  return NextResponse.json(data);
}

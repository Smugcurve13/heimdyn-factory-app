import { NextResponse } from 'next/server';
import data from '@/data/analysis/qoq.json';

export async function GET() {
  return NextResponse.json(data);
}

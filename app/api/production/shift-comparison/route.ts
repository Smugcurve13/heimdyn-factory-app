import { NextResponse } from 'next/server';
import data from '@/data/production/shift-comparison.json';

export async function GET() {
  return NextResponse.json(data);
}

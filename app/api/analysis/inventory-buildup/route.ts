import { NextResponse } from 'next/server';
import data from '@/data/analysis/inventory-buildup.json';

export async function GET() {
  return NextResponse.json(data);
}

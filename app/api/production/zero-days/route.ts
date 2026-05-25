import { NextResponse } from 'next/server';
import data from '@/data/production/zero-days.json';

export async function GET() {
  return NextResponse.json(data);
}

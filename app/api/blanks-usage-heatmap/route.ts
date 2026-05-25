import { NextResponse } from 'next/server';
import data from '@/data/main-dashboard/components-usage.json';

export async function GET() {
  return NextResponse.json(data);
}

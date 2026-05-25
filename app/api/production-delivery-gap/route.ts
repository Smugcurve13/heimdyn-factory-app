import { NextResponse } from 'next/server';
import data from '@/data/main-dashboard/production-delivery-gap.json';

export async function GET() {
  return NextResponse.json(data);
}

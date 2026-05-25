import { NextResponse } from 'next/server';
import data from '@/data/main-dashboard/overview.json';

export async function GET() {
  return NextResponse.json(data);
}

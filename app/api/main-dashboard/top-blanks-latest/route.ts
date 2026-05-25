import { NextResponse } from 'next/server';
import data from '@/data/main-dashboard/top-components.json';

export async function GET() {
  return NextResponse.json(data);
}

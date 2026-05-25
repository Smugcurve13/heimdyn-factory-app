import { NextResponse } from 'next/server';
import data from '@/data/main-dashboard/available-months.json';

export async function GET() {
  return NextResponse.json(data);
}

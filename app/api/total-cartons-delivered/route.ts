import { NextResponse } from 'next/server';
import data from '@/data/main-dashboard/total-units-delivered.json';

export async function GET() {
  return NextResponse.json(data);
}

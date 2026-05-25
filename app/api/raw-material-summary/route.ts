import { NextResponse } from 'next/server';
import data from '@/data/main-dashboard/raw-material-summary.json';

export async function GET() {
  return NextResponse.json(data);
}

import { NextResponse } from 'next/server';
import data from '@/data/material/summary.json';

export async function GET() {
  return NextResponse.json(data);
}

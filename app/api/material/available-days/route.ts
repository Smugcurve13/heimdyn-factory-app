import { NextResponse } from 'next/server';
import data from '@/data/material/available-days.json';

export async function GET() {
  return NextResponse.json(data);
}

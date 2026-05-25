import { NextResponse } from 'next/server';
import data from '@/data/material/available-months.json';

export async function GET() {
  return NextResponse.json(data);
}

import { NextResponse } from 'next/server';
import data from '@/data/material/by-component.json';

export async function GET() {
  return NextResponse.json(data);
}

import { NextResponse } from 'next/server';
import data from '@/data/production/by-operator.json';

export async function GET() {
  return NextResponse.json(data);
}

import { NextResponse, NextRequest } from 'next/server';
import totalCartonsProduced from '@/data/myo/kpi/total-cartons-produced.json';
import totalCartonsDelivered from '@/data/myo/kpi/total-cartons-delivered.json';
import productionDeliveryGap from '@/data/myo/kpi/production-delivery-gap.json';
import rawMaterialPurchased from '@/data/myo/kpi/raw-material-purchased.json';
import rawMaterialConsumed from '@/data/myo/kpi/raw-material-consumed.json';
import uniqueModelsProduced from '@/data/myo/kpi/unique-models-produced.json';

const kpiData: Record<string, unknown> = {
  'total-cartons-produced': totalCartonsProduced,
  'total-cartons-delivered': totalCartonsDelivered,
  'production-delivery-gap': productionDeliveryGap,
  'raw-material-purchased': rawMaterialPurchased,
  'raw-material-consumed': rawMaterialConsumed,
  'unique-models-produced': uniqueModelsProduced,
};

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id || !kpiData[id]) {
    return NextResponse.json({ error: 'KPI not found' }, { status: 404 });
  }
  return NextResponse.json(kpiData[id]);
}

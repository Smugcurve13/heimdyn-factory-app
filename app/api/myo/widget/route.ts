import { NextResponse, NextRequest } from 'next/server';
import cartonsByMonth from '@/data/myo/widget/cartons-by-month.json';
import deliveryByMonth from '@/data/myo/widget/delivery-by-month.json';
import salesByExecutive from '@/data/myo/widget/sales-by-executive.json';
import productionByModel from '@/data/myo/widget/production-by-model.json';
import productionByShift from '@/data/myo/widget/production-by-shift.json';
import topBlanksUsage from '@/data/myo/widget/top-blanks-usage.json';
import rawMaterialByVendor from '@/data/myo/widget/raw-material-by-vendor.json';
import consumptionByShift from '@/data/myo/widget/consumption-by-shift.json';
import productionVsDelivery from '@/data/myo/widget/production-vs-delivery.json';
import deliveryByDealer from '@/data/myo/widget/delivery-by-dealer.json';

const widgetData: Record<string, unknown> = {
  'cartons-by-month': cartonsByMonth,
  'delivery-by-month': deliveryByMonth,
  'sales-by-executive': salesByExecutive,
  'production-by-model': productionByModel,
  'production-by-shift': productionByShift,
  'top-blanks-usage': topBlanksUsage,
  'raw-material-by-vendor': rawMaterialByVendor,
  'consumption-by-shift': consumptionByShift,
  'production-vs-delivery': productionVsDelivery,
  'delivery-by-dealer': deliveryByDealer,
};

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id || !widgetData[id]) {
    return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
  }
  return NextResponse.json(widgetData[id]);
}

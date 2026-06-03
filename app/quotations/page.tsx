'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { products, customers } from '@/lib/erp/seed';
import { getProduct, getCustomer, formatPrice } from '@/lib/erp/selectors';
import { useErpStore } from '@/lib/erp/store';
import { Quotation, QuotationStage } from '@/lib/erp/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { StatusPill, statusTone } from '@/components/erp/StatusPill';
import { DrawerField } from '@/components/erp/DrawerField';
import { DocumentTrail, TrailNode } from '@/components/erp/DocumentTrail';

const STAGES: QuotationStage[] = ['Draft', 'Pending Approval', 'Proforma Invoice', 'Sales Order Raised'];

const quoteTotal = (q: Quotation) => q.lines.reduce((s, l) => s + l.quantity * l.unitPriceUsd, 0);
const quoteQty = (q: Quotation) => q.lines.reduce((s, l) => s + l.quantity, 0);

export default function QuotationsPage() {
  return (
    <Suspense fallback={null}>
      <Quotations />
    </Suspense>
  );
}

function Quotations() {
  const store = useErpStore();
  const focus = useSearchParams().get('focus');
  const { quotations } = store;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    if (focus) setSelectedId(focus);
  }, [focus]);

  const selected = selectedId ? quotations.find((q) => q.id === selectedId) ?? null : null;

  const byStage = useMemo(() => {
    const map: Record<string, Quotation[]> = { Draft: [], 'Pending Approval': [], 'Proforma Invoice': [], 'Sales Order Raised': [] };
    quotations.forEach((q) => map[q.stage]?.push(q));
    return map;
  }, [quotations]);

  const trailFor = (q: Quotation): TrailNode[] => {
    const so = q.linkedSO ? store.getSalesOrder(q.linkedSO) : undefined;
    const mo = q.linkedMO ? store.getManufacturingOrder(q.linkedMO) : undefined;
    const nodes: TrailNode[] = [{ type: 'QT', id: q.id, status: q.stage }];
    if (so) nodes.push({ type: 'SO', id: so.id, status: so.stage });
    if (mo) {
      nodes.push({ type: 'MO', id: mo.id, status: mo.stage });
      mo.raisedPOs.forEach((poId) => {
        const po = store.getPurchaseOrder(poId);
        if (po) nodes.push({ type: 'PO', id: po.id, status: po.stage });
      });
    }
    return nodes;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Quotations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The pipeline for every enquiry. Pricing in USD; stock checked as you build.
          </p>
        </div>
        <Button onClick={() => setWizardOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          New Quotation
        </Button>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((stage) => (
          <div key={stage} className="rounded-lg border border-border bg-card/40">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{stage}</span>
              <span className="font-mono text-xs text-muted-foreground">{byStage[stage].length}</span>
            </div>
            <div className="space-y-2 p-2">
              {byStage[stage].length === 0 && (
                <p className="px-1 py-4 text-center text-xs text-muted-foreground">No quotations</p>
              )}
              {byStage[stage].map((q) => {
                const product = getProduct(q.lines[0]?.productId);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setSelectedId(q.id)}
                    className="w-full rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">{q.id}</span>
                      {q.stockShort && (
                        <span className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
                          Requires MO
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm font-medium text-foreground">
                      {getCustomer(q.customerId)?.name ?? q.customerId}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{product?.name ?? '—'}</div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-mono text-muted-foreground">{quoteQty(q).toLocaleString('en-US')} units</span>
                      <span className="font-mono text-foreground">{formatPrice(quoteTotal(q))}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Detail drawer */}
      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent
          side="right"
          className="w-full gap-0 border-l border-border bg-popover p-0 shadow-none sm:max-w-[480px]"
        >
          {selected && (
            <div className="flex h-full flex-col">
              <div className="border-b border-border px-6 py-5">
                <SheetTitle className="text-lg font-semibold text-foreground">{selected.id}</SheetTitle>
                <SheetDescription className="mt-1 text-sm text-muted-foreground">
                  {getCustomer(selected.customerId)?.name ?? selected.customerId}
                </SheetDescription>
              </div>
              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                <div>
                  <DrawerField label="Customer" value={getCustomer(selected.customerId)?.name ?? selected.customerId} />
                  <DrawerField label="Date" value={selected.date} mono />
                  <DrawerField label="Status" value={<StatusPill label={selected.stage} tone={statusTone(selected.stage)} />} />
                  <DrawerField
                    label="Stock"
                    value={
                      selected.stockShort ? (
                        <StatusPill label="Requires MO" tone="red" />
                      ) : (
                        <StatusPill label="In stock" tone="green" />
                      )
                    }
                  />
                </div>

                {/* Line items */}
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Line Items</p>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-card">
                          <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Product</th>
                          <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Qty</th>
                          <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Price</th>
                          <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.lines.map((l, i) => (
                          <tr key={l.productId} className={i % 2 === 1 ? 'bg-card/50' : undefined}>
                            <td className="px-3 py-2 text-foreground">
                              <div className="font-mono text-xs text-muted-foreground">{l.productId}</div>
                              <div>{getProduct(l.productId)?.name ?? '—'}</div>
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-foreground">{l.quantity.toLocaleString('en-US')}</td>
                            <td className="px-3 py-2 text-right font-mono text-foreground">{formatPrice(l.unitPriceUsd)}</td>
                            <td className="px-3 py-2 text-right font-mono text-foreground">{formatPrice(l.quantity * l.unitPriceUsd)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-border">
                          <td className="px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground" colSpan={3}>Total</td>
                          <td className="px-3 py-2 text-right font-mono font-semibold text-foreground">{formatPrice(quoteTotal(selected))}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Approve / Reject — only at Pending Approval. No "Convert to SO" anywhere. */}
                {selected.stage === 'Pending Approval' && (
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => store.approveQuotation(selected.id)}>
                      Approve
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => store.rejectQuotation(selected.id)}>
                      Reject
                    </Button>
                  </div>
                )}

                <DocumentTrail nodes={trailFor(selected)} currentId={selected.id} />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <NewQuotationWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreate={(customerId, lines) => {
          const stockShort = lines.some((l) => (getProduct(l.productId)?.finishedStock ?? 0) < l.quantity);
          const id = store.addQuotation({
            customerId,
            date: new Date().toISOString().slice(0, 10),
            stage: 'Draft',
            stockShort,
            lines,
            linkedMO: null,
            linkedSO: null,
          });
          setWizardOpen(false);
          setSelectedId(id);
        }}
      />
    </div>
  );
}

interface WizardLine {
  productId: string;
  quantity: number;
}

function NewQuotationWizard({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (customerId: string, lines: { productId: string; quantity: number; unitPriceUsd: number }[]) => void;
}) {
  const finishedGoods = useMemo(() => products.filter((p) => p.status === 'Active'), []);
  const [step, setStep] = useState(1);
  const [customerId, setCustomerId] = useState('');
  const [lines, setLines] = useState<WizardLine[]>([{ productId: '', quantity: 1 }]);

  const reset = () => {
    setStep(1);
    setCustomerId('');
    setLines([{ productId: '', quantity: 1 }]);
  };

  const close = () => {
    reset();
    onClose();
  };

  const validLines = lines.filter((l) => l.productId && l.quantity > 0);
  const total = validLines.reduce((s, l) => s + (getProduct(l.productId)?.priceUsd ?? 0) * l.quantity, 0);

  const step1Valid = customerId !== '';
  const step2Valid = validLines.length > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-lg border-border bg-popover">
        <DialogHeader>
          <DialogTitle>New Quotation</DialogTitle>
          <DialogDescription>Step {step} of 3 · USD pricing</DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex gap-2">
          {['Customer', 'Line items', 'Review'].map((label, i) => (
            <div
              key={label}
              className={cn(
                'flex-1 rounded-md border px-2 py-1 text-center text-xs',
                step === i + 1
                  ? 'border-primary bg-primary/10 text-primary'
                  : step > i + 1
                    ? 'border-border bg-card text-muted-foreground'
                    : 'border-border bg-card text-muted-foreground',
              )}
            >
              {i + 1}. {label}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.city}
                </option>
              ))}
            </select>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            {lines.map((line, idx) => {
              const product = getProduct(line.productId);
              const short = product ? product.finishedStock < line.quantity : false;
              return (
                <div key={idx} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={line.productId}
                      onChange={(e) =>
                        setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, productId: e.target.value } : l)))
                      }
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    >
                      <option value="">Select product (finished goods)…</option>
                      {finishedGoods.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {formatPrice(p.priceUsd)}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) =>
                        setLines((prev) =>
                          prev.map((l, i) => (i === idx ? { ...l, quantity: Number(e.target.value) } : l)),
                        )
                      }
                      className="w-24 font-mono"
                    />
                    {lines.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {product && (
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <StatusPill
                        label={short ? 'Will require production' : 'In stock'}
                        tone={short ? 'amber' : 'green'}
                      />
                      <span className="font-mono text-foreground">{formatPrice(product.priceUsd * line.quantity)}</span>
                    </div>
                  )}
                </div>
              );
            })}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setLines((prev) => [...prev, { productId: '', quantity: 1 }])}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add line item
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-sm">
            <DrawerField label="Customer" value={getCustomer(customerId)?.name ?? '—'} />
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-card">
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Product</th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Qty</th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {validLines.map((l) => {
                    const p = getProduct(l.productId);
                    return (
                      <tr key={l.productId}>
                        <td className="px-3 py-2 text-foreground">{p?.name}</td>
                        <td className="px-3 py-2 text-right font-mono text-foreground">{l.quantity.toLocaleString('en-US')}</td>
                        <td className="px-3 py-2 text-right font-mono text-foreground">{formatPrice((p?.priceUsd ?? 0) * l.quantity)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground" colSpan={2}>Total</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold text-foreground">{formatPrice(total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => (step === 1 ? close() : setStep((s) => s - 1))}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          {step < 3 ? (
            <Button
              disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
              onClick={() => setStep((s) => s + 1)}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={() =>
                onCreate(
                  customerId,
                  validLines.map((l) => ({
                    productId: l.productId,
                    quantity: l.quantity,
                    unitPriceUsd: getProduct(l.productId)?.priceUsd ?? 0,
                  })),
                )
              }
            >
              Create quotation
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

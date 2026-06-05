import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatPrice } from './selectors';

/**
 * Client-side invoice PDF generator for approved quotations (Phase 2 demo).
 *
 * The caller (the Quotations drawer) assembles a fully-resolved InvoiceData
 * object — invoice number/date are frozen on the quotation at approval, so the
 * same input always renders the same document. Seller, tax, and bank details
 * are hardcoded dummy placeholders for the demo.
 */

export interface InvoiceLine {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceUsd: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  quotationId: string;
  customer: { name: string; city: string };
  lines: InvoiceLine[];
}

// --- Dummy seller identity (placeholder until real company data is wired up) ---
const SELLER = {
  name: 'Heimdyn Manufacturing Co.',
  address: ['1420 Industrial Parkway', 'Tacoma, WA 98402', 'United States'],
  taxId: 'Tax ID: 91-1234567',
  email: 'accounts@heimdyn.example',
  phone: '+1 (253) 555-0142',
};
const BANK = {
  beneficiary: 'Heimdyn Manufacturing Co.',
  bank: 'Pacific Commerce Bank',
  account: 'Account #: 0042 8891 2207',
  routing: 'Routing #: 125000024',
};
const PAYMENT_TERMS = 'Payment due within 30 days of invoice date (Net 30).';
const TAX_RATE = 0; // demo placeholder — no tax applied

const MARGIN = 40;
const TEXT = [31, 41, 55] as [number, number, number]; // slate-800
const MUTED = [107, 114, 128] as [number, number, number]; // gray-500
const ACCENT = [37, 99, 235] as [number, number, number]; // blue-600

export function downloadInvoicePdf(data: InvoiceData): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const rightX = pageWidth - MARGIN;

  // --- Header: seller (left) + INVOICE meta (right) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...TEXT);
  doc.text(SELLER.name, MARGIN, 56);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  let y = 74;
  [...SELLER.address, SELLER.taxId, SELLER.email, SELLER.phone].forEach((line) => {
    doc.text(line, MARGIN, y);
    y += 13;
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...ACCENT);
  doc.text('INVOICE', rightX, 58, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT);
  const meta: [string, string][] = [
    ['Invoice #', data.invoiceNumber],
    ['Date', data.invoiceDate],
    ['Quotation', data.quotationId],
  ];
  let my = 78;
  meta.forEach(([label, value]) => {
    doc.setTextColor(...MUTED);
    doc.text(label, rightX - 130, my, { align: 'left' });
    doc.setTextColor(...TEXT);
    doc.text(value, rightX, my, { align: 'right' });
    my += 14;
  });

  // --- Bill To ---
  const billY = Math.max(y, my) + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('BILL TO', MARGIN, billY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...TEXT);
  doc.text(data.customer.name, MARGIN, billY + 16);
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(data.customer.city, MARGIN, billY + 30);

  // --- Line items table ---
  const body = data.lines.map((l, i) => [
    String(i + 1),
    `${l.productId}\n${l.productName}`,
    l.quantity.toLocaleString('en-US'),
    formatPrice(l.unitPriceUsd),
    formatPrice(l.quantity * l.unitPriceUsd),
  ]);

  autoTable(doc, {
    startY: billY + 50,
    head: [['#', 'Product', 'Qty', 'Unit Price', 'Amount']],
    body,
    theme: 'striped',
    styles: { fontSize: 9, cellPadding: 6, textColor: TEXT },
    headStyles: { fillColor: ACCENT, textColor: [255, 255, 255], halign: 'left' },
    columnStyles: {
      0: { cellWidth: 28, halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  // --- Totals ---
  const subtotal = data.lines.reduce((s, l) => s + l.quantity * l.unitPriceUsd, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  let ty = finalY + 22;
  const labelX = rightX - 150;
  const row = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 11 : 9);
    doc.setTextColor(...(bold ? TEXT : MUTED));
    doc.text(label, labelX, ty);
    doc.setTextColor(...TEXT);
    doc.text(value, rightX, ty, { align: 'right' });
    ty += bold ? 20 : 16;
  };
  row('Subtotal', formatPrice(subtotal));
  row(`Tax (${TAX_RATE * 100}% — demo)`, formatPrice(tax));
  doc.setDrawColor(...MUTED);
  doc.line(labelX, ty - 6, rightX, ty - 6);
  row('Total', formatPrice(total), true);

  // --- Footer: payment terms + bank (dummy) ---
  let fy = pageHeight - 96;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('PAYMENT', MARGIN, fy);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT);
  fy += 14;
  doc.text(PAYMENT_TERMS, MARGIN, fy);
  fy += 13;
  [`${BANK.bank} — ${BANK.beneficiary}`, `${BANK.account}   ${BANK.routing}`].forEach((line) => {
    doc.setTextColor(...MUTED);
    doc.text(line, MARGIN, fy);
    fy += 13;
  });

  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text('This is a system-generated document and does not require a signature.', MARGIN, pageHeight - 28);

  doc.save(`${data.invoiceNumber}.pdf`);
}

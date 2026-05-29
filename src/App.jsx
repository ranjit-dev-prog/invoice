import { useState, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// STYLES  (App.css inlined — matches PDF reference exactly)
// ─────────────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --black:      #0a0a0a;
    --ink:        #1a1a1a;
    --gray-dark:  #444;
    --gray-mid:   #888;
    --gray-light: #bbb;
    --gray-pale:  #e4e4e4;
    --gray-bg:    #f2f2f0;
    --white:      #ffffff;
    --font-body:  'DM Sans', sans-serif;
    --font-disp:  'DM Serif Display', serif;
    --radius:     6px;
  }

  html, body { height: 100%; font-family: var(--font-body); background: var(--gray-bg); color: var(--ink); font-size: 14px; }

  /* ── App shell ── */
  .app-root { display: flex; height: 100vh; overflow: hidden; }

  /* ════════════════════════════════════
     SIDEBAR
  ════════════════════════════════════ */
  .sidebar {
    width: 300px; min-width: 300px;
    background: var(--white);
    border-right: 1px solid var(--gray-pale);
    display: flex; flex-direction: column; overflow: hidden;
  }

  /* Head */
  .sb-head {
    padding: 14px 16px 13px;
    background: var(--black);
    display: flex; align-items: center; gap: 12px;
    flex-shrink: 0;
  }
  .sb-logo {
    width: 34px; height: 34px;
    background: var(--white); color: var(--black);
    font-family: var(--font-disp); font-size: 18px; font-weight: 700;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    border-radius: 4px; flex-shrink: 0; line-height: 1;
  }
  .sb-logo-n { font-size: 18px; font-weight: 700; line-height: 1; }
  .sb-logo-t { font-size: 5px; letter-spacing: .08em; text-transform: uppercase; color: var(--gray-dark); margin-top: 1px; }
  .sb-brand  { font-size: 13px; font-weight: 700; color: var(--white); line-height: 1.2; }
  .sb-sub    { font-size: 9px; text-transform: uppercase; letter-spacing: .08em; color: rgba(255,255,255,.4); margin-top: 2px; }

  /* Type switcher */
  .sb-type-bar { display: flex; border-bottom: 1px solid var(--gray-pale); flex-shrink: 0; }
  .type-btn {
    flex: 1; padding: 9px 4px;
    background: none; border: none; border-bottom: 2px solid transparent;
    font-family: var(--font-body); font-size: 10px; font-weight: 600;
    letter-spacing: .05em; text-transform: uppercase; color: var(--gray-mid);
    cursor: pointer; transition: all .15s;
  }
  .type-btn:hover { color: var(--ink); background: var(--gray-bg); }
  .type-btn.active { color: var(--black); border-bottom-color: var(--black); }

  /* Scroll body */
  .sb-scroll { flex: 1; overflow-y: auto; display: flex; flex-direction: column; scrollbar-width: thin; scrollbar-color: var(--gray-pale) transparent; }
  .sb-scroll::-webkit-scrollbar { width: 3px; }
  .sb-scroll::-webkit-scrollbar-thumb { background: var(--gray-pale); border-radius: 2px; }

  /* Company toggle button */
  .co-toggle-btn {
    width: 100%; padding: 8px 16px;
    background: #fafafa; border: none; border-bottom: 1px solid var(--gray-pale);
    text-align: left; font-family: var(--font-body); font-size: 9.5px; font-weight: 700;
    text-transform: uppercase; letter-spacing: .08em; color: var(--gray-mid);
    cursor: pointer; display: flex; align-items: center; flex-shrink: 0; transition: background .13s;
  }
  .co-toggle-btn:hover { background: #f0f0f0; }
  .co-toggle-btn .chev { margin-left: auto; font-size: 8px; }

  /* Per-type tabs */
  .sb-tabs { display: flex; border-bottom: 1px solid var(--gray-pale); background: #fafafa; flex-shrink: 0; }
  .sb-tab {
    flex: 1; padding: 9px 4px;
    background: none; border: none; border-bottom: 2px solid transparent;
    font-family: var(--font-body); font-size: 10px; font-weight: 600;
    letter-spacing: .06em; text-transform: uppercase; color: var(--gray-mid);
    cursor: pointer; transition: all .15s;
  }
  .sb-tab:last-child { border-right: none; }
  .sb-tab:hover { color: var(--ink); }
  .sb-tab.active { color: var(--black); border-bottom-color: var(--black); background: var(--white); }

  /* Sidebar scrollable body */
  .sb-body { padding: 16px 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; }

  /* Section title */
  .sec-title {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .1em; color: var(--gray-mid);
    padding-bottom: 5px; border-bottom: 1px solid var(--gray-pale); margin-top: 4px;
  }
  .sec-title:first-child { margin-top: 0; }

  /* Fields */
  .field-group { display: flex; flex-direction: column; gap: 3px; }
  .field-label { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--gray-mid); }
  .field-input {
    width: 100%; padding: 6px 9px;
    border: 1px solid var(--gray-pale); border-radius: var(--radius);
    font-family: var(--font-body); font-size: 12px; color: var(--ink);
    background: var(--white); outline: none; transition: border-color .13s;
  }
  .field-input:focus { border-color: var(--black); }
  .field-textarea { resize: vertical; min-height: 56px; line-height: 1.45; }
  select.field-input {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e");
    background-repeat: no-repeat; background-position: right 8px center; background-size: 15px;
    padding-right: 28px; cursor: pointer;
  }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

  /* Toggle */
  .toggle-btn {
    width: 100%; padding: 7px 10px;
    border: 1px solid var(--gray-pale); border-radius: var(--radius);
    background: var(--white); color: var(--gray-dark);
    font-family: var(--font-body); font-size: 11.5px; font-weight: 600;
    cursor: pointer; transition: all .13s; text-align: left;
  }
  .toggle-btn.on { border-color: var(--black); background: var(--black); color: var(--white); }

  /* Item card */
  .item-card {
    background: var(--gray-bg); border: 1px solid var(--gray-pale);
    border-radius: var(--radius); padding: 11px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .item-card-head { display: flex; justify-content: space-between; align-items: center; }
  .item-label { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--gray-dark); }
  .remove-btn { background: none; border: none; cursor: pointer; color: var(--gray-light); font-size: 13px; padding: 2px 5px; border-radius: 3px; transition: all .13s; }
  .remove-btn:hover { background: #fee2e2; color: #dc2626; }
  .add-item-btn {
    width: 100%; padding: 8px; border: 1.5px dashed var(--gray-pale);
    border-radius: var(--radius); background: none; cursor: pointer;
    font-family: var(--font-body); font-size: 11.5px; color: var(--gray-mid); font-weight: 600;
    transition: all .13s;
  }
  .add-item-btn:hover { border-color: var(--black); color: var(--black); }

  /* Summary box */
  .summary-box {
    background: var(--gray-bg); border: 1px solid var(--gray-pale);
    border-radius: var(--radius); padding: 11px 12px;
    display: flex; flex-direction: column; gap: 3px;
  }
  .sum-row { display: flex; justify-content: space-between; font-size: 11px; color: var(--gray-dark); padding: 2px 0; }
  .sum-row.bold { font-weight: 700; color: var(--black); font-size: 12px; margin-top: 2px; }
  .sum-divider { height: 1px; background: var(--gray-pale); margin: 4px 0; }

  /* Footer */
  .sb-foot { padding: 12px 16px; border-top: 1px solid var(--gray-pale); flex-shrink: 0; }
  .print-btn {
    width: 100%; padding: 10px; background: var(--black); color: var(--white);
    border: none; border-radius: var(--radius);
    font-family: var(--font-body); font-size: 12px; font-weight: 700;
    letter-spacing: .04em; cursor: pointer; transition: opacity .15s;
  }
  .print-btn:hover { opacity: .82; }

  /* ════════════════════════════════════
     PREVIEW AREA
  ════════════════════════════════════ */
  .preview-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--gray-bg); }
  .preview-bar {
    padding: 10px 28px; display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid var(--gray-pale); background: var(--white); flex-shrink: 0;
  }
  .preview-bar-label { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--black); }
  .preview-bar-hint  { font-size: 11px; color: var(--gray-light); }
  .invoice-scroll {
    flex: 1; overflow-y: auto; padding: 32px 20px 48px;
    display: flex; justify-content: center; align-items: flex-start;
    scrollbar-width: thin; scrollbar-color: var(--gray-pale) transparent;
  }
  .invoice-scroll::-webkit-scrollbar { width: 6px; }
  .invoice-scroll::-webkit-scrollbar-thumb { background: var(--gray-pale); border-radius: 4px; }

  /* ════════════════════════════════════
     INVOICE PAGE
  ════════════════════════════════════ */
  .invoice-page {
    width: 720px;
    background: #fff;
    box-shadow: 0 4px 32px rgba(0,0,0,.09);
    font-family: var(--font-body);
    color: var(--ink);
  }

  /* ── Header ── */
  .inv-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 30px 40px 22px;
    border-bottom: 1.5px solid var(--gray-pale);
  }
  .inv-brand { display: flex; align-items: flex-start; gap: 14px; }

  /* Logo: black square with "1" inside, "Finance" text below */
  .inv-logo-wrap { display: flex; flex-direction: column; align-items: center; gap: 5px; flex-shrink: 0; }
  .inv-logo-box {
    width: 54px; height: 54px; background: var(--black);
    display: flex; align-items: center; justify-content: center;
  }
  .inv-logo-num  { font-family: var(--font-disp); font-size: 28px; color: #fff; line-height: 1; }
  .inv-logo-label { font-size: 8.5px; letter-spacing: .08em; color: var(--gray-dark); font-weight: 500; text-transform: uppercase; }

  .inv-co-block { padding-top: 2px; }
  .inv-co-name  { font-family: var(--font-disp); font-size: 17px; font-weight: 400; letter-spacing: .02em; margin-bottom: 6px; }
  .inv-co-meta  { font-size: 10.5px; color: var(--gray-mid); line-height: 1.85; }
  .inv-co-meta b { font-weight: 600; color: var(--ink); margin-right: 4px; }

  .inv-addr-block { text-align: right; font-size: 11px; color: var(--gray-mid); line-height: 1.85; max-width: 220px; }
  .inv-addr-block a { color: var(--ink); font-weight: 500; text-decoration: none; }

  /* ── Body (the single bordered box) ── */
  .inv-body {
    margin: 0 28px 28px;
    border: 1px solid var(--gray-pale);
    border-radius: 2px;
  }

  /* ── Title ── */
  .inv-title {
    text-align: center;
    font-family: var(--font-disp);
    font-size: 16px; font-weight: 400; letter-spacing: .3px;
    padding: 14px 0 13px;
    border-bottom: 1px solid var(--gray-pale);
  }

  /* ── Billed to / Date ── */
  .inv-billed-row {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 16px 20px 14px;
  }
  .fl  { font-size: 10px; color: var(--gray-mid); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 3px; }
  .fv  { font-size: 13px; font-weight: 600; color: var(--ink); }

  /* ── Party grid: NO borders between columns ── */
  .party-grid {
    display: grid;
    grid-template-columns: 2fr 1.15fr 1.15fr;
    padding: 4px 20px 16px;
    border-top: 1px solid var(--gray-pale);
    border-bottom: 1px solid var(--gray-pale);
    margin-bottom: 0;
    gap: 0;
    align-items: start;
  }
  .party-grid > div { padding: 0 12px; }
  .party-grid > div:first-child { padding-left: 0; }
  .party-grid > div:last-child  { padding-right: 0; }
  .pml {
    font-size: 9.5px; color: var(--gray-mid);
    text-transform: uppercase; letter-spacing: .07em;
    margin-bottom: 3px; margin-top: 12px; display: block;
  }
  .pml:first-child { margin-top: 0; }
  .pmv { font-size: 11.5px; font-weight: 500; color: var(--ink); line-height: 1.6; white-space: pre-wrap; word-break: break-word; display: block; }
  .text-right { text-align: right; }

  /* ── Items table ── */
  .inv-table-wrap { padding: 0 20px; }
  .inv-table { width: 100%; border-collapse: collapse; }
  .inv-table thead tr { border-top: 1px solid var(--gray-pale); border-bottom: 1px solid var(--gray-pale); }
  .inv-table thead th {
    font-size: 10px; font-weight: 500; color: var(--gray-mid);
    text-transform: uppercase; letter-spacing: .07em;
    padding: 9px 6px; text-align: left;
  }
  .inv-table thead th.c { text-align: center; }
  .inv-table thead th.r { text-align: right; }
  .inv-table tbody tr { border-bottom: 1px solid #f0f0f0; }
  .inv-table tbody td { padding: 13px 6px; font-size: 12px; vertical-align: top; color: var(--ink); }
  .inv-table tbody td.c { text-align: center; color: var(--gray-dark); }
  .inv-table tbody td.r { text-align: right; font-weight: 500; }
  .desc-note { font-size: 10px; color: var(--gray-mid); margin-top: 4px; line-height: 1.5; }

  /* ── Totals ── */
  .totals-wrap { display: flex; justify-content: flex-end; padding: 0 20px 4px; }
  .totals-block { width: 300px; }
  .t-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 4px 0; font-size: 12px; color: var(--gray-dark);
  }
  .t-row .lbl { color: var(--gray-mid); }
  .t-row .amt { font-weight: 500; }
  .t-row.sep   { border-top: 1px solid var(--gray-pale); padding-top: 10px; margin-top: 6px; }
  .t-row.head  { font-weight: 600; color: var(--ink); font-size: 13px; }
  .t-row.grand { border-top: 2px solid var(--ink); padding-top: 9px; margin-top: 8px; font-weight: 700; font-size: 14px; }
  .t-row.grand .amt { font-size: 17px; }
  .tax-line {
    display: flex; justify-content: space-between;
    font-size: 12px; padding: 3px 0; color: var(--gray-dark);
  }
  .tax-line.rounding { color: var(--gray-mid); }
  .words-row {
    margin-top: 10px; padding-top: 9px;
    border-top: 1px solid var(--gray-pale);
    font-size: 11px; color: var(--gray-mid); line-height: 1.6;
  }
  .words-row strong { color: var(--ink); font-weight: 600; }

  /* ── Note bar (locker) ── */
  .note-bar {
    margin: 0 20px 10px;
    padding: 9px 12px;
    border: 1px solid var(--gray-pale);
    font-size: 11px; color: var(--gray-mid);
    background: #fafaf8; border-radius: 2px;
  }
  .note-bar strong { color: var(--ink); }

  /* ── Footer ── */
  .inv-footer {
    text-align: center; font-size: 10px; color: var(--gray-mid);
    border-top: 1px solid var(--gray-pale);
    padding: 12px 20px 14px;
    letter-spacing: .2px;
  }

  /* ── Print ── */
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html, body { height: auto; overflow: visible; }
    .app-root { display: block; height: auto; }
    .sidebar, .preview-bar { display: none !important; }
    .preview-area { display: block; overflow: visible; }
    .invoice-scroll { padding: 0; overflow: visible; display: block; }
    .invoice-page { width: 100%; box-shadow: none; }
    @page { size: A4; margin: 12mm; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function fmt(n) {
  return Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
const ONES = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
const TENS = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
function n2w(n) {
  if (n === 0) return "Zero";
  if (n < 20)  return ONES[n];
  if (n < 100) return TENS[Math.floor(n/10)] + (n%10 ? " "+ONES[n%10] : "");
  if (n < 1000) return ONES[Math.floor(n/100)] + " Hundred" + (n%100 ? " "+n2w(n%100) : "");
  if (n < 100000) return n2w(Math.floor(n/1000)) + " Thousand" + (n%1000 ? " "+n2w(n%1000) : "");
  if (n < 10000000) return n2w(Math.floor(n/100000)) + " Lakh" + (n%100000 ? " "+n2w(n%100000) : "");
  return n2w(Math.floor(n/10000000)) + " Crore" + (n%10000000 ? " "+n2w(n%10000000) : "");
}
function amtWords(amt) {
  const r = Math.round(amt * 100) / 100;
  const ip = Math.floor(r), dp = Math.round((r - ip) * 100);
  return n2w(ip) + " Rupees" + (dp > 0 ? " and " + n2w(dp) + " Paise" : "") + " only.";
}
function calcTotals(items, discountEnabled, discount, gstType, igstRate, sgstRate, cgstRate, roundOffEnabled) {
  const total = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const disc  = discountEnabled ? (parseFloat(discount) || 0) : 0;
  const netTotal = Math.max(total - disc, 0);
  let igst = 0, sgst = 0, cgst = 0;
  if (gstType === "igst") igst = netTotal * ((parseFloat(igstRate)||0)/100);
  else { sgst = netTotal * ((parseFloat(sgstRate)||0)/100); cgst = netTotal * ((parseFloat(cgstRate)||0)/100); }
  const preRound = netTotal + igst + sgst + cgst;
  const rounded  = Math.round(preRound);
  const roundOff = roundOffEnabled ? parseFloat((rounded - preRound).toFixed(2)) : 0;
  const grandTotal = roundOffEnabled ? rounded : parseFloat(preRound.toFixed(2));
  return { total, disc, netTotal, igst, sgst, cgst, preRound, roundOff, grandTotal };
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT DATA — all client fields use dummy / hash placeholders
// ─────────────────────────────────────────────────────────────────────────────
const defaultCompany = {
  name:    "1 FINANCE PRIVATE LIMITED",
  gstin:   "27AABCZ8402H1Z8",
  pan:     "AABCZ8402H",
  cin:     "U66190GJ2021PTC126723",
  address: "Unit No. 1101 & 1102, 11th Floor,\nB – Wing, Lotus Corporate Park,\nGoregaon (E), Mumbai-400 063.",
  website: "https://1finance.co.in/",
  regNo:   "SEBI RIA Registration No: INA000017523",
};

const defaultTaxInvoice = {
  invoiceNumber:  "1F/##-##/###",
  invoiceDate:    "2026-05-15",
  billedTo:       "CLIENT FULL NAME",
  partyAddress:   "Flat / House No., Building Name\nStreet, Area, Locality\nCity – XXXXXX",
  partyPhone:     "+91 XXXXX XXXXX",
  partyPAN:       "XXXXX0000X",
  partyGSTIN:     "",
  gstinEnabled:   false,
  placeOfSupply:  "State Name",
  stateCode:      "##",
  items: [{
    description: "Advisory Fees",
    sacCode:     "997156",
    amount:      "75000.00",
    note:        "(An amount of Rs. 56250/- plus applicable taxes shall be payable at three months, six months, and nine months from the Execution Date.)"
  }],
  discountEnabled: false,
  discount:        "0.00",
  gstType:         "sgst_cgst",
  igstRate:        "18",
  sgstRate:        "9",
  cgstRate:        "9",
  roundOffEnabled: false,
};

const defaultLockerInvoice = {
  companyName:    "1 FINANCE PVT LTD",
  companyGSTIN:   "##XXXXX0000X#Z#",
  companyAddress: "Branch Address Line 1,\nArea / Locality,\nCity, State – XXXXXX",
  invoiceNumber:  "1F/##-##/LXXX/##",
  invoiceDate:    "2026-03-11",
  billedTo:       "CLIENT FULL NAME",
  partyAddress:   "Flat / House No., Building Name\nStreet, Area, Locality\nCity – XXXXXX",
  partyPhone:     "+91 XXXXX XXXXX",
  partyPAN:       "XXXXX0000X",
  partyGSTIN:     "",
  gstinEnabled:   false,
  placeOfSupply:  "State Name",
  stateCode:      "##",
  lockerNo:       "X###",
  lockerFrom:     "2026-03-11",
  lockerTo:       "2027-03-10",
  sacCode:        "997329",
  amount:         "2500",
  discountEnabled: true,
  discount:        "2500",
  gstType:         "sgst_cgst",
  sgstRate:        "9",
  cgstRate:        "9",
  roundOffEnabled: false,
  interestNote:    "Interest @2% per month will apply on delayed payment",
};

const defaultCreditNote = {
  invoiceNumber:  "1F/##-##/CN/##",
  invoiceDate:    "2026-05-15",
  billedTo:       "CLIENT FULL NAME",
  partyAddress:   "Flat / House No., Building Name\nStreet, Area, Locality\nCity – XXXXXX",
  partyPhone:     "+91 XXXXX XXXXX",
  partyPAN:       "XXXXX0000X",
  placeOfSupply:  "State Name",
  stateCode:      "##",
  againstInvoice: "1F/##-##/###",
  items: [{ description: "Advisory Fees", sacCode: "997156", amount: "5000.00", note: "" }],
  gstType:  "igst",
  igstRate: "18",
  sgstRate: "9",
  cgstRate: "9",
  roundOffEnabled: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, textarea, type = "text" }) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      {textarea
        ? <textarea className="field-input field-textarea" value={value} rows={3} onChange={e => onChange(e.target.value)} />
        : <input className="field-input" type={type} value={value} onChange={e => onChange(e.target.value)} />}
    </div>
  );
}
function FieldRow({ children }) { return <div className="field-row">{children}</div>; }
function Toggle({ label, on, onToggle }) {
  return (
    <div className="field-group">
      <button type="button" className={`toggle-btn${on ? " on" : ""}`} onClick={onToggle}>
        {on ? `✓ ${label} Enabled` : `+ Enable ${label}`}
      </button>
    </div>
  );
}
function SumRow({ label, value, bold }) {
  return <div className={`sum-row${bold ? " bold" : ""}`}><span>{label}</span><span>{value}</span></div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED INVOICE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function InvHeader({ co, branch }) {
  const name    = branch?.companyName    || co.name;
  const gstin   = branch?.companyGSTIN   || co.gstin;
  const address = branch?.companyAddress || co.address;
  return (
    <div className="inv-header">
      <div className="inv-brand">
        <div className="inv-logo-wrap">
          <div className="inv-logo-box"><span className="inv-logo-num">1</span></div>
          <div className="inv-logo-label">Finance</div>
        </div>
        <div className="inv-co-block">
          <div className="inv-co-name">{name}</div>
          <div className="inv-co-meta">
            <span><b>GSTIN</b>{gstin}</span><br />
            <span><b>PAN</b>{co.pan}</span><br />
            <span><b>CIN</b>{co.cin}</span>
          </div>
        </div>
      </div>
      <div className="inv-addr-block">
        {address.split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}
        {co.website && <a href={co.website}>{co.website}</a>}
      </div>
    </div>
  );
}

function TotalsBlock({ totals, f }) {
  const { total, disc, netTotal, igst, sgst, cgst, roundOff, grandTotal } = totals;
  return (
    <div className="totals-wrap">
      <div className="totals-block">
        <div className="t-row sep">
          <span className="lbl">Total</span>
          <span className="amt">₹ {fmt(total)}</span>
        </div>
        {f.discountEnabled && <>
          <div className="t-row"><span className="lbl">Discount</span><span className="amt">- ₹ {fmt(disc)}</span></div>
          <div className="t-row head"><span>Net Total</span><span>₹ {fmt(netTotal)}</span></div>
        </>}
        {f.gstType === "igst" ? (
          <div className="tax-line"><span>Add: IGST @</span><span>{f.igstRate}%</span><span>₹ {fmt(igst)}</span></div>
        ) : (
          <>
            <div className="tax-line"><span>Add: CGST @</span><span>{f.cgstRate}%</span><span>₹ {fmt(cgst)}</span></div>
            <div className="tax-line"><span>Add: SGST @</span><span>{f.sgstRate}%</span><span>₹ {fmt(sgst)}</span></div>
          </>
        )}
        {f.roundOffEnabled && roundOff !== 0 && (
          <div className="tax-line rounding">
            <span>Rounding-off (+/-)</span>
            <span></span>
            <span>{roundOff > 0 ? "+" : ""}{roundOff.toFixed(2)}</span>
          </div>
        )}
        <div className="t-row grand">
          <span>Grand Total</span>
          <span className="amt">₹ {fmt(grandTotal)}</span>
        </div>
        <div className="words-row">
          <strong>Total Amount (₹ - In Words):</strong>{" "}
          {grandTotal === 0 ? "Rupees Zero only." : amtWords(grandTotal)}
        </div>
      </div>
    </div>
  );
}

function InvFooter({ co }) {
  return (
    <div className="inv-footer">
      {co.regNo}<br />
      <span style={{fontSize:"9px",fontStyle:"italic"}}>This is a Computer Generated Invoice. No signature required.</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INVOICE PREVIEWS — all three identical structure
// ─────────────────────────────────────────────────────────────────────────────
function TaxInvoicePreview({ co, f }) {
  const totals = calcTotals(f.items, f.discountEnabled, f.discount, f.gstType, f.igstRate, f.sgstRate, f.cgstRate, f.roundOffEnabled);
  return (
    <div className="invoice-page">
      <InvHeader co={co} />
      <div className="inv-body">

        {/* Title */}
        <div className="inv-title">Tax Invoice</div>

        {/* Billed to / Date */}
        <div className="inv-billed-row">
          <div><div className="fl">Billed to</div><div className="fv">{f.billedTo}</div></div>
          <div style={{textAlign:"right"}}><div className="fl">Date</div><div className="fv">{formatDate(f.invoiceDate)}</div></div>
        </div>

        {/* Party grid — no column borders */}
        <div className="party-grid">
          <div>
            <span className="pml">Party address</span>
            <span className="pmv">{f.partyAddress}</span>
            {f.partyPhone && <span className="pmv" style={{marginTop:5}}>{f.partyPhone}</span>}
          </div>
          <div>
            <span className="pml">PAN</span>
            <span className="pmv">{f.partyPAN}</span>
            {f.gstinEnabled && f.partyGSTIN && <>
              <span className="pml">GSTIN</span>
              <span className="pmv">{f.partyGSTIN}</span>
            </>}
            <span className="pml">Place of supply</span>
            <span className="pmv">{f.placeOfSupply}</span>
          </div>
          <div className="text-right">
            <span className="pml">Invoice Number</span>
            <span className="pmv">{f.invoiceNumber}</span>
            <span className="pml">State Code</span>
            <span className="pmv">{f.stateCode}</span>
          </div>
        </div>

        {/* Table */}
        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="c" style={{width:92}}>SAC Code</th>
                <th className="r" style={{width:112}}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {f.items.map((item, i) => (
                <tr key={i}>
                  <td>
                    <strong>{item.description}</strong>
                    {item.note && <div className="desc-note">{item.note}</div>}
                  </td>
                  <td className="c">{item.sacCode}</td>
                  <td className="r">₹ {fmt(parseFloat(item.amount)||0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TotalsBlock totals={totals} f={f} />
        <InvFooter co={co} />
      </div>
    </div>
  );
}

function LockerInvoicePreview({ co, f }) {
  const items = [{
    description: `Locker Charges (Locker No:-${f.lockerNo})`,
    sacCode: f.sacCode, amount: f.amount,
    note: `(From ${f.lockerFrom} to ${f.lockerTo})`
  }];
  const totals = calcTotals(items, f.discountEnabled, f.discount, f.gstType, "18", f.sgstRate, f.cgstRate, f.roundOffEnabled);
  return (
    <div className="invoice-page">
      <InvHeader co={co} branch={f} />
      <div className="inv-body">

        <div className="inv-title">Tax Invoice</div>

        <div className="inv-billed-row">
          <div><div className="fl">Billed to</div><div className="fv">{f.billedTo}</div></div>
          <div style={{textAlign:"right"}}><div className="fl">Date</div><div className="fv">{formatDate(f.invoiceDate)}</div></div>
        </div>

        <div className="party-grid">
          <div>
            <span className="pml">Party address</span>
            <span className="pmv">{f.partyAddress}</span>
            {f.partyPhone && <span className="pmv" style={{marginTop:5}}>{f.partyPhone}</span>}
          </div>
          <div>
            <span className="pml">PAN</span>
            <span className="pmv">{f.partyPAN}</span>
            <span className="pml">Place of supply</span>
            <span className="pmv">{f.placeOfSupply}</span>
          </div>
          <div className="text-right">
            <span className="pml">Invoice Number</span>
            <span className="pmv">{f.invoiceNumber}</span>
            <span className="pml">State Code</span>
            <span className="pmv">{f.stateCode}</span>
          </div>
        </div>

        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="c" style={{width:92}}>SAC Code</th>
                <th className="r" style={{width:112}}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Locker Charges (Locker No:-{f.lockerNo})</strong>
                  <div className="desc-note">(From {f.lockerFrom} to {f.lockerTo})</div>
                </td>
                <td className="c">{f.sacCode}</td>
                <td className="r">₹ {fmt(parseFloat(f.amount)||0)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <TotalsBlock totals={totals} f={f} />
        {f.interestNote && (
          <div className="note-bar"><strong>Note:</strong> {f.interestNote}</div>
        )}
        <InvFooter co={co} />
      </div>
    </div>
  );
}

function CreditNotePreview({ co, f }) {
  const totals = calcTotals(f.items, false, "0", f.gstType, f.igstRate, f.sgstRate, f.cgstRate, f.roundOffEnabled);
  return (
    <div className="invoice-page">
      <InvHeader co={co} />
      <div className="inv-body">

        <div className="inv-title">CreditNote</div>

        <div className="inv-billed-row">
          <div><div className="fl">Billed to</div><div className="fv">{f.billedTo}</div></div>
          <div style={{textAlign:"right"}}><div className="fl">Date</div><div className="fv">{formatDate(f.invoiceDate)}</div></div>
        </div>

        <div className="party-grid">
          <div>
            <span className="pml">Party address</span>
            <span className="pmv">{f.partyAddress}</span>
            {f.partyPhone && <span className="pmv" style={{marginTop:5}}>{f.partyPhone}</span>}
          </div>
          <div>
            <span className="pml">PAN</span>
            <span className="pmv">{f.partyPAN}</span>
            <span className="pml">Place of supply</span>
            <span className="pmv">{f.placeOfSupply}</span>
          </div>
          <div className="text-right">
            <span className="pml">Invoice Number</span>
            <span className="pmv">{f.invoiceNumber}</span>
            <span className="pml">State Code</span>
            <span className="pmv">{f.stateCode}</span>
            <span className="pml">Against Invoice No</span>
            <span className="pmv">{f.againstInvoice}</span>
          </div>
        </div>

        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="c" style={{width:92}}>SAC Code</th>
                <th className="r" style={{width:112}}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {f.items.map((item, i) => (
                <tr key={i}>
                  <td>
                    <strong>{item.description}</strong>
                    {item.note && <div className="desc-note">{item.note}</div>}
                  </td>
                  <td className="c">{item.sacCode}</td>
                  <td className="r">₹ {fmt(parseFloat(item.amount)||0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TotalsBlock totals={totals} f={f} />
        <InvFooter co={co} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR — TAX INVOICE
// ─────────────────────────────────────────────────────────────────────────────
function TaxSidebar({ f, set, tab, setTab }) {
  const { total, disc, netTotal, igst, sgst, cgst, grandTotal } =
    calcTotals(f.items, f.discountEnabled, f.discount, f.gstType, f.igstRate, f.sgstRate, f.cgstRate, f.roundOffEnabled);
  const si = (idx, k, v) => { const it = [...f.items]; it[idx] = {...it[idx],[k]:v}; set("items", it); };
  return (
    <>
      <div className="sb-tabs">
        {["client","items","taxes"].map(t => (
          <button key={t} className={`sb-tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>
            {t==="client"?"Client":t==="items"?"Items":"Taxes"}
          </button>
        ))}
      </div>
      <div className="sb-body">
        {tab==="client" && <>
          <div className="sec-title">Invoice Details</div>
          <FieldRow>
            <Field label="Invoice No." value={f.invoiceNumber} onChange={v=>set("invoiceNumber",v)} />
            <Field label="Date" value={f.invoiceDate} onChange={v=>set("invoiceDate",v)} type="date" />
          </FieldRow>
          <div className="sec-title">Client Details</div>
          <Field label="Billed To" value={f.billedTo} onChange={v=>set("billedTo",v)} />
          <Field label="Party Address" value={f.partyAddress} onChange={v=>set("partyAddress",v)} textarea />
          <FieldRow>
            <Field label="Phone" value={f.partyPhone} onChange={v=>set("partyPhone",v)} />
            <Field label="PAN" value={f.partyPAN} onChange={v=>set("partyPAN",v)} />
          </FieldRow>
          <Toggle label="GSTIN" on={f.gstinEnabled} onToggle={()=>set("gstinEnabled",!f.gstinEnabled)} />
          {f.gstinEnabled && <Field label="GSTIN" value={f.partyGSTIN} onChange={v=>set("partyGSTIN",v)} />}
          <FieldRow>
            <Field label="Place of Supply" value={f.placeOfSupply} onChange={v=>set("placeOfSupply",v)} />
            <Field label="State Code" value={f.stateCode} onChange={v=>set("stateCode",v)} />
          </FieldRow>
        </>}
        {tab==="items" && <>
          <div className="sec-title">Line Items</div>
          {f.items.map((item,idx)=>(
            <div className="item-card" key={idx}>
              <div className="item-card-head">
                <span className="item-label">Item {idx+1}</span>
                {f.items.length>1 && <button className="remove-btn" onClick={()=>set("items",f.items.filter((_,i)=>i!==idx))}>✕</button>}
              </div>
              <Field label="Description" value={item.description} onChange={v=>si(idx,"description",v)} />
              <Field label="Note (optional)" value={item.note||""} onChange={v=>si(idx,"note",v)} textarea />
              <FieldRow>
                <Field label="SAC Code" value={item.sacCode} onChange={v=>si(idx,"sacCode",v)} />
                <Field label="Amount (₹)" value={item.amount} onChange={v=>si(idx,"amount",v)} type="number" />
              </FieldRow>
            </div>
          ))}
          <button className="add-item-btn" onClick={()=>set("items",[...f.items,{description:"",sacCode:"",amount:"",note:""}])}>+ Add Item</button>
        </>}
        {tab==="taxes" && <>
          <div className="sec-title">Discount & Taxes</div>
          <Toggle label="Discount" on={f.discountEnabled} onToggle={()=>set("discountEnabled",!f.discountEnabled)} />
          {f.discountEnabled && <Field label="Discount (₹)" value={f.discount} onChange={v=>set("discount",v)} type="number" />}
          <div className="field-group">
            <label className="field-label">GST Type</label>
            <select className="field-input" value={f.gstType} onChange={e=>set("gstType",e.target.value)}>
              <option value="sgst_cgst">SGST + CGST (Intra-state)</option>
              <option value="igst">IGST (Inter-state)</option>
            </select>
          </div>
          {f.gstType==="igst"
            ? <Field label="IGST (%)" value={f.igstRate} onChange={v=>set("igstRate",v)} type="number" />
            : <FieldRow><Field label="SGST (%)" value={f.sgstRate} onChange={v=>set("sgstRate",v)} type="number"/><Field label="CGST (%)" value={f.cgstRate} onChange={v=>set("cgstRate",v)} type="number"/></FieldRow>
          }
          <Toggle label="Round Off" on={f.roundOffEnabled} onToggle={()=>set("roundOffEnabled",!f.roundOffEnabled)} />
          <div className="summary-box">
            <SumRow label="Subtotal" value={`₹ ${fmt(total)}`} />
            {f.discountEnabled && <><SumRow label="Discount" value={`- ₹ ${fmt(disc)}`}/><SumRow label="Net Total" value={`₹ ${fmt(netTotal)}`}/></>}
            {f.gstType==="igst"?<SumRow label={`IGST @ ${f.igstRate}%`} value={`₹ ${fmt(igst)}`}/>:<><SumRow label={`SGST @ ${f.sgstRate}%`} value={`₹ ${fmt(sgst)}`}/><SumRow label={`CGST @ ${f.cgstRate}%`} value={`₹ ${fmt(cgst)}`}/></>}
            {f.roundOffEnabled && totals.roundOff !== 0 && <SumRow label="Rounding-off (+/-)" value={`${totals.roundOff > 0 ? "+" : ""}${totals.roundOff.toFixed(2)}`}/>}
            <div className="sum-divider"/><SumRow label="Grand Total" value={`₹ ${fmt(grandTotal)}`} bold />
          </div>
        </>}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR — LOCKER INVOICE
// ─────────────────────────────────────────────────────────────────────────────
function LockerSidebar({ f, set, tab, setTab }) {
  const { total, disc, netTotal, sgst, cgst, grandTotal } =
    calcTotals([{amount:f.amount}], f.discountEnabled, f.discount, f.gstType, "18", f.sgstRate, f.cgstRate, f.roundOffEnabled);
  return (
    <>
      <div className="sb-tabs">
        {["client","locker","taxes"].map(t => (
          <button key={t} className={`sb-tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>
            {t==="client"?"Client":t==="locker"?"Locker":"Taxes"}
          </button>
        ))}
      </div>
      <div className="sb-body">
        {tab==="client" && <>
          <div className="sec-title">Branch / Company</div>
          <Field label="Company Name" value={f.companyName} onChange={v=>set("companyName",v)} />
          <Field label="Branch GSTIN" value={f.companyGSTIN} onChange={v=>set("companyGSTIN",v)} />
          <Field label="Branch Address" value={f.companyAddress} onChange={v=>set("companyAddress",v)} textarea />
          <div className="sec-title">Invoice Details</div>
          <FieldRow>
            <Field label="Invoice No." value={f.invoiceNumber} onChange={v=>set("invoiceNumber",v)} />
            <Field label="Date" value={f.invoiceDate} onChange={v=>set("invoiceDate",v)} type="date" />
          </FieldRow>
          <div className="sec-title">Client Details</div>
          <Field label="Billed To" value={f.billedTo} onChange={v=>set("billedTo",v)} />
          <Field label="Address" value={f.partyAddress} onChange={v=>set("partyAddress",v)} textarea />
          <FieldRow>
            <Field label="Phone" value={f.partyPhone} onChange={v=>set("partyPhone",v)} />
            <Field label="PAN" value={f.partyPAN} onChange={v=>set("partyPAN",v)} />
          </FieldRow>
          <FieldRow>
            <Field label="Place of Supply" value={f.placeOfSupply} onChange={v=>set("placeOfSupply",v)} />
            <Field label="State Code" value={f.stateCode} onChange={v=>set("stateCode",v)} />
          </FieldRow>
        </>}
        {tab==="locker" && <>
          <div className="sec-title">Locker Details</div>
          <Field label="Locker Number" value={f.lockerNo} onChange={v=>set("lockerNo",v)} />
          <FieldRow>
            <Field label="From Date" value={f.lockerFrom} onChange={v=>set("lockerFrom",v)} type="date" />
            <Field label="To Date" value={f.lockerTo} onChange={v=>set("lockerTo",v)} type="date" />
          </FieldRow>
          <FieldRow>
            <Field label="SAC Code" value={f.sacCode} onChange={v=>set("sacCode",v)} />
            <Field label="Amount (₹)" value={f.amount} onChange={v=>set("amount",v)} type="number" />
          </FieldRow>
          <Field label="Interest Note" value={f.interestNote} onChange={v=>set("interestNote",v)} />
        </>}
        {tab==="taxes" && <>
          <div className="sec-title">Discount & Taxes</div>
          <Toggle label="Discount" on={f.discountEnabled} onToggle={()=>set("discountEnabled",!f.discountEnabled)} />
          {f.discountEnabled && <Field label="Discount (₹)" value={f.discount} onChange={v=>set("discount",v)} type="number" />}
          <FieldRow>
            <Field label="SGST (%)" value={f.sgstRate} onChange={v=>set("sgstRate",v)} type="number" />
            <Field label="CGST (%)" value={f.cgstRate} onChange={v=>set("cgstRate",v)} type="number" />
          </FieldRow>
          <Toggle label="Round Off" on={f.roundOffEnabled} onToggle={()=>set("roundOffEnabled",!f.roundOffEnabled)} />
          <div className="summary-box">
            <SumRow label="Subtotal" value={`₹ ${fmt(total)}`} />
            {f.discountEnabled && <><SumRow label="Discount" value={`- ₹ ${fmt(disc)}`}/><SumRow label="Net Total" value={`₹ ${fmt(netTotal)}`}/></>}
            <SumRow label={`SGST @ ${f.sgstRate}%`} value={`₹ ${fmt(sgst)}`}/>
            <SumRow label={`CGST @ ${f.cgstRate}%`} value={`₹ ${fmt(cgst)}`}/>
            {f.roundOffEnabled && totals.roundOff !== 0 && <SumRow label="Rounding-off (+/-)" value={`${totals.roundOff > 0 ? "+" : ""}${totals.roundOff.toFixed(2)}`}/>}
            <div className="sum-divider"/><SumRow label="Grand Total" value={`₹ ${fmt(grandTotal)}`} bold />
          </div>
        </>}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR — CREDIT NOTE
// ─────────────────────────────────────────────────────────────────────────────
function CreditSidebar({ f, set, tab, setTab }) {
  const { total, igst, sgst, cgst, grandTotal } =
    calcTotals(f.items, false, "0", f.gstType, f.igstRate, f.sgstRate, f.cgstRate, f.roundOffEnabled);
  const si = (idx,k,v)=>{ const it=[...f.items]; it[idx]={...it[idx],[k]:v}; set("items",it); };
  return (
    <>
      <div className="sb-tabs">
        {["client","items","taxes"].map(t => (
          <button key={t} className={`sb-tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>
            {t==="client"?"Client":t==="items"?"Items":"Taxes"}
          </button>
        ))}
      </div>
      <div className="sb-body">
        {tab==="client" && <>
          <div className="sec-title">Credit Note Details</div>
          <FieldRow>
            <Field label="Invoice No." value={f.invoiceNumber} onChange={v=>set("invoiceNumber",v)} />
            <Field label="Date" value={f.invoiceDate} onChange={v=>set("invoiceDate",v)} type="date" />
          </FieldRow>
          <Field label="Against Invoice No." value={f.againstInvoice} onChange={v=>set("againstInvoice",v)} />
          <div className="sec-title">Client Details</div>
          <Field label="Billed To" value={f.billedTo} onChange={v=>set("billedTo",v)} />
          <Field label="Party Address" value={f.partyAddress} onChange={v=>set("partyAddress",v)} textarea />
          <FieldRow>
            <Field label="Phone" value={f.partyPhone} onChange={v=>set("partyPhone",v)} />
            <Field label="PAN" value={f.partyPAN} onChange={v=>set("partyPAN",v)} />
          </FieldRow>
          <FieldRow>
            <Field label="Place of Supply" value={f.placeOfSupply} onChange={v=>set("placeOfSupply",v)} />
            <Field label="State Code" value={f.stateCode} onChange={v=>set("stateCode",v)} />
          </FieldRow>
        </>}
        {tab==="items" && <>
          <div className="sec-title">Line Items</div>
          {f.items.map((item,idx)=>(
            <div className="item-card" key={idx}>
              <div className="item-card-head">
                <span className="item-label">Item {idx+1}</span>
                {f.items.length>1 && <button className="remove-btn" onClick={()=>set("items",f.items.filter((_,i)=>i!==idx))}>✕</button>}
              </div>
              <Field label="Description" value={item.description} onChange={v=>si(idx,"description",v)} />
              <Field label="Note (optional)" value={item.note||""} onChange={v=>si(idx,"note",v)} textarea />
              <FieldRow>
                <Field label="SAC Code" value={item.sacCode} onChange={v=>si(idx,"sacCode",v)} />
                <Field label="Amount (₹)" value={item.amount} onChange={v=>si(idx,"amount",v)} type="number" />
              </FieldRow>
            </div>
          ))}
          <button className="add-item-btn" onClick={()=>set("items",[...f.items,{description:"",sacCode:"",amount:"",note:""}])}>+ Add Item</button>
        </>}
        {tab==="taxes" && <>
          <div className="sec-title">Taxes</div>
          <div className="field-group">
            <label className="field-label">GST Type</label>
            <select className="field-input" value={f.gstType} onChange={e=>set("gstType",e.target.value)}>
              <option value="igst">IGST (Inter-state)</option>
              <option value="sgst_cgst">SGST + CGST (Intra-state)</option>
            </select>
          </div>
          {f.gstType==="igst"
            ? <Field label="IGST (%)" value={f.igstRate} onChange={v=>set("igstRate",v)} type="number" />
            : <FieldRow><Field label="SGST (%)" value={f.sgstRate} onChange={v=>set("sgstRate",v)} type="number"/><Field label="CGST (%)" value={f.cgstRate} onChange={v=>set("cgstRate",v)} type="number"/></FieldRow>
          }
          <Toggle label="Round Off" on={f.roundOffEnabled} onToggle={()=>set("roundOffEnabled",!f.roundOffEnabled)} />
          <div className="summary-box">
            <SumRow label="Subtotal" value={`₹ ${fmt(total)}`} />
            {f.gstType==="igst"?<SumRow label={`IGST @ ${f.igstRate}%`} value={`₹ ${fmt(igst)}`}/>:<><SumRow label={`SGST @ ${f.sgstRate}%`} value={`₹ ${fmt(sgst)}`}/><SumRow label={`CGST @ ${f.cgstRate}%`} value={`₹ ${fmt(cgst)}`}/></>}
            {f.roundOffEnabled && totals.roundOff !== 0 && <SumRow label="Rounding-off (+/-)" value={`${totals.roundOff > 0 ? "+" : ""}${totals.roundOff.toFixed(2)}`}/>}
            <div className="sum-divider"/><SumRow label="Grand Total" value={`₹ ${fmt(grandTotal)}`} bold />
          </div>
        </>}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [invoiceType, setInvoiceType] = useState("tax");
  const [sideTab,     setSideTab]     = useState("client");
  const [coOpen,      setCoOpen]      = useState(false);

  const [company,    setCompanyFull] = useState(defaultCompany);
  const [taxForm,    setTaxFull]     = useState(defaultTaxInvoice);
  const [lockerForm, setLockerFull]  = useState(defaultLockerInvoice);
  const [creditForm, setCreditFull]  = useState(defaultCreditNote);

  const setCo  = useCallback((k,v) => setCompanyFull(p=>({...p,[k]:v})), []);
  const setTax = useCallback((k,v) => setTaxFull(p=>({...p,[k]:v})),     []);
  const setLk  = useCallback((k,v) => setLockerFull(p=>({...p,[k]:v})),  []);
  const setCr  = useCallback((k,v) => setCreditFull(p=>({...p,[k]:v})),  []);

  const switchType = (t) => { setInvoiceType(t); setSideTab("client"); };

  return (
    <>
      <style>{css}</style>
      <div className="app-root">

        {/* ═══ SIDEBAR ═══ */}
        <aside className="sidebar">

          <div className="sb-head">
            <div className="sb-logo">
              <span className="sb-logo-n">1</span>
              <span className="sb-logo-t">Finance</span>
            </div>
            <div>
              <div className="sb-brand">1Finance</div>
              <div className="sb-sub">Invoice Generator</div>
            </div>
          </div>

          <div className="sb-type-bar">
            <button className={`type-btn${invoiceType==="tax"    ?" active":""}`} onClick={()=>switchType("tax")}>Tax</button>
            <button className={`type-btn${invoiceType==="locker" ?" active":""}`} onClick={()=>switchType("locker")}>Locker</button>
            <button className={`type-btn${invoiceType==="credit" ?" active":""}`} onClick={()=>switchType("credit")}>Credit Note</button>
          </div>

          <div className="sb-scroll">
            <button className="co-toggle-btn" onClick={()=>setCoOpen(o=>!o)}>
              Company Info <span className="chev">{coOpen?"▲":"▼"}</span>
            </button>
            {coOpen && (
              <div className="sb-body" style={{flex:"none",maxHeight:340,borderBottom:"1px solid #e4e4e4"}}>
                <Field label="Company Name" value={company.name}    onChange={v=>setCo("name",v)} />
                <FieldRow>
                  <Field label="GSTIN"   value={company.gstin}   onChange={v=>setCo("gstin",v)} />
                  <Field label="PAN"     value={company.pan}     onChange={v=>setCo("pan",v)} />
                </FieldRow>
                <Field label="CIN"       value={company.cin}     onChange={v=>setCo("cin",v)} />
                <Field label="Address"   value={company.address} onChange={v=>setCo("address",v)} textarea />
                <Field label="Website"   value={company.website} onChange={v=>setCo("website",v)} />
                <Field label="Reg. No."  value={company.regNo}   onChange={v=>setCo("regNo",v)} />
              </div>
            )}

            {invoiceType==="tax"    && <TaxSidebar    f={taxForm}    set={setTax} tab={sideTab} setTab={setSideTab} />}
            {invoiceType==="locker" && <LockerSidebar f={lockerForm} set={setLk}  tab={sideTab} setTab={setSideTab} />}
            {invoiceType==="credit" && <CreditSidebar f={creditForm} set={setCr}  tab={sideTab} setTab={setSideTab} />}
          </div>

          <div className="sb-foot">
            <button className="print-btn" onClick={()=>window.print()}>🖨 Print / Download PDF</button>
          </div>
        </aside>

        {/* ═══ PREVIEW ═══ */}
        <main className="preview-area">
          <div className="preview-bar">
            <span className="preview-bar-label">Live Preview</span>
            <span className="preview-bar-hint">Changes reflect instantly</span>
          </div>
          <div className="invoice-scroll">
            {invoiceType==="tax"    && <TaxInvoicePreview    co={company} f={taxForm} />}
            {invoiceType==="locker" && <LockerInvoicePreview co={company} f={lockerForm} />}
            {invoiceType==="credit" && <CreditNotePreview    co={company} f={creditForm} />}
          </div>
        </main>

      </div>
    </>
  );
}
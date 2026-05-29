import { useState } from "react";
import "./App.css";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function calcTotals(items, discountEnabled, discount, gstType, igstRate, sgstRate, cgstRate) {
  const total   = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const disc    = discountEnabled ? (parseFloat(discount) || 0) : 0;
  const netTotal = Math.max(total - disc, 0);
  let igst = 0, sgst = 0, cgst = 0;
  if (gstType === "igst") {
    igst = netTotal * ((parseFloat(igstRate) || 0) / 100);
  } else {
    sgst = netTotal * ((parseFloat(sgstRate) || 0) / 100);
    cgst = netTotal * ((parseFloat(cgstRate) || 0) / 100);
  }
  const grandTotal = netTotal + igst + sgst + cgst;
  return { total, disc, netTotal, igst, sgst, cgst, grandTotal };
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
  let w = n2w(ip) + " Rupees";
  if (dp > 0) w += " and " + n2w(dp) + " Paise";
  return w + " only.";
}

function fmt(num) {
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

// ─────────────────────────────────────────────
// DEFAULT STATES
// ─────────────────────────────────────────────
const defaultCompany = {
  name:    "1 FINANCE PRIVATE LIMITED",
  gstin:   "27AABCZ8402H1Z8",
  pan:     "AABCZ8402H",
  cin:     "U66190GJ2021PTC126723",
  address: "Unit No. 1101 & 1102, 11th Floor, B – Wing, Lotus Corporate Park, Goregaon (E), Mumbai-400 063.",
  website: "https://1finance.co.in/",
  regNo:   "SEBI RIA Registration No: INA000017523",
};

const defaultTaxInvoice = {
  invoiceNumber:  "1F/26-27/183",
  invoiceDate:    "2026-05-06",
  billedTo:       "DEMO NAME",
  partyAddress:   "DEMO ADDRESS",
  partyPhone:     "+91 XXXXXXXXXX",
  partyPAN:       "XXXXXXXXXX",
  partyGSTIN:     "",
  gstinEnabled:   false,
  placeOfSupply:  "MAHARASHTRA",
  stateCode:      "27",
  items: [
    { description: "Advisory Fees", sacCode: "997156", amount: "75000.00",
      note: "(An amount of Rs. 56250/- plus applicable taxes shall be payable at three months, six months, and nine months from the Execution Date.)" }
  ],
  discountEnabled: false,
  discount:        "0.00",
  gstType:         "sgst_cgst",
  igstRate:        "18",
  sgstRate:        "9",
  cgstRate:        "9",
};

const defaultLockerInvoice = {
  companyName:    "1 FINANCE PVT LTD",
  companyGSTIN:   "36AABCZ8402H1Z9",
  companyAddress: "Ground Floor, Unit No GB (Northern Side Of North Side) Avk Sri Harsh - Icon, Serilingampally, Nanakramguda, Hyderabad, Gachibowli, Rangareddy, Telangana-500032",
  invoiceNumber:  "1F/25-26/LCHY/16",
  invoiceDate:    "2026-03-11",
  billedTo:       "ALUGANI HARISH",
  partyAddress:   "1 169, HANUMAN TEMPLE, RAJENDRA NAGAR BUDVEL, RAJENDRANAGAR, K V RANGAREDDY HYDERABAD, TELANGANA - 500030 PIN Code: 500030",
  partyPhone:     "",
  partyPAN:       "AZCPA2666D",
  partyGSTIN:     "",
  gstinEnabled:   false,
  placeOfSupply:  "TELANGANA",
  stateCode:      "36",
  lockerNo:       "M027",
  lockerFrom:     "2026-03-11",
  lockerTo:       "2027-03-10",
  sacCode:        "997329",
  amount:         "2500",
  discountEnabled: true,
  discount:        "2500",
  gstType:         "sgst_cgst",
  sgstRate:        "9",
  cgstRate:        "9",
  interestNote:    "Interest @2% per month will apply on delayed payment",
};

const defaultCreditNote = {
  invoiceNumber:  "1F/26-27/CN/4",
  invoiceDate:    "2026-05-26",
  billedTo:       "DEMO NAME",
  partyAddress:   "DEMO ADDRESS",
  partyPhone:     "+91 XXXXXXXXXX",
  partyPAN:       "XXXXXXXXXX",
  placeOfSupply:  "MAHARASHTRA",
  stateCode:      "27",
  againstInvoice: "1F/26-27/169",
  items: [
    { description: "Advisory Fees", sacCode: "997156", amount: "5000.00", note: "" }
  ],
  gstType:  "igst",
  igstRate: "18",
  sgstRate: "9",
  cgstRate: "9",
};

// ─────────────────────────────────────────────
// SMALL UI COMPONENTS
// ─────────────────────────────────────────────
function Field({ label, value, onChange, textarea, type = "text" }) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      {textarea
        ? <textarea className="field-input field-textarea" value={value} rows={3} onChange={e => onChange(e.target.value)} />
        : <input className="field-input" type={type} value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  );
}

function Toggle({ label, on, onToggle }) {
  return (
    <div className="field-group">
      <button type="button" className={`toggle-btn${on ? " on" : ""}`} onClick={onToggle}>
        {on ? `✓ ${label}` : `+ Enable ${label}`}
      </button>
    </div>
  );
}

function SumRow({ label, value, bold }) {
  return <div className={`sum-row${bold ? " bold" : ""}`}><span>{label}</span><span>{value}</span></div>;
}

// ─────────────────────────────────────────────
// INVOICE LOGO
// ─────────────────────────────────────────────
function InvLogo() {
  return (
    <div className="inv-logo-icon">
      <span className="inv-logo-num">1</span>
      <span className="inv-logo-text">Finance</span>
    </div>
  );
}

function InvHeader({ co, branch }) {
  const name = (branch && (branch.companyName || branch.name)) || co.name;
  const gstin = (branch && branch.companyGSTIN) || co.gstin;
  const pan = co.pan;
  const cin = co.cin;
  const address = (branch && branch.companyAddress) || co.address;
  const website = co.website;

  return (
    <div className="inv-header">
      <div className="inv-brand">
        <InvLogo />
        <div>
          <div className="inv-co-name">{name}</div>
          <div className="inv-co-meta">
            <p><strong>GSTIN</strong>{gstin}</p>
            <p><strong>PAN</strong>{pan}</p>
            <p><strong>CIN</strong>{cin}</p>
          </div>
        </div>
      </div>
      <div className="inv-addr-block">
        {address}
        {website && <><br /><a href={website}>{website}</a></>}
      </div>
    </div>
  );
}

function TotalsBlock({ totals, f, showWords = true }) {
  const { total, disc, netTotal, igst, sgst, cgst, grandTotal } = totals;
  return (
    <div className="totals-wrap">
      <div className="totals-block">
        <div className="t-row sep"><span className="lbl">Total</span><span className="amt">₹ {fmt(total)}</span></div>
        {f.discountEnabled && <div className="t-row"><span className="lbl">Discount</span><span className="amt">- ₹ {fmt(disc)}</span></div>}
        <div className="t-row head"><span>Net Total</span><span>₹ {fmt(netTotal)}</span></div>
        {f.gstType === "igst"
          ? <div className="tax-line"><span>Add: IGST @</span><span>{f.igstRate}%</span><span>₹ {fmt(igst)}</span></div>
          : <>
              <div className="tax-line"><span>Add: CGST @</span><span>{f.cgstRate}%</span><span>₹ {fmt(cgst)}</span></div>
              <div className="tax-line"><span>Add: SGST @</span><span>{f.sgstRate}%</span><span>₹ {fmt(sgst)}</span></div>
            </>
        }
        <div className="t-row grand"><span>Grand Total</span><span className="amt">₹ {fmt(grandTotal)}</span></div>
        {showWords && <div className="words-row"><strong>Total Amount (₹ - In Words):</strong> {grandTotal === 0 ? "Rupees Zero only." : amtWords(grandTotal)}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAX INVOICE PREVIEW
// ─────────────────────────────────────────────
function TaxInvoicePreview({ co, f }) {
  const { total, disc, netTotal, igst, sgst, cgst, grandTotal } =
    calcTotals(f.items, f.discountEnabled, f.discount, f.gstType, f.igstRate, f.sgstRate, f.cgstRate);
  return (
    <div className="invoice-page">
      <InvHeader co={co} />

      <div className="inv-body">
        <div className="inv-title">Tax Invoice</div>

        <div className="inv-billed-row">
          <div>
            <div className="fl">Billed to</div>
            <div className="fv">{f.billedTo}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="fl">Date</div>
            <div className="fv">{formatDate(f.invoiceDate)}</div>
          </div>
        </div>

        <div className="party-grid">
          <div>
            <div className="pml">Party address</div>
            <div className="pmv">{f.partyAddress}<br />{f.partyPhone}</div>
          </div>
          <div>
            <div className="pml">PAN</div><div className="pmv">{f.partyPAN}</div>
            {f.gstinEnabled && f.partyGSTIN && <><div className="pml">GSTIN</div><div className="pmv">{f.partyGSTIN}</div></>}
            <div className="pml">Place of supply</div><div className="pmv">{f.placeOfSupply}</div>
          </div>
          <div className="text-right">
            <div className="pml">Invoice Number</div><div className="pmv">{f.invoiceNumber}</div>
            <div className="pml">State Code</div><div className="pmv">{f.stateCode}</div>
          </div>
        </div>

        <table className="inv-table">
          <thead><tr><th>Description</th><th className="c">SAC Code</th><th className="r">Amount</th></tr></thead>
          <tbody>
            {f.items.map((item, i) => (
              <tr key={i}>
                <td><strong>{item.description}</strong>{item.note && <div className="desc-note">{item.note}</div>}</td>
                <td className="c">{item.sacCode}</td>
                <td className="r">₹ {fmt(parseFloat(item.amount) || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <TotalsBlock totals={{ total, disc, netTotal, igst, sgst, cgst, grandTotal }} f={f} />

        <div className="inv-footer">{co.regNo}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LOCKER INVOICE PREVIEW
// ─────────────────────────────────────────────
function LockerInvoicePreview({ co, f }) {
  const items = [{ description: `Locker Charges (Locker No:-${f.lockerNo})`, sacCode: f.sacCode, amount: f.amount, note: `(From ${f.lockerFrom} to ${f.lockerTo})` }];
  const { total, disc, netTotal, sgst, cgst, grandTotal } =
    calcTotals(items, f.discountEnabled, f.discount, f.gstType, "18", f.sgstRate, f.cgstRate);
  return (
    <div className="invoice-page">
      <InvHeader co={co} branch={f} />

      <div className="inv-body">
        <div className="inv-title">Tax Invoice</div>

        <div className="inv-billed-row">
          <div><div className="fl">Billed to</div><div className="fv">{f.billedTo}</div></div>
          <div style={{ textAlign: "right" }}><div className="fl">Date</div><div className="fv">{formatDate(f.invoiceDate)}</div></div>
        </div>

        <div className="party-grid">
          <div>
            <div className="pml">Address</div>
            <div className="pmv">{f.partyAddress}</div>
          </div>
          <div>
            <div className="pml">PAN</div><div className="pmv">{f.partyPAN}</div>
            <div className="pml">Place of supply</div><div className="pmv">{f.placeOfSupply}</div>
          </div>
          <div className="text-right">
            <div className="pml">Invoice Number</div><div className="pmv">{f.invoiceNumber}</div>
            <div className="pml">State Code</div><div className="pmv">{f.stateCode}</div>
          </div>
        </div>

        <table className="inv-table">
          <thead><tr><th>Description</th><th className="c">SAC Code</th><th className="r">Amount</th></tr></thead>
          <tbody>
            <tr>
              <td><strong>Locker Charges (Locker No:-{f.lockerNo})</strong><div className="desc-note">(From {f.lockerFrom} to {f.lockerTo})</div></td>
              <td className="c">{f.sacCode}</td>
              <td className="r">₹{fmt(parseFloat(f.amount) || 0)}</td>
            </tr>
          </tbody>
        </table>

        <TotalsBlock totals={{ total, disc, netTotal, igst: 0, sgst, cgst, grandTotal }} f={f} />

        {f.interestNote && <div className="note-bar"><strong>Note:</strong> {f.interestNote}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CREDIT NOTE PREVIEW
// ─────────────────────────────────────────────
function CreditNotePreview({ co, f }) {
  const { total, igst, sgst, cgst, grandTotal } =
    calcTotals(f.items, false, "0", f.gstType, f.igstRate, f.sgstRate, f.cgstRate);
  return (
    <div className="invoice-page">
      <InvHeader co={co} />

      <div className="inv-body">
        <div className="inv-title credit">Credit Note</div>

        <div className="inv-billed-row">
          <div><div className="fl">Billed to</div><div className="fv">{f.billedTo}</div></div>
          <div style={{ textAlign: "right" }}><div className="fl">Date</div><div className="fv">{formatDate(f.invoiceDate)}</div></div>
        </div>

        <div className="party-grid">
          <div>
            <div className="pml">Party address</div>
            <div className="pmv">{f.partyAddress}<br />{f.partyPhone}</div>
          </div>
          <div>
            <div className="pml">PAN</div><div className="pmv">{f.partyPAN}</div>
            <div className="pml">Place of supply</div><div className="pmv">{f.placeOfSupply}</div>
          </div>
          <div className="text-right">
            <div className="pml">Invoice Number</div><div className="pmv">{f.invoiceNumber}</div>
            <div className="pml">State Code</div><div className="pmv">{f.stateCode}</div>
            <div className="pml">Against Invoice No</div><div className="pmv">{f.againstInvoice}</div>
          </div>
        </div>

        <table className="inv-table">
          <thead><tr><th>Description</th><th className="c">SAC Code</th><th className="r">Amount</th></tr></thead>
          <tbody>
            {f.items.map((item, i) => (
              <tr key={i}>
                <td><strong>{item.description}</strong>{item.note && <div className="desc-note">{item.note}</div>}</td>
                <td className="c">{item.sacCode}</td>
                <td className="r">₹ {fmt(parseFloat(item.amount) || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <TotalsBlock totals={{ total, disc: 0, netTotal: total, igst, sgst, cgst, grandTotal }} f={f} />

        <div className="inv-footer">{co.regNo}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SIDEBAR — TAX INVOICE
// ─────────────────────────────────────────────
function TaxSidebar({ f, set, tab, setTab }) {
  const { total, disc, netTotal, igst, sgst, cgst, grandTotal } =
    calcTotals(f.items, f.discountEnabled, f.discount, f.gstType, f.igstRate, f.sgstRate, f.cgstRate);

  const setItem = (idx, key, val) => {
    const items = [...f.items];
    items[idx] = { ...items[idx], [key]: val };
    set("items", items);
  };

  return (
    <>
      <div className="sb-tabs">
        {["client","items","taxes"].map(t => (
          <button key={t} className={`sb-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="sb-body">
        {tab === "client" && (
          <>
            <div className="sec-title">Invoice Details</div>
            <Field label="Invoice Number" value={f.invoiceNumber} onChange={v => set("invoiceNumber", v)} />
            <Field label="Invoice Date" value={f.invoiceDate} onChange={v => set("invoiceDate", v)} type="date" />
            <div className="sec-title mt">Client Details</div>
            <Field label="Billed To" value={f.billedTo} onChange={v => set("billedTo", v)} />
            <Field label="Party Address" value={f.partyAddress} onChange={v => set("partyAddress", v)} textarea />
            <Field label="Phone" value={f.partyPhone} onChange={v => set("partyPhone", v)} />
            <Field label="PAN" value={f.partyPAN} onChange={v => set("partyPAN", v)} />
            <Toggle label="GSTIN" on={f.gstinEnabled} onToggle={() => set("gstinEnabled", !f.gstinEnabled)} />
            {f.gstinEnabled && <Field label="GSTIN" value={f.partyGSTIN} onChange={v => set("partyGSTIN", v)} />}
            <Field label="Place of Supply" value={f.placeOfSupply} onChange={v => set("placeOfSupply", v)} />
            <Field label="State Code" value={f.stateCode} onChange={v => set("stateCode", v)} />
          </>
        )}
        {tab === "items" && (
          <>
            <div className="sec-title">Line Items</div>
            {f.items.map((item, idx) => (
              <div className="item-card" key={idx}>
                <div className="item-card-head">
                  <span className="item-label">Item {idx + 1}</span>
                  {f.items.length > 1 && <button className="remove-btn" onClick={() => set("items", f.items.filter((_,i) => i !== idx))}>✕</button>}
                </div>
                <Field label="Description" value={item.description} onChange={v => setItem(idx, "description", v)} />
                <Field label="Note (optional)" value={item.note || ""} onChange={v => setItem(idx, "note", v)} textarea />
                <Field label="SAC Code" value={item.sacCode} onChange={v => setItem(idx, "sacCode", v)} />
                <Field label="Amount (₹)" value={item.amount} onChange={v => setItem(idx, "amount", v)} type="number" />
              </div>
            ))}
            <button className="add-item-btn" onClick={() => set("items", [...f.items, { description: "", sacCode: "", amount: "", note: "" }])}>+ Add Item</button>
          </>
        )}
        {tab === "taxes" && (
          <>
            <div className="sec-title">Discounts & Taxes</div>
            <Toggle label="Discount" on={f.discountEnabled} onToggle={() => set("discountEnabled", !f.discountEnabled)} />
            {f.discountEnabled && <Field label="Discount (₹)" value={f.discount} onChange={v => set("discount", v)} type="number" />}
            <div className="field-group">
              <label className="field-label">GST Type</label>
              <select className="field-input" value={f.gstType} onChange={e => set("gstType", e.target.value)}>
                <option value="sgst_cgst">SGST + CGST (Intra-state)</option>
                <option value="igst">IGST (Inter-state)</option>
              </select>
            </div>
            {f.gstType === "igst"
              ? <Field label="IGST (%)" value={f.igstRate} onChange={v => set("igstRate", v)} type="number" />
              : <>
                  <Field label="SGST (%)" value={f.sgstRate} onChange={v => set("sgstRate", v)} type="number" />
                  <Field label="CGST (%)" value={f.cgstRate} onChange={v => set("cgstRate", v)} type="number" />
                </>
            }
            <div className="summary-box">
              <SumRow label="Subtotal" value={`₹ ${fmt(total)}`} />
              <SumRow label="Discount" value={`- ₹ ${fmt(disc)}`} />
              <SumRow label="Net Total" value={`₹ ${fmt(netTotal)}`} />
              {f.gstType === "igst"
                ? <SumRow label={`IGST @ ${f.igstRate}%`} value={`₹ ${fmt(igst)}`} />
                : <><SumRow label={`SGST @ ${f.sgstRate}%`} value={`₹ ${fmt(sgst)}`} /><SumRow label={`CGST @ ${f.cgstRate}%`} value={`₹ ${fmt(cgst)}`} /></>
              }
              <div className="sum-divider" />
              <SumRow label="Grand Total" value={`₹ ${fmt(grandTotal)}`} bold />
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// SIDEBAR — LOCKER INVOICE
// ─────────────────────────────────────────────
function LockerSidebar({ f, set, tab, setTab }) {
  const items = [{ description: "", sacCode: f.sacCode, amount: f.amount }];
  const { total, disc, netTotal, sgst, cgst, grandTotal } =
    calcTotals(items, f.discountEnabled, f.discount, f.gstType, "18", f.sgstRate, f.cgstRate);

  return (
    <>
      <div className="sb-tabs">
        {["client","locker","taxes"].map(t => (
          <button key={t} className={`sb-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="sb-body">
        {tab === "client" && (
          <>
            <div className="sec-title">Company (Branch)</div>
            <Field label="Company Name" value={f.companyName} onChange={v => set("companyName", v)} />
            <Field label="GSTIN" value={f.companyGSTIN} onChange={v => set("companyGSTIN", v)} />
            <Field label="Branch Address" value={f.companyAddress} onChange={v => set("companyAddress", v)} textarea />
            <div className="sec-title mt">Invoice Details</div>
            <Field label="Invoice Number" value={f.invoiceNumber} onChange={v => set("invoiceNumber", v)} />
            <Field label="Invoice Date" value={f.invoiceDate} onChange={v => set("invoiceDate", v)} type="date" />
            <div className="sec-title mt">Client Details</div>
            <Field label="Billed To" value={f.billedTo} onChange={v => set("billedTo", v)} />
            <Field label="Address" value={f.partyAddress} onChange={v => set("partyAddress", v)} textarea />
            <Field label="PAN" value={f.partyPAN} onChange={v => set("partyPAN", v)} />
            <Field label="Place of Supply" value={f.placeOfSupply} onChange={v => set("placeOfSupply", v)} />
            <Field label="State Code" value={f.stateCode} onChange={v => set("stateCode", v)} />
          </>
        )}
        {tab === "locker" && (
          <>
            <div className="sec-title">Locker Details</div>
            <Field label="Locker Number" value={f.lockerNo} onChange={v => set("lockerNo", v)} />
            <Field label="From Date" value={f.lockerFrom} onChange={v => set("lockerFrom", v)} />
            <Field label="To Date" value={f.lockerTo} onChange={v => set("lockerTo", v)} />
            <Field label="SAC Code" value={f.sacCode} onChange={v => set("sacCode", v)} />
            <Field label="Amount (₹)" value={f.amount} onChange={v => set("amount", v)} type="number" />
            <Field label="Interest Note" value={f.interestNote} onChange={v => set("interestNote", v)} />
          </>
        )}
        {tab === "taxes" && (
          <>
            <div className="sec-title">Discount & Taxes</div>
            <Toggle label="Discount" on={f.discountEnabled} onToggle={() => set("discountEnabled", !f.discountEnabled)} />
            {f.discountEnabled && <Field label="Discount (₹)" value={f.discount} onChange={v => set("discount", v)} type="number" />}
            <Field label="SGST (%)" value={f.sgstRate} onChange={v => set("sgstRate", v)} type="number" />
            <Field label="CGST (%)" value={f.cgstRate} onChange={v => set("cgstRate", v)} type="number" />
            <div className="summary-box">
              <SumRow label="Total" value={`₹ ${fmt(total)}`} />
              <SumRow label="Discount" value={`- ₹ ${fmt(disc)}`} />
              <SumRow label="Net Total" value={`₹ ${fmt(netTotal)}`} />
              <SumRow label={`SGST @ ${f.sgstRate}%`} value={`₹ ${fmt(sgst)}`} />
              <SumRow label={`CGST @ ${f.cgstRate}%`} value={`₹ ${fmt(cgst)}`} />
              <div className="sum-divider" />
              <SumRow label="Grand Total" value={`₹ ${fmt(grandTotal)}`} bold />
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// SIDEBAR — CREDIT NOTE
// ─────────────────────────────────────────────
function CreditSidebar({ f, set, tab, setTab }) {
  const { total, igst, sgst, cgst, grandTotal } =
    calcTotals(f.items, false, "0", f.gstType, f.igstRate, f.sgstRate, f.cgstRate);

  const setItem = (idx, key, val) => {
    const items = [...f.items];
    items[idx] = { ...items[idx], [key]: val };
    set("items", items);
  };

  return (
    <>
      <div className="sb-tabs">
        {["client","items","taxes"].map(t => (
          <button key={t} className={`sb-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="sb-body">
        {tab === "client" && (
          <>
            <div className="sec-title">Invoice Details</div>
            <Field label="Invoice Number" value={f.invoiceNumber} onChange={v => set("invoiceNumber", v)} />
            <Field label="Invoice Date" value={f.invoiceDate} onChange={v => set("invoiceDate", v)} type="date" />
            <Field label="Against Invoice No" value={f.againstInvoice} onChange={v => set("againstInvoice", v)} />
            <div className="sec-title mt">Client Details</div>
            <Field label="Billed To" value={f.billedTo} onChange={v => set("billedTo", v)} />
            <Field label="Party Address" value={f.partyAddress} onChange={v => set("partyAddress", v)} textarea />
            <Field label="Phone" value={f.partyPhone} onChange={v => set("partyPhone", v)} />
            <Field label="PAN" value={f.partyPAN} onChange={v => set("partyPAN", v)} />
            <Field label="Place of Supply" value={f.placeOfSupply} onChange={v => set("placeOfSupply", v)} />
            <Field label="State Code" value={f.stateCode} onChange={v => set("stateCode", v)} />
          </>
        )}
        {tab === "items" && (
          <>
            <div className="sec-title">Line Items</div>
            {f.items.map((item, idx) => (
              <div className="item-card" key={idx}>
                <div className="item-card-head">
                  <span className="item-label">Item {idx + 1}</span>
                  {f.items.length > 1 && <button className="remove-btn" onClick={() => set("items", f.items.filter((_,i) => i !== idx))}>✕</button>}
                </div>
                <Field label="Description" value={item.description} onChange={v => setItem(idx, "description", v)} />
                <Field label="SAC Code" value={item.sacCode} onChange={v => setItem(idx, "sacCode", v)} />
                <Field label="Amount (₹)" value={item.amount} onChange={v => setItem(idx, "amount", v)} type="number" />
              </div>
            ))}
            <button className="add-item-btn" onClick={() => set("items", [...f.items, { description: "", sacCode: "", amount: "", note: "" }])}>+ Add Item</button>
          </>
        )}
        {tab === "taxes" && (
          <>
            <div className="sec-title">Taxes</div>
            <div className="field-group">
              <label className="field-label">GST Type</label>
              <select className="field-input" value={f.gstType} onChange={e => set("gstType", e.target.value)}>
                <option value="igst">IGST (Inter-state)</option>
                <option value="sgst_cgst">SGST + CGST (Intra-state)</option>
              </select>
            </div>
            {f.gstType === "igst"
              ? <Field label="IGST (%)" value={f.igstRate} onChange={v => set("igstRate", v)} type="number" />
              : <><Field label="SGST (%)" value={f.sgstRate} onChange={v => set("sgstRate", v)} type="number" /><Field label="CGST (%)" value={f.cgstRate} onChange={v => set("cgstRate", v)} type="number" /></>
            }
            <div className="summary-box">
              <SumRow label="Total" value={`₹ ${fmt(total)}`} />
              {f.gstType === "igst"
                ? <SumRow label={`IGST @ ${f.igstRate}%`} value={`₹ ${fmt(igst)}`} />
                : <><SumRow label={`SGST @ ${f.sgstRate}%`} value={`₹ ${fmt(sgst)}`} /><SumRow label={`CGST @ ${f.cgstRate}%`} value={`₹ ${fmt(cgst)}`} /></>
              }
              <div className="sum-divider" />
              <SumRow label="Grand Total" value={`₹ ${fmt(grandTotal)}`} bold />
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function App() {
  const [invoiceType, setInvoiceType] = useState("tax");
  const [sideTab, setSideTab]         = useState("client");
  const [coTab, setCoTab]             = useState(false); // company info panel

  const [company,       setCompanyFull]  = useState(defaultCompany);
  const [taxForm,       setTaxFull]      = useState(defaultTaxInvoice);
  const [lockerForm,    setLockerFull]   = useState(defaultLockerInvoice);
  const [creditForm,    setCreditFull]   = useState(defaultCreditNote);

  const setCo  = (k, v) => setCompanyFull(p => ({ ...p, [k]: v }));
  const setTax = (k, v) => setTaxFull(p => ({ ...p, [k]: v }));
  const setLk  = (k, v) => setLockerFull(p => ({ ...p, [k]: v }));
  const setCr  = (k, v) => setCreditFull(p => ({ ...p, [k]: v }));

  // When invoice type changes, reset sidebar tab
  const switchType = (t) => { setInvoiceType(t); setSideTab("client"); setCoTab(false); };

  return (
    <div className="app-root">
      {/* ═══ SIDEBAR ═══ */}
      <aside className="sidebar">
        {/* Header */}
        <div className="sb-head">
          <div className="sb-logo-box">1</div>
          <div>
            <div className="sb-brand">1Finance</div>
            <div className="sb-sub">Invoice Generator</div>
          </div>
        </div>

        {/* Invoice type switcher */}
        <div className="sb-type-bar">
          <button className={`type-btn${invoiceType === "tax" ? " active" : ""}`} onClick={() => switchType("tax")}>Tax</button>
          <button className={`type-btn${invoiceType === "locker" ? " active" : ""}`} onClick={() => switchType("locker")}>Locker</button>
          <button className={`type-btn${invoiceType === "credit" ? " active" : ""}`} onClick={() => switchType("credit")}>Credit Note</button>
        </div>

        {/* Company info toggle */}
        <div style={{ borderBottom: "1px solid var(--gray-pale)", flexShrink: 0 }}>
          <button
            style={{ width: "100%", padding: "8px 18px", background: coTab ? "#f4f4f4" : "none", border: "none", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--gray-mid)", cursor: "pointer" }}
            onClick={() => setCoTab(p => !p)}
          >
            {coTab ? "▲" : "▼"} &nbsp; Company Info
          </button>
          {coTab && (
            <div className="sb-body" style={{ maxHeight: 320, flex: "none" }}>
              <Field label="Company Name" value={company.name} onChange={v => setCo("name", v)} />
              <Field label="GSTIN" value={company.gstin} onChange={v => setCo("gstin", v)} />
              <Field label="PAN" value={company.pan} onChange={v => setCo("pan", v)} />
              <Field label="CIN" value={company.cin} onChange={v => setCo("cin", v)} />
              <Field label="Address" value={company.address} onChange={v => setCo("address", v)} textarea />
              <Field label="Website" value={company.website} onChange={v => setCo("website", v)} />
              <Field label="Reg. No." value={company.regNo} onChange={v => setCo("regNo", v)} />
            </div>
          )}
        </div>

        {/* Per-type sidebar */}
        {invoiceType === "tax"    && <TaxSidebar    f={taxForm}    set={setTax} tab={sideTab} setTab={setSideTab} />}
        {invoiceType === "locker" && <LockerSidebar f={lockerForm} set={setLk}  tab={sideTab} setTab={setSideTab} />}
        {invoiceType === "credit" && <CreditSidebar f={creditForm} set={setCr}  tab={sideTab} setTab={setSideTab} />}

        {/* Print */}
        <div className="sb-foot">
          <button className="print-btn" onClick={() => window.print()}>🖨 Print / Download PDF</button>
        </div>
      </aside>

      {/* ═══ PREVIEW ═══ */}
      <main className="preview-area">
        <div className="preview-bar">
          <span className="preview-bar-label">Live Preview</span>
          <span className="preview-bar-hint">Changes reflect instantly</span>
        </div>
        <div className="invoice-scroll">
          {invoiceType === "tax"    && <TaxInvoicePreview    co={company} f={taxForm} />}
          {invoiceType === "locker" && <LockerInvoicePreview co={company} f={lockerForm} />}
          {invoiceType === "credit" && <CreditNotePreview    co={company} f={creditForm} />}
        </div>
      </main>
    </div>
  );
}
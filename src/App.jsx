import { useState, useRef } from "react";
import "./App.css";

const defaultForm = {
  // Company Info
  companyName: "1 FINANCE PRIVATE LIMITED",
  companyGSTIN: "27AABCZ8402H1Z8",
  companyPAN: "AABCZ8402H",
  companyCIN: "U66190GJ2021PTC126723",
  companyAddress: "Unit No. 1101 & 1102, 11th Floor, B – Wing, Lotus Corporate Park, Goregaon (E), Mumbai-400 063.",
  companyWebsite: "https://1finance.co.in/",
  companyRegNo: "SEBI RIA Registration No: INA000017523",

  // Invoice Details
  invoiceNumber: "1F/26-27/F/42",
  invoiceDate: "2026-04-09",

  // Client Info
  billedTo: "RANJIT MANNALAL SAROJ",
  partyAddress: "ROOM-A/104 PRABHAT CHAWL, JAGDISH SHETTY ROAD,, GANESH NAGAR, KANDIVALI WEST,, MUMBAI, MAHARASHTRA, 400067",
  partyPhone: "+91 9867470618",
  partyPAN: "QJBPS4663F",
  partyGSTIN: "",
  placeOfSupply: "Maharashtra",
  stateCode: "27",

  // Line Items
  items: [
    { description: "Advisory Fees", sacCode: "997156", amount: "2118.00" },
  ],

  // Taxes & Discount
  discount: "2118.00",
  gstType: "sgst_cgst",
  igstRate: "18",
  sgstRate: "9",
  cgstRate: "9",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function calcTotals(items, discount, gstType, igstRate, sgstRate, cgstRate) {
  const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const disc = parseFloat(discount) || 0;
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

function numberToWords(num) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
    "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if (num === 0) return "Zero";
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
  if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + numberToWords(num % 100) : "");
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + numberToWords(num % 1000) : "");
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + numberToWords(num % 100000) : "");
  return numberToWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + numberToWords(num % 10000000) : "");
}

function amountInWords(amount) {
  const rounded = Math.round(amount * 100) / 100;
  const intPart = Math.floor(rounded);
  const decPart = Math.round((rounded - intPart) * 100);
  let words = numberToWords(intPart) + " Rupees";
  if (decPart > 0) words += " and " + numberToWords(decPart) + " Paise";
  return words + " only.";
}

export default function App() {
  const [form, setForm] = useState(defaultForm);
  const [activeTab, setActiveTab] = useState("company");
  const printRef = useRef();

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const setItem = (idx, key, val) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [key]: val };
    set("items", items);
  };

  const addItem = () => set("items", [...form.items, { description: "", sacCode: "", amount: "" }]);
  const removeItem = (idx) => set("items", form.items.filter((_, i) => i !== idx));

  const { total, disc, netTotal, igst, sgst, cgst, grandTotal } = calcTotals(
    form.items, form.discount, form.gstType, form.igstRate, form.sgstRate, form.cgstRate
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-root">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-box">1</span>
            <div>
              <div className="sidebar-brand">1Finance</div>
              <div className="sidebar-sub">Invoice Generator</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-tabs">
          {["company", "client", "items", "taxes"].map((t) => (
            <button
              key={t}
              className={`tab-btn ${activeTab === t ? "active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t === "company" && <span className="tab-icon">🏢</span>}
              {t === "client" && <span className="tab-icon">👤</span>}
              {t === "items" && <span className="tab-icon">📋</span>}
              {t === "taxes" && <span className="tab-icon">💰</span>}
              <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-body">
          {/* COMPANY TAB */}
          {activeTab === "company" && (
            <div className="form-section">
              <h3 className="section-title">Company Details</h3>
              <Field label="Company Name" value={form.companyName} onChange={(v) => set("companyName", v)} />
              <Field label="GSTIN" value={form.companyGSTIN} onChange={(v) => set("companyGSTIN", v)} />
              <Field label="PAN" value={form.companyPAN} onChange={(v) => set("companyPAN", v)} />
              <Field label="CIN" value={form.companyCIN} onChange={(v) => set("companyCIN", v)} />
              <Field label="Address" value={form.companyAddress} onChange={(v) => set("companyAddress", v)} textarea />
              <Field label="Website" value={form.companyWebsite} onChange={(v) => set("companyWebsite", v)} />
              <Field label="Registration No." value={form.companyRegNo} onChange={(v) => set("companyRegNo", v)} />

              <h3 className="section-title mt">Invoice Details</h3>
              <Field label="Invoice Number" value={form.invoiceNumber} onChange={(v) => set("invoiceNumber", v)} />
              <Field label="Invoice Date" value={form.invoiceDate} onChange={(v) => set("invoiceDate", v)} type="date" />
            </div>
          )}

          {/* CLIENT TAB */}
          {activeTab === "client" && (
            <div className="form-section">
              <h3 className="section-title">Client Details</h3>
              <Field label="Billed To" value={form.billedTo} onChange={(v) => set("billedTo", v)} />
              <Field label="Party Address" value={form.partyAddress} onChange={(v) => set("partyAddress", v)} textarea />
              <Field label="Phone" value={form.partyPhone} onChange={(v) => set("partyPhone", v)} />
              <Field label="PAN" value={form.partyPAN} onChange={(v) => set("partyPAN", v)} />
              <Field label="GSTIN" value={form.partyGSTIN} onChange={(v) => set("partyGSTIN", v)} />
              <Field label="Place of Supply" value={form.placeOfSupply} onChange={(v) => set("placeOfSupply", v)} />
              <Field label="State Code" value={form.stateCode} onChange={(v) => set("stateCode", v)} />
            </div>
          )}

          {/* ITEMS TAB */}
          {activeTab === "items" && (
            <div className="form-section">
              <h3 className="section-title">Line Items</h3>
              {form.items.map((item, idx) => (
                <div className="item-card" key={idx}>
                  <div className="item-card-header">
                    <span className="item-num">Item {idx + 1}</span>
                    {form.items.length > 1 && (
                      <button className="remove-btn" onClick={() => removeItem(idx)}>✕</button>
                    )}
                  </div>
                  <Field label="Description" value={item.description} onChange={(v) => setItem(idx, "description", v)} />
                  <Field label="SAC Code" value={item.sacCode} onChange={(v) => setItem(idx, "sacCode", v)} />
                  <Field label="Amount (₹)" value={item.amount} onChange={(v) => setItem(idx, "amount", v)} type="number" />
                </div>
              ))}
              <button className="add-item-btn" onClick={addItem}>+ Add Item</button>
            </div>
          )}

          {/* TAXES TAB */}
          {activeTab === "taxes" && (
            <div className="form-section">
              <h3 className="section-title">Discounts & Taxes</h3>
              <Field label="Discount (₹)" value={form.discount} onChange={(v) => set("discount", v)} type="number" />
              
              <div className="field-group">
                <label className="field-label">GST Type</label>
                <select 
                  className="field-input" 
                  value={form.gstType} 
                  onChange={(e) => set("gstType", e.target.value)}
                >
                  <option value="sgst_cgst">SGST + CGST (Intra-state)</option>
                  <option value="igst">IGST (Inter-state)</option>
                </select>
              </div>

              {form.gstType === "igst" ? (
                <Field label="IGST (%)" value={form.igstRate} onChange={(v) => set("igstRate", v)} type="number" />
              ) : (
                <>
                  <Field label="SGST (%)" value={form.sgstRate} onChange={(v) => set("sgstRate", v)} type="number" />
                  <Field label="CGST (%)" value={form.cgstRate} onChange={(v) => set("cgstRate", v)} type="number" />
                </>
              )}

              <div className="summary-box">
                <SummaryRow label="Subtotal" value={`₹ ${total.toFixed(2)}`} />
                <SummaryRow label="Discount" value={`- ₹ ${disc.toFixed(2)}`} />
                <SummaryRow label="Net Total" value={`₹ ${netTotal.toFixed(2)}`} />
                {form.gstType === "igst" ? (
                  <SummaryRow label={`IGST @ ${form.igstRate}%`} value={`₹ ${igst.toFixed(2)}`} />
                ) : (
                  <>
                    <SummaryRow label={`SGST @ ${form.sgstRate}%`} value={`₹ ${sgst.toFixed(2)}`} />
                    <SummaryRow label={`CGST @ ${form.cgstRate}%`} value={`₹ ${cgst.toFixed(2)}`} />
                  </>
                )}
                <div className="summary-divider" />
                <SummaryRow label="Grand Total" value={`₹ ${grandTotal.toFixed(2)}`} bold />
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <button className="print-btn" onClick={handlePrint}>
            🖨 Print / Download PDF
          </button>
        </div>
      </aside>

      {/* ── PREVIEW ── */}
      <main className="preview-area">
        <div className="preview-topbar">
          <span className="preview-label">Live Preview</span>
          <span className="preview-hint">Changes reflect instantly</span>
        </div>

        <div className="invoice-wrapper" ref={printRef}>
          <div className="invoice-page">
            {/* Header */}
            <header className="inv-header">
              <div className="inv-brand">
                <div className="inv-logo-wrap">
                  <div className="inv-logo-box">1</div>
                  <div className="inv-logo-text">Finance</div>
                </div>
                <div className="inv-company-meta">
                  <div className="inv-company-name">{form.companyName}</div>
                  <div className="inv-meta-row"><span className="meta-label">GSTIN</span> {form.companyGSTIN}</div>
                  <div className="inv-meta-row"><span className="meta-label">PAN</span> {form.companyPAN}</div>
                  <div className="inv-meta-row"><span className="meta-label">CIN</span> {form.companyCIN}</div>
                </div>
              </div>
              <div className="inv-address-block">
                <div className="inv-addr-text">{form.companyAddress}</div>
                <div className="inv-addr-web">{form.companyWebsite}</div>
              </div>
            </header>

            {/* Invoice Body */}
            <div className="inv-body">
              <div className="inv-title">Tax Invoice</div>

              {/* Billed To + Date */}
              <div className="inv-billed-row">
                <div className="inv-billed-section">
                  <div className="inv-field-label">Billed to</div>
                  <div className="inv-billed-name">{form.billedTo}</div>

                  <div className="inv-field-label mt-sm">Party address</div>
                  <div className="inv-billed-addr">{form.partyAddress}</div>
                  <div className="inv-billed-addr">{form.partyPhone}</div>
                </div>

                <div className="inv-meta-right">
                  <div className="inv-meta-col">
                    <div className="inv-field-label">Date</div>
                    <div className="inv-field-value">{formatDate(form.invoiceDate)}</div>
                  </div>
                  <div className="inv-meta-col">
                    <div className="inv-field-label">PAN</div>
                    <div className="inv-field-value">{form.partyPAN}</div>
                  </div>
                  {form.partyGSTIN && (
                    <div className="inv-meta-col">
                      <div className="inv-field-label">GSTIN</div>
                      <div className="inv-field-value">{form.partyGSTIN}</div>
                    </div>
                  )}
                  <div className="inv-meta-col">
                    <div className="inv-field-label">Invoice Number</div>
                    <div className="inv-field-value">{form.invoiceNumber}</div>
                  </div>
                  <div className="inv-meta-col">
                    <div className="inv-field-label">Place of supply</div>
                    <div className="inv-field-value">{form.placeOfSupply}</div>
                  </div>
                  <div className="inv-meta-col">
                    <div className="inv-field-label">State Code</div>
                    <div className="inv-field-value">{form.stateCode}</div>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="inv-table">
                <thead>
                  <tr>
                    <th className="th-desc">Description</th>
                    <th className="th-sac">SAC Code</th>
                    <th className="th-amt">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item, idx) => (
                    <tr key={idx} className="inv-tr">
                      <td className="td-desc">{item.description}</td>
                      <td className="td-sac">{item.sacCode}</td>
                      <td className="td-amt">₹ {parseFloat(item.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="inv-totals">
                <div className="totals-table">
                  <TotalRow label="Total" value={`₹ ${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} size="lg" />
                  <TotalRow label="Discount" value={`-₹ ${disc.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`} />
                  <TotalRow label="Net Total" value={netTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })} bold />
                  {form.gstType === "igst" ? (
                    <TotalRow label={`Add: IGST @`} rate={`${form.igstRate}%`} value={`₹${igst.toFixed(2)}`} />
                  ) : (
                    <>
                      <TotalRow label={`Add: SGST @`} rate={`${form.sgstRate}%`} value={`₹${sgst.toFixed(2)}`} />
                      <TotalRow label={`Add: CGST @`} rate={`${form.cgstRate}%`} value={`₹${cgst.toFixed(2)}`} />
                    </>
                  )}
                  <div className="totals-divider" />
                  <TotalRow
                    label="Grand Total"
                    value={`₹ ${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                    grand
                  />
                  <div className="inv-words">
                    <strong>Total Amount :</strong> {grandTotal === 0 ? "Rupees Zero only." : amountInWords(grandTotal)}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="inv-footer-reg">{form.companyRegNo}</div>
              <div className="inv-footer-note">This is a Computer Generated Invoice. No signature required.</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, textarea, type = "text" }) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      {textarea ? (
        <textarea
          className="field-input field-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      ) : (
        <input
          className="field-input"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function SummaryRow({ label, value, bold }) {
  return (
    <div className={`summary-row ${bold ? "summary-bold" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function TotalRow({ label, value, rate, bold, grand, size }) {
  return (
    <div className={`total-row ${bold ? "total-bold" : ""} ${grand ? "total-grand" : ""} ${size === "lg" ? "total-lg" : ""}`}>
      <span className="total-label">{label} {rate && <span className="total-rate">{rate}</span>}</span>
      <span className="total-value">{value}</span>
    </div>
  );
}
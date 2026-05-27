import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import html2pdf from "html2pdf.js";
import "./App.css";

const TAX_RATE = 0.09;
const INITIAL_FORM_DATA = {
  clientName: "RANJIT MANNALAL SAROJ",
  address:
    "ROOM-A/104 PRABHAT CHAWL,JAGDISH SHETTY ROAD,, GANESH NAGAR,KANDIVALI WEST,, MUMBAI,MAHARASHTRA,400067, MUMBAI, Maharashtra, India, 400067",
  phone: "+91 9867470618",
  pan: "QJBPS4663F",
  date: "2026-04-09",
  invoiceNumber: "1F/26-27/F/42",
  placeOfSupply: "Maharashtra",
  stateCode: "27",
  discount: 2118,
  items: [{ desc: "Advisory Fees", sac: "997156", amount: 2118 }]
};

const parseNumber = (value, fallback = 0) => {
  const number = typeof value === "string" ? parseFloat(value) : Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0);

const toWords = (number) => {
  const amount = parseNumber(number);
  if (amount === 0) return "Rupees Zero";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen"
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const convert = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000)
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + convert(n % 100) : "")
      );
    if (n < 100000)
      return (
        convert(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + convert(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        convert(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + convert(n % 100000) : "")
      );

    return (
      convert(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + convert(n % 10000000) : "")
    );
  };

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  return "Rupees " + convert(rupees) + (paise > 0 ? " and " + convert(paise) + " Paise" : "");
};

const createFileHandler = (setter) => (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  setter(URL.createObjectURL(file));
};

const Field = ({ label, children }) => (
  <div className="form-group">
    <label>{label}</label>
    {children}
  </div>
);

export default function App() {
  const invoiceRef = useRef(null);
  const [bgTemplate, setBgTemplate] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [docType, setDocType] = useState("Tax Invoice");
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  useEffect(() => {
    if (!bgTemplate) return undefined;
    return () => URL.revokeObjectURL(bgTemplate);
  }, [bgTemplate]);

  useEffect(() => {
    if (!logoUrl) return undefined;
    return () => URL.revokeObjectURL(logoUrl);
  }, [logoUrl]);

  const handleTemplateUpload = useCallback(createFileHandler(setBgTemplate), []);
  const handleLogoUpload = useCallback(createFileHandler(setLogoUrl), []);

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateItem = useCallback((index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    }));
  }, []);

  const addItem = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { desc: "", sac: "", amount: 0 }]
    }));
  }, []);

  const removeItem = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index)
    }));
  }, []);

  const isTaxable = docType === "Tax Invoice";
  const invoiceNumberLabel = docType === "Credit Note" ? "Credit Note Number" : "Invoice Number";

  const totals = useMemo(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + parseNumber(item.amount), 0);
    const discount = parseNumber(formData.discount);
    const net = Math.max(0, subtotal - discount);
    const tax = net * TAX_RATE;
    return {
      subtotal,
      discount,
      net,
      sgst: tax,
      cgst: tax,
      grand: isTaxable ? net + tax * 2 : net
    };
  }, [formData.items, formData.discount, isTaxable]);

  const downloadPDF = useCallback(() => {
    if (!invoiceRef.current) return;
    html2pdf()
      .set({
        margin: 0,
        filename: `${docType.replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      })
      .from(invoiceRef.current)
      .save();
  }, [docType]);

  return (
    <div className="app-container">
      <aside className="editor-panel">
        <header className="editor-header">
          <div>
            <h2>✏️ Invoice Editor</h2>
            <select className="doc-type-select" value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option value="Tax Invoice">📄 Tax Invoice</option>
              <option value="Locker Invoice">🔒 Locker Invoice</option>
              <option value="Credit Note">🔙 Credit Note</option>
            </select>
          </div>
          <label className="upload-btn">
            📥 Upload Template
            <input type="file" accept=".pdf,image/*" onChange={handleTemplateUpload} />
          </label>
        </header>

        <div className="editor-body">
          <Field label="Company Logo">
            <input type="file" accept="image/*" onChange={handleLogoUpload} />
          </Field>

          <Field label={invoiceNumberLabel}>
            <input
              value={formData.invoiceNumber}
              onChange={(e) => updateField("invoiceNumber", e.target.value)}
            />
          </Field>

          <Field label="Date">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
            />
          </Field>

          <hr className="divider" />

          <Field label="Client Name">
            <input
              value={formData.clientName}
              onChange={(e) => updateField("clientName", e.target.value)}
            />
          </Field>

          <Field label="Address">
            <textarea
              rows={4}
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </Field>

          <Field label="Phone">
            <input
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </Field>

          <Field label="PAN">
            <input
              value={formData.pan}
              onChange={(e) => updateField("pan", e.target.value)}
            />
          </Field>

          <Field label="Place of Supply">
            <input
              value={formData.placeOfSupply}
              onChange={(e) => updateField("placeOfSupply", e.target.value)}
            />
          </Field>

          <Field label="State Code">
            <input
              value={formData.stateCode}
              onChange={(e) => updateField("stateCode", e.target.value)}
            />
          </Field>

          <div className="items-section">
            <label className="section-label">LINE ITEMS</label>
            {formData.items.map((item, index) => (
              <div className="item-row" key={index}>
                <input
                  className="desc"
                  placeholder="Description"
                  value={item.desc}
                  onChange={(e) => updateItem(index, "desc", e.target.value)}
                />
                <input
                  className="sac"
                  placeholder="SAC"
                  value={item.sac}
                  onChange={(e) => updateItem(index, "sac", e.target.value)}
                />
                <input
                  className="amount"
                  type="number"
                  step="0.01"
                  value={item.amount}
                  onChange={(e) => updateItem(index, "amount", parseNumber(e.target.value))}
                />
                <button type="button" className="btn-remove" onClick={() => removeItem(index)}>
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="btn-add" onClick={addItem}>
              + Add Item
            </button>
          </div>

          <Field label="Discount (₹)">
            <input
              type="number"
              step="0.01"
              value={formData.discount}
              onChange={(e) => updateField("discount", parseNumber(e.target.value))}
            />
          </Field>
        </div>

        <footer className="editor-footer">
          <button type="button" className="btn btn-primary" onClick={downloadPDF}>
            ⬇️ Download PDF
          </button>
        </footer>
      </aside>

      <main className="preview-panel">
        <div ref={invoiceRef} className="invoice-page">
          {bgTemplate && (
            <div className="template-bg" style={{ backgroundImage: `url(${bgTemplate})` }} />
          )}

          <div className="invoice-content">
            {logoUrl && <img src={logoUrl} alt="Company logo" className="company-logo" />}
            <h1 className="inv-title">{docType}</h1>

            <div className="inv-header">
              <div className="inv-left">
                <span className="inv-label">Billed to</span>
                <span className="inv-value client-name">{formData.clientName}</span>
                <span className="inv-label">Party address</span>
                <span className="inv-value address">{formData.address}</span>
                <div className="inv-row">
                  <span className="inv-label">Phone:</span> <span>{formData.phone}</span>
                </div>
                <div className="inv-row">
                  <span className="inv-label">PAN:</span> <span>{formData.pan}</span>
                </div>
              </div>

              <div className="inv-right">
                <div className="inv-row">
                  <span className="inv-label">Date</span>
                  <span>{formData.date}</span>
                </div>
                <div className="inv-row">
                  <span className="inv-label">{invoiceNumberLabel}</span>
                  <span>{formData.invoiceNumber}</span>
                </div>
                <div className="inv-row">
                  <span className="inv-label">Place of supply</span>
                  <span>{formData.placeOfSupply}</span>
                </div>
                <div className="inv-row">
                  <span className="inv-label">State Code</span>
                  <span>{formData.stateCode}</span>
                </div>
              </div>
            </div>

            <table className="inv-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="col-sac">SAC Code</th>
                  <th className="col-amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.desc}</td>
                    <td className="col-sac">{item.sac}</td>
                    <td className="col-amount">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="inv-totals">
              <div className="tot-row">
                <span>Total</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="tot-row">
                <span>Discount</span>
                <span>- {formatCurrency(totals.discount)}</span>
              </div>
              <div className="tot-row">
                <span>Net Total</span>
                <span>{formatCurrency(totals.net)}</span>
              </div>
              {isTaxable && (
                <>
                  <div className="tot-row">
                    <span>Add: SGST@ 9%</span>
                    <span>{formatCurrency(totals.sgst)}</span>
                  </div>
                  <div className="tot-row">
                    <span>Add: CGST@ 9%</span>
                    <span>{formatCurrency(totals.cgst)}</span>
                  </div>
                </>
              )}
              <div className="tot-row grand">
                <span>Grand Total</span>
                <span>{formatCurrency(totals.grand)}</span>
              </div>
            </div>

            <div className="amount-words">Total Amount: {toWords(totals.grand)} only.</div>
            <footer className="inv-footer">
              <strong>1 FINANCE PRIVATE LIMITED</strong>
              GSTIN 27AABCZ8402H1Z8 PAN AABCZ8402H CIN U66190GJ2021PTC126723<br />
              Unit No. 1101& 1102, 11th Floor, B – Wing, Lotus Corporate Park, Goregaon(E), Mumbai-400 063.<br />
              https://1finance.co.in/<br />
              SEBI RIA Registration No: INA000017523<br />
              <span className="disclaimer">This is a Computer Generated {docType}. No signature required.</span>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useRef, useMemo, useCallback } from "react";
import html2pdf from "html2pdf.js";
import "./App.css";

export default function App() {
  const invoiceRef = useRef(null);
  const [bgTemplate, setBgTemplate] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [docType, setDocType] = useState("Tax Invoice");

  const [formData, setFormData] = useState({
    clientName: "RANJIT MANNALAL SAROJ",
    address: "ROOM-A/104 PRABHAT CHAWL,JAGDISH SHETTY ROAD,, GANESH NAGAR,KANDIVALI WEST,, MUMBAI,MAHARASHTRA,400067, MUMBAI, Maharashtra, India, 400067",
    phone: "+91 9867470618",
    pan: "QJBPS4663F",
    date: "9 Apr, 2026",
    invoiceNumber: "1F/26-27/F/42",
    placeOfSupply: "Maharashtra",
    stateCode: "27",
    discount: 2118,
    items: [{ desc: "Advisory Fees", sac: "997156", amount: 2118 }]
  });

  const handleTemplateUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) setBgTemplate(URL.createObjectURL(file));
  }, []);

  const handleLogoUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) setLogoUrl(URL.createObjectURL(file));
  }, []);

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateItem = useCallback((index, field, value) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
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
      items: prev.items.filter((_, i) => i !== index)
    }));
  }, []);

  const totals = useMemo(() => {
    const subtotal = formData.items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    const discount = parseFloat(formData.discount) || 0;
    const net = Math.max(0, subtotal - discount);
    const tax = net * 0.09;
    return { subtotal, discount, net, sgst: tax, cgst: tax, grand: net + tax * 2 };
  }, [formData.items, formData.discount]);

  const fmt = useCallback((n) => {
    return "₹ " + (n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, []);

  const numberToWords = useCallback((num) => {
    if (num === 0) return "Rupees Zero";
    const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
    const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
    const convert = (n) => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? " "+ones[n%10] : "");
      if (n < 1000) return ones[Math.floor(n/100)] + " Hundred" + (n%100 ? " "+convert(n%100) : "");
      if (n < 100000) return convert(Math.floor(n/1000)) + " Thousand" + (n%1000 ? " "+convert(n%1000) : "");
      if (n < 10000000) return convert(Math.floor(n/100000)) + " Lakh" + (n%100000 ? " "+convert(n%100000) : "");
      return convert(Math.floor(n/10000000)) + " Crore" + (n%10000000 ? " "+convert(n%10000000) : "");
    };
    const r = Math.floor(num), p = Math.round((num - r) * 100);
    return "Rupees " + convert(r) + (p > 0 ? " and "+convert(p)+" Paise" : "");
  }, []);

  const downloadPDF = useCallback(() => {
    if (!invoiceRef.current) return;
    const opt = {
      margin: 0,
      filename: `${docType.replace(/\s+/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };
    html2pdf().set(opt).from(invoiceRef.current).save();
  }, [docType]);

  const isTaxable = docType === "Tax Invoice";

  return (
    <div className="app-container">
      {/* LEFT: EDITOR PANEL */}
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
          <label className="upload-btn">📥 Upload Template<input type="file" accept=".pdf,image/*" onChange={handleTemplateUpload} /></label>
        </header>
        <div className="editor-body">
          <div className="form-group"><label>Company Logo</label><input type="file" accept="image/*" onChange={handleLogoUpload} /></div>
          <div className="form-group"><label>{docType === "Credit Note" ? "Credit Note No" : "Invoice Number"}</label><input value={formData.invoiceNumber} onChange={(e) => updateField("invoiceNumber", e.target.value)} /></div>
          <div className="form-group"><label>Date</label><input value={formData.date} onChange={(e) => updateField("date", e.target.value)} /></div>
          <hr className="divider" />
          <div className="form-group"><label>Client Name</label><input value={formData.clientName} onChange={(e) => updateField("clientName", e.target.value)} /></div>
          <div className="form-group"><label>Address</label><textarea rows="4" value={formData.address} onChange={(e) => updateField("address", e.target.value)} /></div>
          <div className="form-group"><label>Phone</label><input value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} /></div>
          <div className="form-group"><label>PAN</label><input value={formData.pan} onChange={(e) => updateField("pan", e.target.value)} /></div>
          <div className="form-group"><label>Place of Supply</label><input value={formData.placeOfSupply} onChange={(e) => updateField("placeOfSupply", e.target.value)} /></div>
          <div className="form-group"><label>State Code</label><input value={formData.stateCode} onChange={(e) => updateField("stateCode", e.target.value)} /></div>
          <div className="items-section">
            <label className="section-label">LINE ITEMS</label>
            {formData.items.map((item, i) => (
              <div className="item-row" key={i}>
                <input className="desc" placeholder="Description" value={item.desc} onChange={(e) => updateItem(i, "desc", e.target.value)} />
                <input className="sac" placeholder="SAC" value={item.sac} onChange={(e) => updateItem(i, "sac", e.target.value)} />
                <input className="amount" type="number" step="0.01" value={item.amount} onChange={(e) => updateItem(i, "amount", parseFloat(e.target.value) || 0)} />
                <button className="btn-remove" onClick={() => removeItem(i)}>×</button>
              </div>
            ))}
            <button className="btn-add" onClick={addItem}>+ Add Item</button>
          </div>
          <div className="form-group" style={{marginTop:16}}><label>Discount (₹)</label><input type="number" step="0.01" value={formData.discount} onChange={(e) => updateField("discount", parseFloat(e.target.value) || 0)} /></div>
        </div>
        <footer className="editor-footer">
          <button className="btn btn-primary" onClick={downloadPDF}>⬇️ Download PDF</button>
        </footer>
      </aside>

      {/* RIGHT: LIVE PREVIEW (A4) */}
      <main className="preview-panel">
        <div ref={invoiceRef} className="invoice-page">
          {bgTemplate && <div className="template-bg" style={{backgroundImage:`url(${bgTemplate})`}} />}
          <div className="invoice-content">
            {logoUrl && <img src={logoUrl} alt="Logo" className="company-logo" />}
            <h1 className="inv-title">{docType}</h1>
            <div className="inv-header">
              <div className="inv-left">
                <span className="inv-label">Billed to</span>
                <span className="inv-value client-name">{formData.clientName}</span>
                <span className="inv-label">Party address</span>
                <span className="inv-value address">{formData.address}</span>
                <div className="inv-row"><span className="inv-label">Phone:</span> <span>{formData.phone}</span></div>
                <div className="inv-row"><span className="inv-label">PAN:</span> <span>{formData.pan}</span></div>
              </div>
              <div className="inv-right">
                <div className="inv-row"><span className="inv-label">Date</span><span>{formData.date}</span></div>
                <div className="inv-row"><span className="inv-label">{docType === "Credit Note" ? "Credit Note Number" : "Invoice Number"}</span><span>{formData.invoiceNumber}</span></div>
                <div className="inv-row"><span className="inv-label">Place of supply</span><span>{formData.placeOfSupply}</span></div>
                <div className="inv-row"><span className="inv-label">State Code</span><span>{formData.stateCode}</span></div>
              </div>
            </div>
            <table className="inv-table">
              <thead><tr><th>Description</th><th className="col-sac">SAC Code</th><th className="col-amount">Amount</th></tr></thead>
              <tbody>
                {formData.items.map((item, i) => (
                  <tr key={i}><td>{item.desc}</td><td className="col-sac">{item.sac}</td><td className="col-amount">{fmt(item.amount)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="inv-totals">
              <div className="tot-row"><span>Total</span><span>{fmt(totals.subtotal)}</span></div>
              <div className="tot-row"><span>Discount</span><span>- {fmt(totals.discount)}</span></div>
              <div className="tot-row"><span>Net Total</span><span>{totals.net.toFixed(2)}</span></div>
              {isTaxable && (
                <>
                  <div className="tot-row"><span>Add: SGST@ 9%</span><span>{fmt(totals.sgst)}</span></div>
                  <div className="tot-row"><span>Add: CGST@ 9%</span><span>{fmt(totals.cgst)}</span></div>
                </>
              )}
              <div className="tot-row grand"><span>Grand Total</span><span>{fmt(totals.grand)}</span></div>
            </div>
            <div className="amount-words">Total Amount: {numberToWords(totals.grand)} only.</div>
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
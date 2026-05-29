export default function LockerInvoice() {
  return (
    <section className="invoice-panel">
      <article className="invoice-card">
        <div className="invoice-card-inner">
          <header className="invoice-header">
            <div className="invoice-company">
              <div className="invoice-title">1 FINANCE PVT LTD</div>
              <div>GSTIN: 36AABCZ8402H1Z9</div>
              <div>PAN: AABCZ8402H</div>
              <div>CIN: U66190GJ2021PTC126723</div>
            </div>
            <div className="invoice-recipient">
              <div>Ground Floor, Unit No</div>
              <div>GB (Northern Side Of North Side)</div>
              <div>Avk Sri Harsh - Icon, Serilingampally, Nanakramguda</div>
              <div>Hyderabad, Telangana - 500032</div>
            </div>
          </header>

          <div className="invoice-title">Tax Invoice</div>

          <div className="invoice-meta">
            <div className="invoice-meta-item">
              <div className="invoice-meta-label">Billed To</div>
              <div className="invoice-meta-value">ALUGANI HARISH</div>
            </div>
            <div className="invoice-meta-item">
              <div className="invoice-meta-label">Date</div>
              <div className="invoice-meta-value">11/03/2026</div>
            </div>
            <div className="invoice-meta-item">
              <div className="invoice-meta-label">Invoice Number</div>
              <div className="invoice-meta-value">1F/25-26/LCHY/16</div>
            </div>
            <div className="invoice-meta-item">
              <div className="invoice-meta-label">PAN</div>
              <div className="invoice-meta-value">AZCPA2666D</div>
            </div>
            <div className="invoice-meta-item">
              <div className="invoice-meta-label">Place of Supply</div>
              <div className="invoice-meta-value">TELANGANA</div>
            </div>
            <div className="invoice-meta-item">
              <div className="invoice-meta-label">State Code</div>
              <div className="invoice-meta-value">36</div>
            </div>
          </div>

          <table className="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>SAC Code</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Locker Charges (Locker No: M027)</strong>
                  <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '6px' }}>
                    From 11/03/2026 to 10/03/2027
                  </div>
                </td>
                <td>997329</td>
                <td>₹2,500</td>
              </tr>
            </tbody>
          </table>

          <div className="invoice-summary">
            <div className="summary-row">
              <span>Total</span>
              <span>₹2,500</span>
            </div>
            <div className="summary-row">
              <span>Discount</span>
              <span>-₹2,500.00</span>
            </div>
            <div className="summary-row total">
              <span>Grand Total</span>
              <span>₹0.00</span>
            </div>
          </div>

          <footer className="invoice-note">
            Interest @2% per month will apply on delayed payment.
          </footer>
        </div>
      </article>
    </section>
  )
}

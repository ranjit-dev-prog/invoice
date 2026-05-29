export default function CreditNote() {
  return (
    <section className="invoice-panel">
      <article className="invoice-card">
        <div className="invoice-card-inner">
          <div className="invoice-header">
            <div className="invoice-company">
              <h1 className="invoice-title">Credit Note</h1>
              <div>Credit Note No: CN-2026-01</div>
              <div>Date: 11/03/2026</div>
            </div>
            <div className="invoice-recipient">
              <div>Customer</div>
              <strong>ALUGANI HARISH</strong>
            </div>
          </div>

          <table className="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Locker rental refund</td>
                <td>₹2,500.00</td>
              </tr>
            </tbody>
          </table>

          <div className="invoice-summary">
            <div className="summary-row total">
              <span>Total Refund</span>
              <span>₹2,500.00</span>
            </div>
          </div>
        </div>
      </article>
    </section>
  )
}

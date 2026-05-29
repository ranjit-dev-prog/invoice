export default function TaxInvoice() {
  return (
    <section className="invoice-panel">
      <article className="invoice-card">
        <div className="invoice-card-inner">
          <div className="invoice-header">
            <div className="invoice-company">
              <h1 className="invoice-title">Tax Invoice</h1>
              <div>Invoice Number: TI-2026-01</div>
              <div>Date: 11/03/2026</div>
            </div>
            <div className="invoice-recipient">
              <div>Billed to</div>
              <strong>CLIENT NAME</strong>
            </div>
          </div>

          <table className="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Tax</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Advisory Services</td>
                <td>18%</td>
                <td>₹21,118.00</td>
              </tr>
            </tbody>
          </table>

          <div className="invoice-summary">
            <div className="summary-row total">
              <span>Grand Total</span>
              <span>₹21,118.00</span>
            </div>
          </div>
        </div>
      </article>
    </section>
  )
}

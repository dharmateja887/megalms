import { useState } from 'react'
import { sales } from './data.js'

const filters = ['All', 'Paid', 'Pending', 'Refunded']

function Sales() {
  const [filter, setFilter] = useState('All')

  const filtered = sales.filter(
    (s) => filter === 'All' || s.status === filter,
  )

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Sales</h1>
          <p>All orders across your products.</p>
        </div>
        <button type="button" className="btn btn-primary">
          Export CSV
        </button>
      </div>

      <div className="dash-toolbar">
        <div className="segmented">
          {filters.map((f) => (
            <button
              type="button"
              key={f}
              className={`seg ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Product</th>
                <th>Student</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sale) => (
                <tr key={sale.id}>
                  <td className="mono">{sale.id}</td>
                  <td className="truncate strong">{sale.product}</td>
                  <td>{sale.student}</td>
                  <td className="strong">{sale.amount}</td>
                  <td>{sale.method}</td>
                  <td>{sale.date}</td>
                  <td>
                    <span className={`badge badge-${sale.status.toLowerCase()}`}>
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default Sales

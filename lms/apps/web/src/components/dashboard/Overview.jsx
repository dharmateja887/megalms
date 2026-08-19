import { products, students, sales } from './data.js'

const stats = [
  { emoji: '📚', value: '27', label: 'Total Products', delta: '+3 this month' },
  { emoji: '🎓', value: '12.4k', label: 'Active Students', delta: '+8.2%' },
  { emoji: '💰', value: '₹18.3L', label: 'Revenue', delta: '+12.4%' },
  { emoji: '📈', value: '4.8', label: 'Avg. Rating', delta: '+0.2' },
]

const insights = [
  { icon: '💰', tone: 'green', title: 'Revenue is up 12.4%', sub: 'vs. last month' },
  { icon: '🎓', tone: 'brand', title: '128 new students enrolled', sub: 'in the last 7 days' },
  { icon: '💡', tone: 'blue', title: '3 courses hit Draft → Published', sub: 'get them promoted' },
]

function Overview({ userName }) {
  const topProducts = [...products]
    .sort((a, b) => b.students - a.students)
    .slice(0, 4)

  const recentSales = sales.slice(0, 5)

  return (
    <>
      <div className="dash-welcome">
        <div>
          <h1>Welcome back, {userName}</h1>
          <p>Here's what's happening with your learning business today.</p>
        </div>
        <button type="button" className="btn btn-primary">
          + New Product
        </button>
      </div>

      <div className="dash-stats">
        {stats.map((s) => (
          <div className="dash-stat-card" key={s.label}>
            <div className="dash-stat-top">
              <span className="stat-emoji">{s.emoji}</span>
              <span className="dash-delta up">{s.delta}</span>
            </div>
            <span className="dash-stat-value">{s.value}</span>
            <span className="dash-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="dash-grid-2">
        <div className="dash-col">
          <div className="dash-card">
            <div className="dash-card-head">
              <h3>Recent Sales</h3>
              <button type="button" className="dash-link-btn">
                View all
              </button>
            </div>
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="mono">{sale.id}</td>
                      <td className="truncate strong">{sale.product}</td>
                      <td className="strong">{sale.amount}</td>
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
        </div>

        <div className="dash-col">
          <div className="dash-card">
            <div className="dash-card-head">
              <h3>Top Products</h3>
              <button type="button" className="dash-link-btn">
                View all
              </button>
            </div>
            <ul className="rank-list">
              {topProducts.map((product, i) => (
                <li key={product.id}>
                  <span className="rank-num">{i + 1}</span>
                  <div>
                    <strong>{product.title}</strong>
                    <span>{product.students.toLocaleString('en-IN')} students</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="dash-card">
            <div className="dash-card-head">
              <h3>Quick Insights</h3>
            </div>
            <ul className="insight-list">
              {insights.map((item) => (
                <li key={item.title}>
                  <span className={`insight-icon ${item.tone}`}>{item.icon}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.sub}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default Overview

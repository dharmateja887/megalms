import { products, revenueSeries, productShare } from './data.js'

const stats = [
  { value: '₹18.3L', label: 'Revenue (Aug)', delta: '+12.4%' },
  { value: '12.4k', label: 'Enrolments', delta: '+8.2%' },
  { value: '4.8/5', label: 'Avg. Rating', delta: '+0.2' },
]

const maxValue = Math.max(...revenueSeries.map((d) => d.value))

function Donut() {
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const colors = ['#5e3bee', '#8ecbff', '#22c55e', '#f59e0b']
  let offset = 0

  return (
    <div className="donut-wrap">
      <div className="donut-box">
        <svg className="donut" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#f0edfa"
            strokeWidth="16"
          />
          {productShare.map((slice, i) => {
            const dash = (slice.value / 100) * circumference
            const seg = (
              <circle
                key={slice.label}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={colors[i % colors.length]}
                strokeWidth="16"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 70 70)"
              />
            )
            offset += dash
            return seg
          })}
        </svg>
        <div className="donut-center">
          <strong>₹18.3L</strong>
          <span>Revenue</span>
        </div>
      </div>
      <ul className="legend">
        {productShare.map((slice, i) => (
          <li key={slice.label}>
            <span
              className="legend-dot"
              style={{ background: colors[i % colors.length] }}
            />
            <span className="legend-label">{slice.label}</span>
            <strong>{slice.value}%</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Analytics() {
  const topProducts = [...products]
    .sort((a, b) => b.students - a.students)
    .slice(0, 5)

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Analytics</h1>
          <p>Performance overview of your products and revenue.</p>
        </div>
      </div>

      <div className="dash-stats dash-stats-3">
        {stats.map((s) => (
          <div className="dash-stat-card" key={s.label}>
            <div className="dash-stat-top">
              <span className="dash-stat-value" style={{ fontSize: '22px' }}>
                {s.value}
              </span>
              <span className="dash-delta up">{s.delta}</span>
            </div>
            <span className="dash-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="dash-grid-2">
        <div className="dash-card">
          <div className="dash-card-head">
            <h3>Revenue Trend</h3>
            <span className="type-chip">2026</span>
          </div>
          <div className="bar-chart">
            {revenueSeries.map((d) => (
              <div className="bar-col" key={d.month}>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ height: `${(d.value / maxValue) * 100}%` }}
                  >
                    <span className="bar-tooltip">₹{d.value}L</span>
                  </div>
                </div>
                <span className="bar-label">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-col">
          <div className="dash-card">
            <div className="dash-card-head">
              <h3>Revenue by Product</h3>
            </div>
            <Donut />
          </div>

          <div className="dash-card">
            <div className="dash-card-head">
              <h3>Top Products</h3>
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
        </div>
      </div>
    </>
  )
}

export default Analytics

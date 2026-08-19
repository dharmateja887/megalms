import { useState } from 'react'
import { products } from './data.js'

const filters = ['All', 'Course', 'Membership', 'Coaching', 'Digital Product']

function Products() {
  const [filter, setFilter] = useState('All')

  const filtered = products.filter(
    (p) => filter === 'All' || p.type === filter,
  )

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Products</h1>
          <p>Manage your courses, memberships and digital products.</p>
        </div>
        <button type="button" className="btn btn-primary">
          + New Product
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
                <th>Product</th>
                <th>Type</th>
                <th>Students</th>
                <th>Price</th>
                <th>Revenue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-cell">
                      <span className="product-thumb">
                        {product.title.slice(0, 1)}
                      </span>
                      <div>
                        <strong>{product.title}</strong>
                        <span className="sub">
                          {product.lessons > 0
                            ? `${product.lessons} lessons`
                            : 'No lessons'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="type-chip">{product.type}</span>
                  </td>
                  <td>{product.students.toLocaleString('en-IN')}</td>
                  <td className="strong">{product.price}</td>
                  <td className="product-revenue">{product.revenue}</td>
                  <td>
                    <span className={`badge badge-${product.status.toLowerCase()}`}>
                      {product.status}
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

export default Products

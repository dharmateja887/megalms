import { useState } from 'react'
import { FaChevronRight } from 'react-icons/fa'
import './ExamPortal.css'

function Portal({ categories, items, meta }) {
  const [active, setActive] = useState(categories[0]?.id)
  const activeCat = categories.find((c) => c.id === active) || categories[0]
  const list = items.filter((i) => i.category === active)

  return (
    <div className="portal">
      <div className="sidebar">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.id}
            className={`menu-item ${active === cat.id ? 'active' : ''}`}
            onClick={() => setActive(cat.id)}
          >
            <span className="left">
              <span className="icon">
                <cat.icon />
              </span>
              <span>{cat.name}</span>
            </span>
            <FaChevronRight className="arrow" />
          </button>
        ))}
      </div>

      <div className="content">
        {list.map((item) => (
          <div className="exam-card" key={item.id}>
            <div className="card-left">
              <span
                className="exam-thumb"
                style={{
                  background: `linear-gradient(135deg, ${activeCat.color}, ${activeCat.color}cc)`,
                }}
              >
                {item.name
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')}
              </span>
              <span className="card-text">
                <strong>{item.name}</strong>
                {meta && <small>{meta(item)}</small>}
              </span>
            </div>
            <FaChevronRight className="arrow" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Portal

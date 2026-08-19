import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Overview from '../components/dashboard/Overview.jsx'
import Products from '../components/dashboard/Products.jsx'
import Students from '../components/dashboard/Students.jsx'
import Sales from '../components/dashboard/Sales.jsx'
import Analytics from '../components/dashboard/Analytics.jsx'
import Settings from '../components/dashboard/Settings.jsx'
import Profile from '../components/dashboard/Profile.jsx'
import { getDisplayName, getUserInitials, readStoredUser } from '../utils/user.js'

const navItems = [
  { key: 'overview', label: 'Dashboard', icon: 'grid' },
  { key: 'profile', label: 'Profile', icon: 'user' },
  { key: 'products', label: 'Products', icon: 'book' },
  { key: 'students', label: 'Students', icon: 'users' },
  { key: 'sales', label: 'Sales', icon: 'card' },
  { key: 'analytics', label: 'Analytics', icon: 'chart' },
  { key: 'settings', label: 'Settings', icon: 'gear' },
]

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
  switch (name) {
    case 'grid':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
          <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
          <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
          <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
        </svg>
      )
    case 'book':
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
          <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
        </svg>
      )
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2.5 20c1-3.2 3.5-4.8 6.5-4.8s5.5 1.6 6.5 4.8" />
          <circle cx="17" cy="9" r="2.8" />
          <path d="M16.5 14.9c2.6.3 4.5 1.8 5 4.1" />
        </svg>
      )
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 20.5c1.1-3.2 4-4.8 7.5-4.8s6.4 1.6 7.5 4.8" />
        </svg>
      )
    case 'card':
      return (
        <svg {...common}>
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M2.5 10h19" />
          <path d="M6 15h4" />
        </svg>
      )
    case 'chart':
      return (
        <svg {...common}>
          <path d="M4 20V4M4 20h16" />
          <rect x="7" y="12" width="3" height="6" rx="1" />
          <rect x="12" y="8" width="3" height="10" rx="1" />
          <rect x="17" y="5" width="3" height="13" rx="1" />
        </svg>
      )
    case 'gear':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.05A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.05A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.05a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.3.6.9 1 1.55 1H21a2 2 0 1 1 0 4h-.05a1.7 1.7 0 0 0-1.55 1z" />
        </svg>
      )
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4-4" />
        </svg>
      )
    case 'bell':
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      )
    case 'logout':
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5M21 12H9" />
        </svg>
      )
    case 'chevron':
      return (
        <svg {...common} width={16} height={16}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      )
    default:
      return null
  }
}

function Dashboard() {
  const [page, setPage] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const user = readStoredUser()
  const displayName = getDisplayName(user)
  const initials = getUserInitials(user)

  function logout() {
    localStorage.removeItem('qt_nxt_user')
    navigate('/')
  }

  return (
    <div className="dash">
      <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <a className="logo" href="/">
          <span className="logo-text">QT NXT</span>
        </a>

        <nav className="dash-nav">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.key}
              className={`dash-nav-item ${page === item.key ? 'active' : ''}`}
              onClick={() => {
                setPage(item.key)
                setSidebarOpen(false)
              }}
            >
              <span className="dash-nav-icon">
                <Icon name={item.icon} />
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="dash-sidebar-foot">
          <a href="/" className="dash-nav-item">
            <span className="dash-nav-icon">
              <Icon name="grid" />
            </span>
            View my website
          </a>
          <button type="button" className="dash-nav-item" onClick={logout}>
            <span className="dash-nav-icon">
              <Icon name="logout" />
            </span>
            Log out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="dash-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="dash-main">
        <header className="dash-topbar">
          <button
            type="button"
            className="dash-burger"
            aria-label="Toggle sidebar"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="dash-search">
            <Icon name="search" size={18} />
            <input type="text" placeholder="Search products, students, sales..." />
          </div>
          <div className="dash-top-actions">
            <button type="button" className="dash-icon-btn" aria-label="Notifications">
              <Icon name="bell" />
              <span className="dash-dot" />
            </button>
            <div className="dash-user">
              <span className="avatar">{initials}</span>
              <span className="dash-user-name">{displayName}</span>
              <Icon name="chevron" />
            </div>
          </div>
        </header>

        <main className="dash-content">
          <div key={page} className="dash-page">
            {page === 'overview' && <Overview userName={displayName} />}
            {page === 'profile' && <Profile user={user} />}
            {page === 'products' && <Products />}
            {page === 'students' && <Students />}
            {page === 'sales' && <Sales />}
            {page === 'analytics' && <Analytics />}
            {page === 'settings' && <Settings user={user} />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard

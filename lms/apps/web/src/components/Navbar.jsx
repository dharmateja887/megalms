import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AssessmentDropdown from './AssessmentDropdown.jsx'
import CoursesDropdown from './CoursesDropdown.jsx'
import { getDisplayName, getUserInitials, readStoredUser } from '../utils/user.js'

function Logo() {
  return (
    <Link className="logo" to="/">
      <span className="logo-text">QT NXT</span>
    </Link>
  )
}

const navLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Success Stories', to: '/stories' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const [assessOpen, setAssessOpen] = useState(false)
  const [courseOpen, setCourseOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = readStoredUser()
  const displayName = getDisplayName(user)
  const initials = getUserInitials(user)
  const isAuthed = Boolean(user.phone || user.firstName || user.lastName || user.name || user.email)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setAssessOpen(false)
    setCourseOpen(false)
    setOpen(false)
  }, [location.pathname])

  const dropdownOpen = assessOpen || courseOpen

  const goToLogin = (targetPath) => {
    navigate('/login', { state: { from: targetPath } })
  }

  const logout = () => {
    localStorage.removeItem('qt_nxt_user')
    navigate('/')
  }

  useEffect(() => {
    document.body.style.overflow = dropdownOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [dropdownOpen])

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <Logo />
          <nav className={`nav-links ${open ? 'open' : ''}`}>
            <Link to="/" className="home-link">
              Home
            </Link>
            <button
              type="button"
              className={`nav-link-btn ${assessOpen ? 'active' : ''}`}
              aria-expanded={assessOpen}
              onClick={() => {
                if (!isAuthed) {
                  goToLogin('/assessment')
                  return
                }
                setOpen(false)
                setCourseOpen(false)
                setAssessOpen((v) => !v)
              }}
            >
              Assessment
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              className={`nav-link-btn ${courseOpen ? 'active' : ''}`}
              aria-expanded={courseOpen}
              onClick={() => {
                if (!isAuthed) {
                  goToLogin('/course')
                  return
                }
                setOpen(false)
                setAssessOpen(false)
                setCourseOpen((v) => !v)
              }}
            >
              Courses
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <Link to="/leaderboard">
              Leaderboard
            </Link>
            {navLinks.map((link) => (
              <Link key={link.label} to={link.to}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            {isAuthed ? (
              <>
                <div className="nav-user-chip" title={displayName}>
                  <span className="nav-user-avatar" aria-hidden="true">
                    {user.avatar ? <img src={user.avatar} alt="" /> : initials}
                  </span>
                  <span className="nav-user-name">{displayName}</span>
                </div>
                <button type="button" className="nav-logout-btn" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm nav-login-btn">
                Login
              </Link>
            )}
            <button
              type="button"
              className={`hamburger ${open ? 'active' : ''}`}
              aria-label="Toggle menu"
              onClick={() => {
                setAssessOpen(false)
                setCourseOpen(false)
                setOpen((v) => !v)
              }}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      {assessOpen && <AssessmentDropdown onClose={() => setAssessOpen(false)} />}
      {courseOpen && <CoursesDropdown onClose={() => setCourseOpen(false)} />}
    </>
  )
}

export default Navbar

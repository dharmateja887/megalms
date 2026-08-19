import { useEffect } from 'react'
import CoursesPortal from './CoursesPortal.jsx'

function CoursesDropdown({ onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="assess-dropdown" onClick={onClose}>
      <div className="assess-dropdown-inner" onClick={(e) => e.stopPropagation()}>
        <div className="container">
          <div className="assess-dropdown-head" style={{ marginBottom: 32 }}>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>All Courses</h2>
            <button
              type="button"
              className="assess-close"
              onClick={onClose}
              aria-label="Close courses"
            >
              ×
            </button>
          </div>
          <CoursesPortal />
        </div>
      </div>
    </div>
  )
}

export default CoursesDropdown

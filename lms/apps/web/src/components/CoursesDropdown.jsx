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
          <div className="assess-dropdown-head">
            <div className="section-head center">
              <span className="eyebrow">Courses</span>
              <h2>All Courses</h2>
              <p>Explore our full range of courses designed to help you grow.</p>
            </div>
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

import { useEffect } from 'react'
import ExamPortal from './ExamPortal.jsx'

function AssessmentDropdown({ onClose }) {
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
              <span className="eyebrow">Assessments</span>
              <h2>All Assessments</h2>
              <p>Explore every assessment and find the right course for your goals.</p>
            </div>
            <button
              type="button"
              className="assess-close"
              onClick={onClose}
              aria-label="Close assessments"
            >
              ×
            </button>
          </div>
          <ExamPortal />
        </div>
      </div>
    </div>
  )
}

export default AssessmentDropdown

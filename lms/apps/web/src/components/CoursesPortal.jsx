import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaChevronRight } from 'react-icons/fa'
import './ExamPortal.css'

function CoursesPortal() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    fetch('/api/courses/')
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setCourses(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <div className="portal-empty">Loading courses...</div>
  }

  if (error) {
    return (
      <div className="portal-empty">
        <strong>Could not load courses</strong>
        <p>{error}</p>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="portal-empty">
        <strong>No courses yet</strong>
        <p>Courses created in the admin panel will appear here.</p>
      </div>
    )
  }

  return (
    <div className="course-catalog">
      {courses.map((course) => {
        const chapters = course.chapters || []
        const itemCount = chapters.reduce((n, ch) => n + (ch.items ? ch.items.length : 0), 0)
        const initials = course.title
          .split(' ')
          .map((w) => w[0])
          .filter(Boolean)
          .slice(0, 2)
          .join('')
          .toUpperCase()
        const isFree = course.pricing && course.pricing.planType === 'FREE'
        const mrp = Number(course.pricing?.mrp || 0)
        const discount = Number(course.pricing?.price || 0)
        const finalPrice = mrp > 0 ? Math.max(0, Math.round(mrp * (1 - discount / 100))) : 0
        const price = isFree ? 'Free' : `₹${finalPrice.toLocaleString()}`
        return (
          <div
            className="course-card"
            key={course.id}
            role="link"
            tabIndex={0}
            onClick={() => navigate(`/course/${course.id}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                navigate(`/course/${course.id}`)
              }
            }}
          >
            <div className="course-card-cover">
              {course.cover ? (
                <img src={course.cover} alt={course.title} />
              ) : (
                <div className="course-card-cover-fallback">{initials}</div>
              )}
            </div>
            <div className="course-card-body">
              <h4>{course.title}</h4>
              {course.tagline && <p className="course-tagline">{course.tagline}</p>}
              {course.description && !course.tagline && (
                <p className="course-tagline">{course.description}</p>
              )}
              <div className="course-meta">
                <span>{course.instructor || 'Instructor'}</span>
                <span>
                  {chapters.length} chapter{chapters.length === 1 ? '' : 's'} · {itemCount} item
                  {itemCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <div className="course-card-foot">
              <span className={`course-price ${isFree ? 'free' : ''}`}>{price}</span>
              <span className="course-view">
                <FaChevronRight />
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CoursesPortal

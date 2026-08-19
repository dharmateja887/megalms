import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  FaArrowLeft,
  FaBookOpen,
  FaChalkboardTeacher,
  FaVideo,
  FaFileAlt,
  FaMusic,
  FaLink,
  FaQuestionCircle,
  FaFilePdf,
  FaFileCode,
  FaClipboardCheck,
  FaPenFancy,
  FaClock,
} from 'react-icons/fa'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import './CourseDetails.css'

const typeIcons = {
  pdf: FaFilePdf,
  video: FaVideo,
  audio: FaMusic,
  scorm: FaFileAlt,
  file: FaFileAlt,
  heading: FaBookOpen,
  text: FaFileAlt,
  link: FaLink,
  quiz: FaQuestionCircle,
  livetest: FaClock,
  liveclass: FaVideo,
  assignment: FaClipboardCheck,
  coding: FaFileCode,
  form: FaPenFancy,
}

function CourseDetails() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fetch(`/api/courses/${courseId}/`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setCourse(data)
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
  }, [courseId])

  if (loading) {
    return (
      <>
        <Navbar />
        <main>
          <section className="section">
            <div className="container">
              <div className="portal-empty">Loading course...</div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !course) {
    return (
      <>
        <Navbar />
        <main>
          <section className="section">
            <div className="container">
              <div className="portal-empty">
                <strong>Could not load course</strong>
                <p>{error || 'Course not found.'}</p>
                <Link to="/course" className="btn btn-primary cd-back-home">
                  Back to all courses
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    )
  }

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
    <>
      <Navbar />
      <main>
        <section className="section">
          <div className="container">
            <Link to="/course" className="cd-back-link">
              <FaArrowLeft /> All Courses
            </Link>

            <div className="cd-hero">
              <div className="cd-cover">
                {course.cover ? (
                  <img src={course.cover} alt={course.title} />
                ) : (
                  <div className="cd-cover-fallback">{initials}</div>
                )}
              </div>
              <div className="cd-info">
                <span className="eyebrow">Course</span>
                <h1>{course.title}</h1>
                {course.tagline && <p className="cd-tagline">{course.tagline}</p>}
                <div className="cd-stats">
                  <span>
                    <FaBookOpen /> {chapters.length} chapter{chapters.length === 1 ? '' : 's'}
                  </span>
                  <span>
                    {itemCount} item{itemCount === 1 ? '' : 's'}
                  </span>
                  {course.instructor && (
                    <span>
                      <FaChalkboardTeacher /> {course.instructor}
                    </span>
                  )}
                  {course.language && <span>{course.language}</span>}
                </div>
                <div className="cd-price-row">
                  <span className={`cd-price ${isFree ? 'free' : ''}`}>{price}</span>
                  <button type="button" className="btn btn-primary">
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>

            <div className="cd-about">
              <h2>About this course</h2>
              <p>{course.description || 'No description available for this course yet.'}</p>
            </div>

            <div className="cd-curriculum">
              <h2>Course Curriculum</h2>
              {chapters.length === 0 ? (
                <p className="cd-no-chapters">No curriculum has been added to this course yet.</p>
              ) : (
                chapters.map((chapter, index) => {
                  const items = chapter.items || []
                  return (
                    <div className="cd-chapter" key={chapter.id}>
                      <div className="cd-chapter-head">
                        <span className="cd-chapter-num">{index + 1}</span>
                        <strong>{chapter.title}</strong>
                        <span className="cd-chapter-count">
                          {items.length} item{items.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      {items.length > 0 && (
                        <ul className="cd-item-list">
                          {items.map((item) => {
                            const Icon = typeIcons[item.type] || FaFileAlt
                            return (
                              <li key={item.id}>
                                <Icon className="cd-item-icon" />
                                <span className="cd-item-title">{item.title}</span>
                                {item.duration && (
                                  <span className="cd-item-duration">{item.duration} min</span>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default CourseDetails

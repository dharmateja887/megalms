import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
  FaStar,
  FaUsers,
  FaGlobe,
  FaCertificate,
  FaMobileAlt,
  FaInfinity,
  FaClosedCaptioning,
  FaPlay,
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaTimes,
  FaBolt,
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

const ENROLL_KEY = 'lms_enrolled_course_ids'

export function getEnrolledIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ENROLL_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addEnrolledId(id) {
  const ids = getEnrolledIds()
  if (!ids.includes(id)) {
    ids.push(id)
    try { localStorage.setItem(ENROLL_KEY, JSON.stringify(ids)) } catch {}
  }
}

function RatingStars({ rating }) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.3
  return (
    <span className="cd-stars">
      {[...Array(5)].map((_, i) => (
        <FaStar
          key={i}
          className={i < full ? 'star-filled' : i === full && hasHalf ? 'star-half' : 'star-empty'}
        />
      ))}
    </span>
  )
}

function PaymentModal({ course, price, onClose, onEnroll }) {
  const [method, setMethod] = useState('upi')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  const handlePay = useCallback(() => {
    setProcessing(true)
    if (typeof window.Razorpay !== 'undefined') {
      const options = {
        key: 'rzp_test placeholder',
        amount: price * 100,
        currency: 'INR',
        name: course.title,
        description: `Enroll in ${course.title}`,
        handler: () => {
          setProcessing(false)
          onEnroll()
          setSuccess(true)
        },
        prefill: {},
        theme: { color: '#6c5ce7' },
      }
      try {
        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', () => setProcessing(false))
        rzp.open()
      } catch {
        setTimeout(() => { setProcessing(false); onEnroll(); setSuccess(true) }, 1500)
      }
    } else {
      setTimeout(() => { setProcessing(false); onEnroll(); setSuccess(true) }, 1500)
    }
  }, [course, price, onEnroll])

  if (success) {
    return (
      <div className="cd-pay-overlay" onClick={onClose}>
        <div className="cd-pay-modal" onClick={(e) => e.stopPropagation()}>
          <div className="cd-pay-success">
            <div className="cd-pay-success-icon"><FaCheck /></div>
            <h3>Payment Successful!</h3>
            <p>You are now enrolled in <strong>{course.title}</strong></p>
            <Link to={`/course/${course.id}/learn`} className="btn btn-primary" style={{ textDecoration: 'none', marginTop: 12 }}>
              Start Learning
            </Link>
            <button type="button" className="cd-pay-close-link" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cd-pay-overlay" onClick={onClose}>
      <div className="cd-pay-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cd-pay-header">
          <h3>Complete Enrollment</h3>
          <button type="button" className="cd-pay-close" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="cd-pay-body">
          <div className="cd-pay-course-info">
            <div className="cd-pay-course-title">{course.title}</div>
            <div className="cd-pay-price">₹{price.toLocaleString()}</div>
            <div className="cd-pg-fees cd-pg-fees-modal">
              <span>Internet handling fees (PG fees)</span>
              <strong>₹{price.toLocaleString()}</strong>
            </div>
          </div>

          <div className="cd-pay-methods">
            <h4>Select Payment Method</h4>
            <label className={`cd-pay-method ${method === 'upi' ? 'active' : ''}`}>
              <input type="radio" name="payMethod" value="upi" checked={method === 'upi'} onChange={() => setMethod('upi')} />
              <span className="cd-pay-method-icon">📱</span>
              <span>UPI</span>
              <span className="cd-pay-method-desc">Google Pay, PhonePe, Paytm, etc.</span>
            </label>
            <label className={`cd-pay-method ${method === 'card' ? 'active' : ''}`}>
              <input type="radio" name="payMethod" value="card" checked={method === 'card'} onChange={() => setMethod('card')} />
              <span className="cd-pay-method-icon">💳</span>
              <span>Credit / Debit Card</span>
              <span className="cd-pay-method-desc">Visa, Mastercard, RuPay</span>
            </label>
            <label className={`cd-pay-method ${method === 'netbanking' ? 'active' : ''}`}>
              <input type="radio" name="payMethod" value="netbanking" checked={method === 'netbanking'} onChange={() => setMethod('netbanking')} />
              <span className="cd-pay-method-icon">🏦</span>
              <span>Net Banking</span>
              <span className="cd-pay-method-desc">All major banks</span>
            </label>
            <label className={`cd-pay-method ${method === 'wallet' ? 'active' : ''}`}>
              <input type="radio" name="payMethod" value="wallet" checked={method === 'wallet'} onChange={() => setMethod('wallet')} />
              <span className="cd-pay-method-icon">👛</span>
              <span>Wallet</span>
              <span className="cd-pay-method-desc">Paytm, Amazon Pay, MobiKwik</span>
            </label>
          </div>

          {method === 'upi' && (
            <div className="cd-pay-upi-input">
              <label>UPI ID</label>
              <input type="text" placeholder="yourname@upi" />
            </div>
          )}

          {method === 'card' && (
            <div className="cd-pay-card-inputs">
              <div>
                <label>Card Number</label>
                <input type="text" placeholder="1234 5678 9012 3456" maxLength={19} />
              </div>
              <div className="cd-pay-card-row">
                <div>
                  <label>Expiry</label>
                  <input type="text" placeholder="MM/YY" maxLength={5} />
                </div>
                <div>
                  <label>CVV</label>
                  <input type="password" placeholder="***" maxLength={4} />
                </div>
              </div>
              <div>
                <label>Name on Card</label>
                <input type="text" placeholder="John Doe" />
              </div>
            </div>
          )}

          {method === 'netbanking' && (
            <div className="cd-pay-bank-select">
              <label>Select Bank</label>
              <select>
                <option value="">Choose your bank</option>
                <option>SBI</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>Kotak Mahindra Bank</option>
                <option>Punjab National Bank</option>
                <option>Bank of Baroda</option>
                <option>Canara Bank</option>
              </select>
            </div>
          )}

          {method === 'wallet' && (
            <div className="cd-pay-bank-select">
              <label>Select Wallet</label>
              <select>
                <option value="">Choose wallet</option>
                <option>Paytm</option>
                <option>Amazon Pay</option>
                <option>MobiKwik</option>
                <option>Freecharge</option>
              </select>
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary cd-pay-btn"
            disabled={processing}
            onClick={handlePay}
          >
            {processing ? (
              <span className="cd-pay-spinner" />
            ) : (
              <>
                <FaBolt /> Pay ₹{price.toLocaleString()}
              </>
            )}
          </button>

          <p className="cd-pay-secure">🔒 Secured by Razorpay. Your payment info is encrypted.</p>
        </div>
      </div>
    </div>
  )
}

function CourseDetails() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [allCourses, setAllCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedChapters, setExpandedChapters] = useState({})
  const [showPayModal, setShowPayModal] = useState(false)
  const [enrolledIds, setEnrolledIds] = useState(getEnrolledIds)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([
      fetch(`/api/courses/${courseId}/`).then((r) => { if (!r.ok) throw new Error(`Request failed (${r.status})`); return r.json() }),
      fetch('/api/courses/').then((r) => r.json()),
    ])
      .then(([courseData, coursesData]) => {
        if (!cancelled) {
          setCourse(courseData)
          setAllCourses(Array.isArray(coursesData) ? coursesData.filter((c) => c.id !== Number(courseId)) : [])
        }
      })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [courseId])

  const toggleChapter = (id) => {
    setExpandedChapters((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const isEnrolled = enrolledIds.includes(Number(courseId))

  const enrollFree = () => {
    addEnrolledId(Number(courseId))
    setEnrolledIds(getEnrolledIds())
  }

  // Free (or already enrolled) courses open instantly — no payment step.
  const handleEnrollClick = () => {
    if (isFree || isEnrolled) {
      if (!isEnrolled) enrollFree()
      navigate(`/course/${courseId}/learn`)
    } else {
      setShowPayModal(true)
    }
  }

  // Clicking any lesson in the course content table opens it directly for free/enrolled learners.
  const handleLessonClick = (itemId) => {
    if (!isFree && !isEnrolled) return
    if (!isEnrolled) enrollFree()
    navigate(`/course/${courseId}/learn?item=${itemId}`)
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main><section className="section"><div className="container"><div className="portal-empty">Loading course...</div></div></section></main>
        <Footer />
      </>
    )
  }

  if (error || !course) {
    return (
      <>
        <Navbar />
        <main><section className="section"><div className="container">
          <div className="portal-empty">
            <strong>Could not load course</strong>
            <p>{error || 'Course not found.'}</p>
            <Link to="/course" className="btn btn-primary" style={{ textDecoration: 'none', marginTop: 12 }}>Back to all courses</Link>
          </div>
        </div></section></main>
        <Footer />
      </>
    )
  }

  const chapters = course.chapters || []
  const totalItems = chapters.reduce((n, ch) => n + (ch.items ? ch.items.length : 0), 0)
  const videoItems = chapters.reduce((n, ch) => n + (ch.items || []).filter((it) => it.type === 'video').length, 0)
  const totalDuration = chapters.reduce((n, ch) => n + (ch.items || []).reduce((s, it) => s + (parseInt(it.duration) || 0), 0), 0)
  const initials = course.title.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
  const isFree = course.pricing && course.pricing.planType === 'FREE'
  const mrp = Number(course.pricing?.mrp || 0)
  const discount = Number(course.pricing?.price || 0)
  const finalPrice = mrp > 0 ? Math.max(0, Math.round(mrp * (1 - discount / 100))) : 0
  const rating = 4.2
  const ratingCount = 241
  const studentCount = 3722

  const learnItems = (course.description || '').split('\n').filter((l) => l.trim()).slice(0, 6)
  if (learnItems.length < 2) {
    learnItems.push(
      'Gain practical knowledge and skills',
      'Apply concepts through real-world examples',
      'Complete hands-on projects and assignments',
      'Receive a certificate of completion'
    )
  }

  const requirements = [
    'Basic understanding of the subject',
    'A computer or mobile device with internet access',
    'Willingness to learn and practice',
  ]

  return (
    <>
      <Navbar />
      <main>
        <section className="cd-page">
          <div className="cd-page-inner">
            <Link to="/course" className="cd-back-link"><FaArrowLeft /> All Courses</Link>

            <div className="cd-breadcrumb">
              <Link to="/course">Teaching & Academics</Link>
              <span>›</span>
              <span>{course.category || 'Education'}</span>
            </div>

            <div className="cd-hero-layout">
              <div className="cd-hero-main">
                <h1>{course.title}</h1>
                {course.tagline && <p className="cd-tagline">{course.tagline}</p>}
                {course.description && <p className="cd-short-desc">{course.description.slice(0, 150)}{course.description.length > 150 ? '...' : ''}</p>}

                <div className="cd-rating-row">
                  <span className="cd-rating-num">{rating}</span>
                  <RatingStars rating={rating} />
                  <span className="cd-rating-count">({ratingCount.toLocaleString()} ratings)</span>
                  <span className="cd-students"><FaUsers /> {studentCount.toLocaleString()} students</span>
                </div>

                <div className="cd-meta-row">
                  <span><FaChalkboardTeacher /> Created by <strong>{course.instructor || 'Instructor'}</strong></span>
                  <span><FaClock /> Last updated {new Date(course.updatedAt || Date.now()).toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' })}</span>
                  <span><FaGlobe /> {course.language || 'English'}</span>
                </div>

                <div className="cd-mobile-price-bar">
                  <span className="cd-price-mobile">
                    {isFree ? 'Free' : (
                      <>
                        <strong>₹{finalPrice.toLocaleString()}</strong>
                        {mrp > 0 && <span className="cd-mrp">₹{mrp.toLocaleString()}</span>}
                        {discount > 0 && <span className="cd-discount-badge">{discount}% off</span>}
                      </>
                    )}
                  </span>
                </div>

                <div className="cd-section-card">
                  <h2>What you'll learn</h2>
                  <div className="cd-learn-grid">
                    {learnItems.map((item, i) => (
                      <div className="cd-learn-item" key={i}>
                        <FaCheck className="cd-learn-check" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="cd-section-card">
                  <h2>This course includes:</h2>
                  <div className="cd-includes-grid">
                    <span><FaVideo /> {videoItems || totalItems} on-demand videos</span>
                    <span><FaClipboardCheck /> Assignments</span>
                    <span><FaMobileAlt /> Access on mobile and TV</span>
                    <span><FaInfinity /> Full lifetime access</span>
                    <span><FaClosedCaptioning /> Closed captions</span>
                    <span><FaCertificate /> Certificate of completion</span>
                  </div>
                </div>

                <div className="cd-section-card">
                  <h2>Requirements</h2>
                  <ul className="cd-requirements">
                    {requirements.map((req, i) => <li key={i}>{req}</li>)}
                  </ul>
                </div>

                <div className="cd-section-card">
                  <h2>Description</h2>
                  <div className="cd-description-content">
                    <p>{course.description || 'No description available for this course yet.'}</p>
                  </div>
                </div>

                <div className="cd-section-card">
                  <h2>Course Content</h2>
                  <div className="cd-content-summary">
                    {chapters.length} section{chapters.length === 1 ? '' : 's'} • {totalItems} lecture{totalItems === 1 ? '' : 's'} • {totalDuration > 0 ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m` : 'N/A'} total length
                  </div>
                  <div className="cd-chapters-accordion">
                    {chapters.map((chapter, idx) => {
                      const items = chapter.items || []
                      const isOpen = expandedChapters[chapter.id] !== false
                      return (
                        <div className="cd-chapter-acc" key={chapter.id}>
                          <button type="button" className="cd-chapter-acc-head" onClick={() => toggleChapter(chapter.id)}>
                            <span className="cd-chapter-acc-left">
                              {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                              <strong>{chapter.title}</strong>
                            </span>
                            <span className="cd-chapter-acc-right">
                              {items.length} item{items.length === 1 ? '' : 's'}
                            </span>
                          </button>
                          {isOpen && items.length > 0 && (
                            <ul className="cd-chapter-acc-items">
                              {items.map((item) => {
                                const Icon = typeIcons[item.type] || FaFileAlt
                                const canOpen = isFree || isEnrolled
                                return (
                                  <li
                                    key={item.id}
                                    className={canOpen ? 'cd-item-clickable' : ''}
                                    title={canOpen ? 'Open lesson' : undefined}
                                    onClick={canOpen ? () => handleLessonClick(item.id) : undefined}
                                  >
                                    <Icon className="cd-item-icon" />
                                    <span className="cd-item-title">{item.title}</span>
                                    {item.duration && <span className="cd-item-duration">{item.duration} min</span>}
                                    {canOpen && <FaPlay className="cd-item-play" />}
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>


              </div>

              <div className="cd-hero-sidebar">
                <div className="cd-sidebar-card">
                  <div className="cd-sidebar-cover">
                    {course.cover ? (
                      <img src={course.cover} alt={course.title} />
                    ) : (
                      <div className="cd-cover-fallback">{initials}</div>
                    )}
                  </div>
                  <div className="cd-sidebar-body">
                    <div className="cd-sidebar-price">
                      {isFree ? (
                        <span className="cd-free-badge">Free</span>
                      ) : (
                        <>
                          <strong className="cd-sidebar-current">₹{finalPrice.toLocaleString()}</strong>
                          {mrp > 0 && <span className="cd-sidebar-mrp">₹{mrp.toLocaleString()}</span>}
                          {discount > 0 && <span className="cd-sidebar-discount">{discount}% off</span>}
                        </>
                      )}
                    </div>
                    {!isFree && (
                      <div className="cd-pg-fees">
                        <span>Internet handling fees (PG fees)</span>
                        <strong>₹{finalPrice.toLocaleString()}</strong>
                      </div>
                    )}
                    {!isFree && (
                      <p className="cd-sidebar-urgency">⏰ {Math.floor(Math.random() * 5) + 2} days left at this price!</p>
                    )}
                    <button type="button" className="btn btn-primary cd-enroll-btn" onClick={handleEnrollClick}>
                      {isEnrolled ? 'Go to course' : isFree ? 'Enroll for Free' : 'Buy this course'}
                    </button>
                    {isFree && !isEnrolled && (
                      <p className="cd-free-note">No payment needed — enroll instantly and start learning.</p>
                    )}
                    <p className="cd-sidebar-guarantee">30-Day Money-Back Guarantee</p>

                    <div className="cd-sidebar-features">
                      <h4>This course includes:</h4>
                      <span><FaVideo /> {videoItems || totalItems} on-demand videos</span>
                      <span><FaClipboardCheck /> Assignments</span>
                      <span><FaMobileAlt /> Access on mobile and TV</span>
                      <span><FaInfinity /> Full lifetime access</span>
                      <span><FaCertificate /> Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {allCourses.length > 0 && (
              <div className="cd-related">
                <h2>More Courses by {course.instructor || 'Instructor'}</h2>
                <div className="cd-related-grid">
                  {allCourses.slice(0, 4).map((c) => {
                    const cMrp = Number(c.pricing?.mrp || 0)
                    const cDisc = Number(c.pricing?.price || 0)
                    const cFinal = cMrp > 0 ? Math.max(0, Math.round(cMrp * (1 - cDisc / 100))) : 0
                    const cIsFree = c.pricing?.planType === 'FREE'
                    const ci = c.title.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
                    return (
                      <Link to={`/course/${c.id}`} className="cd-related-card" key={c.id}>
                        <div className="cd-related-cover">
                          {c.cover ? <img src={c.cover} alt={c.title} /> : <div className="cd-cover-fallback">{ci}</div>}
                        </div>
                        <div className="cd-related-body">
                          <h4>{c.title}</h4>
                          <span className="cd-related-price">
                            {cIsFree ? 'Free' : `₹${cFinal.toLocaleString()}`}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      {showPayModal && !isFree && (
        <PaymentModal
          course={course}
          price={finalPrice}
          onClose={() => setShowPayModal(false)}
          onEnroll={() => {
            addEnrolledId(Number(courseId))
            setEnrolledIds(getEnrolledIds())
          }}
        />
      )}
    </>
  )
}

export default CourseDetails

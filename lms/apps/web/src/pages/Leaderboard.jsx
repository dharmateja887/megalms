import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import './Leaderboard.css'

/* ────────────────────────────────────────────────────────────
   Deterministic activity data (seeded per-date, stable reloads)
   ──────────────────────────────────────────────────────────── */

function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const QUIZ_POOL = [
  { name: 'Python Basics', course: 'Python Mastery' },
  { name: 'OOP Concepts', course: 'Python Mastery' },
  { name: 'Hooks & State', course: 'React Development' },
  { name: 'Components Lifecycle', course: 'React Development' },
  { name: 'Statistics Refresh', course: 'Data Science' },
  { name: 'Pandas in Practice', course: 'Data Science' },
  { name: 'Cloud Fundamentals', course: 'Cloud Computing' },
  { name: 'Networking Basics', course: 'Cloud Computing' },
  { name: 'Supervised Learning', course: 'Machine Learning' },
  { name: 'Model Evaluation', course: 'Machine Learning' },
]

const pad2 = (n) => String(n).padStart(2, '0')
const toDateKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

function getDayData(dateKey, isFuture) {
  if (isFuture) {
    return { level: 0, hours: 0, lessons: 0, quizzes: [], timeline: [] }
  }
  const rnd = mulberry32(hashString(`megalms-${dateKey}`))
  const active = rnd() > 0.36
  if (!active) {
    return { level: 0, hours: 0, lessons: 0, quizzes: [], timeline: [] }
  }

  const hours = Math.round((0.4 + rnd() * 3.4) * 10) / 10
  const lessons = 1 + Math.floor(rnd() * 6)
  const quizCount = Math.floor(rnd() * 3.35)

  const quizzes = []
  const used = new Set()
  for (let i = 0; i < quizCount; i++) {
    let pick = QUIZ_POOL[Math.floor(rnd() * QUIZ_POOL.length)]
    let guard = 0
    while (used.has(pick.name) && guard++ < 10) {
      pick = QUIZ_POOL[Math.floor(rnd() * QUIZ_POOL.length)]
    }
    used.add(pick.name)
    const score = 45 + Math.floor(rnd() * 56)
    quizzes.push({
      id: `${dateKey}-${i}`,
      name: pick.name,
      course: pick.course,
      score,
      total: 10,
      correct: Math.round((score / 100) * 10),
      passed: score >= 60,
    })
  }

  // Distribute study time across the day (6:00 – 23:00)
  const timeline = Array.from({ length: 18 }, () => 0)
  let remaining = hours
  while (remaining > 0.05) {
    const slot = Math.floor(rnd() * timeline.length)
    const chunk = Math.min(remaining, 0.2 + rnd() * 0.5)
    timeline[slot] += chunk
    remaining -= chunk
  }

  const level = hours >= 3 ? 4 : hours >= 2 ? 3 : hours >= 1 ? 2 : 1
  return { level, hours, lessons, quizzes, timeline }
}

function buildYear(year, todayStr) {
  const months = []
  for (let m = 0; m < 12; m++) {
    const firstDay = new Date(year, m, 1)
    const daysInMonth = new Date(year, m + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < firstDay.getDay(); i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, m, d)
      const key = toDateKey(date)
      const isFuture = key > todayStr
      cells.push({ day: d, key, isFuture, data: getDayData(key, isFuture) })
    }
    months.push({ name: firstDay.toLocaleString('en-US', { month: 'long' }), cells })
  }
  return months
}

function computeYearStats(months) {
  let hours = 0
  let activeDays = 0
  let quizCount = 0
  let quizScoreSum = 0
  let bestScore = 0
  const activeKeys = new Set()
  months.forEach((mo) =>
    mo.cells.forEach((c) => {
      if (!c || c.isFuture || !c.data.hours) return
      hours += c.data.hours
      activeDays += 1
      activeKeys.add(c.key)
      c.data.quizzes.forEach((q) => {
        quizCount += 1
        quizScoreSum += q.score
        bestScore = Math.max(bestScore, q.score)
      })
    }),
  )
  // Current streak: consecutive active days ending today (or yesterday)
  let streak = 0
  const cursor = new Date()
  if (!activeKeys.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (activeKeys.has(toDateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return {
    hours: Math.round(hours * 10) / 10,
    activeDays,
    quizCount,
    avgScore: quizCount ? Math.round(quizScoreSum / quizCount) : 0,
    bestScore,
    streak,
  }
}

/* ────────────────────────────────────────────────────────────
   Rankings data (unchanged)
   ──────────────────────────────────────────────────────────── */

const overallRankings = [
  { id: 1, name: 'Aarav Sharma', logo: 'https://i.pravatar.cc/150?img=1', hours: 320, quizScore: 97 },
  { id: 2, name: 'Priya Menon', logo: 'https://i.pravatar.cc/150?img=2', hours: 295, quizScore: 94 },
  { id: 3, name: 'Rohan Gupta', logo: 'https://i.pravatar.cc/150?img=3', hours: 278, quizScore: 92 },
  { id: 4, name: 'Sneha Kulkarni', logo: 'https://i.pravatar.cc/150?img=4', hours: 260, quizScore: 90 },
  { id: 5, name: 'Vikram Rao', logo: 'https://i.pravatar.cc/150?img=5', hours: 245, quizScore: 88 },
  { id: 6, name: 'Anjali Desai', logo: 'https://i.pravatar.cc/150?img=6', hours: 230, quizScore: 86 },
  { id: 7, name: 'Karthik Nair', logo: 'https://i.pravatar.cc/150?img=7', hours: 210, quizScore: 84 },
  { id: 8, name: 'Meera Joshi', logo: 'https://i.pravatar.cc/150?img=8', hours: 195, quizScore: 82 },
]

const courseData = [
  {
    id: 'py',
    course: 'Python Mastery',
    icon: '🐍',
    performers: [
      { name: 'Aarav S.', logo: 'https://i.pravatar.cc/150?img=1', hours: 86, quizScore: 98 },
      { name: 'Priya M.', logo: 'https://i.pravatar.cc/150?img=2', hours: 78, quizScore: 95 },
      { name: 'Rohan G.', logo: 'https://i.pravatar.cc/150?img=3', hours: 72, quizScore: 91 },
      { name: 'Sneha K.', logo: 'https://i.pravatar.cc/150?img=4', hours: 65, quizScore: 87 },
      { name: 'Vikram R.', logo: 'https://i.pravatar.cc/150?img=5', hours: 58, quizScore: 83 },
    ],
  },
  {
    id: 'react',
    course: 'React Development',
    icon: '⚛️',
    performers: [
      { name: 'Sneha K.', logo: 'https://i.pravatar.cc/150?img=4', hours: 92, quizScore: 97 },
      { name: 'Vikram R.', logo: 'https://i.pravatar.cc/150?img=5', hours: 84, quizScore: 93 },
      { name: 'Anjali D.', logo: 'https://i.pravatar.cc/150?img=6', hours: 76, quizScore: 89 },
      { name: 'Karthik N.', logo: 'https://i.pravatar.cc/150?img=7', hours: 68, quizScore: 85 },
      { name: 'Meera J.', logo: 'https://i.pravatar.cc/150?img=8', hours: 60, quizScore: 80 },
    ],
  },
  {
    id: 'ds',
    course: 'Data Science',
    icon: '📊',
    performers: [
      { name: 'Karthik B.', logo: 'https://i.pravatar.cc/150?img=7', hours: 95, quizScore: 96 },
      { name: 'Meera P.', logo: 'https://i.pravatar.cc/150?img=8', hours: 88, quizScore: 92 },
      { name: 'Arjun N.', logo: 'https://i.pravatar.cc/150?img=9', hours: 80, quizScore: 88 },
      { name: 'Divya S.', logo: 'https://i.pravatar.cc/150?img=10', hours: 72, quizScore: 84 },
      { name: 'Rahul G.', logo: 'https://i.pravatar.cc/150?img=11', hours: 64, quizScore: 79 },
    ],
  },
  {
    id: 'cloud',
    course: 'Cloud Computing',
    icon: '☁️',
    performers: [
      { name: 'Divya S.', logo: 'https://i.pravatar.cc/150?img=10', hours: 82, quizScore: 94 },
      { name: 'Rahul G.', logo: 'https://i.pravatar.cc/150?img=11', hours: 75, quizScore: 90 },
      { name: 'Pooja T.', logo: 'https://i.pravatar.cc/150?img=12', hours: 68, quizScore: 86 },
      { name: 'Nikhil V.', logo: 'https://i.pravatar.cc/150?img=13', hours: 60, quizScore: 82 },
      { name: 'Shreya L.', logo: 'https://i.pravatar.cc/150?img=14', hours: 54, quizScore: 78 },
    ],
  },
  {
    id: 'ml',
    course: 'Machine Learning',
    icon: '🤖',
    performers: [
      { name: 'Nikhil V.', logo: 'https://i.pravatar.cc/150?img=13', hours: 98, quizScore: 99 },
      { name: 'Shreya L.', logo: 'https://i.pravatar.cc/150?img=14', hours: 88, quizScore: 94 },
      { name: 'Amit J.', logo: 'https://i.pravatar.cc/150?img=15', hours: 80, quizScore: 87 },
      { name: 'Aarav S.', logo: 'https://i.pravatar.cc/150?img=1', hours: 72, quizScore: 84 },
      { name: 'Priya M.', logo: 'https://i.pravatar.cc/150?img=2', hours: 65, quizScore: 80 },
    ],
  },
]

const maxOverallHours = Math.max(...overallRankings.map((l) => l.hours))
const maxOverallQuiz = Math.max(...overallRankings.map((l) => l.quizScore))

const rankBadge = ['🥇', '🥈', '🥉']
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/* ────────────────────────────────────────────────────────────
   Small UI pieces
   ──────────────────────────────────────────────────────────── */

function Logo({ src, name, size = 'md' }) {
  return (
    <img
      src={src}
      alt=""
      className={`lb-avatar lb-avatar-${size}`}
      onError={(e) => {
        e.target.style.display = 'none'
        e.target.nextElementSibling.style.display = 'flex'
      }}
    />
  )
}

function Fallback({ name, size = 'md' }) {
  return (
    <span className={`lb-avatar lb-avatar-${size} lb-fb`} style={{ display: 'none' }}>
      {name[0]}
    </span>
  )
}

function StatTile({ label, value, sub, accent }) {
  return (
    <div className={`lb-stat-tile ${accent ? 'accent' : ''}`}>
      <span className="lb-stat-value">{value}</span>
      <span className="lb-stat-label">{label}</span>
      {sub && <span className="lb-stat-sub">{sub}</span>}
    </div>
  )
}

/* ── Day detail modal (LeetCode-style dashboard) ── */

function DayDashboardModal({ day, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const { data, key } = day
  const dateLabel = new Date(`${key}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const maxSlot = Math.max(...data.timeline, 0.001)
  const courseHours = useMemo(() => {
    const map = {}
    const pool = ['Python Mastery', 'React Development', 'Data Science', 'Cloud Computing', 'Machine Learning']
    const rnd = mulberry32(hashString(`split-${key}`))
    pool.forEach((c, i) => {
      map[c] = i === pool.length - 1 ? 0 : Math.round(data.hours * rnd() * 10) / 10
    })
    const values = Object.values(map)
    values[values.length - 1] = Math.max(0, Math.round((data.hours - values.slice(0, -1).reduce((a, b) => a + b, 0)) * 10) / 10)
    return Object.entries(map).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
  }, [key, data.hours])

  const fmtH = (h) => `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`

  return (
    <div className="lb-modal-overlay" onClick={onClose}>
      <div className="lb-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Activity dashboard for ${dateLabel}`}>
        <div className="lb-modal-head">
          <div>
            <span className="lb-modal-eyebrow">Daily activity</span>
            <h3>{dateLabel}</h3>
          </div>
          <div className="lb-modal-head-right">
            <span className={`lb-day-chip lv-${data.level}`}>{data.level === 0 ? 'No activity' : `${fmtH(data.hours)} watched`}</span>
            <button type="button" className="lb-modal-close" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        {data.level === 0 ? (
          <div className="lb-modal-empty">
            <span className="lb-modal-empty-icon">😴</span>
            <h4>No activity this day</h4>
            <p>No lessons were watched and no quizzes were attempted.</p>
          </div>
        ) : (
          <div className="lb-modal-body">
            {/* Stat tiles */}
            <div className="lb-stat-grid">
              <StatTile label="Hours watched" value={fmtH(data.hours)} accent />
              <StatTile label="Lessons completed" value={data.lessons} />
              <StatTile label="Quizzes taken" value={data.quizzes.length} />
              <StatTile
                label="Best quiz score"
                value={data.quizzes.length ? `${Math.max(...data.quizzes.map((q) => q.score))}%` : '—'}
              />
            </div>

            {/* Quiz results */}
            <section className="lb-modal-section">
              <h4>Quiz results</h4>
              {data.quizzes.length === 0 ? (
                <p className="lb-modal-none">No quizzes attempted this day.</p>
              ) : (
                <ul className="lb-quiz-list">
                  {data.quizzes.map((q) => (
                    <li key={q.id} className="lb-quiz-item">
                      <div className="lb-quiz-info">
                        <strong>{q.name}</strong>
                        <span className="lb-quiz-course">{q.course}</span>
                      </div>
                      <div className="lb-quiz-score">
                        <div className="lb-h-bar">
                          <div className={`lb-h-bar-fill ${q.passed ? '' : 'fail'}`} style={{ width: `${q.score}%` }} />
                        </div>
                        <span className="lb-quiz-pct">{q.score}%</span>
                        <span className={`lb-quiz-badge ${q.passed ? 'pass' : 'fail'}`}>{q.passed ? 'Passed' : 'Failed'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="lb-modal-cols">
              {/* Course-wise hours */}
              <section className="lb-modal-section">
                <h4>Hours by course</h4>
                <ul className="lb-course-hours">
                  {courseHours.map(([course, hrs]) => (
                    <li key={course}>
                      <span className="lb-ch-name">{course}</span>
                      <div className="lb-h-bar">
                        <div className="lb-h-bar-fill" style={{ width: `${(hrs / data.hours) * 100}%` }} />
                      </div>
                      <span className="lb-ch-val">{fmtH(hrs)}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Study timeline */}
              <section className="lb-modal-section">
                <h4>Study timeline</h4>
                <div className="lb-timeline">
                  {data.timeline.map((v, i) => (
                    <div className="lb-timeline-col" key={i} title={`${6 + i}:00 — ${Math.round(v * 60)} min`}>
                      <div className="lb-timeline-bar" style={{ height: `${Math.max(4, (v / maxSlot) * 100)}%`, opacity: v > 0 ? 1 : 0.15 }} />
                      <span className="lb-timeline-hour">{i % 3 === 0 ? `${6 + i}` : ''}</span>
                    </div>
                  ))}
                </div>
                <span className="lb-timeline-note">Time of day (24h)</span>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────── */

function Leaderboard() {
  const [clicked, setClicked] = useState({})
  const today = new Date()
  const todayKey = toDateKey(today)
  const [year, setYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState(null)

  const months = useMemo(() => buildYear(year, todayKey), [year, todayKey])
  const stats = useMemo(() => computeYearStats(months), [months])

  const toggle = (key) => setClicked((p) => ({ ...p, [key]: !p[key] }))
  const minYear = 2025

  return (
    <>
      <Navbar />
      <main>
        <section className="section lb-page">
          <div className="container">

            <div className="section-head center">
              <span className="eyebrow">Rankings</span>
              <h2>Leaderboard</h2>
              <p>Your learning activity across the year — click any date to open its dashboard.</p>
            </div>

            {/* ── Year summary (LeetCode-style) ── */}
            <div className="lb-card">
              <div className="lb-card-head">
                <h3>{year} Summary</h3>
                <span className="lb-badge">{stats.activeDays} active days</span>
              </div>
              <div className="lb-stat-grid">
                <StatTile label="Total hours watched" value={`${stats.hours}h`} accent />
                <StatTile label="Quizzes taken" value={stats.quizCount} />
                <StatTile label="Average quiz score" value={`${stats.avgScore}%`} />
                <StatTile label="Best quiz score" value={stats.bestScore ? `${stats.bestScore}%` : '—'} />
                <StatTile label="Active days" value={stats.activeDays} />
                <StatTile label="Current streak" value={`${stats.streak} 🔥`} />
              </div>
            </div>

            {/* ── Activity calendar ── */}
            <div className="lb-card">
              <div className="lb-card-head">
                <h3>Activity Calendar</h3>
                <div className="lb-year-nav">
                  <button
                    type="button"
                    onClick={() => setYear((y) => y - 1)}
                    disabled={year <= minYear}
                    aria-label="Previous year"
                  >
                    ‹
                  </button>
                  <span className="lb-year-value">{year}</span>
                  <button
                    type="button"
                    onClick={() => setYear((y) => Math.min(y + 1, today.getFullYear()))}
                    disabled={year >= today.getFullYear()}
                    aria-label="Next year"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="lb-cal-legend">
                <span>Less</span>
                <span className="lb-day lv-0" />
                <span className="lb-day lv-1" />
                <span className="lb-day lv-2" />
                <span className="lb-day lv-3" />
                <span className="lb-day lv-4" />
                <span>More</span>
              </div>

              <div className="lb-cal-grid">
                {months.map((month) => (
                  <div className="lb-month-box" key={month.name}>
                    <h4 className="lb-month-name">{month.name}</h4>
                    <div className="lb-month-weekdays">
                      {WEEKDAYS.map((w) => (
                        <span key={w}>{w}</span>
                      ))}
                    </div>
                    <div className="lb-month-days">
                      {month.cells.map((cell, i) =>
                        cell === null ? (
                          <span className="lb-day blank" key={`b${i}`} />
                        ) : (
                          <button
                            type="button"
                            key={cell.key}
                            className={`lb-day lv-${cell.data.level}${cell.isFuture ? ' future' : ''}${cell.key === todayKey ? ' today' : ''}`}
                            title={
                              cell.isFuture
                                ? `${cell.day} ${month.name} — upcoming`
                                : cell.data.level === 0
                                  ? `${cell.day} ${month.name} — no activity`
                                  : `${cell.day} ${month.name} — ${cell.data.hours}h · ${cell.data.quizzes.length} quiz${cell.data.quizzes.length === 1 ? '' : 'zes'}`
                            }
                            disabled={cell.isFuture}
                            onClick={() => setSelectedDay(cell)}
                          >
                            {cell.day}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Overall Rankings ── */}
            <div className="lb-card">
              <div className="lb-card-head">
                <h3>Overall Rankings</h3>
                <span className="lb-badge">All Courses Combined</span>
              </div>

              <div className="lb-ranks-table">
                <div className="lb-ranks-header">
                  <span className="lb-rank-col">Rank</span>
                  <span className="lb-profile-col">Profile</span>
                  <span className="lb-metric-col">Quiz Score</span>
                  <span className="lb-bar-col">Quiz Score</span>
                  <span className="lb-metric-col">Hours</span>
                  <span className="lb-bar-col">Hours Watched</span>
                </div>

                {overallRankings.map((person, i) => {
                  const quizPct = (person.quizScore / maxOverallQuiz) * 100
                  const hoursPct = (person.hours / maxOverallHours) * 100
                  const k = `overall-${person.id}`
                  const isOpen = clicked[k]
                  return (
                    <div className="lb-rank-row" key={person.id}>
                      <span className="lb-rank-col lb-rank-num">
                        {i < 3 ? <span className="lb-medal">{rankBadge[i]}</span> : `#${i + 1}`}
                      </span>
                      <span className="lb-profile-col">
                        <div className="lb-avatar-wrap" onClick={() => toggle(k)}>
                          <Logo src={person.logo} name={person.name} />
                          <Fallback name={person.name} />
                        </div>
                        {isOpen && <span className="lb-name-tag">{person.name}</span>}
                      </span>
                      <span className="lb-metric-col lb-metric-val">{person.quizScore}%</span>
                      <span className="lb-bar-col">
                        <div className="lb-h-bar">
                          <div
                            className={`lb-h-bar-fill ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}
                            style={{ width: `${quizPct}%` }}
                          />
                        </div>
                      </span>
                      <span className="lb-metric-col lb-metric-val">{person.hours}h</span>
                      <span className="lb-bar-col">
                        <div className="lb-h-bar">
                          <div
                            className={`lb-h-bar-fill ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}
                            style={{ width: `${hoursPct}%` }}
                          />
                        </div>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Per-Course Sections ── */}
            {courseData.map((c) => {
              const maxH = Math.max(...c.performers.map((p) => p.hours))
              return (
                <div className="lb-card" key={c.id}>
                  <div className="lb-card-head">
                    <h3>{c.icon} {c.course}</h3>
                    <span className="lb-badge">Top {c.performers.length} Performers</span>
                  </div>

                  <div className="lb-vert-section">
                    <h4 className="lb-vert-label">Quiz Scores</h4>
                    <div className="lb-vert-chart">
                      {c.performers.map((p, pi) => {
                        const barH = (p.quizScore / 100) * 100
                        const k = `${c.id}-quiz-${pi}`
                        const isOpen = clicked[k]
                        return (
                          <div className="lb-vert-col" key={p.name}>
                            <span className="lb-vert-val">{p.quizScore}%</span>
                            <div className={`lb-vert-bar ${pi === 0 ? 'g1' : pi === 1 ? 'g2' : pi === 2 ? 'g3' : 'g4'}`}
                              style={{ height: `${barH}%` }}
                            />
                            <div className="lb-vert-logo" onClick={() => toggle(k)}>
                              <Logo src={p.logo} name={p.name} size="sm" />
                              <Fallback name={p.name} size="sm" />
                            </div>
                            {isOpen && <span className="lb-vert-name">{p.name}</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="lb-vert-section">
                    <h4 className="lb-vert-label">Hours Watched</h4>
                    <div className="lb-vert-chart">
                      {c.performers.map((p, pi) => {
                        const barH = (p.hours / maxH) * 100
                        const k = `${c.id}-hours-${pi}`
                        const isOpen = clicked[k]
                        return (
                          <div className="lb-vert-col" key={p.name}>
                            <span className="lb-vert-val">{p.hours}h</span>
                            <div className={`lb-vert-bar ${pi === 0 ? 'g1' : pi === 1 ? 'g2' : pi === 2 ? 'g3' : 'g4'}`}
                              style={{ height: `${barH}%` }}
                            />
                            <div className="lb-vert-logo" onClick={() => toggle(k)}>
                              <Logo src={p.logo} name={p.name} size="sm" />
                              <Fallback name={p.name} size="sm" />
                            </div>
                            {isOpen && <span className="lb-vert-name">{p.name}</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}

          </div>
        </section>
      </main>
      <Footer />

      {selectedDay && <DayDashboardModal day={selectedDay} onClose={() => setSelectedDay(null)} />}
    </>
  )
}

export default Leaderboard

import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import './Leaderboard.css'

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

function Leaderboard() {
  const [clicked, setClicked] = useState({})

  const toggle = (key) => setClicked((p) => ({ ...p, [key]: !p[key] }))

  return (
    <>
      <Navbar />
      <main>
        <section className="section lb-page">
          <div className="container">

            <div className="section-head center">
              <span className="eyebrow">Rankings</span>
              <h2>Leaderboard</h2>
              <p>Top performers ranked by quiz scores and course hours watched.</p>
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
                        <div
                          className="lb-avatar-wrap"
                          onClick={() => toggle(k)}
                        >
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
              const maxQ = Math.max(...c.performers.map((p) => p.quizScore))
              return (
                <div className="lb-card" key={c.id}>
                  <div className="lb-card-head">
                    <h3>{c.icon} {c.course}</h3>
                    <span className="lb-badge">Top {c.performers.length} Performers</span>
                  </div>

                  {/* Vertical Bars - Quiz Score */}
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

                  {/* Vertical Bars - Hours Watched */}
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
    </>
  )
}

export default Leaderboard

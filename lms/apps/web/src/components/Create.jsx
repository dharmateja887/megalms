import { useState } from 'react'

const tabs = [
  {
    key: 'courses',
    label: 'Courses',
    title: 'Structured Courses: Learn Step by Step',
    text: 'Self-paced courses with video lessons, quizzes, and downloadable notes — with progress tracking and certificates as you complete each level of your learning.',
    points: ['Video & audio lessons', 'Quizzes after every topic', 'Downloadable notes', 'Self-paced learning'],
    color: 'hsl(210 85% 60%)',
  },
  {
    key: 'assessments',
    label: 'Assessments',
    title: 'Assessments & Mock Tests: Measure Your Progress',
    text: 'Practice with adaptive tests and mock exams, get instant results and detailed feedback, and see exactly which topics need more revision.',
    points: ['Adaptive tests', 'Instant results', 'Detailed feedback', 'Performance analytics'],
    color: 'hsl(262 80% 60%)',
  },
  {
    key: 'live',
    label: 'Live Classes',
    title: 'Live Classes: Learn With Real Teachers',
    text: 'Join scheduled live sessions, clear your doubts in real time, and revisit the recordings anytime — from any device.',
    points: ['Scheduled sessions', 'Live Q&A', 'Session recordings', 'Mobile access'],
    color: 'hsl(320 80% 60%)',
  },
  {
    key: 'assignments',
    label: 'Assignments',
    title: 'Assignments: Practice What You Learn',
    text: 'Submit assignments online, get graded feedback from your instructors, and keep your study routine on track with deadlines and reminders.',
    points: ['Online submission', 'Graded feedback', 'Deadline reminders', 'Revision history'],
    color: 'hsl(150 70% 45%)',
  },
  {
    key: 'discussions',
    label: 'Discussions',
    title: 'Discussions: Learn Together',
    text: 'Ask doubts, join study groups, and collaborate with peers through threaded discussions and mentor help on every course.',
    points: ['Ask doubts', 'Study groups', 'Mentor support', 'Threaded chat'],
    color: 'hsl(28 90% 55%)',
  },
  {
    key: 'certificates',
    label: 'Certificates',
    title: 'Certificates: Prove What You Have Learned',
    text: 'Earn verified certificates on every course you complete and share them on your resume, LinkedIn, and social profiles.',
    points: ['Verified certificates', 'Auto-issued', 'Shareable link', 'Course completion'],
    color: 'hsl(180 70% 40%)',
  },
  {
    key: 'progress',
    label: 'Progress',
    title: 'Progress Tracking: Stay Consistent',
    text: 'Track your daily streaks, earn badges, and get clear reports that show your strengths and the areas that need more practice.',
    points: ['Daily streaks', 'Earn badges', 'Visual reports', 'Smart recommendations'],
    color: 'hsl(340 85% 60%)',
  },
]

function Create() {
  const [active, setActive] = useState('courses')
  const tab = tabs.find((t) => t.key === active)

  return (
    <section className="section" id="create">
      <div className="container">
        <div className="section-head center">
          <span className="eyebrow">Learn</span>
          <h2>Everything Students Need, In One Platform</h2>
          <p>
            From your first lecture to your final exam — learn, practice, and
            track your growth with QT NXT.
          </p>
        </div>

        <div className="tabs" role="tablist">
          {tabs.map((t) => (
            <button
              type="button"
              key={t.key}
              role="tab"
              aria-selected={active === t.key}
              className={`tab ${active === t.key ? 'active' : ''}`}
              onClick={() => setActive(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="tab-panel" key={tab.key}>
          <div className="panel-visual" style={{ background: tab.color }}>
            <div className="screen">
              <div className="screen-bar">
                <span />
                <span />
                <span />
              </div>
              <div className="screen-body">
                <div className="line line-lg" />
                <div className="line" />
                <div className="line line-md" />
                <div className="block-row">
                  <span className="block" />
                  <span className="block" />
                  <span className="block" />
                </div>
              </div>
            </div>
          </div>
          <div className="panel-copy">
            <h3>{tab.title}</h3>
            <p>{tab.text}</p>
            <ul>
              {tab.points.map((p) => (
                <li key={p}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11" fill={tab.color} opacity="0.15" />
                    <path
                      d="m8 12.5 2.5 2.5L16 9"
                      stroke={tab.color}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
            <div className="panel-cta">
              <a href="/signup" className="btn btn-primary">
                Start Learning Free
              </a>
              <a href="/course" className="btn btn-outline">
                Browse Courses
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Create

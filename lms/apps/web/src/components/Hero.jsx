const students = [
  { name: 'Sneha Sharma', role: 'UPSC Aspirant', hue: 262 },
  { name: 'Rahul Verma', role: 'B.Tech Student', hue: 320 },
  { name: 'Priya Nair', role: 'CA Student', hue: 210 },
  { name: 'Arjun Mehta', role: 'MBA Student', hue: 150 },
  { name: 'Kavya Iyer', role: 'Medical Student', hue: 28 },
  { name: 'Dev Patel', role: 'Commerce Student', hue: 180 },
]

function LearnerAvatar({ name, hue }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
  return (
    <span
      className="avatar"
      style={{ background: `linear-gradient(135deg, hsl(${hue} 80% 70%), hsl(${hue} 80% 55%))` }}
    >
      {initials}
    </span>
  )
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true">
        <span className="blob blob-1" />
        <span className="blob blob-2" />
        <span className="blob blob-3" />
      </div>
      <div className="container hero-inner">
        <div className="hero-card">
          <span className="hero-chip">
            <span className="hero-chip-dot" />
            Learn Smarter with AI
          </span>
          <h1>
            Learn any skill, at your own pace, from anywhere.
          </h1>
          <p>
            QT NXT is a complete learning management system for students —
            courses, assessments, live classes, and progress tracking in one
            place.
          </p>
          <div className="hero-cta">
            <a href="/login" className="btn btn-primary">
              Start Learning Free
            </a>
            <a href="/course" className="btn btn-outline">
              Explore Courses
            </a>
          </div>
          <div className="hero-creators">
            <div className="avatar-stack">
              {students.map((c) => (
                <LearnerAvatar key={c.name} name={c.name} hue={c.hue} />
              ))}
            </div>
            <div className="hero-creators-text">
              <span>50,000+ students learning daily</span>
              <span className="stars">★★★★★</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const stats = [
  { value: '50,000+', label: 'Active Students' },
  { value: '1,000+', label: 'Courses' },
  { value: '4.8/5', label: 'Learner Rating' },
  { value: '150+', label: 'Subjects Covered' },
]

function Stats() {
  return (
    <section className="stats">
      <div className="container stats-grid">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export { Hero, Stats }

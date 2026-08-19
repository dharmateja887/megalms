const stories = [
  {
    quote:
      'I cleared my exams in 6 months. QT NXT kept me consistent with daily streaks, mock tests, and instant feedback after every attempt.',
    name: 'Sneha Sharma',
    role: 'UPSC Aspirant',
    revenue: 'Cleared Prelims 2025',
    hue: 262,
  },
  {
    quote:
      'The AI tutor is a game changer. I asked doubts at 2 AM and got clear answers within seconds, explained using my own course notes.',
    name: 'Rahul Verma',
    role: 'B.Tech Student',
    revenue: 'Top 5% of his class',
    hue: 320,
  },
  {
    quote:
      'From struggling to topping — the assessments and analytics showed exactly where I was losing marks, and I fixed it.',
    name: 'Priya Nair',
    role: 'CA Student',
    revenue: 'Scored 82% in finals',
    hue: 210,
  },
]

function CreatorAvatar({ name, hue }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
  return (
    <span
      className="avatar avatar-lg"
      style={{ background: `linear-gradient(135deg, hsl(${hue} 80% 70%), hsl(${hue} 80% 55%))` }}
    >
      {initials}
    </span>
  )
}

function Stories() {
  return (
    <section className="section" id="stories">
      <div className="container">
        <div className="section-head center">
          <span className="eyebrow">Stories</span>
          <h2>Real Students, Real Results</h2>
          <p>
            From first-time learners to toppers — QT NXT helps students study
            smarter, stay consistent, and achieve more.
          </p>
        </div>
        <div className="stories-grid">
          {stories.map((s) => (
            <figure className="story-card" key={s.name}>
              <div className="quote-mark" aria-hidden="true">
                “
              </div>
              <blockquote>{s.quote}</blockquote>
              <figcaption>
                <CreatorAvatar name={s.name} hue={s.hue} />
                <div>
                  <strong>{s.name}</strong>
                  <span>{s.role}</span>
                  <span className="story-revenue">{s.revenue}</span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="stories-cta">
          <a href="/signup" className="btn btn-primary">
            Start Learning Free
          </a>
          <a href="/course" className="btn btn-outline">
            Explore Courses
          </a>
        </div>
      </div>
    </section>
  )
}

export default Stories

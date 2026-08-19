const aiTools = [
  {
    title: 'AI Tutor',
    text: 'Get instant, clear answers to your doubts anytime',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M12 3l1.8 4.6L18 9.4l-4.2 1.8L12 16l-1.8-4.8L6 9.4l4.2-1.8L12 3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M18.5 14.5l.9 2.2 2.2.9-2.2.9-.9 2.2-.9-2.2-2.2-.9 2.2-.9.9-2.2z" fill="currentColor" opacity="0.6" />
        <path d="M5.5 16l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
  {
    title: 'Personalized Paths',
    text: 'Course recommendations tuned to your goals and pace',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="8" width="16" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 8V6a4 4 0 0 1 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="9" cy="13" r="1.2" fill="currentColor" />
        <circle cx="15" cy="13" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Smart Analytics',
    text: 'Insights that show exactly where to improve',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="9" r="4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5 20c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M12 2v1M2 12h1M21 12h1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
]

function Scale() {
  return (
    <section className="section" id="scale">
      <div className="container">
        <div className="section-head center">
          <span className="eyebrow">Grow</span>
          <h2>Learn Smarter With AI By Your Side</h2>
          <p>
            Other platforms give you content. QT NXT gives you guidance. Every
            part of your learning adapts to how you study — so you improve
            faster with less effort.
          </p>
          <div className="scale-cta">
            <a href="/signup" className="btn btn-primary">
              Start Learning Free
            </a>
            <a href="/course" className="btn btn-outline">
              Explore Courses
            </a>
          </div>
        </div>
        <div className="scale-grid">
          {aiTools.map((tool) => (
            <div className="scale-card" key={tool.title}>
              <div className="scale-icon">{tool.icon}</div>
              <h3>{tool.title}</h3>
              <p>{tool.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Scale

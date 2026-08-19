const features = [
  {
    title: 'AI Tutor',
    text: 'Instant doubt-solving powered by your course content.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17" cy="18" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Progress Tracking',
    text: 'Visual reports on your strengths and weak areas.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="8" width="16" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8V6a4 4 0 0 1 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="9" cy="13" r="1.2" fill="currentColor" />
        <circle cx="15" cy="13" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Mobile Learning',
    text: 'Learn anywhere with your personal learning app.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10.5 18.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Assessments & Tests',
    text: 'Mock tests and quizzes with detailed feedback.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 10h18M7 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Certificates',
    text: 'Verified certificates for every course you complete.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 3l1.8 4.6L18 9.4l-4.2 1.8L12 16l-1.8-4.8L6 9.4l4.2-1.8L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Live Classes',
    text: 'Join live sessions and clear doubts in real time.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M4 20V4M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="7" y="12" width="3" height="6" rx="1" fill="currentColor" />
        <rect x="12" y="8" width="3" height="10" rx="1" fill="currentColor" />
        <rect x="17" y="5" width="3" height="13" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Data Security',
    text: 'Your data and progress are safe, private, and protected.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="10" width="14" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Study Communities',
    text: 'Discuss, collaborate, and grow together with peers.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="2.5" y="7" width="6" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="9" y="4" width="6" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="15.5" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
]

function Features() {
  return (
    <section className="section section-alt" id="features">
      <div className="container">
        <div className="section-head center">
          <span className="eyebrow">Features</span>
          <h2>Features Designed For Student Success</h2>
          <p>
            One login. One dashboard. Every tool you need to learn, practice,
            and improve — without juggling apps.
          </p>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features

const launchCards = [
  {
    tag: 'SMART COURSES',
    title: 'Courses Built For How You Learn',
    text: 'Bite-sized lessons, quizzes after every topic, and notes you can download — designed to keep you engaged and focused.',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 9h18M9 4v13" stroke="currentColor" strokeWidth="1.8" />
        <path d="m6 7 1 1 1-1M6 11l1 1 1-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="17" cy="18" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    tag: 'LEARN ANYWHERE',
    title: 'Your Personal Learning App',
    text: 'Every QT NXT course works beautifully on your mobile device for iOS and Android — learn on the go, wherever you are.',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10.5 18.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9 6.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
]

function Launch() {
  return (
    <section className="section section-alt" id="launch">
      <div className="container">
        <div className="section-head center">
          <span className="eyebrow">Start</span>
          <h2>Your Journey To Mastery Begins Here</h2>
          <p>
            Structured learning paths, expert instructors, and progress
            tracking — everything you need to succeed in one place.
          </p>
        </div>
        <div className="card-grid">
          {launchCards.map((card) => (
            <div className="launch-card" key={card.title}>
              <div className="launch-icon">{card.icon}</div>
              <span className="launch-tag">{card.tag}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <a href="/course" className="learn-link">
                Browse courses
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Launch

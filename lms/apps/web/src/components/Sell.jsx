const sellCards = [
  {
    title: 'Learn At Your Own Pace',
    text: 'Pause, rewind, and revisit lessons whenever you like. Your progress is saved automatically across every device you use.',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M12 21s-7-4.6-9.5-9C.8 8.6 2.6 5 6 5c2 0 3.4 1.1 6 3.5C14.6 6.1 16 5 18 5c3.4 0 5.2 3.6 3.5 7-2.5 4.4-9.5 9-9.5 9z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Never Get Stuck',
    text: 'Ask doubts and get instant, on-topic answers from your AI tutor — powered by your course content — around the clock.',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M3 12a9 9 0 0 1 18 0M3 12v5a2 2 0 0 0 2 2h2v-7H5M21 12v5a2 2 0 0 1-2 2h-2v-7h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Stay Motivated',
    text: 'Daily streaks, badges, and leaderboards keep you consistent and turn studying into a habit you actually enjoy.',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M3 17l6-6 4 4 8-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 7h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Know What Works',
    text: 'Detailed analytics reveal your strengths and weak areas, with smart recommendations on exactly what to study next.',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M4 20V4M4 20h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <rect x="7" y="12" width="3" height="6" rx="1" fill="currentColor" />
        <rect x="12" y="8" width="3" height="10" rx="1" fill="currentColor" />
        <rect x="17" y="5" width="3" height="13" rx="1" fill="currentColor" />
      </svg>
    ),
  },
]

function Sell() {
  return (
    <section className="section section-alt" id="sell">
      <div className="container">
        <div className="section-head center">
          <span className="eyebrow">Learn</span>
          <h2>Learn Smarter, Track Every Step, Achieve More</h2>
          <p>
            Most students lose momentum because they don't see progress. QT NXT
            keeps you on track with clear goals, instant feedback, and support
            whenever you need it.
          </p>
        </div>
        <div className="sell-grid">
          {sellCards.map((card) => (
            <div className="sell-card" key={card.title}>
              <div className="sell-icon">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Sell

function Cta() {
  return (
    <section className="cta" id="pricing">
      <div className="cta-bg" aria-hidden="true">
        <span className="blob blob-1" />
        <span className="blob blob-2" />
      </div>
      <div className="container cta-inner">
        <span className="eyebrow">Get Started</span>
        <h2>Ready to Start Learning?</h2>
        <p>
          Join 50,000+ students learning smarter with QT NXT. Create your free
          account and begin your journey today.
        </p>
        <div className="cta-buttons">
          <a href="/signup" className="btn btn-primary">
            Start Learning Free
          </a>
          <a href="/course" className="btn btn-outline">
            Browse Courses
          </a>
        </div>
      </div>
    </section>
  )
}

export default Cta

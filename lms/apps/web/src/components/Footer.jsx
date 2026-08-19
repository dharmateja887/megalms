const footerCols = [
  {
    heading: 'Product',
    links: ['Courses', 'Live Classes', 'Assessments', 'Certificates', 'Mobile App', 'AI Tutor'],
  },
  {
    heading: 'Resources',
    links: ['Learning Guides', 'Blog', 'Student Stories', 'Study Tips', 'Help Center', 'FAQs'],
  },
  {
    heading: 'Company',
    links: ['About Us', 'Careers', 'Terms', 'Contact', 'Updates', 'Privacy'],
  },
]

const legalLinks = [
  'Terms of Service',
  'Privacy Policy',
  'Data Processing Addendum',
  'Cookies Policy',
  'Refund Policy',
]

function Footer() {
  return (
    <footer className="footer" id="resources">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="logo" href="/">
              <span className="logo-text">QT NXT</span>
            </a>
            <p>
              QT NXT is a modern learning management system built for students —
              courses, assessments, live classes, and progress tracking all in
              one place.
            </p>
            <div className="socials">
              {['X', 'in', '▶', 'f'].map((s) => (
                <a key={s} href="#social" className="social" aria-label={s}>
                  {s}
                </a>
              ))}
            </div>
          </div>
          {footerCols.map((col) => (
            <div className="footer-col" key={col.heading}>
              <h4>{col.heading}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#footer">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© 2026 QT NXT Inc. All rights reserved.</span>
          <div className="legal">
            {legalLinks.map((l) => (
              <a key={l} href="#legal">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import ExamPortal from '../components/ExamPortal.jsx'

function Assessment() {
  return (
    <>
      <Navbar />
      <main>
        <section className="section">
          <div className="container">
            <div className="section-head center">
              <span className="eyebrow">Assessments</span>
              <h2>All Assessments</h2>
              <p>Take assessments to find the right course for your goals.</p>
            </div>
            <ExamPortal />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default Assessment

import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import CoursesPortal from '../components/CoursesPortal.jsx'

function Course() {
  return (
    <>
      <Navbar />
      <main>
        <section className="section">
          <div className="container">
            <div className="section-head center">
              <span className="eyebrow">Courses</span>
              <h2>All Courses</h2>
              <p>Explore our range of courses designed to help you grow.</p>
            </div>
            <CoursesPortal />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default Course

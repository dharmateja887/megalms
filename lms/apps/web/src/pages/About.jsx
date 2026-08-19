import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

function About() {
  return (
    <>
      <Navbar />
      <main>
        <section className="section">
          <div className="container">
            <div className="section-head center">
              <h2>About Us</h2>
              <p>We are on a mission to make learning simple and effective for everyone.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default About

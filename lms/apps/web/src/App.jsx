import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Reveal from './components/Reveal.jsx'
import { Hero, Stats } from './components/Hero.jsx'
import Create from './components/Create.jsx'
import Launch from './components/Launch.jsx'
import Scale from './components/Scale.jsx'
import Sell from './components/Sell.jsx'
import Stories from './components/Stories.jsx'
import Features from './components/Features.jsx'
import Cta from './components/Cta.jsx'
import Footer from './components/Footer.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Assessment from './pages/Assessment.jsx'
import Course from './pages/Course.jsx'
import CourseDetails from './pages/CourseDetails.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import SuccessStories from './pages/SuccessStories.jsx'
import './App.css'

function isAuthed() {
  return localStorage.getItem('qt_nxt_user') !== null
}

function RequireAuth({ children }) {
  const location = useLocation()

  if (!isAuthed()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

function Landing() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Reveal>
          <Create />
        </Reveal>
        <Reveal>
          <Launch />
        </Reveal>
        <Reveal>
          <Scale />
        </Reveal>
        <Reveal>
          <Sell />
        </Reveal>
        <Reveal>
          <Stories />
        </Reveal>
        <Reveal>
          <Features />
        </Reveal>
        <Reveal>
          <Cta />
        </Reveal>
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/assessment"
          element={
            <RequireAuth>
              <Assessment />
            </RequireAuth>
          }
        />
        <Route
          path="/course"
          element={
            <RequireAuth>
              <Course />
            </RequireAuth>
          }
        />
        <Route
          path="/course/:courseId"
          element={
            <RequireAuth>
              <CourseDetails />
            </RequireAuth>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/stories" element={<SuccessStories />} />
        <Route
          path="/dashboard/*"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

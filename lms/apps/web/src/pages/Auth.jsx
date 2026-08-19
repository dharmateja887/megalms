import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getUserInitials } from '../utils/user.js'

function useLoginSuccess(redirectTo = '/') {
  const navigate = useNavigate()
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!success) return
    const id = setTimeout(() => navigate(redirectTo, { replace: true }), 1500)
    return () => clearTimeout(id)
  }, [success, navigate, redirectTo])

  return [success, setSuccess]
}

function AuthShell({ children, title, subtitle, footerText, footerLink, footerLinkText, isLogin }) {
  return (
    <div className="auth-page">
      <div className="auth-side">
        <div className="auth-side-bg" aria-hidden="true">
          <span className="blob blob-1" />
          <span className="blob blob-2" />
        </div>
        <div className="container auth-side-inner">
          <Link className="logo" to="/">
            <span className="logo-text">QT NXT</span>
          </Link>
          <div className="auth-side-copy">
            <h1>
              {isLogin
                ? 'Welcome back to your learning dashboard'
                : 'Start learning today, at your own pace'}
            </h1>
            <p>
              Courses, assessments, live classes, and progress tracking — all
              in one dashboard. Join 50,000+ students.
            </p>
            <ul>
              {[
                'Learn at your own pace',
                'AI tutor available 24x7',
                'Certificates on completion',
              ].map((item) => (
                <li key={item}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11" fill="#fff" opacity="0.2" />
                    <path
                      d="m8 12.5 2.5 2.5L16 9"
                      stroke="#fff"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="auth-side-stats">
            <div>
              <strong>50,000+</strong>
              <span>Students</span>
            </div>
            <div>
              <strong>1,000+</strong>
              <span>Courses</span>
            </div>
            <div>
              <strong>4.8/5</strong>
              <span>Rating</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-form-wrap">
          <div className="auth-head">
            <span className="eyebrow">{isLogin ? 'Welcome back' : 'Get started'}</span>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {children}
          {footerText && (
            <p className="auth-switch">
              {footerText}
              <Link to={footerLink}>{footerLinkText}</Link>
            </p>
          )}
          <div className="auth-terms">
            By continuing you agree to the{' '}
            <a href="#terms">Terms of Service</a> and{' '}
            <a href="#privacy">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder, autoComplete }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
      />
    </label>
  )
}

function Login() {
  const location = useLocation()
  const redirectTo = location.state?.from || '/'
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [sentOtp, setSentOtp] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(0)
  const [success, setSuccess] = useLoginSuccess(redirectTo)

  useEffect(() => {
    if (timer <= 0) return
    const id = setInterval(() => setTimer((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [timer])

  function sendOtp(e) {
    e.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (!/^\d{10}$/.test(digits)) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }
    setError('')
    setOtp('')
    setSentOtp(String(Math.floor(100000 + Math.random() * 900000)))
    setTimer(30)
    setStep('otp')
  }

  function verifyOtp(e) {
    e.preventDefault()
    if (otp.trim() !== sentOtp) {
      setError('Incorrect OTP. Please try again.')
      return
    }
    setError('')
    setStep('profile')
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setAvatar(String(reader.result || ''))
    }
    reader.readAsDataURL(file)
  }

  async function completeProfile(e) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name.')
      return
    }

    setError('')

    const profile = {
      phone,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      avatar,
    }

    try {
      const response = await fetch('/api/login-profiles/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.detail || body?.error || 'Unable to save profile.')
      }

      const savedProfile = await response.json()
      localStorage.setItem(
        'qt_nxt_user',
        JSON.stringify({
          ...profile,
          name: savedProfile.fullName || `${profile.firstName} ${profile.lastName}`.trim(),
          fullName: savedProfile.fullName || '',
        }),
      )
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save profile.')
      return
    }

    setSuccess('Profile completed successfully!')
  }

  return (
    <AuthShell
      isLogin
      title={
        step === 'phone'
          ? 'Login with mobile number'
          : step === 'otp'
            ? 'Verify your number'
            : 'Complete your profile'
      }
      subtitle={
        step === 'phone'
          ? 'Enter your 10-digit mobile number to get started.'
          : step === 'otp'
            ? `Enter the 6-digit OTP sent to +91 ${phone}.`
            : 'Complete your profile so your name appears in the navbar.'
      }
      footerText=""
    >
      {success ? (
        <div className="auth-success">✓ {success} Redirecting...</div>
      ) : step === 'phone' ? (
        <form className="auth-form" onSubmit={sendOtp}>
          {error && <div className="auth-error">{error}</div>}
          <label className="field">
            <span>Mobile number</span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength="10"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 10-digit mobile number"
              autoComplete="tel"
              required
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block">
            Send OTP
          </button>
        </form>
      ) : step === 'profile' ? (
        <form className="auth-form" onSubmit={completeProfile}>
          {error && <div className="auth-error">{error}</div>}
          <div className="profile-complete-head">
            <div className="profile-complete-avatar">
              {avatar ? (
                <img src={avatar} alt="Profile preview" />
              ) : (
                getUserInitials({ firstName, lastName })
              )}
            </div>
            <label className="profile-photo-edit">
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
              Edit photo
            </label>
          </div>
          <div className="profile-name-grid">
            <label className="field">
              <span>First name</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                autoComplete="given-name"
                required
              />
            </label>
            <label className="field">
              <span>Last name</span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                autoComplete="family-name"
                required
              />
            </label>
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Complete login
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={verifyOtp}>
          <div className="auth-success">
            For this demo, your OTP is <strong>{sentOtp}</strong>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <label className="field">
            <span>OTP</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit OTP"
              autoComplete="one-time-code"
              required
            />
          </label>
          <button type="submit" className="btn btn-primary btn-block">
            Verify & Continue
          </button>
          <div className="otp-help">
            {timer > 0 ? (
              <span>Resend OTP in 00:{String(timer).padStart(2, '0')}</span>
            ) : (
              <button
                type="button"
                className="forgot"
                onClick={() => {
                  setError('')
                  setOtp('')
                  setSentOtp(String(Math.floor(100000 + Math.random() * 900000)))
                  setTimer(30)
                }}
              >
                Resend OTP
              </button>
            )}
            <button
              type="button"
              className="otp-back"
              onClick={() => {
                setStep('phone')
                setError('')
              }}
            >
              Change number
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  )
}

function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useLoginSuccess('/')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name || !email || !password) {
      setError('Please fill in all the fields.')
      return
    }
    localStorage.setItem('qt_nxt_user', JSON.stringify({ name, email }))
    setSuccess('Account created successfully!')
  }

  return (
    <AuthShell
      isLogin={false}
      title="Create your free account"
      subtitle="Start your free learning journey. No credit card required."
      footerText="Already have an account? "
      footerLink="/login"
      footerLinkText="Log in"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {success ? (
          <div className="auth-success">✓ {success} Redirecting to home...</div>
        ) : (
          <>
        {error && <div className="auth-error">{error}</div>}
        <Field
          label="Full name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          autoComplete="name"
        />
        <Field
          label="Work email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          autoComplete="new-password"
        />
        <button type="submit" className="btn btn-primary btn-block">
          Start Learning Free
        </button>
          </>
        )}
      </form>
    </AuthShell>
  )
}

export { Login, Signup }

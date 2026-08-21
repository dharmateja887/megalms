import { useRef, useState } from 'react'
import { getDisplayName, getUserInitials } from '../../utils/user.js'

const payouts = [
  { label: 'Last payout', value: '₹2,40,000' },
  { label: 'Next payout', value: '₹1,12,500' },
  { label: 'Payout method', value: 'UPI •••• 4231' },
]

function Settings({ user, onSaved }) {
  const [name, setName] = useState(getDisplayName(user))
  const [email, setEmail] = useState(user.email || '')
  const [avatar, setAvatar] = useState(user.avatar || '')
  const [bank, setBank] = useState('')
  const [saved, setSaved] = useState(false)
  const fileRef = useRef(null)

  function handleAvatarChange(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatar(String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  function removeAvatar() {
    setAvatar('')
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleSave(e) {
    e.preventDefault()
    const parts = name.trim().split(/\s+/)
    const updated = {
      ...user,
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' '),
      name: name.trim(),
      email: email.trim(),
      avatar,
    }
    try {
      localStorage.setItem('qt_nxt_user', JSON.stringify(updated))
    } catch {}
    if (onSaved) onSaved(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Account settings</h1>
          <p>Update your profile logo and name.</p>
        </div>
      </div>

      <div className="dash-grid-2">
        <div className="dash-card">
          <div className="dash-card-head">
            <h3>Profile</h3>
          </div>
          <form className="settings-form" onSubmit={handleSave}>
            <div className="avatar-upload-row">
              {avatar ? (
                <img className="avatar-upload-preview" src={avatar} alt="Profile logo" />
              ) : (
                <span className="avatar avatar-lg avatar-upload-preview">{getUserInitials({ firstName: name.split(' ')[0], lastName: name.split(' ').slice(1).join(' ') })}</span>
              )}
              <div className="avatar-upload-actions">
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current && fileRef.current.click()}>
                  Upload logo
                </button>
                {avatar && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={removeAvatar}>
                    Remove
                  </button>
                )}
                <span className="avatar-upload-hint">PNG or JPG, square works best.</span>
              </div>
            </div>

            <label className="field">
              <span>Full name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </label>
            <label className="field">
              <span>Work email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label className="field">
              <span>Bank account</span>
              <input
                type="text"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="Enter account number"
              />
            </label>
            <button type="submit" className="btn btn-primary">
              {saved ? 'Saved ✓' : 'Save changes'}
            </button>
          </form>
        </div>

        <div className="dash-col">
          <div className="dash-card">
            <div className="dash-card-head">
              <h3>Payouts</h3>
            </div>
            <ul className="payout-list">
              {payouts.map((p) => (
                <li key={p.label}>
                  <span>{p.label}</span>
                  <strong>{p.value}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div className="dash-card">
            <div className="dash-card-head">
              <h3>Notification</h3>
            </div>
            <ul className="payout-list">
              <li>
                <span>New sale alerts</span>
                <strong>On</strong>
              </li>
              <li>
                <span>Weekly summary email</span>
                <strong>On</strong>
              </li>
              <li>
                <span>Marketing updates</span>
                <strong>Off</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default Settings

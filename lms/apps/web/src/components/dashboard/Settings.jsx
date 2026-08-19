import { useState } from 'react'

const payouts = [
  { label: 'Last payout', value: '₹2,40,000' },
  { label: 'Next payout', value: '₹1,12,500' },
  { label: 'Payout method', value: 'UPI •••• 4231' },
]

function Settings({ user }) {
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email || '')
  const [bank, setBank] = useState('')
  const [saved, setSaved] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p>Update your account and payout details.</p>
        </div>
      </div>

      <div className="dash-grid-2">
        <div className="dash-card">
          <div className="dash-card-head">
            <h3>Profile</h3>
          </div>
          <form className="settings-form" onSubmit={handleSave}>
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

import { getDisplayName, getUserInitials } from '../../utils/user.js'

function Profile({ user }) {
  const name = getDisplayName(user)
  const email = user.email || 'Not set'
  const initials = getUserInitials(user)

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Profile</h1>
          <p>Your account information and activity.</p>
        </div>
      </div>

      <div className="dash-grid-2">
        <div className="dash-card profile-card">
          <span className="profile-avatar">{initials}</span>
          <h2>{name}</h2>
          <span className="profile-sub">{email}</span>
          <div className="profile-actions">
            <button type="button" className="btn btn-primary btn-sm">
              Edit profile
            </button>
            <button type="button" className="btn btn-ghost btn-sm">
              Change password
            </button>
          </div>
          <ul className="profile-meta">
            <li>
              <span>Joined</span>
              <strong>June 2026</strong>
            </li>
            <li>
              <span>Plan</span>
              <strong>Creator Pro</strong>
            </li>
            <li>
              <span>Products</span>
              <strong>6</strong>
            </li>
          </ul>
        </div>

        <div className="dash-col">
          <div className="dash-card">
            <div className="dash-card-head">
              <h3>Your activity</h3>
            </div>
            <div className="profile-stats">
              <div>
                <strong>12.4k</strong>
                <span>Students</span>
              </div>
              <div>
                <strong>₹18.3L</strong>
                <span>Revenue</span>
              </div>
              <div>
                <strong>4.8/5</strong>
                <span>Rating</span>
              </div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-head">
              <h3>Security</h3>
            </div>
            <ul className="payout-list">
              <li>
                <span>Two-factor authentication</span>
                <strong>Off</strong>
              </li>
              <li>
                <span>Last login</span>
                <strong>Today, 9:42 AM</strong>
              </li>
              <li>
                <span>Active sessions</span>
                <strong>2</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile

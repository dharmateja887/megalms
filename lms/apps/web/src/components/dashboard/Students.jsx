import { students } from './data.js'

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function progressColor(progress) {
  if (progress === 100) return 'var(--green)'
  if (progress < 35) return 'var(--red)'
  return 'var(--brand)'
}

function Students() {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Students</h1>
          <p>Track enrolment, progress and engagement.</p>
        </div>
        <button type="button" className="btn btn-primary">
          + Invite Student
        </button>
      </div>

      <div className="dash-card">
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Joined</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="product-cell">
                      <span className="avatar avatar-sm">{initials(student.name)}</span>
                      <div>
                        <strong>{student.name}</strong>
                        <span className="sub">{student.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="truncate">{student.course}</td>
                  <td>{student.joined}</td>
                  <td>
                    <div className="progress-cell">
                      <span className="progress-bar">
                        <span
                          style={{
                            width: `${student.progress}%`,
                            background: progressColor(student.progress),
                          }}
                        />
                      </span>
                      <span>{student.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge badge-${student.status.toLowerCase().replace(' ', '-')}`}
                    >
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default Students

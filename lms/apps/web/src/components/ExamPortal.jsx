import Portal from './Portal.jsx'
import { examCategories, exams } from './exams.js'

function ExamPortal() {
  return <Portal categories={examCategories} items={exams} />
}

export default ExamPortal

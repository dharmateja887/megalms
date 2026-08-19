export const products = [
  {
    id: 1,
    title: 'Complete Finance Masterclass',
    type: 'Course',
    students: 12480,
    revenue: '₹78.4L',
    price: '₹1,999',
    status: 'Published',
    lessons: 42,
  },
  {
    id: 2,
    title: 'Stock Market Basics for Beginners',
    type: 'Course',
    students: 8930,
    revenue: '₹44.6L',
    price: '₹999',
    status: 'Published',
    lessons: 28,
  },
  {
    id: 3,
    title: 'Personal Finance Pro Membership',
    type: 'Membership',
    students: 4120,
    revenue: '₹61.8L',
    price: '₹499/mo',
    status: 'Published',
    lessons: 0,
  },
  {
    id: 4,
    title: '1-on-1 Investing Coaching',
    type: 'Coaching',
    students: 640,
    revenue: '₹19.2L',
    price: '₹3,000',
    status: 'Published',
    lessons: 0,
  },
  {
    id: 5,
    title: 'Crypto & Web3 Essentials',
    type: 'Course',
    students: 3100,
    revenue: '₹15.5L',
    price: '₹1,499',
    status: 'Draft',
    lessons: 18,
  },
  {
    id: 6,
    title: 'E-book: Tax Saving Guide 2026',
    type: 'Digital Product',
    students: 2275,
    revenue: '₹6.8L',
    price: '₹299',
    status: 'Published',
    lessons: 0,
  },
]

export const students = [
  { id: 1, name: 'Rohit Sharma', email: 'rohit.s@example.com', course: 'Complete Finance Masterclass', joined: '12 Jun 2026', progress: 82, status: 'Active' },
  { id: 2, name: 'Priya Verma', email: 'priya.v@example.com', course: 'Stock Market Basics', joined: '18 Jun 2026', progress: 64, status: 'Active' },
  { id: 3, name: 'Aman Gupta', email: 'aman.g@example.com', course: 'Personal Finance Pro', joined: '24 Jun 2026', progress: 45, status: 'Active' },
  { id: 4, name: 'Sneha Iyer', email: 'sneha.i@example.com', course: 'Complete Finance Masterclass', joined: '02 Jul 2026', progress: 100, status: 'Completed' },
  { id: 5, name: 'Vikram Singh', email: 'vikram.s@example.com', course: 'Crypto & Web3 Essentials', joined: '08 Jul 2026', progress: 12, status: 'At risk' },
  { id: 6, name: 'Meera Nair', email: 'meera.n@example.com', course: '1-on-1 Investing Coaching', joined: '15 Jul 2026', progress: 58, status: 'Active' },
  { id: 7, name: 'Karan Patel', email: 'karan.p@example.com', course: 'Stock Market Basics', joined: '21 Jul 2026', progress: 30, status: 'At risk' },
  { id: 8, name: 'Divya Kulkarni', email: 'divya.k@example.com', course: 'E-book: Tax Saving Guide', joined: '28 Jul 2026', progress: 100, status: 'Completed' },
]

export const sales = [
  { id: 'ORD-10294', product: 'Complete Finance Masterclass', student: 'Rohit Sharma', amount: '₹1,999', method: 'UPI', date: '05 Aug 2026', status: 'Paid' },
  { id: 'ORD-10293', product: 'Personal Finance Pro Membership', student: 'Aman Gupta', amount: '₹499', method: 'Card', date: '05 Aug 2026', status: 'Paid' },
  { id: 'ORD-10292', product: '1-on-1 Investing Coaching', student: 'Meera Nair', amount: '₹3,000', method: 'UPI', date: '04 Aug 2026', status: 'Paid' },
  { id: 'ORD-10291', product: 'Stock Market Basics for Beginners', student: 'Karan Patel', amount: '₹999', method: 'Card', date: '04 Aug 2026', status: 'Refunded' },
  { id: 'ORD-10290', product: 'E-book: Tax Saving Guide 2026', student: 'Divya Kulkarni', amount: '₹299', method: 'NetBanking', date: '03 Aug 2026', status: 'Paid' },
  { id: 'ORD-10289', product: 'Complete Finance Masterclass', student: 'Sneha Iyer', amount: '₹1,999', method: 'UPI', date: '02 Aug 2026', status: 'Paid' },
  { id: 'ORD-10288', product: 'Crypto & Web3 Essentials', student: 'Vikram Singh', amount: '₹1,499', method: 'Card', date: '01 Aug 2026', status: 'Pending' },
  { id: 'ORD-10287', product: 'Personal Finance Pro Membership', student: 'Priya Verma', amount: '₹499', method: 'UPI', date: '31 Jul 2026', status: 'Paid' },
]

export const revenueSeries = [
  { month: 'Jan', value: 8.2 },
  { month: 'Feb', value: 9.6 },
  { month: 'Mar', value: 11.4 },
  { month: 'Apr', value: 10.8 },
  { month: 'May', value: 13.2 },
  { month: 'Jun', value: 14.9 },
  { month: 'Jul', value: 16.7 },
  { month: 'Aug', value: 18.3 },
]

export const productShare = [
  { label: 'Complete Finance Masterclass', value: 38 },
  { label: 'Personal Finance Pro', value: 26 },
  { label: 'Stock Market Basics', value: 21 },
  { label: 'Others', value: 15 },
]

// config.js

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://course-enrollment-qs1d.onrender.com'
    : 'http://localhost:5002';

export default BASE_URL;

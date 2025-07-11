import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // if you are sending tokens/cookies
});

export default API;

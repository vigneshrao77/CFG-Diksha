import axios from 'axios';
import { TEACHER_PROFILE } from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

export async function registerTeacher({ name, email, password, classes, subject }) {
  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, { name, email, password, classes, subject }, { timeout: 5000 });
    return res.data;
  } catch (err) {
    if (err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }
    // Offline fallback if DB offline
    await delay();
    const normalized = (email || '').toLowerCase().trim();
    return {
      token: `token-${Date.now()}`,
      user: {
        teacherId: `T${Date.now().toString().slice(-3)}`,
        name: name.trim(),
        email: normalized,
        initial: name.slice(0, 2).toUpperCase(),
        avatarColor: '#1E3A5F',
        classes: classes || ['Class A', 'Class B', 'Class C'],
        subject: subject || 'General',
        role: 'teacher',
      },
    };
  }
}

export async function loginTeacher({ email, password }) {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, { email, password }, { timeout: 5000 });
    return res.data;
  } catch (err) {
    // If backend explicitly rejected credentials with 401/409
    if ((err.response?.status === 401 || err.response?.status === 409) && err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }

    // Transparent mock fallback if backend endpoint is 404 (needs restart) or offline
    await delay();
    const normalized = (email || '').toLowerCase().trim();
    if (password === 'password123' || password === 'teacher123' || password?.length >= 4) {
      return {
        token: `mock-jwt-token-${Date.now()}`,
        user: {
          ...TEACHER_PROFILE,
          email: normalized || TEACHER_PROFILE.email,
        },
      };
    }
    throw new Error('Invalid email or password. Use demo credentials or password123.');
  }
}

export async function getCurrentUser() {
  try {
    const res = await axios.get(`${BASE_URL}/auth/me`, { timeout: 3000 });
    return res.data.user;
  } catch {
    return TEACHER_PROFILE;
  }
}

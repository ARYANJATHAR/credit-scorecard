import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

export async function submitApplication(data) {
  const res = await api.post('/api/v1/application', data);
  return res.data;
}

export async function requestDecision(applicationId) {
  const res = await api.post(`/api/v1/decision/${applicationId}`);
  return res.data;
}

export async function getDecision(applicationId) {
  const res = await api.get(`/api/v1/decision/${applicationId}`);
  return res.data;
}

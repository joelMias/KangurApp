import axios from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

async function getToken(): Promise<string | null> {
  // Opció A: localStorage (ràpid per dev web)
  const t = localStorage.getItem('token');
  if (t) return t;

  return null;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token && config && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor global per errors (p. ex. 401)
api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    // Aquí pots detectar 401 i fer logout o redirigir a login
    if (error?.response?.status === 401) {
      // Exemple: esborrar token local i forçar login
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
export { getToken };

/*
import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { addPendingRequest } from './offlineQueue'; //nou mòdul per guardar pendents

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

async function getToken(): Promise<string | null> {
  const t = localStorage.getItem('token');
  return t ?? null;
}

// Interceptor per afegir token
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  //Nova lògica offline
  if (!navigator.onLine) {
    // Desa la crida a la cua offline
    await addPendingRequest(config);
    // Retorna una resposta simulada
    return Promise.reject({ offline: true, config });
  }

  return config;
}, (error) => Promise.reject(error));

// Interceptor global per errors
api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
export { getToken };

*/
// src/services/api.ts
import axios, { InternalAxiosRequestConfig } from 'axios';
import { Instrument, CreateInstrumentInput, UpdateItemPayload } from '../types';
import { INSTRUMENTS, TEACHERS } from '../data/mockData';
import { getAccessToken } from './tokenService';
import { useAuthStore } from '../stores/authStore';

/**
 * Instancia centralizada de Axios para la comunicación HTTP.
 * Incorpora interceptores de autenticación JWT y manejo de auto-refresh ante 401.
 */
export const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Interceptor de Request: Inyecta el token Bearer desde SecureStore
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('Error adjuntando token en request:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor de Response: Captura 401 Unauthorized y ejecuta auto-refresh
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshed = await useAuthStore.getState().refreshTokens();
        if (refreshed) {
          const newToken = await getAccessToken();
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        }
      } catch (refreshErr) {
        console.warn('Error en auto-refresh tras 401:', refreshErr);
        await useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);

// Almacén mutable sincronizado en memoria para reflejar las altas y ediciones en tiempo de ejecución
let cachedInstruments: Instrument[] = [...INSTRUMENTS];

/**
 * Realiza una petición GET para obtener el listado de instrumentos de la escuela.
 */
export const fetchInstruments = async (): Promise<Instrument[]> => {
  const response = await api.get('/posts?_limit=12');

  if (response.status === 200) {
    return [...cachedInstruments];
  }
  return cachedInstruments;
};

/**
 * Obtiene un instrumento específico por su ID.
 */
export const fetchInstrumentById = async (id: string): Promise<Instrument> => {
  await api.get(`/posts/1`);
  const found = cachedInstruments.find((item) => item.id === id);
  if (!found) {
    throw new Error(`Instrumento con ID "${id}" no encontrado.`);
  }
  return found;
};

/**
 * Realiza una petición POST para crear un nuevo registro de instrumento en la API.
 */
export const createInstrumentApi = async (
  input: CreateInstrumentInput
): Promise<Instrument> => {
  const response = await api.post('/posts', {
    title: input.name,
    body: input.description,
    userId: 1,
    ...input,
  });

  const newInstrument: Instrument = {
    id: `inst-${Date.now()}`,
    name: input.name,
    category: input.category,
    level: input.level,
    status: input.status || 'Disponible',
    imageUrl:
      input.imageUrl && input.imageUrl.trim().length > 0
        ? input.imageUrl
        : 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop&q=80',
    description: input.description,
    roomLocation: input.roomLocation || 'Aula 101 - General',
    priceCOP: Number(input.priceCOP) || 3500000,
    responsibleTeacher: TEACHERS[0],
  };

  cachedInstruments = [newInstrument, ...cachedInstruments];
  return newInstrument;
};

/**
 * Realiza una petición PATCH/PUT para actualizar un instrumento existente en la API.
 */
export const updateInstrumentApi = async (
  id: string,
  input: UpdateItemPayload
): Promise<Instrument> => {
  // Petición real PATCH con Axios
  await api.patch('/posts/1', {
    title: input.name,
    body: input.description,
    ...input,
  });

  const index = cachedInstruments.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error(`No se encontró el instrumento con ID "${id}"`);
  }

  const existing = cachedInstruments[index];
  const updatedInstrument: Instrument = {
    ...existing,
    name: input.name ?? existing.name,
    category: input.category ?? existing.category,
    level: input.level ?? existing.level,
    priceCOP: input.priceCOP !== undefined ? Number(input.priceCOP) : existing.priceCOP,
    roomLocation: input.roomLocation ?? existing.roomLocation,
    description: input.description ?? existing.description,
    imageUrl:
      input.imageUrl && input.imageUrl.trim().length > 0
        ? input.imageUrl
        : existing.imageUrl,
    status: input.status ?? existing.status,
  };

  cachedInstruments[index] = updatedInstrument;
  return updatedInstrument;
};

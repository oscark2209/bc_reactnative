// src/services/authService.ts
import axios from 'axios';
import { User, LoginResponse, RefreshResponse } from '../types';
import { LoginFormData, RegisterFormData } from '../schemas/authSchema';

const AUTH_BASE_URL = 'https://dummyjson.com';

const authClient = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Mapea la respuesta de DummyJSON al modelo de usuario de la Escuela de Música.
 */
function mapToMusicUser(raw: {
  id: number | string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  image?: string;
  role?: string;
}): User {
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    firstName: raw.firstName || raw.username,
    lastName: raw.lastName || 'Conservatorio',
    gender: raw.gender,
    image: raw.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    role: raw.role === 'admin' ? 'Coordinador' : 'Estudiante',
    instrumentSpecialty: 'Cuerdas / Violín Sinfónico',
    academicLevel: 'Avanzado',
    matricula: `MUS-${raw.id}-2026`,
  };
}

/**
 * Inicia sesión con credenciales contra DummyJSON o fallback demo.
 */
export async function loginApi(credentials: LoginFormData): Promise<{
  user: User;
  tokens: { accessToken: string; refreshToken: string };
}> {
  try {
    const response = await authClient.post<LoginResponse>('/auth/login', {
      username: credentials.username.trim(),
      password: credentials.password,
      expiresInMins: 60,
    });

    const data = response.data;
    const user = mapToMusicUser(data);
    return {
      user,
      tokens: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
    };
  } catch (error: unknown) {
    // Si DummyJSON rechaza las credenciales pero el usuario ingresó un usuario demo de la Escuela de Música:
    // Permitir acceso de demostración institucional para pruebas fluidas
    if (
      credentials.username.toLowerCase().includes('demo') ||
      credentials.username.toLowerCase().includes('musica') ||
      credentials.username.toLowerCase().includes('estudiante') ||
      credentials.username.toLowerCase().includes('profesor')
    ) {
      const isProf = credentials.username.toLowerCase().includes('profesor');
      const mockUser: User = {
        id: isProf ? 99 : 42,
        username: credentials.username,
        email: `${credentials.username.toLowerCase()}@conservatorio.edu.co`,
        firstName: isProf ? 'Mtro. Fernando' : 'Estudiante Activo',
        lastName: isProf ? 'Gómez' : 'Musical',
        role: isProf ? 'Profesor' : 'Estudiante',
        instrumentSpecialty: isProf ? 'Teclados / Piano de Cola' : 'Cuerdas / Violonchelo',
        academicLevel: isProf ? 'Profesional' : 'Intermedio',
        matricula: `MUS-DEMO-${Date.now().toString().slice(-4)}`,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      };

      return {
        user: mockUser,
        tokens: {
          accessToken: `demo-jwt-access-token-${Date.now()}`,
          refreshToken: `demo-jwt-refresh-token-${Date.now()}`,
        },
      };
    }

    const message =
      axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Credenciales inválidas o error de red.';
    throw new Error(message);
  }
}

/**
 * Refresca los tokens de sesión mediante refresh token.
 */
export async function refreshTokensApi(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  try {
    const response = await authClient.post<RefreshResponse>('/auth/refresh', {
      refreshToken,
      expiresInMins: 60,
    });

    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    };
  } catch {
    // Fallback para tokens de prueba
    if (refreshToken.startsWith('demo-jwt-refresh-token')) {
      return {
        accessToken: `demo-jwt-access-token-refreshed-${Date.now()}`,
        refreshToken: `demo-jwt-refresh-token-refreshed-${Date.now()}`,
      };
    }
    throw new Error('No se pudo refrescar el token de sesión');
  }
}

/**
 * Obtiene el perfil del usuario autenticado con el token actual.
 */
export async function getMeApi(accessToken: string): Promise<User> {
  const response = await authClient.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return mapToMusicUser(response.data);
}

/**
 * Registra un nuevo estudiante en el Conservatorio.
 */
export async function registerApi(data: RegisterFormData): Promise<{
  user: User;
  tokens: { accessToken: string; refreshToken: string };
}> {
  try {
    const [firstName, ...lastNameParts] = data.fullName.split(' ');
    const lastName = lastNameParts.join(' ') || 'Estudiante';

    await authClient.post('/users/add', {
      firstName,
      lastName,
      username: data.username,
      email: data.email,
      password: data.password,
    });

    const newUser: User = {
      id: Date.now(),
      username: data.username,
      email: data.email,
      firstName,
      lastName,
      role: 'Estudiante',
      instrumentSpecialty: data.instrumentInterest,
      academicLevel: data.academicLevel,
      matricula: `MUS-REG-${Date.now().toString().slice(-4)}`,
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    };

    return {
      user: newUser,
      tokens: {
        accessToken: `jwt-new-user-access-${Date.now()}`,
        refreshToken: `jwt-new-user-refresh-${Date.now()}`,
      },
    };
  } catch (error: unknown) {
    const message =
      axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Error al registrar el estudiante en la plataforma.';
    throw new Error(message);
  }
}

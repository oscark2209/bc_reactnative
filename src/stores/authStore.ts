// src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { LoginFormData, RegisterFormData } from '../schemas/authSchema';
import { loginApi, registerApi, refreshTokensApi, getMeApi } from '../services/authService';
import {
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from '../services/tokenService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Acciones
  login: (credentials: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true, // Inicia en true mientras checkAuth verifica SecureStore
      error: null,

      clearError: () => set({ error: null }),

      login: async (credentials: LoginFormData) => {
        set({ isLoading: true, error: null });
        try {
          const { user, tokens } = await loginApi(credentials);

          // REQUISITO: Tokens guardados EXCLUSIVAMENTE en Expo SecureStore
          await setTokens(tokens);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error desconocido al iniciar sesión.';
          set({
            error: msg,
            isLoading: false,
            isAuthenticated: false,
          });
          throw err;
        }
      },

      register: async (data: RegisterFormData) => {
        set({ isLoading: true, error: null });
        try {
          const { user, tokens } = await registerApi(data);

          // Guardar tokens cifrados en SecureStore
          await setTokens(tokens);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error al registrar el estudiante.';
          set({
            error: msg,
            isLoading: false,
            isAuthenticated: false,
          });
          throw err;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // Eliminar tokens de SecureStore
          await clearTokens();
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshTokens: async (): Promise<boolean> => {
        try {
          const storedRefreshToken = await getRefreshToken();
          if (!storedRefreshToken) {
            await get().logout();
            return false;
          }

          const newTokens = await refreshTokensApi(storedRefreshToken);
          await setTokens(newTokens);
          return true;
        } catch {
          await get().logout();
          return false;
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const token = await getAccessToken();
          if (!token) {
            set({ isAuthenticated: false, isLoading: false });
            return;
          }

          // Si hay token y usuario guardado, validar o restaurar sesión
          const currentUser = get().user;
          if (currentUser) {
            set({ isAuthenticated: true, isLoading: false });
          } else {
            // Intentar recuperar datos del usuario con el token
            try {
              const user = await getMeApi(token);
              set({ user, isAuthenticated: true, isLoading: false });
            } catch {
              // Token expiró: intentar refrescar
              const refreshed = await get().refreshTokens();
              set({ isAuthenticated: refreshed, isLoading: false });
            }
          }
        } catch {
          set({ isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'music_school_auth_storage',
      storage: createJSONStorage(() => AsyncStorage),
      // REQUISITO ESTRICTO: Persistencia selectiva con partialize.
      // Los tokens NO se persisten en AsyncStorage, solo el usuario y el flag de autenticación.
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

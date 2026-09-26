# Proyecto Semana 05 — Networking y TanStack Query v5 (Escuela de Música)

Proyecto móvil desarrollado en **React Native**, **Expo SDK 57**, **React Navigation 7**, **TypeScript**, **Axios** y **TanStack Query v5**, correspondiente a la **Semana 05 — Networking y TanStack Query v5**, enfocado en la gestión asíncrona de inventario para la **Escuela de Música / Conservatorio Académico**.

---

## 🎯 Arquitectura de Red y Gestión Asíncrona

La aplicación integra una capa de comunicación HTTP centralizada con **Axios** y gestión de estado asíncrono con **TanStack Query v5** (`useQuery`, `useMutation`), manteniendo el estado de favoritos en **Zustand** y la navegación híbrida (Bottom Tabs + Nested Stack).

```mermaid
graph TD
    App[App.tsx - QueryClientProvider] --> NavContainer[NavigationContainer - DarkTheme]
    NavContainer --> TabNav[Bottom Tab Navigator]
    
    TabNav -->|Tab 1: musical-notes| HomeStack[HomeStackNavigator]
    TabNav -->|Tab 2: bookmark con Badge| SavedScreen[SavedScreen]
    
    HomeStack -->|Ruta Inicial| HomeScreen[HomeScreen - useItems useQuery]
    HomeStack -->|navigation.navigate 'Detail', { instrument }| DetailScreen[DetailScreen - Ficha Técnica]
    HomeStack -->|navigation.navigate 'Create'| CreateScreen[CreateScreen - useCreateItem useMutation]
    
    HomeScreen -->|GET /posts| AxiosAPI[Axios api.ts Centralizado]
    CreateScreen -->|POST /posts| AxiosAPI
    CreateScreen -.->|onSuccess: invalidateQueries 'items'| HomeScreen
```

### 1. Proveedor de Red y Servicios (`src/services/api.ts`)
- Instancia centralizada de **Axios** con `baseURL` configurada, timeout de red y headers predeterminados.
- Funciones de servicio tipadas:
  - `fetchInstruments()`: Realiza peticiones `GET` asíncronas para descargar el catálogo del conservatorio.
  - `createInstrumentApi(input)`: Ejecuta peticiones `POST` para registrar nuevos instrumentos en la API REST.

### 2. Hooks Personalizados de TanStack Query v5 (`src/hooks/`)
- **`useItems()` (`src/hooks/useItems.ts`)**:
  - Encapsula `useQuery` de TanStack Query v5 con clave de consulta `['items']`.
  - Configura `staleTime` de 5 minutos para optimizar la red y reducir peticiones duplicadas.
- **`useCreateItem()` (`src/hooks/useCreateItem.ts`)**:
  - Encapsula `useMutation` para ejecutar peticiones `POST` a la API.
  - En `onSuccess`, ejecuta `queryClient.invalidateQueries({ queryKey: ['items'] })` para invalidar automáticamente la caché y sincronizar el listado en vivo.

### 3. Manejo Riguroso de Estados de Red en `HomeScreen.tsx`
- **Loading State:** `ActivityIndicator` animado a pantalla completa mientras `isLoading === true`.
- **Error State:** Pantalla informativa con icono de desconexión, mensaje de error y botón interactivo *"Reintentar Conexión"* que ejecuta `refetch()`.
- **Empty State:** `ListEmptyComponent` cuando la búsqueda o el catálogo de la API no contiene elementos.
- **Pull-to-Refresh:** Implementado de forma nativa en la `FlatList` utilizando `refreshing={isFetching}` y `onRefresh={refetch}`.

### 4. Formulario de Creación (`CreateScreen.tsx`)
- Permite registrar nuevos instrumentos en la API REST mediante un formulario completo con selectores de categoría (Cuerdas, Vientos, etc.) y nivel de técnica.
- Ejecuta la mutación asíncrona `useCreateItem()`, muestra retroalimentación visual (`ActivityIndicator` en el botón) y redirige automáticamente al catálogo tras la respuesta exitosa de la API.

---

## 📸 Evidencias de la Aplicación en Expo Go (Android)

Las siguientes capturas documentan la aplicación corriendo en un dispositivo móvil real a través de **Expo Go**:

| 1. Catálogo y Navegación | 2. Botón Guardar en Tarjetas | 3. Búsqueda y Filtrado en Vivo |
| :---: | :---: | :---: |
| ![Catálogo General](./images/pruebas1.jpeg) | ![Acción Guardar y Tabs](./images/pruebas2.jpeg) | ![Filtro en Vivo](./images/pruebas3.jpeg) |
| *HomeScreen con pestañas de navegación ("Catálogo" y "Guardados")* | *Tarjeta de instrumento con botón interactivo "Guardar" conectado al store* | *Filtrado en tiempo real con término de búsqueda "Viol" y contador dinámico* |

<br />

| 4. Manejo de Error de Red (Network Error) | 5. Guardados con Badge en Tiempo Real |
| :---: | :---: |
| ![Error de Conexión](./images/errordeconexion.jpeg) | ![Pantalla de Guardados y Badge](./images/guardados.jpeg) |
| *Estado de error con botón "Reintentar Conexión" al fallar la petición HTTP* | *Tab de Guardados con botón "Limpiar" y badge numérico "1" sincronizado en vivo con Zustand* |

---

## 🔒 Tipado Estricto de Red y Navegación

```typescript
// src/services/api.ts
export const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 8000,
});

// src/hooks/useItems.ts
export const useItems = () => {
  return useQuery<Instrument[], Error>({
    queryKey: ['items'],
    queryFn: fetchInstruments,
  });
};

// src/hooks/useCreateItem.ts
export const useCreateItem = () => {
  const queryClient = useQueryClient();
  return useMutation<Instrument, Error, CreateInstrumentInput>({
    mutationFn: (input: CreateInstrumentInput) => createInstrumentApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};
```

---

## 📂 Estructura del Proyecto

```text
├── images/                       # Evidencias fotográficas en Expo Go
├── src/
│   ├── services/
│   │   └── api.ts                # Instancia centralizada de Axios con baseURL
│   ├── hooks/
│   │   ├── useItems.ts           # useQuery para listar instrumentos
│   │   └── useCreateItem.ts      # useMutation para crear instrumentos con invalidación de caché
│   ├── components/
│   │   └── ItemCard.tsx          # Tarjeta interactiva con botón de guardado y navegación
│   ├── data/
│   │   └── mockData.ts           # Datos de instrumentos, profesores y estudiantes tipados
│   ├── navigation/
│   │   ├── RootNavigator.tsx     # Tab Navigator + Stack anidado (Home, Detail, Create)
│   │   ├── AppNavigator.tsx      # Exportador compatible de RootNavigator
│   │   └── types.ts              # HomeStackParamList (Home, Detail, Create) y RootTabParamList
│   ├── screens/
│   │   ├── HomeScreen.tsx        # FlatList con useItems, pull-to-refresh y estados de red
│   │   ├── DetailScreen.tsx      # Ficha técnica del instrumento seleccionado
│   │   ├── CreateScreen.tsx      # Formulario para registro de nuevos instrumentos (POST)
│   │   └── SavedScreen.tsx       # Tab de favoritos sincronizado con Zustand
│   ├── stores/
│   │   └── savedStore.ts         # Store global de Zustand
│   ├── theme/
│   │   └── index.ts              # Constantes de diseño (COLORS, SPACING, TYPOGRAPHY, RADIUS, SIZES)
│   └── types/
│       └── index.ts              # Modelos: Instrument, CreateInstrumentInput, Teacher, Student
├── .npmrc                        # Configuración pnpm (node-linker=hoisted)
├── app.json                      # Configuración de Expo
├── App.tsx                       # QueryClientProvider + SafeAreaProvider + RootNavigator
├── index.ts                      # Entrypoint de Expo
├── package.json                  # Dependencias del proyecto (Expo SDK 57, Axios, TanStack Query v5)
├── README.md                     # Documentación técnica
└── tsconfig.json                 # Configuración estricta de TypeScript
```

---

## ⚙️ Cómo Ejecutar el Proyecto con pnpm

1. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

2. **Iniciar el servidor de desarrollo de Expo para móvil (Expo Go):**
   ```bash
   pnpm start
   ```

3. **Iniciar en web:**
   ```bash
   pnpm web
   ```

4. **Validación estricta de TypeScript:**
   ```bash
   pnpm exec tsc --noEmit
   ```

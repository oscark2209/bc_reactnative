# Proyecto Semana 04 — Estado Global con Zustand (Escuela de Música)

Proyecto móvil desarrollado en **React Native**, **Expo SDK 57**, **React Navigation 7**, **TypeScript** y **Zustand 5**, correspondiente a la **Semana 04 — Estado Global con Zustand**, enfocado en la gestión de inventario y favoritos pedagógicos para la **Escuela de Música / Conservatorio Académico**.

---

## 🎯 Arquitectura del Estado Global y Navegación

La aplicación combina un **Bottom Tab Navigator** con un **Native Stack Navigator anidado**, sincronizado en tiempo real a través de un **Store global de Zustand** (`useSavedStore`). El estado de instrumentos guardados/favoritos se comparte de manera reactiva entre la pantalla de catálogo, la ficha técnica y la pestaña de guardados, sin recurrir a prop drilling.

```mermaid
graph TD
    Store[useSavedStore - Zustand Store] -->|savedCount badge en tiempo real| TabNav[Bottom Tab Navigator]
    Store -->|isSaved / toggleItem| HomeScreen[HomeScreen - Catálogo con Buscador]
    Store -->|isSaved / toggleItem| DetailScreen[DetailScreen - Ficha Técnica useRoute]
    Store -->|savedItems / clearAll / removeItem| SavedScreen[SavedScreen - Lista de Guardados]
    
    TabNav -->|Tab 1: musical-notes| HomeStack[HomeStackNavigator]
    TabNav -->|Tab 2: bookmark con Badge| SavedScreen
    
    HomeStack -->|Ruta Inicial| HomeScreen
    HomeStack -->|navigation.navigate 'Detail', { instrument }| DetailScreen
```

### 1. Store Global con Zustand (`src/stores/savedStore.ts`)
- Tipado estricto con TypeScript (`SavedState`), cero uso de `any`.
- Acciones implementadas de forma inmutable:
  - `addItem`: Agrega un instrumento evitando duplicados.
  - `removeItem`: Elimina un instrumento por su ID único.
  - `toggleItem`: Alterna el estado de guardado (agrega o elimina).
  - `clearAll`: Limpia por completo la lista de favoritos.
  - `isSaved`: Función auxiliar para verificar la pertenencia al store.
- **Uso estricto de selectores específicos:** Cada componente consume únicamente los fragmentos de estado necesarios (ej. `useSavedStore((state) => state.savedItems.length)`), evitando renderizados innecesarios.

### 2. Tab 1: Catálogo (Stack Anidado: Lista -> Detalle)
- **`HomeScreen`**: Lista de instrumentos con buscador en tiempo real. Cada tarjeta incluye botón de acción rápida para guardar/quitar de favoritos y tap para navegar a la ficha técnica.
- **`DetailScreen`**: Vista profunda del instrumento que extrae parámetros fuertemente tipados con `useRoute<DetailScreenRouteProp>()`. Incluye botón dinámico interactivo en la tarjeta y en el header para alternar el estado en el store global de Zustand.

### 3. Tab 2: Guardados (Seguimiento Académico)
- **`SavedScreen`**: Renderiza exclusivamente los instrumentos guardados por el usuario.
- **Badge en tiempo real:** El Tab Bar muestra el conteo dinámico de elementos guardados obtenido directamente de Zustand sin prop drilling (`savedCount > 0 ? savedCount : undefined`).
- **Estado vacío personalizado:** Interfaz visual con botón "Explorar Catálogo" cuando no hay instrumentos guardados.
- **Limpieza masiva:** Botón "Limpiar" con diálogo de confirmación nativo (`Alert.alert`).

---

## 📸 Evidencias de la Aplicación en Expo Go (Android)

Las siguientes capturas documentan la aplicación de la **Semana 04** corriendo en un dispositivo móvil real a través de **Expo Go**, demostrando el **Catálogo**, el nuevo botón de acción rápida de guardado conectado a **Zustand**, y el **filtrado reactivo en tiempo real**:

| 1. Catálogo y Navegación | 2. Botón Guardar en Tarjetas | 3. Búsqueda y Filtrado en Vivo |
| :---: | :---: | :---: |
| ![Catálogo General](./images/pruebas1.jpeg) | ![Acción Guardar y Tabs](./images/pruebas2.jpeg) | ![Filtro en Vivo](./images/pruebas3.jpeg) |
| *HomeScreen con pestañas de navegación ("Catálogo" y "Guardados")* | *Tarjeta de instrumento con botón interactivo "Guardar" conectado al store* | *Filtrado en tiempo real con término de búsqueda "Viol" y contador dinámico* |

---

## 🔒 Tipado Estricto de Navegación y Store

```typescript
// src/navigation/types.ts
export type HomeStackParamList = {
  Home: undefined;
  Detail: {
    instrument: Instrument;
  };
};

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList> | undefined;
  SavedTab: undefined;
};

// src/stores/savedStore.ts
export interface SavedState {
  savedItems: Instrument[];
  addItem: (instrument: Instrument) => void;
  removeItem: (id: string) => void;
  toggleItem: (instrument: Instrument) => void;
  clearAll: () => void;
  isSaved: (id: string) => boolean;
}
```

---

## 📂 Estructura del Proyecto

```text
├── images/                       # Evidencias fotográficas en Expo Go
├── src/
│   ├── components/
│   │   └── ItemCard.tsx          # Tarjeta interactiva con botón de guardado y navegación
│   ├── data/
│   │   └── mockData.ts           # 12 instrumentos, 4 profesores y 3 estudiantes tipados
│   ├── navigation/
│   │   ├── RootNavigator.tsx     # Tab Navigator + Stack anidado con badge de Zustand
│   │   ├── AppNavigator.tsx      # Exportador compatible de RootNavigator
│   │   └── types.ts              # RootTabParamList, HomeStackParamList y ScreenProps
│   ├── screens/
│   │   ├── HomeScreen.tsx        # Catálogo FlatList con buscador y acción rápida de guardado
│   │   ├── DetailScreen.tsx      # Ficha técnica que consume useRoute y sincroniza con el store
│   │   └── SavedScreen.tsx       # Segunda pestaña con lista de guardados y estado vacío
│   ├── stores/
│   │   └── savedStore.ts         # Store global de Zustand (addItem, removeItem, toggleItem, clearAll)
│   ├── theme/
│   │   └── index.ts              # Constantes de diseño (COLORS, SPACING, TYPOGRAPHY, RADIUS, SIZES)
│   └── types/
│       └── index.ts              # Modelos de datos (Instrument, Teacher, Student)
├── .npmrc                        # Configuración pnpm (node-linker=hoisted)
├── app.json                      # Configuración de Expo
├── App.tsx                       # SafeAreaProvider + RootNavigator
├── index.ts                      # Entrypoint de Expo
├── package.json                  # Dependencias del proyecto (Expo SDK 57, React Navigation 7, Zustand 5)
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

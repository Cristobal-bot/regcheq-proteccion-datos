# Prompt para Claude Code — Integración Regcheq Protección de Datos

## Contexto

Tengo 7 módulos React independientes (total ~4,600 líneas) para un sistema de compliance de protección de datos personales (Ley 21.719 Chile). Cada módulo funciona standalone con su propio sidebar, header y estado. Necesito integrarlos en una aplicación React unificada con navegación funcional.

## Archivos del proyecto

```
src/
├── modules/
│   ├── Dashboard.jsx              # KPIs y métricas (650 líneas)
│   ├── ModuloRAT.jsx              # Inventario RAT + IA Copilot (1004 líneas)
│   ├── ModuloLicitud.jsx          # Motor de Licitud + IA Copilot (677 líneas)
│   ├── ModuloConsentimientos.jsx  # Gestión Consentimientos B2B + IA Copilot (661 líneas)
│   ├── ModuloEIPD.jsx             # Evaluación de Impacto EIPD (775 líneas)
│   └── ModuloARCO.jsx             # Derechos ARCO+ (817 líneas)
└── shared/
    ├── colors.js                  # Paleta de colores
    └── demoData.js                # Datos centralizados
```

## Sidebar definitivo (8 módulos)

```js
const sidebarItems = [
  { icon: "🏠", label: "Dashboard", id: "dashboard" },
  { icon: "📋", label: "Inventario RAT", id: "rat" },
  { icon: "⚖️", label: "Licitud", id: "licitud" },
  { icon: "📑", label: "Gestión Consent.", id: "consentimientos" },
  { icon: "🔒", label: "Riesgos (EIPD)", id: "eipd" },
  { icon: "📩", label: "Derechos ARCO+", id: "arco" },
  // Separador visual antes de Setup
  { icon: "⚙️", label: "Setup", id: "setup" }, // SOLO visible si usuario es superadmin
];
```

## Sistema de Roles y Áreas

### Selector de usuario en el Header
En el header de App.jsx, agregar un dropdown selector de usuario que permite cambiar entre los usuarios demo. Esto simula el login y permite demostrar el filtrado por área:

```jsx
// Usuarios demo (importar de src/shared/userContext.js)
const [currentUserId, setCurrentUserId] = useState("USR-001"); // Rebeca = superadmin

// En el header, mostrar el usuario actual con un <select> para cambiar:
<select value={currentUserId} onChange={e => setCurrentUserId(e.target.value)}>
  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} ({rol.nombre})</option>)}
</select>
```

### Lógica de acceso
- **Setup** solo aparece en sidebar si el usuario actual tiene rol `superadmin`
- Cada módulo recibe `currentUser` como prop (para futuro filtrado por área)
- Los roles definen qué módulos ve cada usuario (campo `modulos` en cada rol)
- Si el usuario tiene `veTodasAreas: false`, solo ve datos de su área

### Archivos nuevos
- `src/shared/userContext.js` — Datos de roles, áreas, usuarios, empresa
- `src/modules/ModuloSetup.jsx` — Panel de configuración (solo superadmin)

## Tareas de integración

### 1. Crear proyecto React + Vite
```bash
npm create vite@latest regcheq-app -- --template react
cd regcheq-app
npm install
```

### 2. Extraer Sidebar compartido
Cada módulo tiene su propio `Sidebar` idéntico. Extraer a `src/shared/Sidebar.jsx`:
- Props: `{ collapsed, onToggle, activeModule, onNavigate }`
- Los 7 items del sidebar (ver arriba)
- Click en cualquier item → llama `onNavigate(id)`

### 3. Crear App.jsx como router
```jsx
function App() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f8" }}>
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeModule={activeModule}
        onNavigate={setActiveModule}
      />
      <main style={{ flex: 1, marginLeft: sidebarCollapsed ? 56 : 210, transition: "margin-left 0.2s" }}>
        {activeModule === "dashboard" && <Dashboard />}
        {activeModule === "rat" && <ModuloRAT />}
        {activeModule === "licitud" && <ModuloLicitud />}
        {activeModule === "consentimientos" && <ModuloConsentimientos />}
        {activeModule === "eipd" && <ModuloEIPD />}
        {activeModule === "arco" && <ModuloARCO />}
      </main>
    </div>
  );
}
```

### 4. Refactorizar cada módulo
En CADA uno de los 7 módulos:
1. **Eliminar** el componente `Sidebar` interno
2. **Eliminar** el wrapper externo `<div style={{ display: "flex" }}>` que contiene Sidebar + contenido
3. **Eliminar** el `marginLeft` del contenido (App.jsx lo maneja)
4. **Conservar** el header con breadcrumb
5. **Conservar** TODO el estado interno, lógica de negocio, vistas, formularios
6. El componente exportado debe renderizar solo el contenido (header + body)

### 5. AI Copilot
Todos los 7 módulos tienen AI Copilot integrado (panel lateral derecho):
- El copilot es `position: fixed` a la derecha → no interfiere con layout
- El `marginRight: 380` cuando copilot está abierto se aplica dentro del módulo
- NO tocar la lógica del copilot, solo asegurar que siga funcionando

### 6. Adjunción de Archivos
Nuevo componente compartido en `src/shared/FileAttachments.jsx`. Debe integrarse en las vistas de detalle de todos los módulos:

**Cómo integrar:**
```jsx
import FileAttachments from '../shared/FileAttachments';

// En la vista de detalle de cada módulo, agregar después del contenido principal:
<FileAttachments modulo="rat" registroId="RAT-001" />
```

**Módulos y dónde agregar:**
- **RAT**: En `DetailView`, después de las categorías de datos
- **Licitud**: En `DetailView`, después de la sección de base legal
- **Consentimientos**: En `TitularDetail`, después del panel de evidencia
- **EIPD**: En `EIPDDetail`, después del paso de riesgo residual
- **ARCO+**: En `DetailView`, después del historial de gestión
- **Setup**: En `SeccionEmpresa`, al final

**Props del componente:**
- `modulo`: "rat" | "licitud" | "consentimientos" | "eipd" | "arco" | "setup"
- `registroId`: ID del registro (ej: "RAT-001", "LIC-002", "ARCO-003")
- `compact`: true para vista compacta (inline), false para vista completa (default)

**Funcionalidades:**
- Drag & drop de archivos
- Selector de categoría por módulo (ej: "Política de privacidad" en RAT, "Solicitud del titular" en ARCO+)
- Preview de imágenes en modal
- Descarga de archivos subidos
- Archivos demo pre-cargados por módulo
- FileReader real (archivos se almacenan en memoria del navegador)

### 7. IMPORTANTE — No modificar lógica interna
Cada módulo tiene lógica compleja (formularios multi-step, matrices de riesgo, ponderaciones, timelines, evidencia de auditoría). NO tocar esa lógica. Solo:
- Extraer sidebar duplicado
- Ajustar el layout wrapper
- Hacer que cada módulo sea un componente que se renderiza dentro del App.jsx

---

## Módulos y sus funcionalidades

| Módulo | IA Copilot | Funcionalidades principales |
|--------|-----------|---------------------------|
| Dashboard | ✅ | KPIs, score de cumplimiento, alertas, tendencias |
| Inventario RAT | ✅ | CRUD de actividades, ciclo de vida, clasificación datos, 4 pasos |
| Licitud | ✅ | 4 bases legales, ponderación interés legítimo, consentimientos por finalidad |
| Gestión Consent. | ✅ | Registro por titular, vista por RAT, revocaciones, evidencia/auditoría |
| Riesgos (EIPD) | ✅ | Amenazas, matriz de riesgo, controles, riesgo residual, bloqueo |
| Derechos ARCO+ | ✅ | 6 tipos de derecho, plazo 30 días, gestión de estado, historial |
| Setup | ❌ | Datos empresa, áreas, usuarios/roles, categorías datos. Solo superadmin |

## Design System

- **Font**: `'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif`
- **Sidebar**: 210px expandida / 56px colapsada, gradient navy
- **Header**: 52px sticky, breadcrumb
- **Content**: max-width 1200px, padding 22px 28px
- **AI Copilot**: 380px panel fijo derecho, accent #7c3aed
- **Estilos**: Todos inline (sin Tailwind, sin CSS externo)

## Para verificar

```bash
npm run dev
```

Checklist:
1. ✅ Sidebar navega entre los 8 módulos (7 + Setup)
2. ✅ Setup solo aparece si usuario es superadmin
3. ✅ Selector de usuario en el header permite cambiar entre usuarios demo
4. ✅ Cada módulo muestra su contenido completo
5. ✅ Sidebar se colapsa/expande
6. ✅ Copilot IA funciona en los 7 módulos principales
7. ✅ Vistas internas funcionan (crear, detalle, listas, tabs)
8. ✅ Header muestra breadcrumb correcto + usuario actual + rol
9. ✅ Módulo Setup tiene las 4 secciones: Empresa, Áreas, Usuarios, Categorías

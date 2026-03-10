// ============================================
// REGCHEQ — Sistema de Roles, Áreas y Usuarios
// Contexto compartido entre todos los módulos
// ============================================

// ===== ÁREAS / DEPARTAMENTOS =====
export const initialAreas = [
  { id: "rrhh", nombre: "Recursos Humanos", responsable: "Andrea Soto Vergara", email: "asoto@empresa.cl", color: "#3b82f6" },
  { id: "marketing", nombre: "Marketing", responsable: "Felipe Araya Muñoz", email: "faraya@empresa.cl", color: "#8b5cf6" },
  { id: "seguridad", nombre: "Seguridad", responsable: "Roberto Díaz Castillo", email: "rdiaz@empresa.cl", color: "#f97316" },
  { id: "riesgo", nombre: "Riesgo y Cumplimiento", responsable: "Carolina Méndez Ruiz", email: "cmendez@empresa.cl", color: "#10b981" },
  { id: "comercial", nombre: "Comercial", responsable: "Daniela Vargas Pinto", email: "dvargas@empresa.cl", color: "#06b6d4" },
  { id: "data", nombre: "Data Analytics", responsable: "Tomás Herrera Lagos", email: "therrera@empresa.cl", color: "#f59e0b" },
  { id: "servicio", nombre: "Servicio al Cliente", responsable: "Patricia Lobos Reyes", email: "plobos@empresa.cl", color: "#ef4444" },
];

// ===== ROLES =====
export const roles = [
  { id: "superadmin", nombre: "Super Administrador", desc: "Acceso total + Setup", icon: "👑", modulos: ["dashboard", "rat", "licitud", "consentimientos", "eipd", "arco", "setup"], veTodasAreas: true },
  { id: "admin", nombre: "Administrador", desc: "Acceso total sin Setup", icon: "🔑", modulos: ["dashboard", "rat", "licitud", "consentimientos", "eipd", "arco"], veTodasAreas: true },
  { id: "dpd", nombre: "Delegado Protección Datos", desc: "Todos los módulos, todas las áreas", icon: "🛡️", modulos: ["dashboard", "rat", "licitud", "consentimientos", "eipd", "arco"], veTodasAreas: true },
  { id: "responsable", nombre: "Responsable de Área", desc: "Solo su área", icon: "👤", modulos: ["dashboard", "rat", "licitud", "consentimientos", "eipd", "arco"], veTodasAreas: false },
  { id: "operador", nombre: "Operador", desc: "Solo ARCO+ y Consentimientos de su área", icon: "⚙️", modulos: ["dashboard", "arco", "consentimientos"], veTodasAreas: false },
];

// ===== USUARIOS DEMO =====
export const initialUsuarios = [
  { id: "USR-001", nombre: "Rebeca Lobos", email: "rlobos@empresa.cl", rol: "superadmin", area: null, activo: true, avatar: "R" },
  { id: "USR-002", nombre: "Carolina Méndez", email: "cmendez@empresa.cl", rol: "dpd", area: null, activo: true, avatar: "C" },
  { id: "USR-003", nombre: "Andrea Soto", email: "asoto@empresa.cl", rol: "responsable", area: "rrhh", activo: true, avatar: "A" },
  { id: "USR-004", nombre: "Felipe Araya", email: "faraya@empresa.cl", rol: "responsable", area: "marketing", activo: true, avatar: "F" },
  { id: "USR-005", nombre: "Roberto Díaz", email: "rdiaz@empresa.cl", rol: "responsable", area: "seguridad", activo: true, avatar: "R" },
  { id: "USR-006", nombre: "Tomás Herrera", email: "therrera@empresa.cl", rol: "operador", area: "data", activo: true, avatar: "T" },
  { id: "USR-007", nombre: "Patricia Lobos", email: "plobos@empresa.cl", rol: "operador", area: "servicio", activo: true, avatar: "P" },
];

// ===== DATOS DE LA EMPRESA =====
export const initialEmpresa = {
  razonSocial: "Empresa Demo SpA",
  rut: "76.123.456-7",
  giro: "Servicios tecnológicos",
  direccion: "Av. Providencia 1234, Of. 801, Providencia",
  representanteLegal: "Andrea Soto Vergara",
  rutRepresentante: "12.345.678-9",
  dpd: "Carolina Méndez Ruiz",
  emailDpd: "cmendez@empresa.cl",
  telefonoDpd: "+56 9 8765 4321",
  fechaRegistro: "2025-08-01",
  agenciaNotificada: false,
};

// ===== CATEGORÍAS PERSONALIZADAS =====
export const initialCategoriasConfig = [
  { id: "identificacion", nombre: "Identificación", sensible: false, activa: true, riesgoBase: "Bajo" },
  { id: "contacto", nombre: "Contacto", sensible: false, activa: true, riesgoBase: "Bajo" },
  { id: "financiero", nombre: "Financiero", sensible: false, activa: true, riesgoBase: "Medio" },
  { id: "crediticio", nombre: "Crediticio", sensible: false, activa: true, riesgoBase: "Medio" },
  { id: "laboral", nombre: "Laboral", sensible: false, activa: true, riesgoBase: "Bajo" },
  { id: "biometricos", nombre: "Biométricos", sensible: true, activa: true, riesgoBase: "Alto" },
  { id: "imagen", nombre: "Imagen", sensible: false, activa: true, riesgoBase: "Medio" },
  { id: "salud", nombre: "Salud", sensible: true, activa: true, riesgoBase: "Alto" },
  { id: "preferencias", nombre: "Preferencias", sensible: false, activa: true, riesgoBase: "Bajo" },
  { id: "transaccional", nombre: "Transaccional", sensible: false, activa: true, riesgoBase: "Bajo" },
  { id: "comportamental", nombre: "Comportamental", sensible: false, activa: true, riesgoBase: "Medio" },
  { id: "geolocalizacion", nombre: "Geolocalización", sensible: false, activa: true, riesgoBase: "Medio" },
  { id: "menores", nombre: "Menores de edad", sensible: true, activa: true, riesgoBase: "Alto" },
  { id: "etnico", nombre: "Origen étnico/racial", sensible: true, activa: false, riesgoBase: "Alto" },
  { id: "politico", nombre: "Afiliación política", sensible: true, activa: false, riesgoBase: "Alto" },
  { id: "sexual", nombre: "Orientación sexual", sensible: true, activa: false, riesgoBase: "Alto" },
];

// ===== MAPEO RAT → ÁREA =====
export const ratAreaMap = {
  "RAT-001": "rrhh",
  "RAT-002": "marketing",
  "RAT-003": "seguridad",
  "RAT-004": "riesgo",
  "RAT-005": "comercial",
  "RAT-006": "seguridad",
  "RAT-007": "servicio",
  "RAT-008": "data",
};

// ===== HELPER: Filtrar por área =====
export function filterByArea(items, userArea, veTodasAreas, areaKey = "area") {
  if (veTodasAreas || !userArea) return items;
  return items.filter(item => item[areaKey] === userArea);
}

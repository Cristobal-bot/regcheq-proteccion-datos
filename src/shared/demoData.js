// ============================================
// REGCHEQ — Datos compartidos entre módulos
// ============================================

export const ratActividades = [
  { id: "RAT-001", niref: "NIREF-2025-001", nombre: "Gestión de nómina y remuneraciones", responsable: "Departamento de Recursos Humanos", riesgo: "Medio", categorias: ["Identificación", "Contacto", "Financiero"], sensible: false },
  { id: "RAT-002", niref: "NIREF-2025-002", nombre: "Marketing directo por email", responsable: "Departamento de Marketing", riesgo: "Medio", categorias: ["Identificación", "Contacto", "Preferencias"], sensible: false },
  { id: "RAT-003", niref: "NIREF-2025-003", nombre: "Videovigilancia oficinas", responsable: "Departamento de Seguridad", riesgo: "Alto", categorias: ["Biométricos", "Imagen"], sensible: true },
  { id: "RAT-004", niref: "NIREF-2025-004", nombre: "Evaluación crediticia clientes", responsable: "Departamento de Riesgo", riesgo: "Alto", categorias: ["Identificación", "Financiero", "Crediticio"], sensible: false },
  { id: "RAT-005", niref: "NIREF-2025-005", nombre: "Programa de fidelización", responsable: "Departamento Comercial", riesgo: "Bajo", categorias: ["Identificación", "Contacto", "Preferencias", "Transaccional"], sensible: false },
  { id: "RAT-006", niref: "NIREF-2025-006", nombre: "Control de acceso biométrico", responsable: "Departamento de Seguridad", riesgo: "Alto", categorias: ["Biométricos", "Identificación"], sensible: true },
  { id: "RAT-007", niref: "NIREF-2025-007", nombre: "Atención de reclamos", responsable: "Departamento Servicio al Cliente", riesgo: "Bajo", categorias: ["Identificación", "Contacto"], sensible: false },
  { id: "RAT-008", niref: "NIREF-2025-008", nombre: "Perfilamiento automatizado de clientes", responsable: "Departamento Data Analytics", riesgo: "Alto", categorias: ["Identificación", "Transaccional", "Comportamental", "Preferencias"], sensible: false },
];

export const basesLicitud = [
  { id: "consentimiento", nombre: "Consentimiento", icon: "✋", art: "Art. 12°" },
  { id: "ejecucion_contrato", nombre: "Ejecución de Contrato", icon: "📄", art: "Art. 13° letra a)" },
  { id: "interes_legitimo", nombre: "Interés Legítimo", icon: "⚖️", art: "Art. 13° letra e)" },
  { id: "obligacion_legal", nombre: "Obligación Legal", icon: "🏛️", art: "Art. 13° letra c)" },
];

export const categoriasDisponibles = [
  "Identificación", "Contacto", "Financiero", "Crediticio", "Sensibles",
  "Biométricos", "Imagen", "Salud", "Preferencias", "Transaccional",
  "Comportamental", "Geolocalización", "Laboral", "Académico", "Menores de edad",
];

export const tiposDerechos = [
  { id: "acceso", nombre: "Acceso", icon: "👁️", art: "Art. 5°", plazo: 30 },
  { id: "rectificacion", nombre: "Rectificación", icon: "✏️", art: "Art. 6°", plazo: 30 },
  { id: "supresion", nombre: "Supresión", icon: "🗑️", art: "Art. 7°", plazo: 30 },
  { id: "bloqueo", nombre: "Bloqueo", icon: "🔒", art: "Art. 7° bis", plazo: 30 },
  { id: "portabilidad", nombre: "Portabilidad", icon: "📦", art: "Art. 9°", plazo: 30 },
  { id: "oposicion", nombre: "Oposición", icon: "🤖", art: "Art. 8° bis", plazo: 30 },
];

export const FECHA_SIMULADA = "2025-11-25";

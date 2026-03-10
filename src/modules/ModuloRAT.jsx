import { useState, useMemo, useRef, useEffect } from "react";

// ============================================
// REGCHEQ - Módulo de Inventario RAT + IA Copilot
// Registro de Actividades de Tratamiento
// Ley 21.719 - Chile
// ============================================

const C = {
  navyDark: "#141242", navyMid: "#1e1b5e", navyLight: "#3d3a8c",
  bg: "#f3f4f8", white: "#ffffff",
  text: "#141242", textSec: "#64668b", textMut: "#9b9db5",
  green: "#10b981", greenLt: "#d1fae5",
  yellow: "#f59e0b", yellowLt: "#fef3c7",
  red: "#ef4444", redLt: "#fee2e2",
  blue: "#3b82f6", blueLt: "#dbeafe",
  purple: "#8b5cf6", purpleLt: "#ede9fe",
  orange: "#f97316", orangeLt: "#ffedd5",
  border: "#e2e4ed",
  cardShadow: "0 1px 4px rgba(20,18,66,0.06)",
  ai: "#7c3aed", aiLt: "#ede9fe", aiGlow: "rgba(124,58,237,0.08)",
};

// ===== DEMO DATA =====
const initialActividades = [
  {
    id: "RAT-001", niref: "NIREF-2025-001", nombre: "Gestión de nómina y remuneraciones",
    descripcion: "Tratamiento de datos personales de trabajadores para el cálculo y pago de remuneraciones, cotizaciones previsionales y declaraciones tributarias.",
    responsable: "Departamento de Recursos Humanos", representanteLegal: "Andrea Soto Vergara", dpd: "Carolina Méndez Ruiz",
    recoleccion: true, almacenamiento: true, uso: true, destruccion: false,
    detalleRecoleccion: "Formulario de ingreso laboral y contrato de trabajo",
    detalleAlmacenamiento: "Base de datos RRHH encriptada, servidor local",
    detalleUso: "Cálculo de remuneraciones, emisión de liquidaciones, declaraciones al SII",
    detalleDestruccion: "",
    categorias: ["Identificación", "Contacto", "Financiero"],
    riesgo: "Medio", fechaCreacion: "2025-09-15", fechaAct: "2025-11-01", completo: true,
  },
  {
    id: "RAT-002", niref: "NIREF-2025-002", nombre: "Marketing directo por email",
    descripcion: "Envío de comunicaciones comerciales personalizadas a clientes y prospectos mediante correo electrónico.",
    responsable: "Departamento de Marketing", representanteLegal: "Andrea Soto Vergara", dpd: "Carolina Méndez Ruiz",
    recoleccion: true, almacenamiento: true, uso: true, destruccion: false,
    detalleRecoleccion: "Formulario web de suscripción con consentimiento expreso",
    detalleAlmacenamiento: "Plataforma Mailchimp (EEUU) con cláusulas contractuales tipo",
    detalleUso: "Segmentación y envío de campañas comerciales",
    detalleDestruccion: "",
    categorias: ["Identificación", "Contacto", "Preferencias"],
    riesgo: "Medio", fechaCreacion: "2025-09-20", fechaAct: "2025-11-05", completo: true,
  },
  {
    id: "RAT-003", niref: "NIREF-2025-003", nombre: "Videovigilancia oficinas",
    descripcion: "Captación y almacenamiento de imágenes mediante cámaras de seguridad en oficinas y accesos.",
    responsable: "Departamento de Seguridad", representanteLegal: "Andrea Soto Vergara", dpd: "Carolina Méndez Ruiz",
    recoleccion: true, almacenamiento: true, uso: true, destruccion: true,
    detalleRecoleccion: "Cámaras de circuito cerrado en áreas comunes",
    detalleAlmacenamiento: "DVR local con cifrado, acceso restringido",
    detalleUso: "Monitoreo de seguridad en tiempo real y revisión ante incidentes",
    detalleDestruccion: "Eliminación automática tras 30 días de grabación",
    categorias: ["Biométricos", "Imagen"],
    riesgo: "Alto", fechaCreacion: "2025-10-01", fechaAct: "2025-11-08", completo: true,
  },
  {
    id: "RAT-004", niref: "NIREF-2025-004", nombre: "Evaluación crediticia clientes",
    descripcion: "Análisis de antecedentes financieros y crediticios de clientes para evaluación de riesgo comercial.",
    responsable: "Departamento de Riesgo", representanteLegal: "Andrea Soto Vergara", dpd: "Carolina Méndez Ruiz",
    recoleccion: true, almacenamiento: true, uso: true, destruccion: false,
    detalleRecoleccion: "Consulta a bureaus de crédito y documentación del cliente",
    detalleAlmacenamiento: "Sistema de gestión de riesgo interno",
    detalleUso: "Scoring crediticio y decisión de otorgamiento",
    detalleDestruccion: "",
    categorias: ["Identificación", "Financiero", "Crediticio"],
    riesgo: "Alto", fechaCreacion: "2025-10-05", fechaAct: "2025-11-10", completo: false,
  },
  {
    id: "RAT-005", niref: "NIREF-2025-005", nombre: "Programa de fidelización",
    descripcion: "Gestión de programa de puntos y beneficios para clientes frecuentes.",
    responsable: "Departamento Comercial", representanteLegal: "Andrea Soto Vergara", dpd: "Carolina Méndez Ruiz",
    recoleccion: true, almacenamiento: true, uso: true, destruccion: false,
    detalleRecoleccion: "Registro voluntario en tienda o sitio web",
    detalleAlmacenamiento: "CRM Salesforce con medidas de seguridad estándar",
    detalleUso: "Acumulación de puntos, ofertas personalizadas",
    detalleDestruccion: "",
    categorias: ["Identificación", "Contacto", "Preferencias", "Transaccional"],
    riesgo: "Bajo", fechaCreacion: "2025-10-10", fechaAct: "2025-11-12", completo: true,
  },
  {
    id: "RAT-006", niref: "NIREF-2025-006", nombre: "Control de acceso biométrico",
    descripcion: "Registro de huella dactilar y reconocimiento facial para control de acceso a instalaciones.",
    responsable: "Departamento de Seguridad", representanteLegal: "Andrea Soto Vergara", dpd: "Carolina Méndez Ruiz",
    recoleccion: true, almacenamiento: true, uso: true, destruccion: false,
    detalleRecoleccion: "Captura de huella dactilar y foto al ingreso del personal",
    detalleAlmacenamiento: "Servidor biométrico dedicado con cifrado AES-256",
    detalleUso: "Validación de identidad en puntos de acceso",
    detalleDestruccion: "",
    categorias: ["Biométricos", "Identificación"],
    riesgo: "Alto", fechaCreacion: "2025-10-15", fechaAct: "2025-11-15", completo: false,
  },
  {
    id: "RAT-007", niref: "NIREF-2025-007", nombre: "Atención de reclamos",
    descripcion: "Recepción y gestión de reclamos de clientes con registro de datos de contacto y detalle del caso.",
    responsable: "Departamento Servicio al Cliente", representanteLegal: "Andrea Soto Vergara", dpd: "Carolina Méndez Ruiz",
    recoleccion: true, almacenamiento: true, uso: true, destruccion: false,
    detalleRecoleccion: "Formulario de reclamo presencial, web o telefónico",
    detalleAlmacenamiento: "Sistema de tickets Zendesk",
    detalleUso: "Gestión y resolución del reclamo, seguimiento",
    detalleDestruccion: "",
    categorias: ["Identificación", "Contacto"],
    riesgo: "Bajo", fechaCreacion: "2025-10-20", fechaAct: "2025-11-18", completo: true,
  },
  {
    id: "RAT-008", niref: "NIREF-2025-008", nombre: "Perfilamiento automatizado de clientes",
    descripcion: "Análisis automatizado de patrones de comportamiento y preferencias de compra para segmentación comercial.",
    responsable: "Departamento Data Analytics", representanteLegal: "Andrea Soto Vergara", dpd: "Carolina Méndez Ruiz",
    recoleccion: true, almacenamiento: true, uso: true, destruccion: false,
    detalleRecoleccion: "Tracking de navegación web, historial de compras, interacciones",
    detalleAlmacenamiento: "Data warehouse en nube (AWS)",
    detalleUso: "Modelos predictivos de comportamiento, recomendaciones automatizadas",
    detalleDestruccion: "",
    categorias: ["Identificación", "Transaccional", "Comportamental", "Preferencias"],
    riesgo: "Alto", fechaCreacion: "2025-11-01", fechaAct: "2025-11-20", completo: false,
  },
];

const categoriasDisponibles = [
  "Identificación", "Contacto", "Financiero", "Crediticio", "Sensibles",
  "Biométricos", "Imagen", "Salud", "Preferencias", "Transaccional",
  "Comportamental", "Geolocalización", "Laboral", "Académico", "Menores de edad",
];

const etapasVida = [
  { key: "recoleccion", label: "Recolección", icon: "📥", desc: "Cómo se obtienen los datos" },
  { key: "almacenamiento", label: "Almacenamiento", icon: "💾", desc: "Dónde y cómo se guardan" },
  { key: "uso", label: "Uso", icon: "⚙️", desc: "Para qué se utilizan" },
  { key: "destruccion", label: "Destrucción", icon: "🗑️", desc: "Cómo se eliminan definitivamente" },
];

// ====================================================================
// AI COPILOT - SIMULATED RESPONSES ENGINE
// ====================================================================
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// Contextual response database
const aiResponses = {
  // LIST VIEW responses
  list: {
    greet: "¡Hola! Soy tu asistente de protección de datos. Puedo ayudarte a:\n\n• Crear nuevas actividades RAT con sugerencias inteligentes\n• Analizar el estado de cumplimiento de tu inventario\n• Recomendar mejoras en actividades existentes\n• Resolver dudas sobre la Ley 21.719\n\n¿En qué te puedo ayudar?",
    analisis: "📊 **Análisis de tu inventario RAT:**\n\nTienes 8 actividades registradas. Aquí va mi diagnóstico:\n\n🔴 **3 actividades de riesgo alto** sin EIPD vinculada — esto es una brecha de cumplimiento prioritaria.\n\n🟡 **3 actividades incompletas** (RAT-004, RAT-006, RAT-008) — les faltan campos obligatorios para cumplir Art. 8°.\n\n🟢 **5 actividades completas** — buen avance.\n\n⚠️ **RAT-008 (Perfilamiento automatizado)** es la más crítica: combina riesgo alto + decisiones automatizadas + sin base de licitud asignada. Recomiendo priorizarla.\n\n¿Quieres que te ayude a completar alguna de estas actividades?",
    sugerencias: "💡 **Actividades que podrían faltar en tu inventario:**\n\nBasándome en tu industria y las actividades existentes, sugiero revisar si realizan:\n\n1. **Gestión de candidatos (reclutamiento)** — Si reciben CVs, hay tratamiento de datos personales que debe registrarse.\n\n2. **Transferencia internacional de datos** — Usan Mailchimp (EEUU) y AWS. Cada transferencia debería documentarse.\n\n3. **Registro de visitantes** — Si controlan acceso a oficinas, los datos de visitantes también aplican.\n\n4. **Gestión de proveedores** — Datos de contacto de personas naturales en empresas proveedoras.\n\n¿Quieres que pre-llene alguna de estas actividades?",
    cumplimiento: "📋 **Score de cumplimiento RAT:**\n\n| Criterio | Estado |\n|---|---|\n| Actividades registradas | ✅ 8/8 identificadas |\n| Campos completos | ⚠️ 5/8 (62.5%) |\n| EIPD en riesgo alto | ❌ 0/4 vinculadas |\n| Base de licitud asignada | ⚠️ 6/8 (75%) |\n| DPD designado | ✅ Sí |\n| Ciclo de vida mapeado | ✅ 8/8 |\n\n**Score general: 65%** — Necesitas completar las actividades pendientes y vincular las EIPD para llegar al 80% mínimo recomendado.",
  },

  // CREATE STEP 1 responses
  step1: {
    greet: "📝 Estás creando una nueva actividad RAT. En este paso defines la **identificación y trazabilidad**.\n\nPuedo ayudarte a:\n• Sugerir un nombre adecuado según el tipo de tratamiento\n• Redactar la descripción según estándares de la ley\n• Evaluar el nivel de riesgo inicial\n\nDescríbeme brevemente qué tratamiento de datos quieres registrar.",
    nombre: (desc) => {
      if (!desc) return "Dame una descripción breve del tratamiento que quieres registrar y te sugeriré un nombre estandarizado.";
      // Simulated smart response based on keywords
      const lower = desc.toLowerCase();
      if (lower.includes("empleado") || lower.includes("trabajador") || lower.includes("rrhh") || lower.includes("personal")) {
        return "📝 Basándome en tu descripción, sugiero:\n\n**Nombre:** \"Gestión de datos de personal y relación laboral\"\n\n**Descripción sugerida:**\n\"Tratamiento de datos personales de trabajadores y colaboradores en el contexto de la relación laboral, incluyendo administración de contratos, control de asistencia y gestión de beneficios.\"\n\n**Riesgo sugerido:** Medio\n— Involucra datos laborales que pueden incluir información sensible (salud, afiliación sindical).\n\n¿Quieres que aplique estas sugerencias?";
      }
      if (lower.includes("cliente") || lower.includes("venta") || lower.includes("comercial") || lower.includes("crm")) {
        return "📝 Basándome en tu descripción, sugiero:\n\n**Nombre:** \"Gestión comercial y relación con clientes\"\n\n**Descripción sugerida:**\n\"Tratamiento de datos personales de clientes actuales y potenciales para la gestión de relaciones comerciales, seguimiento de oportunidades de venta y servicio post-venta.\"\n\n**Riesgo sugerido:** Medio\n— Datos comerciales estándar, pero el volumen puede requerir controles adicionales.\n\n¿Quieres que aplique estas sugerencias?";
      }
      if (lower.includes("web") || lower.includes("cookie") || lower.includes("naveg") || lower.includes("analytic")) {
        return "📝 Basándome en tu descripción, sugiero:\n\n**Nombre:** \"Analítica web y cookies de seguimiento\"\n\n**Descripción sugerida:**\n\"Recolección y análisis de datos de navegación de usuarios del sitio web mediante cookies y herramientas de analítica, incluyendo dirección IP, comportamiento de navegación y preferencias.\"\n\n**Riesgo sugerido:** Alto\n— El perfilamiento web requiere consentimiento expreso y puede constituir decisión automatizada (Art. 8° bis).\n\n⚠️ **Alerta:** Si usan Google Analytics, hay transferencia internacional a EEUU que debe documentarse.\n\n¿Quieres que aplique estas sugerencias?";
      }
      if (lower.includes("salud") || lower.includes("médic") || lower.includes("clinic") || lower.includes("paciente")) {
        return "📝 Basándome en tu descripción, sugiero:\n\n**Nombre:** \"Gestión de datos de salud y ficha médica\"\n\n**Descripción sugerida:**\n\"Tratamiento de datos personales de salud en el contexto de atención médica, incluyendo historial clínico, diagnósticos, tratamientos y prescripciones médicas.\"\n\n**Riesgo sugerido:** Alto\n— 🔴 Datos de salud son **datos sensibles** según Art. 16° bis. Requiere EIPD obligatoria, medidas de seguridad reforzadas y base de licitud específica.\n\n¿Quieres que aplique estas sugerencias?";
      }
      return "📝 Basándome en tu descripción, sugiero:\n\n**Nombre:** \"Tratamiento de datos personales — " + desc.slice(0, 40) + "\"\n\n**Descripción sugerida:**\n\"Tratamiento de datos personales en el contexto de " + desc.toLowerCase() + ", conforme a los principios de finalidad, proporcionalidad y temporalidad establecidos en la Ley 21.719.\"\n\nPara sugerirte el nivel de riesgo necesito saber:\n1. ¿Qué tipos de datos se tratan? (identificación, financieros, biométricos...)\n2. ¿Cuántos titulares involucra aproximadamente?\n3. ¿Hay decisiones automatizadas?\n\n¿Quieres que aplique el nombre y descripción?";
    },
    riesgo: "📊 **Criterios para evaluar el riesgo inicial:**\n\n🟢 **Bajo:** Datos de contacto básicos, pocos titulares, sin datos sensibles, sin transferencia internacional.\n\n🟡 **Medio:** Datos financieros o laborales, volumen medio de titulares, tratamiento estándar sin perfilamiento.\n\n🔴 **Alto** (requiere EIPD obligatoria):\n• Datos sensibles (salud, biométricos, origen étnico)\n• Evaluación sistemática de aspectos personales\n• Tratamiento a gran escala\n• Vigilancia sistemática de zona pública\n• Decisiones automatizadas con efectos jurídicos\n• Datos de menores de 16 años\n\nSegún Art. 18° Ley 21.719, si es riesgo alto, deberás completar una EIPD antes de iniciar el tratamiento.",
  },

  // CREATE STEP 2 responses
  step2: {
    greet: "👥 Ahora defines los **actores** del tratamiento. Puedo orientarte sobre:\n\n• Quién debe ser el Responsable del tratamiento\n• Cuándo es obligatorio designar un DPD\n• Rol del Representante Legal\n\n¿Necesitas ayuda con alguno de estos roles?",
    dpd: "🏛️ **¿Cuándo es obligatorio el DPD?** (Art. 31° Ley 21.719)\n\nEl Delegado de Protección de Datos es **obligatorio** cuando:\n\n1. **Organismos públicos** — Siempre, sin excepción.\n2. **Tratamiento a gran escala** de datos sensibles o biométricos.\n3. **Monitoreo habitual y sistemático** de titulares a gran escala.\n\n💡 **Recomendación:** Aunque no sea obligatorio, designar un DPD es una buena práctica que demuestra accountability. Para empresas medianas, puede ser un rol compartido (no necesariamente exclusivo).\n\n**Funciones del DPD:**\n• Informar y asesorar al responsable\n• Supervisar el cumplimiento\n• Ser punto de contacto con la Agencia de Protección de Datos\n• Cooperar con la autoridad de control",
    responsable: "⚖️ **Sobre el Responsable del tratamiento:**\n\nEl responsable es quien **decide los fines y medios** del tratamiento. Según la Ley 21.719:\n\n• Debe ser la **unidad organizacional** que efectivamente toma las decisiones sobre el tratamiento.\n• No confundir con el \"encargado\" (quien procesa datos por cuenta del responsable).\n\n**Ejemplo:** Si Marketing decide hacer una campaña de email, el Departamento de Marketing es el responsable, aunque TI gestione los servidores.\n\n¿Te ayudo a identificar el responsable correcto para tu actividad?",
  },

  // CREATE STEP 3 responses
  step3: {
    greet: "🔄 En este paso mapeas el **ciclo de vida del dato**. Esto es clave para cumplir el principio de temporalidad.\n\nPuedo ayudarte a:\n• Describir cada etapa correctamente\n• Sugerir plazos de retención según la ley\n• Identificar si falta la etapa de destrucción\n\n¿Qué etapas aplican a tu actividad?",
    destruccion: "🗑️ **Sobre la etapa de destrucción:**\n\nLa Ley 21.719 establece el **principio de temporalidad**: los datos solo pueden conservarse durante el período necesario para la finalidad del tratamiento.\n\n⚠️ **Veo que no activaste la destrucción.** Esto podría ser un problema de cumplimiento salvo que:\n\n1. Exista una **obligación legal** de retención (ej: datos tributarios por 6 años).\n2. Los datos sean **anonimizados** al finalizar su uso.\n3. El titular haya consentido una retención extendida.\n\n💡 **Recomendación:** Siempre define un plazo de retención y un método de destrucción. Ejemplos:\n• \"Eliminación segura tras 5 años desde el término de la relación laboral\"\n• \"Anonimización estadística tras 2 años de inactividad del cliente\"\n• \"Borrado automático a los 30 días (videovigilancia)\"\n\n¿Quieres que sugiera un plazo de retención para tu actividad?",
    recoleccion: (desc) => {
      if (!desc) return "Describe brevemente cómo se recolectan los datos y te ayudaré a redactar esta sección correctamente.";
      return "📥 **Sugerencia para Recolección:**\n\nBasándome en tu descripción, asegúrate de documentar:\n\n1. **Medio de recolección**: formulario web, presencial, API, etc.\n2. **Momento de obtención del consentimiento** (si aplica)\n3. **Información entregada al titular** al momento de recolectar\n\nSegún Art. 14° Ley 21.719, al recolectar datos debes informar:\n• Identidad del responsable\n• Finalidad del tratamiento\n• Categorías de datos tratados\n• Destinatarios o categorías de destinatarios\n• Plazo de conservación\n• Derechos del titular (ARCO+)\n\n¿Quieres que redacte un texto modelo para esta etapa?";
    },
  },

  // CREATE STEP 4 responses
  step4: {
    greet: "📂 Último paso: **clasificar los datos**. Esto determina las obligaciones de seguridad y si necesitas EIPD.\n\nPuedo ayudarte a:\n• Identificar categorías que podrías estar omitiendo\n• Alertarte sobre datos sensibles y sus implicancias\n• Evaluar si necesitas EIPD obligatoria\n\n¿Sobre qué tipo de personas tratan los datos?",
    sensibles: "🔴 **Datos sensibles detectados.**\n\nSegún Art. 16° bis Ley 21.719, los datos sensibles incluyen:\n• Origen racial o étnico\n• Opiniones políticas\n• Convicciones religiosas o filosóficas\n• Afiliación sindical\n• **Datos biométricos** (huella, rostro)\n• **Datos de salud**\n• Vida sexual u orientación sexual\n\n**Implicancias inmediatas:**\n1. ✅ EIPD **obligatoria** antes de iniciar el tratamiento\n2. ✅ Medidas de seguridad **reforzadas** (cifrado, control de acceso estricto)\n3. ✅ Base de licitud **específica** (consentimiento explícito o excepción legal)\n4. ✅ Notificación a la Agencia en caso de brecha\n\n⚠️ No puedes tratar estos datos sin completar primero el módulo de Riesgos (EIPD).",
    categorias: (nombre, desc) => {
      const lower = (nombre + " " + desc).toLowerCase();
      let sugerencias = [];
      if (lower.includes("nómina") || lower.includes("remuneración") || lower.includes("laboral") || lower.includes("rrhh")) {
        sugerencias = ["Identificación", "Contacto", "Financiero", "Laboral"];
        if (lower.includes("salud") || lower.includes("licencia")) sugerencias.push("Salud");
      } else if (lower.includes("marketing") || lower.includes("email") || lower.includes("comercial")) {
        sugerencias = ["Identificación", "Contacto", "Preferencias"];
        if (lower.includes("web") || lower.includes("cookie")) sugerencias.push("Comportamental");
      } else if (lower.includes("video") || lower.includes("cámara") || lower.includes("vigilancia")) {
        sugerencias = ["Biométricos", "Imagen"];
      } else if (lower.includes("biométric") || lower.includes("huella") || lower.includes("facial")) {
        sugerencias = ["Biométricos", "Identificación"];
      } else if (lower.includes("crédito") || lower.includes("financier") || lower.includes("scoring")) {
        sugerencias = ["Identificación", "Financiero", "Crediticio"];
      } else {
        sugerencias = ["Identificación", "Contacto"];
      }
      return `📂 **Categorías sugeridas para "${nombre || "esta actividad"}":**\n\n${sugerencias.map(s => `• ✅ **${s}**`).join("\n")}\n\n${sugerencias.some(s => ["Biométricos", "Salud", "Sensibles"].includes(s)) ? "🔴 **Atención:** Incluye datos sensibles. Se activará EIPD obligatoria.\n\n" : ""}💡 Revisa si también aplican:\n• **Geolocalización** — si rastrean ubicación\n• **Menores de edad** — si los titulares pueden ser menores de 16\n• **Comportamental** — si hay perfilamiento o tracking\n\n¿Quieres que seleccione estas categorías automáticamente?`;
    },
  },

  // DETAIL VIEW responses
  detail: {
    analizar: (act) => {
      const issues = [];
      if (!act.completo) issues.push("❌ La actividad está **incompleta** — faltan campos obligatorios.");
      if (act.riesgo === "Alto") issues.push("🔴 Riesgo **Alto** — Requiere EIPD obligatoria (Art. 18°).");
      if (act.categorias.some(c => ["Biométricos", "Sensibles", "Salud"].includes(c))) issues.push("⚠️ Contiene **datos sensibles** — Medidas de seguridad reforzadas obligatorias.");
      if (!act.destruccion) issues.push("🟡 No tiene **etapa de destrucción** definida — Posible incumplimiento del principio de temporalidad.");
      if (act.categorias.includes("Menores de edad")) issues.push("🔴 Involucra **menores de edad** — Requiere consentimiento parental.");
      
      const score = Math.max(0, 100 - issues.length * 18);
      return `🔍 **Análisis de ${act.nombre}:**\n\n**Score de cumplimiento: ${score}%** ${"█".repeat(Math.round(score/10))}${"░".repeat(10-Math.round(score/10))}\n\n${issues.length > 0 ? "**Hallazgos:**\n" + issues.join("\n") : "✅ No se detectaron problemas. La actividad cumple con los requisitos básicos."}\n\n${issues.length > 0 ? "\n**Próximos pasos recomendados:**\n" + issues.map((_, i) => `${i+1}. Resolver el hallazgo ${i+1} antes de poner en producción`).join("\n") : "💡 Considera programar una revisión periódica cada 6 meses."}`;
    },
    descripcion: (act) => `📝 **Descripción mejorada sugerida:**\n\n"${act.descripcion}"\n\n**Versión optimizada:**\n"Actividad de tratamiento consistente en ${act.descripcion.charAt(0).toLowerCase() + act.descripcion.slice(1)}${act.descripcion.endsWith(".") ? "" : "."} El tratamiento abarca las etapas de ${[act.recoleccion && "recolección", act.almacenamiento && "almacenamiento", act.uso && "uso", act.destruccion && "destrucción"].filter(Boolean).join(", ")}, involucrando datos de categoría ${act.categorias.join(", ")}. El nivel de riesgo ha sido evaluado como ${act.riesgo.toLowerCase()}, bajo la responsabilidad de ${act.responsable}."\n\n¿Quieres que actualice la descripción?`,
  },

  // General Q&A
  general: {
    ley: "📜 **Resumen Ley 21.719 — Lo esencial:**\n\nLa Ley 21.719 moderniza la protección de datos personales en Chile. Puntos clave:\n\n1. **Principios** (Art. 3°): Licitud, finalidad, proporcionalidad, calidad, responsabilidad, seguridad, transparencia, confidencialidad.\n\n2. **RAT obligatorio** (Art. 8°): Todo responsable debe mantener un registro actualizado de actividades de tratamiento.\n\n3. **Bases de licitud** (Art. 13°): Consentimiento, contrato, obligación legal, interés legítimo, interés vital, función pública.\n\n4. **Derechos ARCO+** (Arts. 5°-10°): Acceso, rectificación, supresión, oposición, portabilidad, bloqueo.\n\n5. **EIPD** (Art. 18°): Obligatoria para tratamientos de alto riesgo.\n\n6. **Sanciones**: Hasta 20.000 UTM (~$1.300M CLP) por infracciones graves.\n\n¿Sobre qué tema quieres profundizar?",
    transferencia: "🌍 **Transferencia internacional de datos:**\n\nSegún Art. 27° Ley 21.719, puedes transferir datos al extranjero cuando:\n\n1. El país receptor tiene **nivel adecuado** de protección\n2. Existen **cláusulas contractuales tipo** aprobadas\n3. El titular dio **consentimiento expreso**\n4. Es necesaria para la ejecución de un **contrato**\n\n⚠️ En tu inventario detecto:\n• **Mailchimp (EEUU)** en RAT-002\n• **AWS (EEUU)** en RAT-008\n• **Salesforce (EEUU)** en RAT-005\n\nRecomiendo documentar las garantías de cada transferencia.",
    sanciones: "⚖️ **Régimen sancionatorio Ley 21.719:**\n\n| Tipo | Monto máximo | Ejemplo |\n|---|---|---|\n| Leves | 100 UTM (~$6.5M) | No mantener RAT actualizado |\n| Graves | 5.000 UTM (~$325M) | Tratar datos sin base de licitud |\n| Gravísimas | 20.000 UTM (~$1.300M) | Tratar datos sensibles sin cumplir requisitos |\n\n**Agravantes:**\n• Reincidencia\n• Afectación a menores\n• Gran volumen de datos\n\n**Atenuantes:**\n• Colaboración con la Agencia\n• Adopción de medidas correctivas\n• Programa de cumplimiento implementado\n\nMantener el RAT completo y actualizado es tu primera línea de defensa.",
  },
};

// Simulated AI response matcher
function getAIResponse(message, context) {
  const lower = message.toLowerCase().trim();
  const { currentView, step, form, actividad } = context;

  // General questions (work in any view)
  if (lower.includes("ley 21.719") || lower.includes("ley") && lower.includes("protección")) return aiResponses.general.ley;
  if (lower.includes("sancion") || lower.includes("multa")) return aiResponses.general.sanciones;
  if (lower.includes("transferencia internacional") || lower.includes("dato") && lower.includes("extranjero")) return aiResponses.general.transferencia;

  // List view
  if (currentView === "list") {
    if (lower.includes("anali") || lower.includes("diagnóstico") || lower.includes("estado")) return aiResponses.list.analisis;
    if (lower.includes("suger") || lower.includes("falt") || lower.includes("qué me falta") || lower.includes("nueva")) return aiResponses.list.sugerencias;
    if (lower.includes("cumplimiento") || lower.includes("score") || lower.includes("nota")) return aiResponses.list.cumplimiento;
    return aiResponses.list.greet;
  }

  // Create view
  if (currentView === "create") {
    if (step === 1) {
      if (lower.includes("riesgo") || lower.includes("nivel") || lower.includes("evaluar riesgo")) return aiResponses.step1.riesgo;
      if (lower.includes("nombre") || lower.includes("descripción") || lower.includes("sugi") || lower.includes("ayuda") || lower.includes("cómo")) {
        return aiResponses.step1.nombre(form?.descripcion || form?.nombre || message);
      }
      if (form?.nombre || form?.descripcion) return aiResponses.step1.nombre(form?.descripcion || form?.nombre);
      return aiResponses.step1.greet;
    }
    if (step === 2) {
      if (lower.includes("dpd") || lower.includes("delegado")) return aiResponses.step2.dpd;
      if (lower.includes("responsable") || lower.includes("quién")) return aiResponses.step2.responsable;
      return aiResponses.step2.greet;
    }
    if (step === 3) {
      if (lower.includes("destruc") || lower.includes("retención") || lower.includes("elimina") || lower.includes("plazo")) return aiResponses.step3.destruccion;
      if (lower.includes("recolec")) return aiResponses.step3.recoleccion(form?.detalleRecoleccion);
      return aiResponses.step3.greet;
    }
    if (step === 4) {
      if (lower.includes("sensib") || lower.includes("biométr") || lower.includes("salud")) return aiResponses.step4.sensibles;
      if (lower.includes("categ") || lower.includes("qué dato") || lower.includes("sugi") || lower.includes("recomienda")) {
        return aiResponses.step4.categorias(form?.nombre, form?.descripcion);
      }
      return aiResponses.step4.greet;
    }
  }

  // Detail view
  if (currentView === "detail" && actividad) {
    if (lower.includes("anali") || lower.includes("cumpl") || lower.includes("revis") || lower.includes("evalú")) return aiResponses.detail.analizar(actividad);
    if (lower.includes("descripción") || lower.includes("mejor") || lower.includes("redact")) return aiResponses.detail.descripcion(actividad);
    return aiResponses.detail.analizar(actividad);
  }

  return "Entiendo tu consulta. ¿Podrías ser más específico? Puedo ayudarte con:\n\n• Analizar actividades existentes\n• Sugerir mejoras de cumplimiento\n• Resolver dudas sobre la Ley 21.719\n• Asistir en la creación de nuevas actividades RAT";
}

// Quick action buttons by context
function getQuickActions(currentView, step) {
  if (currentView === "list") return [
    { label: "📊 Analizar inventario", msg: "Analiza el estado de mi inventario RAT" },
    { label: "💡 Sugerir actividades faltantes", msg: "¿Qué actividades podrían faltar?" },
    { label: "📋 Score de cumplimiento", msg: "¿Cuál es mi score de cumplimiento?" },
    { label: "⚖️ Resumen Ley 21.719", msg: "Dame un resumen de la Ley 21.719" },
  ];
  if (currentView === "create" && step === 1) return [
    { label: "✨ Sugerir nombre y descripción", msg: "Sugiere un nombre para esta actividad" },
    { label: "📊 Evaluar nivel de riesgo", msg: "¿Cómo evalúo el nivel de riesgo?" },
  ];
  if (currentView === "create" && step === 2) return [
    { label: "👤 ¿Quién es el responsable?", msg: "¿Quién debe ser el responsable?" },
    { label: "🏛️ ¿Es obligatorio el DPD?", msg: "¿Cuándo es obligatorio el DPD?" },
  ];
  if (currentView === "create" && step === 3) return [
    { label: "🗑️ ¿Falta destrucción?", msg: "¿Necesito definir la destrucción?" },
    { label: "📥 Ayuda con recolección", msg: "Ayúdame a redactar la recolección" },
  ];
  if (currentView === "create" && step === 4) return [
    { label: "📂 Sugerir categorías", msg: "¿Qué categorías recomiendas?" },
    { label: "🔴 ¿Qué son datos sensibles?", msg: "¿Qué datos son sensibles?" },
  ];
  if (currentView === "detail") return [
    { label: "🔍 Analizar cumplimiento", msg: "Analiza el cumplimiento de esta actividad" },
    { label: "📝 Mejorar descripción", msg: "Mejora la descripción de esta actividad" },
  ];
  return [];
}

// ====================================================================
// AI COPILOT PANEL COMPONENT
// ====================================================================
const AICopilot = ({ open, onToggle, currentView, step, form, actividad }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState({});
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Auto-greet on context change
  useEffect(() => {
    const key = `${currentView}-${step || ""}`;
    if (!hasGreeted[key] && open) {
      const greetMsg = getAIResponse("", { currentView, step, form, actividad });
      setMessages(prev => [...prev, { role: "ai", text: greetMsg, ts: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) }]);
      setHasGreeted(prev => ({ ...prev, [key]: true }));
    }
  }, [currentView, step, open]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", text, ts: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    await delay(600 + Math.random() * 900);

    const response = getAIResponse(text, { currentView, step, form, actividad });
    setMessages(prev => [...prev, { role: "ai", text: response, ts: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) }]);
    setTyping(false);
  };

  const quickActions = getQuickActions(currentView, step);

  // Floating toggle button
  if (!open) {
    return (
      <button onClick={onToggle} style={{
        position: "fixed", right: 20, bottom: 20, width: 54, height: 54, borderRadius: "50%",
        background: `linear-gradient(135deg, ${C.ai} 0%, #9333ea 100%)`, border: "none",
        color: "#fff", fontSize: 22, cursor: "pointer", zIndex: 200,
        boxShadow: `0 4px 20px ${C.ai}66`, display: "flex", alignItems: "center", justifyContent: "center",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = `0 6px 28px ${C.ai}88`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = `0 4px 20px ${C.ai}66`; }}
      >
        🤖
      </button>
    );
  }

  // Render markdown-like formatting (bold, bullet points)
  const renderText = (text) => {
    return text.split("\n").map((line, i) => {
      let processed = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\|(.*?)\|/g, '<span style="padding:2px 6px;border-bottom:1px solid #e2e4ed;display:inline-block;font-size:11px">$1</span>');
      const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-") || /^\d+\./.test(line.trim());
      return (
        <div key={i} style={{
          marginBottom: line.trim() === "" ? 6 : 2,
          paddingLeft: isBullet ? 4 : 0,
          lineHeight: 1.55,
        }} dangerouslySetInnerHTML={{ __html: processed }} />
      );
    });
  };

  return (
    <div style={{
      position: "fixed", right: 0, top: 0, bottom: 0, width: 380, zIndex: 200,
      background: C.white, borderLeft: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column",
      boxShadow: "-4px 0 30px rgba(20,18,66,0.08)",
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 18px", borderBottom: `1px solid ${C.border}`,
        background: `linear-gradient(135deg, ${C.ai}08 0%, ${C.ai}04 100%)`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.ai} 0%, #9333ea 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>🤖</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Asistente IA</div>
            <div style={{ fontSize: 10, color: C.ai, fontWeight: 600 }}>Protección de Datos · RAT</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => { setMessages([]); setHasGreeted({}); }} title="Limpiar chat"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: C.textMut, padding: 4 }}>🗑️</button>
          <button onClick={onToggle}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.textMut, padding: 4 }}>✕</button>
        </div>
      </div>

      {/* Context indicator */}
      <div style={{
        padding: "8px 18px", background: C.aiGlow, borderBottom: `1px solid ${C.border}`,
        fontSize: 11, color: C.ai, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.ai, display: "inline-block" }} />
        {currentView === "list" && "Vista: Listado de actividades"}
        {currentView === "create" && `Creando actividad · Paso ${step}: ${["", "Identificación", "Actores", "Ciclo de Vida", "Clasificación"][step]}`}
        {currentView === "detail" && `Detalle: ${actividad?.nombre || ""}`}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "14px 18px",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px 10px", color: C.textMut, fontSize: 12 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
            <div style={{ fontWeight: 600, color: C.textSec, marginBottom: 4 }}>Asistente IA de Regcheq</div>
            <div>Pregúntame sobre protección de datos, la Ley 21.719, o usa las acciones rápidas abajo.</div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "100%",
          }}>
            <div style={{
              maxWidth: "92%",
              padding: "10px 14px", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              background: msg.role === "user" ? C.navyDark : C.bg,
              color: msg.role === "user" ? "#fff" : C.text,
              fontSize: 12.5, lineHeight: 1.5,
            }}>
              {msg.role === "ai" ? renderText(msg.text) : msg.text}
              <div style={{
                fontSize: 9, marginTop: 4,
                color: msg.role === "user" ? "rgba(255,255,255,0.5)" : C.textMut,
                textAlign: "right",
              }}>{msg.ts}</div>
            </div>
          </div>
        ))}

        {typing && (
          <div style={{
            display: "flex", justifyContent: "flex-start",
          }}>
            <div style={{
              padding: "10px 14px", borderRadius: "14px 14px 14px 4px",
              background: C.bg, fontSize: 12.5,
            }}>
              <span style={{ display: "inline-flex", gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: "50%", background: C.ai,
                    opacity: 0.4, display: "inline-block",
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick actions */}
      {quickActions.length > 0 && (
        <div style={{
          padding: "8px 14px", borderTop: `1px solid ${C.border}`,
          display: "flex", gap: 6, flexWrap: "wrap", background: C.aiGlow,
        }}>
          {quickActions.map((qa, i) => (
            <button key={i} onClick={() => sendMessage(qa.msg)} style={{
              padding: "5px 10px", borderRadius: 14, border: `1px solid ${C.ai}33`,
              background: C.white, color: C.ai, fontSize: 11, fontWeight: 600,
              cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.aiLt; e.currentTarget.style.borderColor = C.ai; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = `${C.ai}33`; }}
            >{qa.label}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: "12px 14px", borderTop: `1px solid ${C.border}`, background: C.white,
        display: "flex", gap: 8, alignItems: "flex-end",
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Pregunta sobre protección de datos..."
          rows={1}
          style={{
            flex: 1, padding: "9px 12px", borderRadius: 10,
            border: `1.5px solid ${C.border}`, fontSize: 13, color: C.text,
            resize: "none", fontFamily: "inherit", outline: "none",
            maxHeight: 80, overflowY: "auto",
          }}
          onFocus={e => e.currentTarget.style.borderColor = C.ai}
          onBlur={e => e.currentTarget.style.borderColor = C.border}
        />
        <button onClick={() => sendMessage(input)} disabled={!input.trim()} style={{
          width: 36, height: 36, borderRadius: 10, border: "none",
          background: input.trim() ? `linear-gradient(135deg, ${C.ai} 0%, #9333ea 100%)` : C.bg,
          color: input.trim() ? "#fff" : C.textMut,
          cursor: input.trim() ? "pointer" : "default", fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
        }}>➤</button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
};

// ====================================================================
// MAIN MODULE (same structure, adjusted for copilot width)
// ====================================================================

const sidebarItems = [
  { icon: "🏠", label: "Dashboard", id: "dashboard" },
  { icon: "📋", label: "Inventario RAT", id: "rat", active: true },
  { icon: "⚖️", label: "Licitud", id: "licitud" },
  { icon: "🔒", label: "Riesgos (EIPD)", id: "eipd" },
  { icon: "📩", label: "Derechos ARCO+", id: "arco" },
];

const Sidebar = ({ collapsed, onToggle }) => (
  <div style={{
    width: collapsed ? 56 : 210, minHeight: "100vh",
    background: `linear-gradient(180deg, ${C.navyDark} 0%, ${C.navyMid} 100%)`,
    color: "#fff", display: "flex", flexDirection: "column",
    position: "fixed", left: 0, top: 0, zIndex: 100, transition: "width 0.2s",
  }}>
    <div style={{ padding: collapsed ? "18px 8px" : "18px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
      {!collapsed && <span style={{ fontWeight: 800, fontSize: 20, fontFamily: "Georgia, serif" }}>Regcheq</span>}
      <button onClick={onToggle} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", cursor: "pointer", borderRadius: 4, padding: "3px 7px", fontSize: 12 }}>{collapsed ? "▶" : "◀"}</button>
    </div>
    <nav style={{ flex: 1, paddingTop: 6 }}>
      {sidebarItems.map(item => (
        <div key={item.id} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: collapsed ? "10px 0" : "10px 16px",
          justifyContent: collapsed ? "center" : "flex-start", cursor: "pointer",
          background: item.active ? "rgba(255,255,255,0.12)" : "transparent",
          borderLeft: item.active ? "3px solid #fff" : "3px solid transparent", fontSize: 13,
        }}>
          <span style={{ fontSize: 15 }}>{item.icon}</span>
          {!collapsed && <span style={{ fontWeight: item.active ? 600 : 400 }}>{item.label}</span>}
        </div>
      ))}
    </nav>
    {!collapsed && <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Protección de Datos Personales · Ley 21.719</div>}
  </div>
);

const Badge = ({ text, color, bg }) => <span style={{ padding: "2px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: bg, color, whiteSpace: "nowrap" }}>{text}</span>;
const RiskBadge = ({ level }) => { const m = { Bajo: [C.green, C.greenLt], Medio: [C.yellow, C.yellowLt], Alto: [C.red, C.redLt] }; const [color, bg] = m[level] || m.Medio; return <Badge text={level} color={color} bg={bg} />; };
const Btn = ({ children, onClick, variant = "primary", style: s = {} }) => {
  const base = { padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", ...s };
  const v = { primary: { ...base, background: C.navyDark, color: "#fff" }, secondary: { ...base, background: C.white, color: C.text, border: `1px solid ${C.border}` }, ghost: { ...base, background: "transparent", color: C.textSec }, danger: { ...base, background: C.redLt, color: C.red } };
  return <button onClick={onClick} style={v[variant]}>{children}</button>;
};
const Input = ({ label, value, onChange, placeholder, type = "text", required, textarea }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>{label} {required && <span style={{ color: C.red }}>*</span>}</label>
    {textarea ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, resize: "vertical", minHeight: 70, fontFamily: "inherit", boxSizing: "border-box" }} />
      : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, boxSizing: "border-box" }} />}
  </div>
);
const Select = ({ label, value, onChange, options, required }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>{label} {required && <span style={{ color: C.red }}>*</span>}</label>
    <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, background: C.white, boxSizing: "border-box" }}>
      <option value="">Seleccionar...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const stepsMeta = [{ num: 1, label: "Identificación" }, { num: 2, label: "Actores" }, { num: 3, label: "Ciclo de Vida" }, { num: 4, label: "Clasificación" }];
const StepIndicator = ({ current }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 24 }}>
    {stepsMeta.map((s, i) => (
      <div key={s.num} style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: current === s.num ? C.navyDark : current > s.num ? C.greenLt : C.bg, color: current === s.num ? "#fff" : current > s.num ? C.green : C.textMut, fontSize: 12, fontWeight: 600 }}>
          <span style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: current === s.num ? "rgba(255,255,255,0.2)" : current > s.num ? C.green : C.border, color: current === s.num ? "#fff" : current > s.num ? "#fff" : C.textMut, fontSize: 11, fontWeight: 700 }}>{current > s.num ? "✓" : s.num}</span>
          {s.label}
        </div>
        {i < stepsMeta.length - 1 && <div style={{ width: 24, height: 1, background: C.border }} />}
      </div>
    ))}
  </div>
);

// ===== FORM STEPS =====
const Step1 = ({ form, setField }) => (
  <div>
    <h3 style={{ margin: "0 0 4px", fontSize: 16, color: C.text }}>Identificación y Trazabilidad</h3>
    <p style={{ margin: "0 0 18px", fontSize: 13, color: C.textSec }}>Identifique la actividad de tratamiento con nombre, referencia y descripción.</p>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>
      <Input label="Nombre de la actividad" value={form.nombre} onChange={v => setField("nombre", v)} placeholder="Ej: Gestión de nómina" required />
      <Input label="NIREF (auto)" value={form.niref} onChange={() => {}} placeholder="Se genera automáticamente" />
    </div>
    <Input label="Descripción de la actividad" value={form.descripcion} onChange={v => setField("descripcion", v)} placeholder="Describa el propósito y alcance del tratamiento de datos..." textarea required />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>
      <Input label="Fecha de creación" value={form.fechaCreacion} onChange={v => setField("fechaCreacion", v)} type="date" />
      <Select label="Nivel de riesgo estimado" value={form.riesgo} onChange={v => setField("riesgo", v)} options={["Bajo", "Medio", "Alto"]} required />
    </div>
  </div>
);

const Step2 = ({ form, setField }) => (
  <div>
    <h3 style={{ margin: "0 0 4px", fontSize: 16, color: C.text }}>Individualización de Actores</h3>
    <p style={{ margin: "0 0 18px", fontSize: 13, color: C.textSec }}>Defina al responsable del tratamiento, representante legal y delegado de protección de datos.</p>
    <Input label="Responsable del tratamiento" value={form.responsable} onChange={v => setField("responsable", v)} placeholder="Ej: Departamento de Recursos Humanos" required />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>
      <Input label="Representante Legal" value={form.representanteLegal} onChange={v => setField("representanteLegal", v)} placeholder="Nombre completo" required />
      <Input label="Delegado de Protección de Datos (DPD)" value={form.dpd} onChange={v => setField("dpd", v)} placeholder="Nombre completo" required />
    </div>
    <div style={{ marginTop: 8, padding: "12px 16px", background: C.blueLt, borderRadius: 8, fontSize: 12, color: C.blue, lineHeight: 1.5 }}>
      ℹ️ El DPD es obligatorio para organismos públicos y empresas que traten datos sensibles a gran escala (Art. 31° Ley 21.719).
    </div>
  </div>
);

const Step3 = ({ form, setField }) => (
  <div>
    <h3 style={{ margin: "0 0 4px", fontSize: 16, color: C.text }}>Ciclo de Vida del Dato</h3>
    <p style={{ margin: "0 0 18px", fontSize: 13, color: C.textSec }}>Mapee el flujo desde la recolección hasta la destrucción definitiva de los datos.</p>
    <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
      {etapasVida.map(et => {
        const active = form[et.key];
        return (
          <div key={et.key} onClick={() => setField(et.key, !active)} style={{
            flex: 1, minWidth: 120, padding: "14px 16px", borderRadius: 10, cursor: "pointer",
            border: `2px solid ${active ? C.blue : C.border}`, background: active ? C.blueLt : C.white, transition: "all 0.15s",
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{et.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: active ? C.blue : C.text }}>{et.label}</div>
            <div style={{ fontSize: 11, color: C.textMut, marginTop: 2 }}>{et.desc}</div>
          </div>
        );
      })}
    </div>
    {etapasVida.filter(et => form[et.key]).map(et => (
      <Input key={et.key} label={`Detalle: ${et.label}`}
        value={form[`detalle${et.key.charAt(0).toUpperCase() + et.key.slice(1)}`] || ""}
        onChange={v => setField(`detalle${et.key.charAt(0).toUpperCase() + et.key.slice(1)}`, v)}
        placeholder={`Describa el proceso de ${et.label.toLowerCase()}...`} textarea />
    ))}
  </div>
);

const Step4 = ({ form, setField }) => {
  const toggle = (cat) => {
    const cats = form.categorias.includes(cat) ? form.categorias.filter(c => c !== cat) : [...form.categorias, cat];
    setField("categorias", cats);
  };
  const hasMenores = form.categorias.includes("Menores de edad");
  const hasSensibles = form.categorias.some(c => ["Sensibles", "Biométricos", "Salud"].includes(c));
  return (
    <div>
      <h3 style={{ margin: "0 0 4px", fontSize: 16, color: C.text }}>Clasificación de Datos</h3>
      <p style={{ margin: "0 0 18px", fontSize: 13, color: C.textSec }}>Seleccione las categorías de datos personales involucradas en esta actividad.</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {categoriasDisponibles.map(cat => {
          const sel = form.categorias.includes(cat);
          const isSensitive = ["Sensibles", "Biométricos", "Salud", "Menores de edad"].includes(cat);
          return (
            <div key={cat} onClick={() => toggle(cat)} style={{
              padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600,
              border: `1.5px solid ${sel ? (isSensitive ? C.red : C.blue) : C.border}`,
              background: sel ? (isSensitive ? C.redLt : C.blueLt) : C.white,
              color: sel ? (isSensitive ? C.red : C.blue) : C.textSec, transition: "all 0.15s",
            }}>{sel ? "✓ " : ""}{cat}{isSensitive && " ⚠️"}</div>
          );
        })}
      </div>
      {hasSensibles && <div style={{ padding: "12px 16px", background: C.orangeLt, borderRadius: 8, fontSize: 12, color: C.orange, marginBottom: 12, lineHeight: 1.5, borderLeft: `3px solid ${C.orange}` }}>⚠️ <strong>Datos sensibles detectados.</strong> Esta actividad requerirá una Evaluación de Impacto (EIPD) obligatoria y medidas de seguridad reforzadas según Art. 16° bis Ley 21.719.</div>}
      {hasMenores && <div style={{ padding: "12px 16px", background: C.redLt, borderRadius: 8, fontSize: 12, color: C.red, marginBottom: 12, lineHeight: 1.5, borderLeft: `3px solid ${C.red}` }}>🔴 <strong>Datos de menores de 16 años.</strong> Se requiere consentimiento de padres o representantes legales (Art. 16° quáter Ley 21.719).</div>}
      {form.categorias.length > 0 && (
        <div style={{ padding: "12px 16px", background: C.bg, borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>Resumen de clasificación</div>
          <div style={{ fontSize: 12, color: C.textSec }}>{form.categorias.length} categoría{form.categorias.length > 1 ? "s" : ""} seleccionada{form.categorias.length > 1 ? "s" : ""}{hasSensibles ? " · Incluye datos sensibles" : ""}{hasMenores ? " · Incluye menores de edad" : ""}</div>
        </div>
      )}
    </div>
  );
};

// ===== DETAIL VIEW =====
const DetailView = ({ actividad, onBack }) => {
  const hasSensibles = actividad.categorias.some(c => ["Sensibles", "Biométricos", "Salud"].includes(c));
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <Btn variant="ghost" onClick={onBack}>← Volver</Btn>
        <span style={{ fontSize: 12, color: C.textMut }}>{actividad.niref}</span>
      </div>
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, color: C.text }}>{actividad.nombre}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textSec }}>{actividad.descripcion}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <RiskBadge level={actividad.riesgo} />
            {actividad.completo ? <Badge text="Completo" color={C.green} bg={C.greenLt} /> : <Badge text="Incompleto" color={C.orange} bg={C.orangeLt} />}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          {[{ label: "Responsable", value: actividad.responsable }, { label: "Representante Legal", value: actividad.representanteLegal }, { label: "DPD", value: actividad.dpd }].map(f => (
            <div key={f.label} style={{ padding: "12px 16px", background: C.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: C.textMut, marginBottom: 2 }}>{f.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{f.value}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>Ciclo de Vida del Dato</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {etapasVida.map((et, i) => {
            const active = actividad[et.key];
            const detalle = actividad[`detalle${et.key.charAt(0).toUpperCase() + et.key.slice(1)}`];
            return (
              <div key={et.key} style={{ flex: 1, minWidth: 160 }}>
                <div style={{ padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${active ? C.blue : C.border}`, background: active ? C.blueLt : C.bg, marginBottom: 6, opacity: active ? 1 : 0.4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span>{et.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: active ? C.blue : C.textMut }}>{et.label}</span>
                    {active && i < etapasVida.length - 1 && <span style={{ marginLeft: "auto", color: C.blue }}>→</span>}
                  </div>
                  {active && detalle && <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.4 }}>{detalle}</div>}
                  {!active && <div style={{ fontSize: 11, color: C.textMut }}>No aplica</div>}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>Categorías de Datos</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {actividad.categorias.map(cat => {
            const isSensitive = ["Sensibles", "Biométricos", "Salud", "Menores de edad"].includes(cat);
            return <Badge key={cat} text={isSensitive ? `${cat} ⚠️` : cat} color={isSensitive ? C.red : C.purple} bg={isSensitive ? C.redLt : C.purpleLt} />;
          })}
        </div>
        {hasSensibles && <div style={{ padding: "10px 14px", background: C.orangeLt, borderRadius: 8, fontSize: 12, color: C.orange, borderLeft: `3px solid ${C.orange}` }}>⚠️ Actividad con datos sensibles — Requiere EIPD obligatoria</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <div style={{ fontSize: 11, color: C.textMut }}>Creada: {actividad.fechaCreacion}</div>
          <div style={{ fontSize: 11, color: C.textMut }}>·</div>
          <div style={{ fontSize: 11, color: C.textMut }}>Última actualización: {actividad.fechaAct}</div>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN =====
export default function ModuloRAT() {
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState("list");
  const [actividades, setActividades] = useState(initialActividades);
  const [selectedId, setSelectedId] = useState(null);
  const [step, setStep] = useState(1);
  const [filter, setFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [copilotOpen, setCopilotOpen] = useState(false);

  const emptyForm = {
    nombre: "", niref: `NIREF-2025-${String(actividades.length + 1).padStart(3, "0")}`,
    descripcion: "", responsable: "", representanteLegal: "", dpd: "",
    recoleccion: false, almacenamiento: false, uso: false, destruccion: false,
    detalleRecoleccion: "", detalleAlmacenamiento: "", detalleUso: "", detalleDestruccion: "",
    categorias: [], riesgo: "", fechaCreacion: new Date().toISOString().slice(0, 10), fechaAct: new Date().toISOString().slice(0, 10), completo: false,
  };
  const [form, setForm] = useState(emptyForm);
  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const filteredActividades = useMemo(() => {
    let list = actividades;
    if (filter === "completos") list = list.filter(a => a.completo);
    if (filter === "incompletos") list = list.filter(a => !a.completo);
    if (filter === "alto") list = list.filter(a => a.riesgo === "Alto");
    if (searchTerm) list = list.filter(a => a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || a.niref.toLowerCase().includes(searchTerm.toLowerCase()));
    return list;
  }, [actividades, filter, searchTerm]);

  const stats = useMemo(() => ({
    total: actividades.length, completos: actividades.filter(a => a.completo).length,
    alto: actividades.filter(a => a.riesgo === "Alto").length, incompletos: actividades.filter(a => !a.completo).length,
  }), [actividades]);

  const handleSave = () => {
    const newAct = { ...form, id: `RAT-${String(actividades.length + 1).padStart(3, "0")}`, completo: !!(form.nombre && form.responsable && form.dpd && form.categorias.length > 0 && form.riesgo) };
    setActividades([...actividades, newAct]);
    setForm(emptyForm); setStep(1); setView("list");
  };

  const ml = collapsed ? 56 : 210;
  const mr = copilotOpen ? 380 : 0;
  const selectedActividad = selectedId ? actividades.find(a => a.id === selectedId) : null;

  const renderContent = () => {
    if (view === "detail" && selectedActividad) {
      return <DetailView actividad={selectedActividad} onBack={() => { setView("list"); setSelectedId(null); }} />;
    }
    if (view === "create") {
      return (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Btn variant="ghost" onClick={() => { setView("list"); setStep(1); setForm(emptyForm); }}>← Volver</Btn>
            <h2 style={{ margin: 0, fontSize: 18, color: C.text }}>Nueva Actividad de Tratamiento</h2>
          </div>
          <StepIndicator current={step} />
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 16, boxShadow: C.cardShadow }}>
            {step === 1 && <Step1 form={form} setField={setField} />}
            {step === 2 && <Step2 form={form} setField={setField} />}
            {step === 3 && <Step3 form={form} setField={setField} />}
            {step === 4 && <Step4 form={form} setField={setField} />}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Btn variant="secondary" onClick={() => step > 1 && setStep(step - 1)} style={{ opacity: step === 1 ? 0.4 : 1 }}>← Anterior</Btn>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="secondary" onClick={() => { setView("list"); setStep(1); setForm(emptyForm); }}>Cancelar</Btn>
              {step < 4 ? <Btn onClick={() => setStep(step + 1)}>Siguiente →</Btn> : <Btn onClick={handleSave}>💾 Guardar Actividad</Btn>}
            </div>
          </div>
        </div>
      );
    }

    // LIST VIEW
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text }}>Inventario RAT</h1>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: C.textSec }}>Registro de Actividades de Tratamiento · Art. 8° Ley 21.719</p>
          </div>
          <Btn onClick={() => setView("create")}>+ Nueva Actividad</Btn>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          {[
            { label: "Total", value: stats.total, color: C.blue, f: "todos" },
            { label: "Completos", value: stats.completos, color: C.green, f: "completos" },
            { label: "Incompletos", value: stats.incompletos, color: C.orange, f: "incompletos" },
            { label: "Riesgo Alto", value: stats.alto, color: C.red, f: "alto" },
          ].map(s => (
            <div key={s.f} onClick={() => setFilter(filter === s.f ? "todos" : s.f)} style={{
              background: C.white, borderRadius: 8, padding: "10px 18px", cursor: "pointer",
              border: filter === s.f ? `2px solid ${s.color}` : `1px solid ${C.border}`, flex: 1, minWidth: 120,
            }}>
              <div style={{ fontSize: 11, color: C.textSec }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por nombre o NIREF..."
            style={{ width: "100%", maxWidth: 360, padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, boxSizing: "border-box" }} />
        </div>

        <div style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: C.cardShadow }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {["NIREF", "Actividad", "Responsable", "Categorías", "Ciclo", "Riesgo", "Estado"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: C.textSec, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredActividades.map(a => (
                <tr key={a.id} onClick={() => { setSelectedId(a.id); setView("detail"); }}
                  style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: C.navyDark, fontFamily: "monospace", fontSize: 11 }}>{a.niref}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ fontWeight: 600, color: C.text }}>{a.nombre}</div>
                    <div style={{ fontSize: 11, color: C.textMut, marginTop: 1 }}>Actualizado: {a.fechaAct}</div>
                  </td>
                  <td style={{ padding: "10px 12px", color: C.textSec }}>{a.responsable}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {a.categorias.slice(0, 2).map(c => <Badge key={c} text={c} color={["Sensibles", "Biométricos", "Salud"].includes(c) ? C.red : C.purple} bg={["Sensibles", "Biométricos", "Salud"].includes(c) ? C.redLt : C.purpleLt} />)}
                      {a.categorias.length > 2 && <Badge text={`+${a.categorias.length - 2}`} color={C.textMut} bg={C.bg} />}
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 3 }}>
                      {etapasVida.map(et => (
                        <span key={et.key} title={et.label} style={{ width: 20, height: 20, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, background: a[et.key] ? C.blueLt : C.bg, opacity: a[et.key] ? 1 : 0.3 }}>{et.icon}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px" }}><RiskBadge level={a.riesgo} /></td>
                  <td style={{ padding: "10px 12px" }}>
                    {a.completo ? <Badge text="Completo" color={C.green} bg={C.greenLt} /> : <Badge text="Incompleto" color={C.orange} bg={C.orangeLt} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredActividades.length === 0 && <div style={{ padding: 30, textAlign: "center", color: C.textMut, fontSize: 13 }}>No se encontraron actividades con los filtros seleccionados.</div>}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div style={{ flex: 1, marginLeft: ml, marginRight: mr, transition: "margin-left 0.2s, margin-right 0.3s" }}>
        <div style={{
          height: 52, background: C.white, borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: C.textSec }}>Protección de Datos</span>
            <span style={{ color: C.textMut, margin: "0 6px" }}>›</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Inventario RAT</span>
          </div>
          {!copilotOpen && (
            <button onClick={() => setCopilotOpen(true)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8,
              background: `linear-gradient(135deg, ${C.ai}12 0%, ${C.ai}06 100%)`,
              border: `1px solid ${C.ai}33`, color: C.ai, fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              🤖 Asistente IA
            </button>
          )}
        </div>
        <div style={{ padding: "22px 28px", maxWidth: 1200 }}>
          {renderContent()}
        </div>
      </div>

      <AICopilot
        open={copilotOpen}
        onToggle={() => setCopilotOpen(!copilotOpen)}
        currentView={view}
        step={step}
        form={form}
        actividad={selectedActividad}
      />
    </div>
  );
}

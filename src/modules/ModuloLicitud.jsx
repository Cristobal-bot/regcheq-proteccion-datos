import { useState, useMemo, useRef, useEffect } from "react";

// ============================================
// REGCHEQ - Módulo de Licitud + IA Copilot
// Motor de Reglas Legales - Ley 21.719
// ============================================

const C = {
  navyDark: "#141242", navyMid: "#1e1b5e",
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

// ===== RAT Activities =====
const ratActividades = [
  { id: "RAT-001", niref: "NIREF-2025-001", nombre: "Gestión de nómina y remuneraciones", responsable: "Depto. RRHH", riesgo: "Medio", categorias: ["Identificación", "Contacto", "Financiero"], tieneMenores: false },
  { id: "RAT-002", niref: "NIREF-2025-002", nombre: "Marketing directo por email", responsable: "Depto. Marketing", riesgo: "Medio", categorias: ["Identificación", "Contacto", "Preferencias"], tieneMenores: false },
  { id: "RAT-003", niref: "NIREF-2025-003", nombre: "Videovigilancia oficinas", responsable: "Depto. Seguridad", riesgo: "Alto", categorias: ["Biométricos", "Imagen"], tieneMenores: false },
  { id: "RAT-004", niref: "NIREF-2025-004", nombre: "Evaluación crediticia clientes", responsable: "Depto. Riesgo", riesgo: "Alto", categorias: ["Identificación", "Financiero", "Crediticio"], tieneMenores: false },
  { id: "RAT-005", niref: "NIREF-2025-005", nombre: "Programa de fidelización", responsable: "Depto. Comercial", riesgo: "Bajo", categorias: ["Identificación", "Contacto", "Preferencias", "Transaccional"], tieneMenores: false },
  { id: "RAT-006", niref: "NIREF-2025-006", nombre: "Control de acceso biométrico", responsable: "Depto. Seguridad", riesgo: "Alto", categorias: ["Biométricos", "Identificación"], tieneMenores: false },
  { id: "RAT-007", niref: "NIREF-2025-007", nombre: "Atención de reclamos", responsable: "Depto. Servicio al Cliente", riesgo: "Bajo", categorias: ["Identificación", "Contacto"], tieneMenores: false },
  { id: "RAT-008", niref: "NIREF-2025-008", nombre: "Perfilamiento automatizado de clientes", responsable: "Depto. Data Analytics", riesgo: "Alto", categorias: ["Identificación", "Transaccional", "Comportamental", "Preferencias"], tieneMenores: false },
];

const basesLicitud = [
  { id: "consentimiento", nombre: "Consentimiento", icon: "✋", color: C.blue, desc: "Debe ser libre, informado, específico e inequívoco. Si el tratamiento tiene múltiples fines, debe obtenerse consentimiento separado para cada uno.", art: "Art. 12° Ley 21.719" },
  { id: "ejecucion_contrato", nombre: "Ejecución de Contrato", icon: "📄", color: C.green, desc: "El tratamiento es necesario para la ejecución o cumplimiento de un contrato. No puede supeditarse la prestación del servicio a datos no necesarios.", art: "Art. 13° letra a) Ley 21.719" },
  { id: "interes_legitimo", nombre: "Interés Legítimo", icon: "⚖️", color: C.purple, desc: "El responsable debe realizar una ponderación que demuestre que el interés no es ambiguo, es real, actual y proporcional al impacto en los derechos del titular.", art: "Art. 13° letra e) Ley 21.719" },
  { id: "obligacion_legal", nombre: "Obligación Legal", icon: "🏛️", color: C.orange, desc: "El tratamiento es mandatado por una norma legal específica. Debe identificarse la norma exacta que fundamenta el tratamiento.", art: "Art. 13° letra c) Ley 21.719" },
];

// ===== Demo vinculaciones =====
const initialVinculaciones = [
  { id: "LIC-001", ratId: "RAT-001", base: "ejecucion_contrato", estado: "Validada", justificacion: "El tratamiento de datos de nómina es estrictamente necesario para la ejecución del contrato laboral y el cumplimiento de obligaciones legales laborales y previsionales.", normaReferencia: "", necesidadAnalisis: "Los datos tratados (nombre, RUT, remuneración, AFP, salud) son indispensables para calcular y pagar remuneraciones conforme al Código del Trabajo.", consentimientos: [], fechaValidacion: "2025-09-20", validadoPor: "Carolina Méndez" },
  { id: "LIC-002", ratId: "RAT-002", base: "consentimiento", estado: "Validada", justificacion: "Los titulares otorgan consentimiento expreso y específico para recibir comunicaciones comerciales.", normaReferencia: "", necesidadAnalisis: "", consentimientos: [{ fin: "Envío de ofertas y promociones por email", obtenido: true, fecha: "2025-09-25", separado: true }, { fin: "Segmentación por preferencias de compra", obtenido: true, fecha: "2025-09-25", separado: true }, { fin: "Compartir datos con socios comerciales", obtenido: false, fecha: "", separado: true }], fechaValidacion: "2025-10-01", validadoPor: "Carolina Méndez" },
  { id: "LIC-003", ratId: "RAT-003", base: "interes_legitimo", estado: "En ponderación", justificacion: "La videovigilancia responde al interés legítimo de seguridad de las personas y bienes de la empresa.", normaReferencia: "", ponderacion: { interes: "Protección de la seguridad de personas y activos empresariales", necesidad: "No existen medidas alternativas menos invasivas que brinden el mismo nivel de seguridad", proporcionalidad: "Las cámaras se limitan a áreas comunes, no se graban espacios privados", impactoTitular: "Impacto moderado en la privacidad de trabajadores y visitantes", mitigacion: "Señalización visible, retención limitada a 30 días, acceso restringido", resultado: "pendiente" }, necesidadAnalisis: "", consentimientos: [], fechaValidacion: "", validadoPor: "" },
  { id: "LIC-004", ratId: "RAT-004", base: "obligacion_legal", estado: "Validada", justificacion: "La evaluación crediticia es requerida por normativa financiera para la prevención del lavado de activos y la gestión del riesgo crediticio.", normaReferencia: "Ley 20.393 (Responsabilidad penal de personas jurídicas), Normativa CMF Capítulo 18-5, Ley 19.628 Art. 17 (información comercial)", necesidadAnalisis: "", consentimientos: [], fechaValidacion: "2025-10-10", validadoPor: "Carolina Méndez" },
  { id: "LIC-005", ratId: "RAT-005", base: "consentimiento", estado: "Validada", justificacion: "Los clientes se registran voluntariamente en el programa de fidelización otorgando consentimiento expreso.", normaReferencia: "", necesidadAnalisis: "", consentimientos: [{ fin: "Acumulación y canje de puntos", obtenido: true, fecha: "2025-10-15", separado: true }, { fin: "Envío de ofertas personalizadas", obtenido: true, fecha: "2025-10-15", separado: true }, { fin: "Análisis de hábitos de compra", obtenido: true, fecha: "2025-10-15", separado: true }], fechaValidacion: "2025-10-18", validadoPor: "Carolina Méndez" },
  { id: "LIC-006", ratId: "RAT-006", base: "interes_legitimo", estado: "Pendiente", justificacion: "", normaReferencia: "", ponderacion: { interes: "", necesidad: "", proporcionalidad: "", impactoTitular: "", mitigacion: "", resultado: "pendiente" }, necesidadAnalisis: "", consentimientos: [], fechaValidacion: "", validadoPor: "" },
  { id: "LIC-007", ratId: "RAT-007", base: "ejecucion_contrato", estado: "Validada", justificacion: "La gestión de reclamos forma parte de las obligaciones contractuales y de los términos de servicio aceptados por el cliente.", normaReferencia: "", necesidadAnalisis: "Solo se recaban datos necesarios para identificar al titular y gestionar su reclamo específico.", consentimientos: [], fechaValidacion: "2025-10-25", validadoPor: "Carolina Méndez" },
];

// ====================================================================
// AI COPILOT ENGINE - LICITUD
// ====================================================================
const delay = (ms) => new Promise(r => setTimeout(r, ms));

const aiResponses = {
  list: {
    greet: "¡Hola! Soy tu asistente de licitud. Puedo ayudarte a:\n\n• Recomendar la base legal más adecuada para cada actividad\n• Redactar justificaciones y análisis de ponderación\n• Identificar normas legales aplicables\n• Revisar el estado de cumplimiento de licitud\n\n¿En qué te puedo ayudar?",
    analisis: "📊 **Análisis del estado de licitud:**\n\n✅ **4 de 7 vinculaciones validadas** (57%)\n\n**Hallazgos críticos:**\n\n🔴 **RAT-008 (Perfilamiento automatizado)** — Sin base de licitud asignada. Esta es la actividad más riesgosa: combina datos comportamentales + decisiones automatizadas. Urgente asignar base.\n\n🟡 **LIC-003 (Videovigilancia)** — Ponderación de interés legítimo incompleta. Falta definir el resultado.\n\n🟡 **LIC-006 (Control biométrico)** — Interés legítimo pendiente. Todos los campos vacíos.\n\n🟡 **LIC-002 (Marketing)** — 1 de 3 consentimientos pendiente: \"Compartir datos con socios comerciales\".\n\n**Recomendación:** Priorizar RAT-008 y completar LIC-006, ambas de riesgo alto.",
    rat008: "🔴 **Recomendación para RAT-008 (Perfilamiento automatizado):**\n\nEsta actividad es compleja porque involucra decisiones automatizadas. Las opciones son:\n\n**1. Consentimiento** (recomendado)\n— El perfilamiento comercial típicamente requiere consentimiento expreso del titular.\n— Finalidades a separar: (a) Tracking de navegación, (b) Análisis de comportamiento de compra, (c) Generación de recomendaciones automatizadas.\n— ⚠️ Además, por involucrar decisiones automatizadas (Art. 8° bis), debe informarse al titular sobre la lógica del algoritmo.\n\n**2. Interés legítimo** (viable pero arriesgado)\n— Requiere ponderación rigurosa.\n— El impacto en el titular es alto por el volumen de datos y la naturaleza del perfilamiento.\n— Difícil de justificar ante la Agencia.\n\n**No aplican:** Obligación legal ni ejecución de contrato.\n\n¿Quieres que prepare la vinculación con consentimiento?",
  },

  create: {
    greet: "📋 Estás creando una nueva vinculación de licitud. Puedo ayudarte a:\n\n• Recomendar la base legal más adecuada según la actividad\n• Redactar la justificación\n\nSelecciona la actividad RAT y te daré mi recomendación.",
    recomendar: (ratId) => {
      const rat = ratActividades.find(a => a.id === ratId);
      if (!rat) return "Selecciona primero una actividad RAT para que pueda recomendarte la base de licitud más adecuada.";
      
      const recs = {
        "RAT-008": "⚖️ **Recomendación para \"Perfilamiento automatizado\":**\n\n**Base recomendada: Consentimiento** ✋\n\n**Razones:**\n1. El perfilamiento de comportamiento requiere consentimiento explícito cuando genera efectos significativos en el titular.\n2. Las decisiones automatizadas (Art. 8° bis) exigen informar sobre la lógica del algoritmo.\n3. El interés legítimo es viable pero difícil de defender ante el alto impacto en privacidad.\n\n**Finalidades sugeridas para consentimiento separado:**\n• Tracking de navegación web\n• Análisis de historial de compras\n• Generación de recomendaciones automatizadas\n• Segmentación comercial\n\n**Justificación modelo:**\n\"Los titulares otorgan consentimiento libre, informado y específico para el análisis automatizado de sus patrones de comportamiento y preferencias de compra, con fines de segmentación comercial y generación de recomendaciones personalizadas.\"",
      };
      
      if (recs[ratId]) return recs[ratId];

      // Generic recommendation based on categories
      const hasBio = rat.categorias.some(c => ["Biométricos", "Sensibles", "Salud"].includes(c));
      const hasFin = rat.categorias.includes("Financiero") || rat.categorias.includes("Crediticio");
      
      if (hasBio) {
        return `⚖️ **Recomendación para "${rat.nombre}":**\n\n**Base recomendada: Consentimiento explícito** ✋\n\nLos datos sensibles/biométricos requieren un estándar más alto de licitud. El consentimiento debe ser:\n• Explícito (no implícito)\n• Específico para cada finalidad\n• Documentado y verificable\n\nAlternativamente, si existe una norma que lo exija, podría aplicar **Obligación Legal**.\n\n¿Quieres que redacte la justificación?`;
      }
      if (hasFin) {
        return `⚖️ **Recomendación para "${rat.nombre}":**\n\n**Bases posibles:**\n1. **Obligación Legal** 🏛️ — Si el tratamiento financiero es exigido por normativa (CMF, Ley 20.393, SII).\n2. **Ejecución de Contrato** 📄 — Si los datos financieros son necesarios para prestar el servicio contratado.\n\n¿Quieres que identifique las normas aplicables?`;
      }
      return `⚖️ **Recomendación para "${rat.nombre}":**\n\nBasándome en las categorías de datos (${rat.categorias.join(", ")}), las bases más probables son:\n\n1. **Ejecución de Contrato** — Si el tratamiento es necesario para prestar un servicio.\n2. **Consentimiento** — Si el titular puede decidir libremente.\n3. **Interés Legítimo** — Si hay un interés real y proporcional del responsable.\n\n¿Quieres que profundice en alguna de estas opciones?`;
    },
    justificacion: (ratId, base) => {
      const rat = ratActividades.find(a => a.id === ratId);
      if (!rat || !base) return "Selecciona la actividad y la base de licitud para que pueda generar una justificación.";
      
      const justificaciones = {
        consentimiento: `📝 **Justificación sugerida:**\n\n"Los titulares de datos personales otorgan consentimiento libre, informado, específico e inequívoco para el tratamiento de sus datos en el contexto de ${rat.nombre.toLowerCase()}. El consentimiento se obtiene de forma separada para cada finalidad del tratamiento, conforme a lo establecido en el Art. 12° de la Ley 21.719, garantizando que el titular comprende el alcance y puede revocar su consentimiento en cualquier momento sin expresión de causa."`,
        ejecucion_contrato: `📝 **Justificación sugerida:**\n\n"El tratamiento de datos personales en el contexto de ${rat.nombre.toLowerCase()} es estrictamente necesario para la ejecución del contrato celebrado con el titular. Los datos tratados (${rat.categorias.join(", ")}) son indispensables para cumplir con las obligaciones contractuales pactadas, sin que se recaben datos adicionales no necesarios para dicho fin, conforme al Art. 13° letra a) de la Ley 21.719."`,
        interes_legitimo: `📝 **Justificación sugerida:**\n\n"El responsable del tratamiento tiene un interés legítimo, real, concreto y actual en ${rat.nombre.toLowerCase()}, el cual ha sido debidamente ponderado frente a los derechos y libertades fundamentales de los titulares. La ponderación formal demuestra que el tratamiento es necesario, proporcional y cuenta con medidas de mitigación adecuadas, conforme al Art. 13° letra e) de la Ley 21.719."\n\n⚠️ **Importante:** Deberás completar la ponderación formal con los 5 campos obligatorios para que esta base sea válida.`,
        obligacion_legal: `📝 **Justificación sugerida:**\n\n"El tratamiento de datos personales en el contexto de ${rat.nombre.toLowerCase()} es exigido por normativa legal vigente. El responsable está obligado a tratar los datos indicados para dar cumplimiento a sus obligaciones legales, conforme al Art. 13° letra c) de la Ley 21.719."\n\n⚠️ **Importante:** Debes identificar la norma legal específica que fundamenta esta obligación.`,
      };
      return justificaciones[base] || "Selecciona una base de licitud válida.";
    },
  },

  detail: {
    analizar: (vinc, rat) => {
      const base = basesLicitud.find(b => b.id === vinc.base);
      const issues = [];
      if (!vinc.justificacion) issues.push("❌ Sin justificación documentada.");
      if (vinc.base === "consentimiento") {
        const pend = (vinc.consentimientos || []).filter(c => !c.obtenido).length;
        if (pend > 0) issues.push(`🟡 ${pend} consentimiento${pend > 1 ? "s" : ""} pendiente${pend > 1 ? "s" : ""} de obtener.`);
        const noSep = (vinc.consentimientos || []).filter(c => !c.separado).length;
        if (noSep > 0) issues.push(`🔴 ${noSep} consentimiento${noSep > 1 ? "s" : ""} no separado${noSep > 1 ? "s" : ""} — incumple Art. 12°.`);
      }
      if (vinc.base === "interes_legitimo") {
        const p = vinc.ponderacion || {};
        const vacios = ["interes", "necesidad", "proporcionalidad", "impactoTitular", "mitigacion"].filter(k => !p[k]?.trim());
        if (vacios.length > 0) issues.push(`🟡 Ponderación incompleta: ${vacios.length} campo${vacios.length > 1 ? "s" : ""} vacío${vacios.length > 1 ? "s" : ""}.`);
        if (p.resultado === "pendiente") issues.push("🟡 Resultado de ponderación sin definir.");
        if (p.resultado === "desfavorable") issues.push("🔴 Ponderación desfavorable — No puede usarse interés legítimo.");
      }
      if (vinc.base === "obligacion_legal" && !vinc.normaReferencia) issues.push("🔴 Sin norma legal identificada — Requisito obligatorio.");
      if (vinc.base === "ejecucion_contrato" && !vinc.necesidadAnalisis) issues.push("🟡 Sin análisis de necesidad documentado.");
      
      const score = Math.max(0, 100 - issues.length * 20);
      return `🔍 **Análisis de licitud: ${rat.nombre}**\n\n**Base:** ${base?.icon} ${base?.nombre} (${base?.art})\n**Score: ${score}%** ${"█".repeat(Math.round(score/10))}${"░".repeat(10 - Math.round(score/10))}\n\n${issues.length > 0 ? "**Hallazgos:**\n" + issues.join("\n") : "✅ La vinculación cumple con todos los requisitos."}\n\n${vinc.estado !== "Validada" && issues.length === 0 ? "💡 **Sugerencia:** Todos los requisitos están completos. Puedes cambiar el estado a \"Validada\"." : ""}`;
    },

    ponderacion: (rat) => {
      const lower = rat.nombre.toLowerCase();
      if (lower.includes("video") || lower.includes("vigilancia")) {
        return "⚖️ **Borrador de ponderación para Videovigilancia:**\n\n**1. Interés perseguido:**\n\"Protección de la integridad física de trabajadores, clientes y visitantes, así como la seguridad de activos e instalaciones de la empresa. Este interés es real, concreto y actual, respaldado por incidentes previos de seguridad documentados.\"\n\n**2. Análisis de necesidad:**\n\"Se evaluaron alternativas menos invasivas (guardias de seguridad adicionales, sistemas de alarma), pero ninguna proporciona el mismo nivel de disuasión y capacidad de investigación post-incidente que la videovigilancia.\"\n\n**3. Proporcionalidad:**\n\"Las cámaras se ubican exclusivamente en áreas comunes (accesos, pasillos, estacionamientos). No se graban oficinas privadas, baños ni áreas de descanso. La resolución se limita a lo necesario para identificación.\"\n\n**4. Impacto en el titular:**\n\"Impacto moderado en la expectativa de privacidad de trabajadores y visitantes en áreas comunes. No se realiza seguimiento individualizado ni reconocimiento facial automatizado.\"\n\n**5. Medidas de mitigación:**\n\"Señalización clara en todos los puntos de grabación. Retención máxima de 30 días. Acceso restringido a personal autorizado de seguridad. Registro de accesos al sistema de CCTV. Protocolo de atención de solicitudes ARCO+.\"\n\n¿Quieres que aplique este borrador?";
      }
      if (lower.includes("biométr") || lower.includes("acceso")) {
        return "⚖️ **Borrador de ponderación para Control Biométrico:**\n\n**1. Interés perseguido:**\n\"Control de acceso físico a instalaciones que contienen información confidencial y activos de alto valor. Prevención de acceso no autorizado y cumplimiento de políticas de seguridad corporativa.\"\n\n**2. Análisis de necesidad:**\n\"Se evaluaron tarjetas de acceso y códigos PIN, pero presentan riesgo de préstamo, pérdida o duplicación. La biometría es el único método que garantiza la identidad del individuo con certeza.\"\n\n**3. Proporcionalidad:**\n\"Se utiliza exclusivamente huella dactilar (no reconocimiento facial completo). Los datos biométricos se almacenan como templates cifrados, no como imágenes reconstruibles. Solo se aplica en puntos de acceso a áreas restringidas.\"\n\n**4. Impacto en el titular:**\n\"Impacto significativo por tratarse de datos sensibles (Art. 16° bis). Los trabajadores podrían sentir vigilancia excesiva. Existe riesgo en caso de brecha de los templates biométricos.\"\n\n**5. Medidas de mitigación:**\n\"Cifrado AES-256 de templates. Servidor biométrico aislado de la red corporativa. Eliminación inmediata al término de la relación laboral. Alternativa disponible (tarjeta + PIN) para quien no consiente la biometría.\"\n\n⚠️ **Advertencia:** Los datos biométricos son sensibles. Aunque el interés legítimo es viable, considere si el consentimiento explícito sería una base más segura ante la Agencia.\n\n¿Quieres que aplique este borrador?";
      }
      return "⚖️ Puedo generar un borrador de ponderación de interés legítimo. Necesito que me indiques:\n\n1. ¿Cuál es el interés específico que persigue la empresa?\n2. ¿Qué alternativas menos invasivas se evaluaron?\n3. ¿Cómo afecta este tratamiento a los titulares?\n\nO si prefieres, dame el nombre de la actividad y generaré una propuesta completa.";
    },

    consentimiento: (vinc) => {
      const pendientes = (vinc.consentimientos || []).filter(c => !c.obtenido);
      const todos = vinc.consentimientos || [];
      if (pendientes.length === 0 && todos.length > 0) {
        return "✅ **Todos los consentimientos están obtenidos.** Verificación:\n\n" + todos.map(c => `• ✅ "${c.fin}" — Obtenido ${c.fecha}${c.separado ? " (separado)" : " ⚠️ NO separado"}`).join("\n") + "\n\n💡 Recuerda que los consentimientos deben renovarse si cambia la finalidad o si el titular los revoca.";
      }
      if (pendientes.length > 0) {
        return `⚠️ **${pendientes.length} consentimiento${pendientes.length > 1 ? "s" : ""} pendiente${pendientes.length > 1 ? "s" : ""}:**\n\n${pendientes.map(c => `• ❌ "${c.fin}"`).join("\n")}\n\n**Recomendaciones:**\n1. Implementar un formulario de consentimiento granular en el punto de contacto.\n2. Cada finalidad debe poder aceptarse o rechazarse de forma independiente.\n3. No condicionar el servicio a consentimientos no necesarios.\n4. Mantener registro de fecha, medio y contenido del consentimiento.\n\n💡 **Texto modelo de consentimiento:**\n"Autorizo expresamente a [Empresa] para el tratamiento de mis datos personales con la finalidad de [FINALIDAD ESPECÍFICA]. Entiendo que puedo revocar este consentimiento en cualquier momento sin expresión de causa."`;
      }
      return "📋 No hay consentimientos registrados aún. ¿Quieres que sugiera las finalidades que deberían separarse para esta actividad?";
    },

    norma: (vinc, rat) => {
      if (vinc.normaReferencia) {
        return `📚 **Normas identificadas:**\n${vinc.normaReferencia}\n\n**Verificación:**\nLas normas referenciadas parecen pertinentes. Asegúrate de que:\n1. Cada norma esté vigente a la fecha.\n2. El artículo específico que obliga al tratamiento esté identificado.\n3. El alcance del tratamiento no exceda lo que la norma exige.\n\n¿Quieres que busque normas complementarias?`;
      }
      const lower = rat.nombre.toLowerCase();
      if (lower.includes("nómina") || lower.includes("laboral") || lower.includes("rrhh")) {
        return "🏛️ **Normas aplicables sugeridas para tratamiento laboral:**\n\n• **Código del Trabajo**, Art. 10° — Contenido mínimo del contrato de trabajo.\n• **DL 3.500** — Obligación de cotizaciones previsionales (AFP).\n• **Ley 18.933** — Obligación de cotizaciones de salud (Isapre/Fonasa).\n• **DL 824 (Ley de Renta)**, Art. 42° — Retención de impuesto a la renta.\n• **Ley 16.744** — Seguro de accidentes del trabajo.\n• **Ley 20.393** — Prevención de delitos (si aplica modelo de prevención).\n\n¿Quieres que incluya estas referencias en la vinculación?";
      }
      if (lower.includes("crédito") || lower.includes("financier") || lower.includes("riesgo")) {
        return "🏛️ **Normas aplicables sugeridas para evaluación financiera/crediticia:**\n\n• **Ley 20.393** — Responsabilidad penal de personas jurídicas (PLA/FT).\n• **CMF Capítulo 18-5** — Gestión de riesgo crediticio en entidades supervisadas.\n• **Ley 19.628, Art. 17** — Tratamiento de datos de carácter económico.\n• **Ley 19.913** — Unidad de Análisis Financiero (UAF), prevención de lavado de activos.\n• **Circular 57 CMF** — Matrices de riesgo para clientes.\n\n¿Quieres que incluya estas referencias?";
      }
      return "🏛️ Para identificar las normas aplicables, necesito entender mejor el contexto del tratamiento. ¿Puedes indicarme:\n\n1. ¿Qué sector regulado aplica? (financiero, salud, laboral, educación...)\n2. ¿Qué organismo fiscalizador supervisa esta actividad?\n3. ¿Existe alguna circular o instrucción específica que conozcan?\n\nCon esa información puedo sugerir las normas exactas.";
    },
  },

  general: {
    bases: "📚 **Las 6 bases de licitud de la Ley 21.719:**\n\n1. **Consentimiento** (Art. 12°) — Libre, informado, específico, inequívoco. Revocable sin expresión de causa.\n\n2. **Ejecución de contrato** (Art. 13° letra a) — Necesario para cumplir un contrato con el titular.\n\n3. **Obligación legal** (Art. 13° letra c) — Mandatado por ley. Debe identificarse la norma específica.\n\n4. **Interés vital** (Art. 13° letra d) — Para proteger la vida del titular o de un tercero.\n\n5. **Interés legítimo** (Art. 13° letra e) — Requiere ponderación formal. El más complejo de justificar.\n\n6. **Función pública** (Art. 13° letra f) — Para organismos públicos en ejercicio de sus funciones.\n\n💡 **Consejo práctico:** Si puedes usar ejecución de contrato u obligación legal, prefiere esas bases sobre el consentimiento — son más robustas y no dependen de la voluntad del titular.",
    consentimiento: "✋ **Todo sobre el Consentimiento (Art. 12°):**\n\n**Requisitos:**\n• **Libre:** Sin presión ni condicionamiento del servicio.\n• **Informado:** El titular debe conocer quién, para qué, cuánto tiempo.\n• **Específico:** Separado para cada finalidad distinta.\n• **Inequívoco:** Acción afirmativa clara (no silencio ni casillas pre-marcadas).\n\n**Errores comunes:**\n❌ \"Al usar este sitio acepta el tratamiento de sus datos\" — No es específico ni libre.\n❌ Casilla pre-marcada — No es inequívoco.\n❌ Un solo consentimiento para múltiples fines — No es separado.\n❌ Condicionar el servicio al consentimiento — No es libre.\n\n**Revocación:**\nEl titular puede revocar en cualquier momento, sin expresión de causa, por un medio igual de fácil al que usó para consentir.",
    legitimoInteres: "⚖️ **Interés legítimo en profundidad (Art. 13° letra e):**\n\n**Los 5 pilares de la ponderación:**\n\n1. **Interés real y actual** — No puede ser hipotético o futuro. Debe ser concreto y demostrable.\n\n2. **Necesidad** — ¿Es este tratamiento necesario para lograr el interés? ¿No hay alternativas menos invasivas?\n\n3. **Proporcionalidad** — ¿El beneficio del tratamiento justifica el impacto en la privacidad?\n\n4. **Impacto en derechos** — ¿Cómo afecta al titular? ¿Puede causar daño, discriminación o restricción de derechos?\n\n5. **Mitigación** — ¿Qué medidas concretas se implementan para reducir el impacto?\n\n**Casos típicos donde aplica:**\n• Videovigilancia de seguridad\n• Prevención de fraude\n• Seguridad de redes informáticas\n• Marketing directo a clientes existentes (discutible)\n\n**Casos donde NO aplica:**\n• Datos sensibles a gran escala\n• Perfilamiento con efectos jurídicos significativos\n• Tratamiento de datos de menores",
  },
};

function getAIResponse(message, context) {
  const lower = message.toLowerCase().trim();
  const { currentView, vinculacion, rat, selectedRatId, selectedBase } = context;

  // General
  if (lower.includes("base") && (lower.includes("licitud") || lower.includes("legal")) && lower.includes("cuál")) return aiResponses.general.bases;
  if (lower.includes("consentimiento") && (lower.includes("qué es") || lower.includes("requisito") || lower.includes("cómo"))) return aiResponses.general.consentimiento;
  if (lower.includes("interés legítimo") || lower.includes("interes legitimo") || (lower.includes("legítimo") && lower.includes("profund"))) return aiResponses.general.legitimoInteres;

  if (currentView === "list") {
    if (lower.includes("anali") || lower.includes("estado") || lower.includes("diagnóstico") || lower.includes("cumplimiento")) return aiResponses.list.analisis;
    if (lower.includes("rat-008") || lower.includes("perfilamiento") || lower.includes("sin asignar") || lower.includes("falta")) return aiResponses.list.rat008;
    return aiResponses.list.greet;
  }

  if (currentView === "create") {
    if (lower.includes("recomienda") || lower.includes("sugier") || lower.includes("cuál base") || lower.includes("qué base")) return aiResponses.create.recomendar(selectedRatId);
    if (lower.includes("justifica")) return aiResponses.create.justificacion(selectedRatId, selectedBase);
    if (selectedRatId) return aiResponses.create.recomendar(selectedRatId);
    return aiResponses.create.greet;
  }

  if (currentView === "detail" && vinculacion && rat) {
    if (lower.includes("anali") || lower.includes("revis") || lower.includes("evalú") || lower.includes("cumpl")) return aiResponses.detail.analizar(vinculacion, rat);
    if (lower.includes("ponderación") || lower.includes("ponderacion") || lower.includes("borrador") || lower.includes("redact")) return aiResponses.detail.ponderacion(rat);
    if (lower.includes("consentimiento") || lower.includes("finalidad")) return aiResponses.detail.consentimiento(vinculacion);
    if (lower.includes("norma") || lower.includes("ley") || lower.includes("legal") || lower.includes("regulación")) return aiResponses.detail.norma(vinculacion, rat);
    return aiResponses.detail.analizar(vinculacion, rat);
  }

  return "Entiendo tu consulta. Puedo ayudarte con:\n\n• Analizar el estado de licitud del inventario\n• Recomendar bases legales para actividades\n• Redactar justificaciones y ponderaciones\n• Explicar requisitos de cada base de licitud\n\n¿Qué necesitas?";
}

function getQuickActions(currentView, vinculacion) {
  if (currentView === "list") return [
    { label: "📊 Analizar licitud", msg: "Analiza el estado de licitud de mi inventario" },
    { label: "🔴 RAT-008 sin base", msg: "¿Qué recomiendas para RAT-008 Perfilamiento?" },
    { label: "📚 Bases de licitud", msg: "¿Cuáles son las bases de licitud?" },
    { label: "⚖️ Interés legítimo", msg: "Explica el interés legítimo en profundidad" },
  ];
  if (currentView === "create") return [
    { label: "💡 Recomendar base", msg: "¿Qué base de licitud recomiendas?" },
    { label: "📝 Generar justificación", msg: "Genera la justificación para esta vinculación" },
  ];
  if (currentView === "detail") {
    const actions = [{ label: "🔍 Analizar cumplimiento", msg: "Analiza el cumplimiento de esta vinculación" }];
    if (vinculacion?.base === "interes_legitimo") actions.push({ label: "⚖️ Redactar ponderación", msg: "Redacta un borrador de ponderación" });
    if (vinculacion?.base === "consentimiento") actions.push({ label: "✋ Revisar consentimientos", msg: "Revisa el estado de los consentimientos" });
    if (vinculacion?.base === "obligacion_legal") actions.push({ label: "🏛️ Identificar normas", msg: "¿Qué normas legales aplican?" });
    if (vinculacion?.base === "ejecucion_contrato") actions.push({ label: "📄 Análisis de necesidad", msg: "¿Qué normas aplican a esta actividad?" });
    actions.push({ label: "✋ Qué es consentimiento", msg: "¿Cuáles son los requisitos del consentimiento?" });
    return actions;
  }
  return [];
}

// ====================================================================
// AI COPILOT PANEL
// ====================================================================
const AICopilot = ({ open, onToggle, currentView, vinculacion, rat, selectedRatId, selectedBase }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState({});
  const chatEndRef = useRef(null);

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  useEffect(() => {
    const key = `${currentView}-${vinculacion?.id || ""}`;
    if (!hasGreeted[key] && open) {
      const greetMsg = getAIResponse("", { currentView, vinculacion, rat, selectedRatId, selectedBase });
      setMessages(prev => [...prev, { role: "ai", text: greetMsg, ts: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) }]);
      setHasGreeted(prev => ({ ...prev, [key]: true }));
    }
  }, [currentView, vinculacion?.id, open]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: "user", text, ts: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) }]);
    setInput(""); setTyping(true);
    await delay(600 + Math.random() * 900);
    const response = getAIResponse(text, { currentView, vinculacion, rat, selectedRatId, selectedBase });
    setMessages(prev => [...prev, { role: "ai", text: response, ts: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) }]);
    setTyping(false);
  };

  const quickActions = getQuickActions(currentView, vinculacion);

  const renderText = (text) => text.split("\n").map((line, i) => {
    let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-") || /^\d+\./.test(line.trim());
    return <div key={i} style={{ marginBottom: line.trim() === "" ? 6 : 2, paddingLeft: isBullet ? 4 : 0, lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: processed }} />;
  });

  if (!open) {
    return (
      <button onClick={onToggle} style={{
        position: "fixed", right: 20, bottom: 20, width: 54, height: 54, borderRadius: "50%",
        background: `linear-gradient(135deg, ${C.ai} 0%, #9333ea 100%)`, border: "none",
        color: "#fff", fontSize: 22, cursor: "pointer", zIndex: 200,
        boxShadow: `0 4px 20px ${C.ai}66`, display: "flex", alignItems: "center", justifyContent: "center",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>🤖</button>
    );
  }

  return (
    <div style={{
      position: "fixed", right: 0, top: 0, bottom: 0, width: 380, zIndex: 200,
      background: C.white, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column",
      boxShadow: "-4px 0 30px rgba(20,18,66,0.08)", fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, background: `linear-gradient(135deg, ${C.ai}08 0%, ${C.ai}04 100%)`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${C.ai} 0%, #9333ea 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Asistente IA</div>
            <div style={{ fontSize: 10, color: C.ai, fontWeight: 600 }}>Licitud · Bases Legales</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => { setMessages([]); setHasGreeted({}); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: C.textMut, padding: 4 }}>🗑️</button>
          <button onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.textMut, padding: 4 }}>✕</button>
        </div>
      </div>

      <div style={{ padding: "8px 18px", background: C.aiGlow, borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.ai, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.ai, display: "inline-block" }} />
        {currentView === "list" && "Vista: Listado de vinculaciones"}
        {currentView === "create" && "Creando nueva vinculación"}
        {currentView === "detail" && `Detalle: ${rat?.nombre || ""}`}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px 10px", color: C.textMut, fontSize: 12 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚖️</div>
            <div style={{ fontWeight: 600, color: C.textSec, marginBottom: 4 }}>Asistente de Licitud</div>
            <div>Pregúntame sobre bases legales, consentimientos, ponderaciones o normas aplicables.</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "100%" }}>
            <div style={{ maxWidth: "92%", padding: "10px 14px", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: msg.role === "user" ? C.navyDark : C.bg, color: msg.role === "user" ? "#fff" : C.text, fontSize: 12.5, lineHeight: 1.5 }}>
              {msg.role === "ai" ? renderText(msg.text) : msg.text}
              <div style={{ fontSize: 9, marginTop: 4, color: msg.role === "user" ? "rgba(255,255,255,0.5)" : C.textMut, textAlign: "right" }}>{msg.ts}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: C.bg, fontSize: 12.5 }}>
              <span style={{ display: "inline-flex", gap: 4 }}>
                {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.ai, opacity: 0.4, display: "inline-block", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {quickActions.length > 0 && (
        <div style={{ padding: "8px 14px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 6, flexWrap: "wrap", background: C.aiGlow }}>
          {quickActions.map((qa, i) => (
            <button key={i} onClick={() => sendMessage(qa.msg)} style={{
              padding: "5px 10px", borderRadius: 14, border: `1px solid ${C.ai}33`, background: C.white, color: C.ai, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
            }} onMouseEnter={e => { e.currentTarget.style.background = C.aiLt; }} onMouseLeave={e => { e.currentTarget.style.background = C.white; }}>{qa.label}</button>
          ))}
        </div>
      )}

      <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, background: C.white, display: "flex", gap: 8, alignItems: "flex-end" }}>
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Pregunta sobre licitud..." rows={1}
          style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, color: C.text, resize: "none", fontFamily: "inherit", outline: "none", maxHeight: 80 }}
          onFocus={e => e.currentTarget.style.borderColor = C.ai} onBlur={e => e.currentTarget.style.borderColor = C.border} />
        <button onClick={() => sendMessage(input)} disabled={!input.trim()} style={{
          width: 36, height: 36, borderRadius: 10, border: "none",
          background: input.trim() ? `linear-gradient(135deg, ${C.ai} 0%, #9333ea 100%)` : C.bg,
          color: input.trim() ? "#fff" : C.textMut, cursor: input.trim() ? "pointer" : "default", fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>➤</button>
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1.15); } }`}</style>
    </div>
  );
};

// ====================================================================
// MAIN MODULE
// ====================================================================
const sidebarItems = [
  { icon: "🏠", label: "Dashboard", id: "dashboard" },
  { icon: "📋", label: "Inventario RAT", id: "rat" },
  { icon: "⚖️", label: "Licitud", id: "licitud", active: true },
  { icon: "🔒", label: "Riesgos (EIPD)", id: "eipd" },
  { icon: "📩", label: "Derechos ARCO+", id: "arco" },
];

const Sidebar = ({ collapsed, onToggle }) => (
  <div style={{ width: collapsed ? 56 : 210, minHeight: "100vh", background: `linear-gradient(180deg, ${C.navyDark} 0%, ${C.navyMid} 100%)`, color: "#fff", display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, zIndex: 100, transition: "width 0.2s" }}>
    <div style={{ padding: collapsed ? "18px 8px" : "18px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
      {!collapsed && <span style={{ fontWeight: 800, fontSize: 20, fontFamily: "Georgia, serif" }}>Regcheq</span>}
      <button onClick={onToggle} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", cursor: "pointer", borderRadius: 4, padding: "3px 7px", fontSize: 12 }}>{collapsed ? "▶" : "◀"}</button>
    </div>
    <nav style={{ flex: 1, paddingTop: 6 }}>
      {sidebarItems.map(item => (
        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 0" : "10px 16px", justifyContent: collapsed ? "center" : "flex-start", cursor: "pointer", background: item.active ? "rgba(255,255,255,0.12)" : "transparent", borderLeft: item.active ? "3px solid #fff" : "3px solid transparent", fontSize: 13 }}>
          <span style={{ fontSize: 15 }}>{item.icon}</span>
          {!collapsed && <span style={{ fontWeight: item.active ? 600 : 400 }}>{item.label}</span>}
        </div>
      ))}
    </nav>
    {!collapsed && <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Protección de Datos · Ley 21.719</div>}
  </div>
);

const Badge = ({ text, color, bg }) => <span style={{ padding: "2px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: bg, color, whiteSpace: "nowrap" }}>{text}</span>;
const RiskBadge = ({ level }) => { const m = { Bajo: [C.green, C.greenLt], Medio: [C.yellow, C.yellowLt], Alto: [C.red, C.redLt] }; const [color, bg] = m[level] || m.Medio; return <Badge text={level} color={color} bg={bg} />; };
const StatusBadge = ({ estado }) => { const m = { "Validada": [C.green, C.greenLt], "En ponderación": [C.yellow, C.yellowLt], "Pendiente": [C.orange, C.orangeLt], "Sin asignar": [C.red, C.redLt], "Rechazada": [C.red, C.redLt] }; const [color, bg] = m[estado] || [C.textMut, C.bg]; return <Badge text={estado} color={color} bg={bg} />; };
const Btn = ({ children, onClick, variant = "primary", style: s = {}, disabled }) => { const base = { padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", border: "none", opacity: disabled ? 0.5 : 1, ...s }; const v = { primary: { ...base, background: C.navyDark, color: "#fff" }, secondary: { ...base, background: C.white, color: C.text, border: `1px solid ${C.border}` }, ghost: { ...base, background: "transparent", color: C.textSec, padding: "9px 12px" }, success: { ...base, background: C.green, color: "#fff" }, danger: { ...base, background: C.redLt, color: C.red } }; return <button onClick={disabled ? undefined : onClick} style={v[variant]}>{children}</button>; };
const Input = ({ label, value, onChange, placeholder, textarea, required }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>{label} {required && <span style={{ color: C.red }}>*</span>}</label>}
    {textarea ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, resize: "vertical", minHeight: 70, fontFamily: "inherit", boxSizing: "border-box" }} /> : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, boxSizing: "border-box" }} />}
  </div>
);

// ===== CONSENTIMIENTO =====
const ConsentimientoManager = ({ consentimientos, onChange }) => {
  const addFin = () => onChange([...consentimientos, { fin: "", obtenido: false, fecha: "", separado: true }]);
  const updateFin = (i, field, val) => { const u = [...consentimientos]; u[i] = { ...u[i], [field]: val }; onChange(u); };
  const removeFin = (i) => onChange(consentimientos.filter((_, idx) => idx !== i));
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>Consentimientos por Finalidad</div>
      <div style={{ padding: "10px 14px", background: C.blueLt, borderRadius: 8, fontSize: 12, color: C.blue, marginBottom: 14, lineHeight: 1.5 }}>ℹ️ Cada finalidad de tratamiento debe tener un consentimiento separado, libre, informado y específico (Art. 12° Ley 21.719).</div>
      {consentimientos.map((c, i) => (
        <div key={i} style={{ padding: "12px 16px", borderRadius: 8, marginBottom: 8, border: `1px solid ${c.obtenido ? C.green : C.border}`, background: c.obtenido ? "#f0fdf9" : C.white }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}><input value={c.fin} onChange={e => updateFin(i, "fin", e.target.value)} placeholder="Finalidad del tratamiento..." style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, color: C.text, boxSizing: "border-box" }} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.textSec, cursor: "pointer" }}><input type="checkbox" checked={c.obtenido} onChange={e => updateFin(i, "obtenido", e.target.checked)} />Obtenido</label>
              {c.obtenido && <input type="date" value={c.fecha} onChange={e => updateFin(i, "fecha", e.target.value)} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 11, color: C.text }} />}
              <button onClick={() => removeFin(i)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
          </div>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.textMut, cursor: "pointer" }}><input type="checkbox" checked={c.separado} onChange={e => updateFin(i, "separado", e.target.checked)} />Consentimiento separado e independiente</label>
            {!c.separado && <span style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>⚠️ Requerido por ley</span>}
          </div>
        </div>
      ))}
      <Btn variant="secondary" onClick={addFin} style={{ fontSize: 12, padding: "6px 14px" }}>+ Agregar finalidad</Btn>
    </div>
  );
};

// ===== PONDERACIÓN =====
const PonderacionForm = ({ ponderacion, onChange }) => {
  const set = (k, v) => onChange({ ...ponderacion, [k]: v });
  const fields = [
    { key: "interes", label: "Interés perseguido", placeholder: "Describa el interés legítimo real, concreto y actual del responsable..." },
    { key: "necesidad", label: "Análisis de necesidad", placeholder: "¿Por qué no existen medidas alternativas menos invasivas?" },
    { key: "proporcionalidad", label: "Proporcionalidad", placeholder: "¿El tratamiento es proporcional al fin perseguido?" },
    { key: "impactoTitular", label: "Impacto en el titular", placeholder: "¿Cómo afecta este tratamiento los derechos del titular?" },
    { key: "mitigacion", label: "Medidas de mitigación", placeholder: "¿Qué medidas se implementan para reducir el impacto?" },
  ];
  const allFilled = fields.every(f => ponderacion[f.key]?.trim());
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>Ponderación de Interés Legítimo</div>
      <div style={{ padding: "10px 14px", background: C.purpleLt, borderRadius: 8, fontSize: 12, color: C.purple, marginBottom: 14, lineHeight: 1.5 }}>⚖️ El interés legítimo requiere una ponderación formal que demuestre que el interés del responsable no es ambiguo, es proporcional y no vulnera los derechos fundamentales del titular (Art. 13° letra e) Ley 21.719).</div>
      {fields.map(f => (
        <div key={f.key} style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>{f.label} <span style={{ color: C.red }}>*</span></label>
          <textarea value={ponderacion[f.key] || ""} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, resize: "vertical", minHeight: 60, fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>
      ))}
      <div style={{ marginTop: 10 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>Resultado de la ponderación</label>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ val: "favorable", label: "Favorable", desc: "El interés es legítimo y proporcional", color: C.green, bg: C.greenLt }, { val: "pendiente", label: "Pendiente", desc: "Requiere más análisis", color: C.yellow, bg: C.yellowLt }, { val: "desfavorable", label: "Desfavorable", desc: "El interés no supera la ponderación", color: C.red, bg: C.redLt }].map(opt => (
            <div key={opt.val} onClick={() => allFilled ? set("resultado", opt.val) : null} style={{ flex: 1, padding: "12px 14px", borderRadius: 8, cursor: allFilled ? "pointer" : "not-allowed", border: `2px solid ${ponderacion.resultado === opt.val ? opt.color : C.border}`, background: ponderacion.resultado === opt.val ? opt.bg : C.white, opacity: allFilled ? 1 : 0.5 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: ponderacion.resultado === opt.val ? opt.color : C.text }}>{opt.label}</div>
              <div style={{ fontSize: 11, color: C.textMut, marginTop: 2 }}>{opt.desc}</div>
            </div>
          ))}
        </div>
        {ponderacion.resultado === "desfavorable" && <div style={{ marginTop: 10, padding: "10px 14px", background: C.redLt, borderRadius: 8, fontSize: 12, color: C.red, fontWeight: 600, borderLeft: `3px solid ${C.red}` }}>⛔ La ponderación es desfavorable. No se puede utilizar el interés legítimo como base.</div>}
      </div>
    </div>
  );
};

// ===== DETAIL VIEW =====
const DetailView = ({ vinculacion, rat, onBack, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [localVinc, setLocalVinc] = useState(vinculacion);
  const baseConfig = basesLicitud.find(b => b.id === localVinc.base);
  const hasMenores = rat.tieneMenores || rat.categorias.includes("Menores de edad");
  const handleSave = () => { onUpdate(localVinc); setEditMode(false); };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <Btn variant="ghost" onClick={onBack}>← Volver</Btn>
        <span style={{ fontSize: 12, color: C.textMut }}>{vinculacion.id} · {rat.niref}</span>
      </div>
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 16, boxShadow: C.cardShadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: C.textMut, marginBottom: 2 }}>Actividad vinculada</div>
            <h2 style={{ margin: 0, fontSize: 18, color: C.text }}>{rat.nombre}</h2>
            <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}><span style={{ fontSize: 12, color: C.textSec }}>{rat.responsable}</span><RiskBadge level={rat.riesgo} /></div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <StatusBadge estado={localVinc.estado} />
            {!editMode && <Btn variant="secondary" onClick={() => setEditMode(true)} style={{ fontSize: 12, padding: "6px 12px" }}>✏️ Editar</Btn>}
          </div>
        </div>
        {baseConfig && (
          <div style={{ padding: "16px 18px", borderRadius: 10, marginBottom: 18, background: `${baseConfig.color}11`, border: `1.5px solid ${baseConfig.color}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ fontSize: 20 }}>{baseConfig.icon}</span><span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{baseConfig.nombre}</span><span style={{ fontSize: 11, color: C.textMut }}>{baseConfig.art}</span></div>
            <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.5 }}>{baseConfig.desc}</div>
          </div>
        )}
        {hasMenores && <div style={{ padding: "12px 16px", background: C.redLt, borderRadius: 8, fontSize: 12, color: C.red, marginBottom: 16, borderLeft: `3px solid ${C.red}`, lineHeight: 1.5 }}>🔴 <strong>Actividad involucra datos de menores de 16 años.</strong> Se requiere consentimiento parental (Art. 16° quáter).</div>}
        {editMode ? <Input label="Justificación" value={localVinc.justificacion} onChange={v => setLocalVinc({ ...localVinc, justificacion: v })} placeholder="Justifique..." textarea required /> : localVinc.justificacion ? <div style={{ marginBottom: 16 }}><div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>Justificación</div><div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, padding: "10px 14px", background: C.bg, borderRadius: 8 }}>{localVinc.justificacion}</div></div> : null}

        {localVinc.base === "consentimiento" && <div style={{ marginTop: 16 }}>{editMode ? <ConsentimientoManager consentimientos={localVinc.consentimientos || []} onChange={c => setLocalVinc({ ...localVinc, consentimientos: c })} /> : <div><div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>Consentimientos por Finalidad</div>{(localVinc.consentimientos || []).map((c, i) => <div key={i} style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 6, border: `1px solid ${c.obtenido ? C.green : C.border}`, background: c.obtenido ? "#f0fdf9" : C.white, display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontSize: 13, color: C.text }}>{c.fin}</div><div style={{ fontSize: 11, color: C.textMut }}>{c.separado ? "Consentimiento separado" : "⚠️ No separado"}</div></div>{c.obtenido ? <Badge text={`✓ Obtenido ${c.fecha}`} color={C.green} bg={C.greenLt} /> : <Badge text="Pendiente" color={C.orange} bg={C.orangeLt} />}</div>)}</div>}</div>}

        {localVinc.base === "interes_legitimo" && localVinc.ponderacion && <div style={{ marginTop: 16 }}>{editMode ? <PonderacionForm ponderacion={localVinc.ponderacion} onChange={p => setLocalVinc({ ...localVinc, ponderacion: p })} /> : <div><div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Ponderación de Interés Legítimo</div>{[{ key: "interes", label: "Interés perseguido" }, { key: "necesidad", label: "Análisis de necesidad" }, { key: "proporcionalidad", label: "Proporcionalidad" }, { key: "impactoTitular", label: "Impacto en el titular" }, { key: "mitigacion", label: "Medidas de mitigación" }].map(f => localVinc.ponderacion[f.key] ? <div key={f.key} style={{ marginBottom: 10 }}><div style={{ fontSize: 12, fontWeight: 600, color: C.textSec }}>{f.label}</div><div style={{ fontSize: 13, color: C.text, padding: "6px 0", lineHeight: 1.5 }}>{localVinc.ponderacion[f.key]}</div></div> : null)}<Badge text={`Resultado: ${localVinc.ponderacion.resultado === "favorable" ? "Favorable ✓" : localVinc.ponderacion.resultado === "desfavorable" ? "Desfavorable ⛔" : "Pendiente"}`} color={localVinc.ponderacion.resultado === "favorable" ? C.green : localVinc.ponderacion.resultado === "desfavorable" ? C.red : C.yellow} bg={localVinc.ponderacion.resultado === "favorable" ? C.greenLt : localVinc.ponderacion.resultado === "desfavorable" ? C.redLt : C.yellowLt} /></div>}</div>}

        {localVinc.base === "obligacion_legal" && <div style={{ marginTop: 16 }}><div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>Norma de referencia</div>{editMode ? <Input label="" value={localVinc.normaReferencia} onChange={v => setLocalVinc({ ...localVinc, normaReferencia: v })} placeholder="Identifique la norma legal específica..." textarea /> : <div style={{ fontSize: 13, color: C.text, padding: "10px 14px", background: C.bg, borderRadius: 8, lineHeight: 1.5 }}>{localVinc.normaReferencia || <span style={{ color: C.textMut, fontStyle: "italic" }}>Sin norma especificada</span>}</div>}</div>}

        {localVinc.base === "ejecucion_contrato" && <div style={{ marginTop: 16 }}><div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>Análisis de necesidad</div>{editMode ? <Input label="" value={localVinc.necesidadAnalisis} onChange={v => setLocalVinc({ ...localVinc, necesidadAnalisis: v })} placeholder="Explique por qué los datos son necesarios para el contrato..." textarea /> : <div style={{ fontSize: 13, color: C.text, padding: "10px 14px", background: C.bg, borderRadius: 8, lineHeight: 1.5 }}>{localVinc.necesidadAnalisis || <span style={{ color: C.textMut, fontStyle: "italic" }}>Sin análisis registrado</span>}</div>}<div style={{ marginTop: 8, padding: "10px 14px", background: C.greenLt, borderRadius: 8, fontSize: 12, color: C.green, lineHeight: 1.5 }}>ℹ️ No puede supeditarse la prestación del servicio a datos no estrictamente necesarios.</div></div>}

        {editMode && <div style={{ display: "flex", gap: 8, marginTop: 20 }}><Btn variant="secondary" onClick={() => { setLocalVinc(vinculacion); setEditMode(false); }}>Cancelar</Btn><Btn onClick={handleSave}>💾 Guardar cambios</Btn></div>}
        {localVinc.fechaValidacion && <div style={{ marginTop: 16, display: "flex", gap: 16, fontSize: 11, color: C.textMut }}><span>Validado: {localVinc.fechaValidacion}</span><span>Por: {localVinc.validadoPor}</span></div>}
      </div>
    </div>
  );
};

// ===== NEW VINCULACION =====
const NewVinculacion = ({ onSave, onCancel, actividades, existingRatIds, onRatSelect, onBaseSelect }) => {
  const available = actividades.filter(a => !existingRatIds.includes(a.id));
  const [selectedRat, setSelectedRat] = useState("");
  const [selectedBase, setSelectedBase] = useState("");
  const [justificacion, setJustificacion] = useState("");

  const handleRatSelect = (id) => { setSelectedRat(id); onRatSelect(id); };
  const handleBaseSelect = (id) => { setSelectedBase(id); onBaseSelect(id); };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <Btn variant="ghost" onClick={onCancel}>← Volver</Btn>
        <h2 style={{ margin: 0, fontSize: 18, color: C.text }}>Vincular Base de Licitud</h2>
      </div>
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, boxShadow: C.cardShadow }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>Actividad del RAT <span style={{ color: C.red }}>*</span></label>
          {available.length === 0 ? <div style={{ padding: "12px 16px", background: C.greenLt, borderRadius: 8, fontSize: 13, color: C.green }}>✓ Todas las actividades tienen base de licitud.</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {available.map(a => (
                <div key={a.id} onClick={() => handleRatSelect(a.id)} style={{ padding: "12px 16px", borderRadius: 8, cursor: "pointer", border: selectedRat === a.id ? `2px solid ${C.blue}` : `1px solid ${C.border}`, background: selectedRat === a.id ? C.blueLt : C.white }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><span style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{a.nombre}</span><span style={{ fontSize: 11, color: C.textMut, marginLeft: 8 }}>{a.niref}</span></div>
                    <RiskBadge level={a.riesgo} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedRat && (
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 8 }}>Base de Licitud <span style={{ color: C.red }}>*</span></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {basesLicitud.map(b => (
                <div key={b.id} onClick={() => handleBaseSelect(b.id)} style={{ padding: "14px 16px", borderRadius: 10, cursor: "pointer", border: selectedBase === b.id ? `2px solid ${b.color}` : `1px solid ${C.border}`, background: selectedBase === b.id ? `${b.color}11` : C.white }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ fontSize: 18 }}>{b.icon}</span><span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{b.nombre}</span></div>
                  <div style={{ fontSize: 11, color: C.textSec, lineHeight: 1.4 }}>{b.desc.slice(0, 100)}...</div>
                  <div style={{ fontSize: 10, color: C.textMut, marginTop: 4 }}>{b.art}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedBase && <Input label="Justificación" value={justificacion} onChange={setJustificacion} placeholder="Explique por qué esta base aplica..." textarea required />}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <Btn variant="secondary" onClick={onCancel}>Cancelar</Btn>
          <Btn onClick={() => onSave({ ratId: selectedRat, base: selectedBase, justificacion })} disabled={!selectedRat || !selectedBase || !justificacion}>💾 Crear Vinculación</Btn>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN =====
export default function ModuloLicitud() {
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState("list");
  const [vinculaciones, setVinculaciones] = useState(initialVinculaciones);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("todos");
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [createRatId, setCreateRatId] = useState("");
  const [createBase, setCreateBase] = useState("");

  const existingRatIds = vinculaciones.map(v => v.ratId);
  const sinAsignar = ratActividades.filter(a => !existingRatIds.includes(a.id));

  const stats = useMemo(() => ({ total: vinculaciones.length, validadas: vinculaciones.filter(v => v.estado === "Validada").length, pendientes: vinculaciones.filter(v => v.estado !== "Validada").length, sinAsignar: sinAsignar.length }), [vinculaciones, sinAsignar]);
  const filtered = useMemo(() => { if (filter === "validadas") return vinculaciones.filter(v => v.estado === "Validada"); if (filter === "pendientes") return vinculaciones.filter(v => v.estado !== "Validada"); return vinculaciones; }, [vinculaciones, filter]);

  const handleNewSave = ({ ratId, base, justificacion }) => {
    const newVinc = { id: `LIC-${String(vinculaciones.length + 1).padStart(3, "0")}`, ratId, base, estado: "Pendiente", justificacion, normaReferencia: "", necesidadAnalisis: "", consentimientos: base === "consentimiento" ? [{ fin: "", obtenido: false, fecha: "", separado: true }] : [], ponderacion: base === "interes_legitimo" ? { interes: "", necesidad: "", proporcionalidad: "", impactoTitular: "", mitigacion: "", resultado: "pendiente" } : undefined, fechaValidacion: "", validadoPor: "" };
    setVinculaciones([...vinculaciones, newVinc]); setView("list");
  };
  const handleUpdate = (updated) => setVinculaciones(vinculaciones.map(v => v.id === updated.id ? updated : v));

  const ml = collapsed ? 56 : 210;
  const mr = copilotOpen ? 380 : 0;
  const selectedVinc = selectedId ? vinculaciones.find(v => v.id === selectedId) : null;
  const selectedRat = selectedVinc ? ratActividades.find(a => a.id === selectedVinc.ratId) : null;

  const renderContent = () => {
    if (view === "detail" && selectedVinc && selectedRat) {
      return <DetailView vinculacion={selectedVinc} rat={selectedRat} onBack={() => { setView("list"); setSelectedId(null); }} onUpdate={handleUpdate} />;
    }
    if (view === "create") {
      return <NewVinculacion onSave={handleNewSave} onCancel={() => setView("list")} actividades={ratActividades} existingRatIds={existingRatIds} onRatSelect={setCreateRatId} onBaseSelect={setCreateBase} />;
    }
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text }}>Motor de Licitud</h1>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: C.textSec }}>Validación de bases legales · Arts. 12° y 13° Ley 21.719</p>
          </div>
          <Btn onClick={() => setView("create")}>+ Vincular Base de Licitud</Btn>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          {[{ label: "Vinculadas", value: stats.total, color: C.blue, f: "todos" }, { label: "Validadas", value: stats.validadas, color: C.green, f: "validadas" }, { label: "Pendientes", value: stats.pendientes, color: C.yellow, f: "pendientes" }, { label: "Sin asignar", value: stats.sinAsignar, color: C.red, f: "sinasignar" }].map(s => (
            <div key={s.f} onClick={() => setFilter(filter === s.f ? "todos" : s.f)} style={{ background: C.white, borderRadius: 8, padding: "10px 18px", cursor: "pointer", border: filter === s.f ? `2px solid ${s.color}` : `1px solid ${C.border}`, flex: 1, minWidth: 120 }}>
              <div style={{ fontSize: 11, color: C.textSec }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        {sinAsignar.length > 0 && <div style={{ padding: "12px 18px", background: C.redLt, borderRadius: 10, marginBottom: 16, borderLeft: `3px solid ${C.red}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontSize: 13, fontWeight: 700, color: C.red }}>⚠️ {sinAsignar.length} actividad{sinAsignar.length > 1 ? "es" : ""} sin base de licitud</div><div style={{ fontSize: 12, color: C.red, marginTop: 2 }}>{sinAsignar.map(a => a.nombre).join(", ")}</div></div><Btn variant="danger" onClick={() => setView("create")} style={{ fontSize: 12, padding: "6px 14px" }}>Asignar ahora</Btn></div>}
        <div style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: C.cardShadow }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr style={{ background: C.bg }}>{["Actividad RAT", "Base de Licitud", "Requisitos", "Estado", "Validación"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: C.textSec, borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(v => {
                const rat = ratActividades.find(a => a.id === v.ratId);
                const base = basesLicitud.find(b => b.id === v.base);
                if (!rat || !base) return null;
                let requisitos = "";
                if (v.base === "consentimiento") { const t = v.consentimientos?.length || 0; const o = v.consentimientos?.filter(c => c.obtenido).length || 0; requisitos = `${o}/${t} consentimientos`; }
                else if (v.base === "interes_legitimo") requisitos = v.ponderacion?.resultado === "favorable" ? "Ponderación favorable" : v.ponderacion?.resultado === "desfavorable" ? "Ponderación desfavorable" : "Ponderación pendiente";
                else if (v.base === "obligacion_legal") requisitos = v.normaReferencia ? "Norma identificada" : "Norma pendiente";
                else if (v.base === "ejecucion_contrato") requisitos = v.necesidadAnalisis ? "Necesidad analizada" : "Análisis pendiente";
                return (
                  <tr key={v.id} onClick={() => { setSelectedId(v.id); setView("detail"); }} style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = C.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 14px" }}><div style={{ fontWeight: 600, color: C.text }}>{rat.nombre}</div><div style={{ fontSize: 11, color: C.textMut }}>{rat.niref} · {rat.responsable}</div></td>
                    <td style={{ padding: "12px 14px" }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 16 }}>{base.icon}</span><span style={{ fontWeight: 600, color: C.text }}>{base.nombre}</span></div></td>
                    <td style={{ padding: "12px 14px", color: C.textSec }}>{requisitos}</td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge estado={v.estado} /></td>
                    <td style={{ padding: "12px 14px", fontSize: 11, color: C.textMut }}>{v.fechaValidacion ? `${v.fechaValidacion} · ${v.validadoPor}` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div style={{ flex: 1, marginLeft: ml, marginRight: mr, transition: "margin-left 0.2s, margin-right 0.3s" }}>
        <div style={{ height: 52, background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: C.textSec }}>Protección de Datos</span>
            <span style={{ color: C.textMut, margin: "0 6px" }}>›</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Motor de Licitud</span>
          </div>
          {!copilotOpen && <button onClick={() => setCopilotOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: `linear-gradient(135deg, ${C.ai}12 0%, ${C.ai}06 100%)`, border: `1px solid ${C.ai}33`, color: C.ai, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>🤖 Asistente IA</button>}
        </div>
        <div style={{ padding: "22px 28px", maxWidth: 1200 }}>{renderContent()}</div>
      </div>
      <AICopilot open={copilotOpen} onToggle={() => setCopilotOpen(!copilotOpen)} currentView={view} vinculacion={selectedVinc} rat={selectedRat} selectedRatId={createRatId} selectedBase={createBase} />
    </div>
  );
}

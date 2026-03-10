import { useState, useMemo, useRef, useEffect } from "react";

// ============================================
// REGCHEQ - Módulo de Derechos ARCO+
// Gestión de Solicitudes de Titulares
// Ley 21.719 - Chile
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
  cyan: "#06b6d4", cyanLt: "#cffafe",
  border: "#e2e4ed",
  shadow: "0 1px 4px rgba(20,18,66,0.06)",
};

// ===== Tipos de derecho =====
const tiposDerechos = [
  { id: "acceso", nombre: "Acceso", icon: "👁️", color: C.blue, bg: C.blueLt, desc: "Confirmar si se tratan datos y obtener copia", art: "Art. 5° Ley 21.719", plazo: 30 },
  { id: "rectificacion", nombre: "Rectificación", icon: "✏️", color: C.orange, bg: C.orangeLt, desc: "Corregir datos inexactos o incompletos", art: "Art. 6° Ley 21.719", plazo: 30 },
  { id: "supresion", nombre: "Supresión", icon: "🗑️", color: C.red, bg: C.redLt, desc: "Eliminar datos cuando no exista base legal para su tratamiento", art: "Art. 7° Ley 21.719", plazo: 30 },
  { id: "bloqueo", nombre: "Bloqueo", icon: "🔒", color: C.purple, bg: C.purpleLt, desc: "Suspender temporalmente el tratamiento mientras se resuelve una solicitud", art: "Art. 7° bis Ley 21.719", plazo: 30 },
  { id: "portabilidad", nombre: "Portabilidad", icon: "📦", color: C.cyan, bg: C.cyanLt, desc: "Entregar copia en formato electrónico estructurado y de uso común", art: "Art. 9° Ley 21.719", plazo: 30 },
  { id: "oposicion", nombre: "Oposición a Decisión Automatizada", icon: "🤖", color: C.navyDark, bg: "#e8e8f0", desc: "Solicitar intervención humana e impugnar decisiones basadas en algoritmos", art: "Art. 8° bis Ley 21.719", plazo: 30 },
];

// ===== Estados =====
const estadoConfig = {
  "Recibida": { color: C.blue, bg: C.blueLt, icon: "📥" },
  "En evaluación": { color: C.purple, bg: C.purpleLt, icon: "🔍" },
  "En proceso": { color: C.orange, bg: C.orangeLt, icon: "⚙️" },
  "Esperando información": { color: C.yellow, bg: C.yellowLt, icon: "⏳" },
  "Completada": { color: C.green, bg: C.greenLt, icon: "✅" },
  "Rechazada": { color: C.red, bg: C.redLt, icon: "❌" },
};

const formatosExport = ["CSV", "JSON", "XML", "Excel (.xlsx)"];

// ===== DEMO DATA =====
const initialSolicitudes = [
  {
    id: "ARCO-001", tipo: "acceso",
    titular: { nombre: "Juan Pérez Morales", rut: "12.345.678-9", email: "jperez@email.com", telefono: "+56 9 1234 5678" },
    fechaSolicitud: "2025-10-28", plazoLegal: "2025-11-27",
    estado: "Completada", prioridad: "Normal",
    canal: "Portal web",
    descripcion: "Solicito conocer qué datos personales míos están siendo tratados por la empresa, con qué finalidad y si han sido compartidos con terceros.",
    datosInvolucrados: ["Identificación", "Contacto", "Financiero"],
    actividadesRAT: ["RAT-001", "RAT-005"],
    historial: [
      { fecha: "2025-10-28", accion: "Solicitud recibida", responsable: "Sistema", detalle: "Ingreso automático vía portal web" },
      { fecha: "2025-10-29", accion: "Asignada a evaluación", responsable: "Carolina Méndez", detalle: "Verificación de identidad del titular" },
      { fecha: "2025-10-30", accion: "Identidad verificada", responsable: "Carolina Méndez", detalle: "RUT y email coinciden con registros" },
      { fecha: "2025-11-05", accion: "Informe generado", responsable: "Carolina Méndez", detalle: "Se recopiló información de RAT-001 y RAT-005" },
      { fecha: "2025-11-07", accion: "Respuesta enviada al titular", responsable: "Carolina Méndez", detalle: "Informe completo enviado por email cifrado" },
    ],
    respuesta: "Se entregó informe detallado con todos los datos personales tratados, finalidades, bases de licitud y destinatarios.",
    fechaRespuesta: "2025-11-07",
  },
  {
    id: "ARCO-002", tipo: "rectificacion",
    titular: { nombre: "María González López", rut: "14.567.890-1", email: "mgonzalez@email.com", telefono: "+56 9 8765 4321" },
    fechaSolicitud: "2025-11-10", plazoLegal: "2025-12-10",
    estado: "En proceso", prioridad: "Alta",
    canal: "Email",
    descripcion: "Mi dirección de domicilio está incorrecta en sus registros. La dirección correcta es Av. Libertador 4521, depto 302, Providencia. También mi estado civil cambió a casada.",
    datosInvolucrados: ["Contacto", "Identificación"],
    actividadesRAT: ["RAT-001"],
    datosRectificar: [
      { campo: "Domicilio", valorActual: "Av. Libertador 4521, depto 201, Providencia", valorNuevo: "Av. Libertador 4521, depto 302, Providencia", aprobado: true },
      { campo: "Estado civil", valorActual: "Soltera", valorNuevo: "Casada", aprobado: false },
    ],
    historial: [
      { fecha: "2025-11-10", accion: "Solicitud recibida", responsable: "Sistema", detalle: "Ingreso vía email" },
      { fecha: "2025-11-11", accion: "Asignada a evaluación", responsable: "Carolina Méndez", detalle: "" },
      { fecha: "2025-11-13", accion: "Verificación de identidad", responsable: "Carolina Méndez", detalle: "Se solicitó documento de respaldo" },
      { fecha: "2025-11-18", accion: "Rectificación parcial", responsable: "Carolina Méndez", detalle: "Dirección actualizada. Estado civil pendiente de documento de respaldo." },
    ],
    respuesta: "",
    fechaRespuesta: "",
  },
  {
    id: "ARCO-003", tipo: "supresion",
    titular: { nombre: "Carlos Muñoz Rivera", rut: "16.789.012-3", email: "cmunoz@email.com", telefono: "+56 9 5555 1234" },
    fechaSolicitud: "2025-11-15", plazoLegal: "2025-12-15",
    estado: "En evaluación", prioridad: "Alta",
    canal: "Portal web",
    descripcion: "Solicito la eliminación completa de mis datos personales de todos sus sistemas. Ya no soy cliente y no deseo que mantengan mi información.",
    datosInvolucrados: ["Identificación", "Contacto", "Transaccional", "Preferencias"],
    actividadesRAT: ["RAT-002", "RAT-005"],
    evaluacionSupresion: {
      obligacionLegal: true,
      detalleObligacion: "Datos tributarios deben conservarse por 6 años (Art. 200 Código Tributario). Datos de facturación no pueden eliminarse.",
      supresionParcial: true,
      datosEliminables: ["Email marketing", "Preferencias de compra", "Historial de navegación"],
      datosRetenidos: ["Nombre", "RUT", "Historial de facturación"],
      motivoRetencion: "Obligación legal tributaria y contractual",
    },
    historial: [
      { fecha: "2025-11-15", accion: "Solicitud recibida", responsable: "Sistema", detalle: "Ingreso vía portal web" },
      { fecha: "2025-11-16", accion: "Asignada a evaluación", responsable: "Carolina Méndez", detalle: "" },
      { fecha: "2025-11-19", accion: "Análisis de obligaciones legales", responsable: "Carolina Méndez", detalle: "Se detectó obligación de retención tributaria" },
    ],
    respuesta: "",
    fechaRespuesta: "",
  },
  {
    id: "ARCO-004", tipo: "portabilidad",
    titular: { nombre: "Ana Silva Torres", rut: "18.901.234-5", email: "asilva@email.com", telefono: "+56 9 7777 8888" },
    fechaSolicitud: "2025-11-18", plazoLegal: "2025-12-18",
    estado: "En proceso", prioridad: "Normal",
    canal: "Email",
    descripcion: "Necesito una copia de todos mis datos en formato electrónico para trasladarlos a otra empresa proveedora de servicios similares.",
    datosInvolucrados: ["Identificación", "Contacto", "Transaccional"],
    actividadesRAT: ["RAT-005", "RAT-007"],
    portabilidad: {
      formatoSeleccionado: "JSON",
      datosIncluidos: ["Datos de identificación", "Historial de compras", "Puntos acumulados", "Preferencias registradas"],
      archivoGenerado: false,
      pesoEstimado: "2.4 MB",
    },
    historial: [
      { fecha: "2025-11-18", accion: "Solicitud recibida", responsable: "Sistema", detalle: "Ingreso vía email" },
      { fecha: "2025-11-19", accion: "Asignada", responsable: "Carolina Méndez", detalle: "" },
      { fecha: "2025-11-22", accion: "Recopilación de datos", responsable: "Carolina Méndez", detalle: "Extrayendo datos de RAT-005 y RAT-007" },
    ],
    respuesta: "",
    fechaRespuesta: "",
  },
  {
    id: "ARCO-005", tipo: "oposicion",
    titular: { nombre: "Pedro Rojas Albornoz", rut: "11.223.344-6", email: "projas@email.com", telefono: "+56 9 3333 4444" },
    fechaSolicitud: "2025-11-20", plazoLegal: "2025-12-20",
    estado: "Recibida", prioridad: "Alta",
    canal: "Carta certificada",
    descripcion: "Me opongo a la decisión automatizada que rechazó mi solicitud de crédito. Exijo que un ser humano revise mi caso y me explique los criterios utilizados por el algoritmo.",
    datosInvolucrados: ["Identificación", "Financiero", "Crediticio"],
    actividadesRAT: ["RAT-004", "RAT-008"],
    oposicionAutomatizada: {
      decisionImpugnada: "Rechazo de solicitud de crédito por scoring automatizado",
      algoritmoInvolucrado: "Modelo de scoring crediticio v3.2",
      intervencionHumana: false,
      revisorAsignado: "",
      resultadoRevision: "",
    },
    historial: [
      { fecha: "2025-11-20", accion: "Solicitud recibida", responsable: "Sistema", detalle: "Ingreso vía carta certificada" },
      { fecha: "2025-11-21", accion: "Registrada en sistema", responsable: "Recepción", detalle: "Carta digitalizada y registrada" },
    ],
    respuesta: "",
    fechaRespuesta: "",
  },
  {
    id: "ARCO-006", tipo: "bloqueo",
    titular: { nombre: "Claudia Fernández Bravo", rut: "15.678.901-2", email: "cfernandez@email.com", telefono: "+56 9 6666 7777" },
    fechaSolicitud: "2025-11-22", plazoLegal: "2025-12-22",
    estado: "Recibida", prioridad: "Normal",
    canal: "Portal web",
    descripcion: "Solicito el bloqueo temporal de mis datos mientras se resuelve mi solicitud de supresión que presenté la semana pasada. No deseo que se sigan usando mis datos para marketing.",
    datosInvolucrados: ["Identificación", "Contacto", "Preferencias"],
    actividadesRAT: ["RAT-002"],
    bloqueo: {
      motivo: "Pendiente resolución de solicitud de supresión",
      actividadesBloqueadas: ["Marketing directo por email"],
      fechaBloqueo: "",
      fechaDesbloqueo: "",
    },
    historial: [
      { fecha: "2025-11-22", accion: "Solicitud recibida", responsable: "Sistema", detalle: "Ingreso vía portal web" },
    ],
    respuesta: "",
    fechaRespuesta: "",
  },
  {
    id: "ARCO-007", tipo: "acceso",
    titular: { nombre: "Roberto Díaz Castillo", rut: "13.456.789-0", email: "rdiaz@email.com", telefono: "+56 9 2222 3333" },
    fechaSolicitud: "2025-10-05", plazoLegal: "2025-11-04",
    estado: "Completada", prioridad: "Normal",
    canal: "Email",
    descripcion: "Quisiera saber si tienen datos míos y en qué bases de datos están almacenados.",
    datosInvolucrados: ["Identificación", "Contacto"],
    actividadesRAT: ["RAT-007"],
    historial: [
      { fecha: "2025-10-05", accion: "Solicitud recibida", responsable: "Sistema", detalle: "" },
      { fecha: "2025-10-06", accion: "Asignada", responsable: "Carolina Méndez", detalle: "" },
      { fecha: "2025-10-10", accion: "Informe generado", responsable: "Carolina Méndez", detalle: "" },
      { fecha: "2025-10-12", accion: "Respuesta enviada", responsable: "Carolina Méndez", detalle: "Dentro del plazo legal" },
    ],
    respuesta: "Se informó al titular sobre los datos tratados en el contexto de atención de reclamos.",
    fechaRespuesta: "2025-10-12",
  },
];

// ===== SIDEBAR =====
// ===== UI =====
const Badge = ({ text, color, bg }) => <span style={{ padding: "2px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: bg, color, whiteSpace: "nowrap" }}>{text}</span>;
const Btn = ({ children, onClick, variant = "primary", style: s = {}, disabled }) => {
  const base = { padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", border: "none", opacity: disabled ? 0.5 : 1, ...s };
  const v = { primary: { ...base, background: C.navyDark, color: "#fff" }, secondary: { ...base, background: C.white, color: C.text, border: `1px solid ${C.border}` }, ghost: { ...base, background: "transparent", color: C.textSec, padding: "9px 12px" }, success: { ...base, background: C.green, color: "#fff" } };
  return <button onClick={disabled ? undefined : onClick} style={v[variant]}>{children}</button>;
};
const Input = ({ label, value, onChange, placeholder, textarea, required, type = "text" }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>{label} {required && <span style={{ color: C.red }}>*</span>}</label>
    {textarea ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, resize: "vertical", minHeight: 70, fontFamily: "inherit", boxSizing: "border-box" }} />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, boxSizing: "border-box" }} />
    )}
  </div>
);

// ===== DEADLINE BAR =====
const DeadlineBar = ({ fechaSolicitud, plazoLegal, estado }) => {
  if (estado === "Completada" || estado === "Rechazada") return null;
  const start = new Date(fechaSolicitud).getTime();
  const end = new Date(plazoLegal).getTime();
  const now = new Date("2025-11-25").getTime();
  const totalDays = Math.ceil((end - start) / 86400000);
  const elapsed = Math.ceil((now - start) / 86400000);
  const remaining = Math.max(0, totalDays - elapsed);
  const pct = Math.min(100, (elapsed / totalDays) * 100);
  const urgent = remaining <= 5;
  const critical = remaining <= 2;
  const color = critical ? C.red : urgent ? C.orange : remaining <= 10 ? C.yellow : C.green;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: C.textSec }}>Plazo legal: 30 días corridos</span>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>
          {remaining} día{remaining !== 1 ? "s" : ""} restante{remaining !== 1 ? "s" : ""}
          {critical ? " ⚠️ CRÍTICO" : urgent ? " ⚠️" : ""}
        </span>
      </div>
      <div style={{ height: 8, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.5s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMut, marginTop: 2 }}>
        <span>{fechaSolicitud}</span>
        <span>{plazoLegal}</span>
      </div>
    </div>
  );
};

// ===== DETAIL VIEW =====
const DetailView = ({ solicitud: initial, onBack, onUpdate }) => {
  const [sol, setSol] = useState(initial);
  const tipo = tiposDerechos.find(t => t.id === sol.tipo);
  const estConf = estadoConfig[sol.estado];

  const addHistorial = (accion, detalle) => {
    const entry = { fecha: "2025-11-25", accion, responsable: "Usuario actual", detalle };
    setSol(prev => ({ ...prev, historial: [...prev.historial, entry] }));
  };

  const changeEstado = (nuevoEstado) => {
    addHistorial(`Estado cambiado a: ${nuevoEstado}`, "");
    const updated = { ...sol, estado: nuevoEstado, historial: [...sol.historial, { fecha: "2025-11-25", accion: `Estado cambiado a: ${nuevoEstado}`, responsable: "Usuario actual", detalle: "" }] };
    if (nuevoEstado === "Completada") {
      updated.fechaRespuesta = "2025-11-25";
    }
    setSol(updated);
    onUpdate(updated);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Btn variant="ghost" onClick={onBack}>← Volver</Btn>
        <span style={{ fontSize: 12, color: C.textMut }}>{sol.id}</span>
      </div>

      {/* Header card */}
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 14, boxShadow: C.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: tipo?.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{tipo?.icon}</div>
            <div>
              <div style={{ fontSize: 11, color: C.textMut }}>{tipo?.art}</div>
              <h2 style={{ margin: "2px 0 0", fontSize: 18, color: C.text }}>{tipo?.nombre}</h2>
              <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{tipo?.desc}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Badge text={sol.prioridad} color={sol.prioridad === "Alta" ? C.red : C.textSec} bg={sol.prioridad === "Alta" ? C.redLt : C.bg} />
            <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600, background: estConf?.bg, color: estConf?.color }}>
              {estConf?.icon} {sol.estado}
            </span>
          </div>
        </div>

        <DeadlineBar fechaSolicitud={sol.fechaSolicitud} plazoLegal={sol.plazoLegal} estado={sol.estado} />

        {/* Titular info */}
        <div style={{ padding: "14px 18px", background: C.bg, borderRadius: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>Datos del Titular</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "Nombre", value: sol.titular.nombre },
              { label: "RUT", value: sol.titular.rut },
              { label: "Email", value: sol.titular.email },
              { label: "Teléfono", value: sol.titular.telefono },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: 10, color: C.textMut }}>{f.label}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>Descripción de la solicitud</div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, padding: "10px 14px", background: C.bg, borderRadius: 8 }}>{sol.descripcion}</div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: C.textSec }}>Canal: <strong style={{ color: C.text }}>{sol.canal}</strong></div>
          <span style={{ color: C.textMut }}>·</span>
          <div style={{ fontSize: 12, color: C.textSec }}>Actividades vinculadas: {sol.actividadesRAT?.map(r => <Badge key={r} text={r} color={C.blue} bg={C.blueLt} />)}</div>
        </div>
      </div>

      {/* Tipo-specific sections */}
      {sol.tipo === "rectificacion" && sol.datosRectificar && (
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 14, boxShadow: C.shadow }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, color: C.text }}>✏️ Datos a Rectificar</h3>
          {sol.datosRectificar.map((d, i) => (
            <div key={i} style={{ padding: "12px 16px", borderRadius: 8, marginBottom: 8, border: `1px solid ${d.aprobado ? C.green : C.border}`, background: d.aprobado ? "#f0fdf9" : C.white }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>{d.campo}</div>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: C.textMut }}>Valor actual</div>
                  <div style={{ fontSize: 12, color: C.red, textDecoration: d.aprobado ? "line-through" : "none" }}>{d.valorActual}</div>
                </div>
                <div style={{ fontSize: 18, color: C.textMut, alignSelf: "center" }}>→</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: C.textMut }}>Valor solicitado</div>
                  <div style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>{d.valorNuevo}</div>
                </div>
                <Badge text={d.aprobado ? "✓ Aplicado" : "Pendiente"} color={d.aprobado ? C.green : C.orange} bg={d.aprobado ? C.greenLt : C.orangeLt} />
              </div>
            </div>
          ))}
        </div>
      )}

      {sol.tipo === "supresion" && sol.evaluacionSupresion && (
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 14, boxShadow: C.shadow }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, color: C.text }}>🗑️ Evaluación de Supresión</h3>
          {sol.evaluacionSupresion.obligacionLegal && (
            <div style={{ padding: "12px 16px", background: C.yellowLt, borderRadius: 8, marginBottom: 14, borderLeft: `3px solid ${C.yellow}`, fontSize: 12, color: C.yellow, lineHeight: 1.5 }}>
              ⚠️ <strong>Obligación legal de retención detectada.</strong> {sol.evaluacionSupresion.detalleObligacion}
            </div>
          )}
          {sol.evaluacionSupresion.supresionParcial && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ padding: "14px 16px", background: C.greenLt, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 6 }}>✓ Datos eliminables</div>
                {sol.evaluacionSupresion.datosEliminables.map(d => (
                  <div key={d} style={{ fontSize: 12, color: C.text, padding: "2px 0" }}>• {d}</div>
                ))}
              </div>
              <div style={{ padding: "14px 16px", background: C.redLt, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 6 }}>✕ Datos retenidos por obligación legal</div>
                {sol.evaluacionSupresion.datosRetenidos.map(d => (
                  <div key={d} style={{ fontSize: 12, color: C.text, padding: "2px 0" }}>• {d}</div>
                ))}
                <div style={{ fontSize: 11, color: C.textMut, marginTop: 6 }}>Motivo: {sol.evaluacionSupresion.motivoRetencion}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {sol.tipo === "portabilidad" && sol.portabilidad && (
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 14, boxShadow: C.shadow }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, color: C.text }}>📦 Portabilidad de Datos</h3>
          <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>Formato de entrega</div>
              <div style={{ display: "flex", gap: 6 }}>
                {formatosExport.map(f => (
                  <div key={f} style={{
                    padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                    border: sol.portabilidad.formatoSeleccionado === f.split(" ")[0] ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
                    background: sol.portabilidad.formatoSeleccionado === f.split(" ")[0] ? C.blueLt : C.white,
                    color: sol.portabilidad.formatoSeleccionado === f.split(" ")[0] ? C.blue : C.textSec,
                  }}>{f}</div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>Peso estimado</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{sol.portabilidad.pesoEstimado}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>Datos incluidos en el paquete</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {sol.portabilidad.datosIncluidos.map(d => <Badge key={d} text={d} color={C.cyan} bg={C.cyanLt} />)}
          </div>
          {!sol.portabilidad.archivoGenerado && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: C.orangeLt, borderRadius: 8, fontSize: 12, color: C.orange }}>
              📦 Archivo de portabilidad pendiente de generación
            </div>
          )}
        </div>
      )}

      {sol.tipo === "oposicion" && sol.oposicionAutomatizada && (
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 14, boxShadow: C.shadow }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, color: C.text }}>🤖 Oposición a Decisión Automatizada</h3>
          <div style={{ padding: "12px 16px", background: C.purpleLt, borderRadius: 8, marginBottom: 14, fontSize: 12, color: C.purple, lineHeight: 1.5 }}>
            ℹ️ El titular tiene derecho a solicitar intervención humana, obtener explicación de la lógica del algoritmo e impugnar la decisión (Art. 8° bis Ley 21.719).
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ padding: "12px 16px", background: C.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: C.textMut }}>Decisión impugnada</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{sol.oposicionAutomatizada.decisionImpugnada}</div>
            </div>
            <div style={{ padding: "12px 16px", background: C.bg, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: C.textMut }}>Algoritmo involucrado</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{sol.oposicionAutomatizada.algoritmoInvolucrado}</div>
            </div>
          </div>
          <div style={{ marginTop: 14, padding: "14px 18px", borderRadius: 10, border: `2px solid ${sol.oposicionAutomatizada.intervencionHumana ? C.green : C.red}`, background: sol.oposicionAutomatizada.intervencionHumana ? C.greenLt : C.redLt }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: sol.oposicionAutomatizada.intervencionHumana ? C.green : C.red }}>
              {sol.oposicionAutomatizada.intervencionHumana ? "✅ Intervención humana realizada" : "⚠️ Intervención humana pendiente"}
            </div>
            {sol.oposicionAutomatizada.intervencionHumana ? (
              <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>Revisor: {sol.oposicionAutomatizada.revisorAsignado}</div>
            ) : (
              <div style={{ fontSize: 12, color: C.red, marginTop: 4 }}>Se debe asignar un revisor humano para evaluar el caso antes de responder al titular.</div>
            )}
          </div>
        </div>
      )}

      {sol.tipo === "bloqueo" && sol.bloqueo && (
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 14, boxShadow: C.shadow }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, color: C.text }}>🔒 Bloqueo Temporal</h3>
          <div style={{ padding: "12px 16px", background: C.bg, borderRadius: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.textMut }}>Motivo del bloqueo</div>
            <div style={{ fontSize: 13, color: C.text }}>{sol.bloqueo.motivo}</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 6 }}>Actividades de tratamiento a bloquear</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {sol.bloqueo.actividadesBloqueadas.map(a => (
              <div key={a} style={{ padding: "8px 14px", borderRadius: 8, background: C.purpleLt, border: `1px solid ${C.purple}`, fontSize: 12, fontWeight: 600, color: C.purple }}>
                🔒 {a}
              </div>
            ))}
          </div>
          {!sol.bloqueo.fechaBloqueo && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: C.orangeLt, borderRadius: 8, fontSize: 12, color: C.orange }}>
              ⏳ Bloqueo pendiente de ejecución
            </div>
          )}
        </div>
      )}

      {/* Timeline / Historial */}
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 14, boxShadow: C.shadow }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, color: C.text }}>📋 Historial de Gestión</h3>
        <div style={{ position: "relative", paddingLeft: 24 }}>
          <div style={{ position: "absolute", left: 7, top: 4, bottom: 4, width: 2, background: C.border }} />
          {sol.historial.map((h, i) => (
            <div key={i} style={{ position: "relative", marginBottom: 14, paddingLeft: 16 }}>
              <div style={{
                position: "absolute", left: -20, top: 4, width: 12, height: 12, borderRadius: "50%",
                background: i === sol.historial.length - 1 ? C.blue : C.white,
                border: `2px solid ${i === sol.historial.length - 1 ? C.blue : C.border}`,
              }} />
              <div style={{ fontSize: 11, color: C.textMut }}>{h.fecha} · {h.responsable}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{h.accion}</div>
              {h.detalle && <div style={{ fontSize: 12, color: C.textSec }}>{h.detalle}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Respuesta final */}
      {sol.respuesta && (
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.green}`, padding: 24, marginBottom: 14, boxShadow: C.shadow }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 15, color: C.green }}>✅ Respuesta al Titular</h3>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{sol.respuesta}</div>
          <div style={{ fontSize: 11, color: C.textMut, marginTop: 8 }}>Fecha de respuesta: {sol.fechaRespuesta}</div>
        </div>
      )}

      {/* Actions */}
      {sol.estado !== "Completada" && sol.estado !== "Rechazada" && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {sol.estado === "Recibida" && <Btn onClick={() => changeEstado("En evaluación")}>🔍 Iniciar Evaluación</Btn>}
          {sol.estado === "En evaluación" && <Btn onClick={() => changeEstado("En proceso")}>⚙️ Pasar a Proceso</Btn>}
          {sol.estado === "En evaluación" && <Btn variant="secondary" onClick={() => changeEstado("Esperando información")}>⏳ Solicitar Información</Btn>}
          {sol.estado === "Esperando información" && <Btn onClick={() => changeEstado("En proceso")}>📨 Información Recibida</Btn>}
          {sol.estado === "En proceso" && <Btn variant="success" onClick={() => changeEstado("Completada")}>✅ Marcar Completada</Btn>}
          {sol.estado !== "Completada" && <Btn variant="secondary" onClick={() => changeEstado("Rechazada")} style={{ color: C.red }}>❌ Rechazar</Btn>}
        </div>
      )}
    </div>
  );
};

// ===== NEW SOLICITUD FORM =====
const NewSolicitud = ({ onSave, onCancel }) => {
  const [tipo, setTipo] = useState("");
  const [titular, setTitular] = useState({ nombre: "", rut: "", email: "", telefono: "" });
  const [descripcion, setDescripcion] = useState("");
  const [canal, setCanal] = useState("Portal web");
  const [prioridad, setPrioridad] = useState("Normal");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <Btn variant="ghost" onClick={onCancel}>← Volver</Btn>
        <h2 style={{ margin: 0, fontSize: 18, color: C.text }}>Nueva Solicitud ARCO+</h2>
      </div>
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, boxShadow: C.shadow }}>
        {/* Tipo */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 8 }}>Tipo de Derecho <span style={{ color: C.red }}>*</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {tiposDerechos.map(t => (
              <div key={t.id} onClick={() => setTipo(t.id)} style={{
                padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                border: tipo === t.id ? `2px solid ${t.color}` : `1px solid ${C.border}`,
                background: tipo === t.id ? t.bg : C.white, transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 18 }}>{t.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{t.nombre}</span>
                </div>
                <div style={{ fontSize: 10, color: C.textMut }}>{t.art}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Titular */}
        <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 8 }}>Datos del Titular</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Input label="Nombre completo" value={titular.nombre} onChange={v => setTitular({ ...titular, nombre: v })} placeholder="Nombre y apellidos" required />
          <Input label="RUT" value={titular.rut} onChange={v => setTitular({ ...titular, rut: v })} placeholder="12.345.678-9" required />
          <Input label="Email" value={titular.email} onChange={v => setTitular({ ...titular, email: v })} placeholder="email@ejemplo.com" type="email" required />
          <Input label="Teléfono" value={titular.telefono} onChange={v => setTitular({ ...titular, telefono: v })} placeholder="+56 9 1234 5678" />
        </div>

        <Input label="Descripción de la solicitud" value={descripcion} onChange={setDescripcion} placeholder="Detalle lo que el titular solicita..." textarea required />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>Canal de ingreso</label>
            <select value={canal} onChange={e => setCanal(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, boxSizing: "border-box" }}>
              {["Portal web", "Email", "Presencial", "Carta certificada", "Teléfono"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>Prioridad</label>
            <select value={prioridad} onChange={e => setPrioridad(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, boxSizing: "border-box" }}>
              {["Normal", "Alta"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <Btn variant="secondary" onClick={onCancel}>Cancelar</Btn>
          <Btn onClick={() => onSave({ tipo, titular, descripcion, canal, prioridad })} disabled={!tipo || !titular.nombre || !titular.rut || !descripcion}>
            💾 Registrar Solicitud
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN =====

// ====================================================================
// AI ENGINE - ARCO+
// ====================================================================
const arcoAI = {
  greet: "¡Hola! Soy tu asistente de Derechos ARCO+. Puedo ayudarte a:\n\n• Analizar el estado de las solicitudes\n• Priorizar por plazo de vencimiento\n• Redactar borradores de respuesta al titular\n• Resolver dudas sobre plazos y procedimientos\n\n¿En qué te puedo ayudar?",
  analisis: "📊 **Estado de solicitudes ARCO+:**\n\n**7 solicitudes** registradas:\n\n✅ **2 completadas:** ARCO-001 (Acceso) y ARCO-007 (Acceso) — respondidas dentro del plazo.\n\n⚠️ **5 activas con plazo corriendo:**\n• 🟠 ARCO-002 (Rectificación) — **7 días restantes** — Pendiente documento de respaldo\n• 🟡 ARCO-003 (Supresión) — 12 días — En evaluación de obligaciones legales\n• 🟡 ARCO-004 (Portabilidad) — 15 días — Generando archivo de datos\n• 🟢 ARCO-005 (Oposición a decisión automatizada) — 17 días — Recién recibida\n• 🟢 ARCO-006 (Bloqueo) — 19 días — Recién recibida\n\n**Prioridad inmediata:** ARCO-002 tiene solo 7 días. Si no se resuelve, hay infracción al plazo legal de 30 días.",
  prioridades: "🎯 **Solicitudes por prioridad de atención:**\n\n1. 🔴 **ARCO-002** (Rectificación, María González) — **7 días**\n   Acción: Obtener documento de respaldo para estado civil\n\n2. 🟠 **ARCO-003** (Supresión, Carlos Muñoz) — **12 días**\n   Acción: Completar análisis de retención legal (datos tributarios)\n\n3. 🟡 **ARCO-004** (Portabilidad, Ana Silva) — **15 días**\n   Acción: Generar archivo JSON con datos de RAT-005 y RAT-007\n\n4. 🟢 **ARCO-005** (Oposición automatizada, Pedro Rojas) — **17 días**\n   Acción: Asignar revisor humano para caso de scoring crediticio\n\n5. 🟢 **ARCO-006** (Bloqueo, Claudia Fernández) — **19 días**\n   Acción: Ejecutar bloqueo de marketing directo\n\n💡 Regla: Atender siempre la de menor plazo primero.",
  respuesta: (tipo, titular) => {
    const modelos = {
      acceso: "📝 **Borrador de respuesta — Acceso:**\n\n\"Estimado/a " + (titular || "[Titular]") + ":\n\nEn respuesta a su solicitud de acceso a datos personales, le informamos que hemos procedido a recopilar la información relativa a sus datos que obran en nuestros registros.\n\nAdjunto encontrará un informe detallado que incluye:\n• Categorías de datos tratados\n• Finalidades del tratamiento\n• Destinatarios o categorías de destinatarios\n• Plazo previsto de conservación\n• Base de licitud aplicable\n\nQuedamos a su disposición para cualquier consulta adicional.\n\nAtentamente,\n[Nombre del DPD]\"",
      rectificacion: "📝 **Borrador de respuesta — Rectificación:**\n\n\"Estimado/a " + (titular || "[Titular]") + ":\n\nEn respuesta a su solicitud de rectificación, le informamos que hemos procedido a corregir los datos indicados en sus registros:\n\n[DETALLAR CAMPOS CORREGIDOS]\n\nLos datos han sido actualizados en todos nuestros sistemas. Si los datos fueron compartidos con terceros, estos han sido debidamente notificados de la corrección.\n\nAtentamente,\n[Nombre del DPD]\"",
      supresion: "📝 **Borrador de respuesta — Supresión:**\n\n\"Estimado/a " + (titular || "[Titular]") + ":\n\nEn respuesta a su solicitud de supresión, le informamos lo siguiente:\n\n[Si procede totalmente:]\nSus datos personales han sido eliminados de todos nuestros sistemas y bases de datos.\n\n[Si procede parcialmente:]\nHemos eliminado los datos no sujetos a obligación legal de retención. Los siguientes datos se conservan por obligación legal: [DETALLAR].\n\n[Si no procede:]\nLamentamos informarle que no es posible proceder a la supresión debido a [MOTIVO LEGAL].\n\nAtentamente,\n[Nombre del DPD]\"",
    };
    return modelos[tipo?.toLowerCase()] || "📝 Selecciona un tipo de solicitud (Acceso, Rectificación, Supresión, etc.) y te genero un borrador de respuesta personalizado.";
  },
  plazos: "⏰ **Plazos legales ARCO+ (Ley 21.719):**\n\nTodas las solicitudes tienen **30 días corridos** desde la recepción para ser respondidas.\n\n**Cómputo del plazo:**\n• Comienza al día siguiente de la recepción\n• Incluye fines de semana y feriados\n• NO es prorrogable salvo circunstancias excepcionales documentadas\n\n**Consecuencias del incumplimiento:**\n• Infracción grave (Art. 34° bis)\n• Multa de hasta 5.000 UTM (~$325M CLP)\n• El titular puede reclamar ante la Agencia de Protección de Datos\n\n**Buena práctica:** Responder en máximo 20 días para tener margen.",
  tipos: "📋 **Los 6 derechos ARCO+ explicados:**\n\n👁️ **Acceso** — El titular puede solicitar confirmación de si se tratan sus datos, y obtener copia.\n\n✏️ **Rectificación** — Corregir datos inexactos o incompletos. Requiere acreditar la inexactitud.\n\n🗑️ **Supresión** — Eliminar datos cuando no existe base legal. Puede denegarse si hay obligación de retención.\n\n🔒 **Bloqueo** — Suspender temporalmente el tratamiento mientras se resuelve otra solicitud.\n\n📦 **Portabilidad** — Entregar copia en formato electrónico estructurado (JSON, CSV, XML).\n\n🤖 **Oposición a decisión automatizada** — Solicitar intervención humana cuando un algoritmo toma decisiones con efectos jurídicos.",
};
const getARCOResponse = (msg, ctx) => {
  const l = msg.toLowerCase().trim();
  if (l.includes("prioridad") || l.includes("urgente") || l.includes("orden")) return arcoAI.prioridades;
  if (l.includes("respuesta") || l.includes("borrador") || l.includes("redact")) return arcoAI.respuesta(ctx?.tipoSolicitud, ctx?.titularNombre);
  if (l.includes("plazo") || l.includes("días") || l.includes("vencimiento")) return arcoAI.plazos;
  if (l.includes("tipo") || l.includes("derecho") || l.includes("cuál")) return arcoAI.tipos;
  if (l.includes("anali") || l.includes("estado") || l.includes("resumen")) return arcoAI.analisis;
  if (!l) return arcoAI.greet;
  return arcoAI.analisis;
};
const getARCOQA = (ctx) => {
  const base = [
    { label: "📊 Analizar solicitudes", msg: "Analiza el estado de las solicitudes ARCO+" },
    { label: "🎯 Prioridades", msg: "¿Cuáles son las prioridades?" },
    { label: "⏰ Plazos legales", msg: "¿Cuáles son los plazos legales?" },
    { label: "📋 Tipos de derecho", msg: "Explícame los 6 derechos ARCO+" },
  ];
  if (ctx?.tipoSolicitud) base.splice(1, 0, { label: "📝 Borrador respuesta", msg: "Redacta una respuesta para esta solicitud" });
  return base;
};


// ====================================================================
// AI COPILOT
// ====================================================================
const _delay = (ms) => new Promise(r => setTimeout(r, ms));

const AICopilot = ({ open, onToggle, getResponse, getQuickActions, contextLabel }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState({});
  const chatEndRef = useRef(null);
  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);
  useEffect(() => {
    const key = contextLabel;
    if (!hasGreeted[key] && open) {
      const g = getResponse("");
      setMessages(prev => [...prev, { role: "ai", text: g, ts: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) }]);
      setHasGreeted(prev => ({ ...prev, [key]: true }));
    }
  }, [contextLabel, open]);
  const send = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: "user", text, ts: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) }]);
    setInput(""); setTyping(true);
    await _delay(600 + Math.random() * 800);
    const r = getResponse(text);
    setMessages(prev => [...prev, { role: "ai", text: r, ts: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) }]);
    setTyping(false);
  };
  const qa = getQuickActions();
  const renderText = (t) => t.split("\n").map((l, i) => {
    let p = l.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const isBullet = l.trim().startsWith("•") || l.trim().startsWith("-") || /^\d+\./.test(l.trim());
    return <div key={i} style={{ marginBottom: l.trim() === "" ? 6 : 2, paddingLeft: isBullet ? 4 : 0, lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: p }} />;
  });
  if (!open) return <button onClick={onToggle} style={{ position: "fixed", right: 20, bottom: 20, width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", zIndex: 200, boxShadow: "0 4px 20px rgba(124,58,237,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>🤖</button>;
  return (
    <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 380, zIndex: 200, background: C.white, borderLeft: "1px solid " + C.border, display: "flex", flexDirection: "column", boxShadow: "-4px 0 30px rgba(20,18,66,0.08)", fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid " + C.border, background: "rgba(124,58,237,0.03)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div><div><div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Asistente IA</div><div style={{ fontSize: 10, color: "#7c3aed", fontWeight: 600 }}>{contextLabel}</div></div></div>
        <div style={{ display: "flex", gap: 6 }}><button onClick={() => { setMessages([]); setHasGreeted({}); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: C.textMut, padding: 4 }}>🗑️</button><button onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.textMut, padding: 4 }}>✕</button></div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && <div style={{ textAlign: "center", padding: "30px 10px", color: C.textMut, fontSize: 12 }}><div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div><div style={{ fontWeight: 600, color: C.textSec, marginBottom: 4 }}>Asistente IA de Regcheq</div><div>Usa las acciones rápidas o escríbeme tu consulta.</div></div>}
        {messages.map((msg, i) => <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}><div style={{ maxWidth: "92%", padding: "10px 14px", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: msg.role === "user" ? C.navyDark : C.bg, color: msg.role === "user" ? "#fff" : C.text, fontSize: 12.5 }}>{msg.role === "ai" ? renderText(msg.text) : msg.text}<div style={{ fontSize: 9, marginTop: 4, color: msg.role === "user" ? "rgba(255,255,255,0.5)" : C.textMut, textAlign: "right" }}>{msg.ts}</div></div></div>)}
        {typing && <div><div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: C.bg }}><span style={{ display: "inline-flex", gap: 4 }}>{[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed", opacity: 0.4, animation: "pulse " + (1.2) + "s ease-in-out " + (i*0.2) + "s infinite" }} />)}</span></div></div>}
        <div ref={chatEndRef} />
      </div>
      {qa.length > 0 && <div style={{ padding: "8px 14px", borderTop: "1px solid " + C.border, display: "flex", gap: 6, flexWrap: "wrap", background: "rgba(124,58,237,0.03)" }}>{qa.map((q, i) => <button key={i} onClick={() => send(q.msg)} style={{ padding: "5px 10px", borderRadius: 14, border: "1px solid rgba(124,58,237,0.2)", background: C.white, color: "#7c3aed", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }} onMouseEnter={e => e.currentTarget.style.background = "#ede9fe"} onMouseLeave={e => e.currentTarget.style.background = C.white}>{q.label}</button>)}</div>}
      <div style={{ padding: "12px 14px", borderTop: "1px solid " + C.border, display: "flex", gap: 8, alignItems: "flex-end" }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder="Pregunta al asistente..." rows={1} style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: "1.5px solid " + C.border, fontSize: 13, color: C.text, resize: "none", fontFamily: "inherit", outline: "none", maxHeight: 80 }} onFocus={e => e.currentTarget.style.borderColor = "#7c3aed"} onBlur={e => e.currentTarget.style.borderColor = C.border} />
        <button onClick={() => send(input)} disabled={!input.trim()} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: input.trim() ? "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)" : C.bg, color: input.trim() ? "#fff" : C.textMut, cursor: input.trim() ? "pointer" : "default", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>➤</button>
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1.15); } }`}</style>
    </div>
  );
};


export default function ModuloARCO() {
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [view, setView] = useState("list");
  const [solicitudes, setSolicitudes] = useState(initialSolicitudes);
  const [selectedId, setSelectedId] = useState(null);
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");

  const stats = useMemo(() => {
    const activas = solicitudes.filter(s => s.estado !== "Completada" && s.estado !== "Rechazada");
    const urgentes = activas.filter(s => {
      const remaining = Math.ceil((new Date(s.plazoLegal).getTime() - new Date("2025-11-25").getTime()) / 86400000);
      return remaining <= 5;
    });
    return {
      total: solicitudes.length,
      activas: activas.length,
      completadas: solicitudes.filter(s => s.estado === "Completada").length,
      urgentes: urgentes.length,
    };
  }, [solicitudes]);

  const filtered = useMemo(() => {
    let list = solicitudes;
    if (filterTipo !== "todos") list = list.filter(s => s.tipo === filterTipo);
    if (filterEstado === "activas") list = list.filter(s => s.estado !== "Completada" && s.estado !== "Rechazada");
    if (filterEstado === "completadas") list = list.filter(s => s.estado === "Completada");
    if (filterEstado === "urgentes") list = list.filter(s => {
      if (s.estado === "Completada" || s.estado === "Rechazada") return false;
      return Math.ceil((new Date(s.plazoLegal).getTime() - new Date("2025-11-25").getTime()) / 86400000) <= 5;
    });
    return list;
  }, [solicitudes, filterTipo, filterEstado]);

  const handleNew = ({ tipo, titular, descripcion, canal, prioridad }) => {
    const hoy = "2025-11-25";
    const plazo = new Date("2025-11-25");
    plazo.setDate(plazo.getDate() + 30);
    const newSol = {
      id: `ARCO-${String(solicitudes.length + 1).padStart(3, "0")}`, tipo, titular,
      fechaSolicitud: hoy, plazoLegal: plazo.toISOString().slice(0, 10),
      estado: "Recibida", prioridad, canal, descripcion,
      datosInvolucrados: [], actividadesRAT: [],
      historial: [{ fecha: hoy, accion: "Solicitud recibida", responsable: "Sistema", detalle: `Ingreso vía ${canal}` }],
      respuesta: "", fechaRespuesta: "",
    };
    setSolicitudes([newSol, ...solicitudes]);
    setView("list");
  };

  const handleUpdate = (updated) => setSolicitudes(solicitudes.map(s => s.id === updated.id ? updated : s));

  const mr = copilotOpen ? 380 : 0;

  const renderContent = () => {
    if (view === "detail" && selectedId) {
      const sol = solicitudes.find(s => s.id === selectedId);
      if (!sol) return null;
      return <DetailView solicitud={sol} onBack={() => { setView("list"); setSelectedId(null); }} onUpdate={handleUpdate} />;
    }
    if (view === "create") {
      return <NewSolicitud onSave={handleNew} onCancel={() => setView("list")} />;
    }

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text }}>Derechos ARCO+</h1>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: C.textSec }}>Gestión de solicitudes de titulares · Plazo legal: 30 días corridos · Arts. 5° a 10° Ley 21.719</p>
          </div>
          <Btn onClick={() => setView("create")}>+ Nueva Solicitud</Btn>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          {[
            { label: "Total", value: stats.total, color: C.blue, f: "todos" },
            { label: "Activas", value: stats.activas, color: C.orange, f: "activas" },
            { label: "Completadas", value: stats.completadas, color: C.green, f: "completadas" },
            { label: "Urgentes (≤5 días)", value: stats.urgentes, color: C.red, f: "urgentes" },
          ].map(s => (
            <div key={s.f} onClick={() => setFilterEstado(filterEstado === s.f ? "todos" : s.f)} style={{
              background: C.white, borderRadius: 8, padding: "10px 18px", cursor: "pointer",
              border: filterEstado === s.f ? `2px solid ${s.color}` : `1px solid ${C.border}`, flex: 1, minWidth: 120,
            }}>
              <div style={{ fontSize: 11, color: C.textSec }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Type filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          <div onClick={() => setFilterTipo("todos")} style={{
            padding: "5px 12px", borderRadius: 16, fontSize: 12, fontWeight: 600, cursor: "pointer",
            background: filterTipo === "todos" ? C.navyDark : C.white, color: filterTipo === "todos" ? "#fff" : C.textSec,
            border: `1px solid ${filterTipo === "todos" ? C.navyDark : C.border}`,
          }}>Todos</div>
          {tiposDerechos.map(t => (
            <div key={t.id} onClick={() => setFilterTipo(filterTipo === t.id ? "todos" : t.id)} style={{
              padding: "5px 12px", borderRadius: 16, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: filterTipo === t.id ? t.bg : C.white, color: filterTipo === t.id ? t.color : C.textSec,
              border: `1px solid ${filterTipo === t.id ? t.color : C.border}`,
            }}>{t.icon} {t.nombre}</div>
          ))}
        </div>

        {/* Urgentes alert */}
        {stats.urgentes > 0 && filterEstado !== "urgentes" && (
          <div style={{ padding: "12px 18px", background: C.redLt, borderRadius: 10, marginBottom: 14, borderLeft: `3px solid ${C.red}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.red }}>⚠️ {stats.urgentes} solicitud{stats.urgentes > 1 ? "es" : ""} con plazo próximo a vencer (≤5 días)</div>
              <div style={{ fontSize: 12, color: C.red }}>Requieren atención inmediata para cumplir el plazo legal de 30 días.</div>
            </div>
            <Btn variant="danger" onClick={() => setFilterEstado("urgentes")} style={{ fontSize: 12, padding: "6px 14px" }}>Ver urgentes</Btn>
          </div>
        )}

        {/* Table */}
        <div style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: C.shadow }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {["ID", "Titular", "Tipo", "Canal", "Fecha", "Plazo", "Estado"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: C.textSec, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const tipo = tiposDerechos.find(t => t.id === s.tipo);
                const est = estadoConfig[s.estado];
                const remaining = s.estado !== "Completada" && s.estado !== "Rechazada"
                  ? Math.ceil((new Date(s.plazoLegal).getTime() - new Date("2025-11-25").getTime()) / 86400000) : null;
                const urgent = remaining !== null && remaining <= 5;

                return (
                  <tr key={s.id} onClick={() => { setSelectedId(s.id); setView("detail"); }}
                    style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer", background: urgent ? "#fff8f5" : "transparent", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = urgent ? "#fff0eb" : C.bg}
                    onMouseLeave={e => e.currentTarget.style.background = urgent ? "#fff8f5" : "transparent"}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: C.navyDark, fontFamily: "monospace", fontSize: 11 }}>{s.id}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: 600, color: C.text }}>{s.titular.nombre}</div>
                      <div style={{ fontSize: 11, color: C.textMut }}>{s.titular.rut}</div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span>{tipo?.icon}</span>
                        <Badge text={tipo?.nombre} color={tipo?.color} bg={tipo?.bg} />
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: C.textSec }}>{s.canal}</td>
                    <td style={{ padding: "10px 12px", color: C.textSec }}>{s.fechaSolicitud}</td>
                    <td style={{ padding: "10px 12px" }}>
                      {remaining !== null ? (
                        <span style={{ fontWeight: 700, color: urgent ? C.red : remaining <= 10 ? C.orange : C.text }}>
                          {remaining}d {urgent && "⚠️"}
                        </span>
                      ) : (
                        <span style={{ color: C.green }}>✓</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: est?.color }}>
                        {est?.icon} {s.estado}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 30, textAlign: "center", color: C.textMut, fontSize: 13 }}>No hay solicitudes con los filtros seleccionados.</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ flex: 1, marginLeft: 0, marginRight: mr, transition: "margin-right 0.3s" }}>
        <div style={{ height: 52, background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 28px", position: "sticky", top: 0, zIndex: 50 }}>
          <span style={{ fontSize: 13, color: C.textSec }}>Protección de Datos</span>
          <span style={{ color: C.textMut, margin: "0 6px" }}>›</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Derechos ARCO+</span>
        </div>
        <div style={{ padding: "22px 28px", maxWidth: 1200 }}>
          {renderContent()}
        </div>
      </div>

      <AICopilot open={copilotOpen} onToggle={() => setCopilotOpen(!copilotOpen)} getResponse={(msg) => getARCOResponse(msg, { tipoSolicitud: selectedId ? solicitudes.find(s => s.id === selectedId)?.tipo : "", titularNombre: selectedId ? solicitudes.find(s => s.id === selectedId)?.titular?.nombre : "" })} getQuickActions={() => getARCOQA({ tipoSolicitud: selectedId ? solicitudes.find(s => s.id === selectedId)?.tipo : "" })} contextLabel={view === "detail" ? "Detalle Solicitud" : "Derechos ARCO+"} />
    </div>
  );
}

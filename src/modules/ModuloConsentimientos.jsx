import { useState, useMemo, useRef, useEffect } from "react";

// ============================================
// REGCHEQ - Gestión Operativa de Consentimientos B2B
// Plataforma para que empresas gestionen
// consentimientos de sus titulares
// Ley 21.719 - Chile (Art. 12°)
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
  teal: "#14b8a6", tealLt: "#ccfbf1",
  border: "#e2e4ed",
  cardShadow: "0 1px 4px rgba(20,18,66,0.06)",
  ai: "#7c3aed", aiLt: "#ede9fe", aiGlow: "rgba(124,58,237,0.08)",
};

// ===== CONSTANTES =====
const canalesCaptura = [
  { id: "web", label: "Formulario Web", icon: "🌐" },
  { id: "app", label: "App Móvil", icon: "📱" },
  { id: "email", label: "Email Opt-in", icon: "📧" },
  { id: "presencial", label: "Presencial/Papel", icon: "📝" },
  { id: "telefono", label: "Telefónico", icon: "📞" },
  { id: "api", label: "API Terceros", icon: "🔗" },
];

const ratActividades = [
  { id: "RAT-001", nombre: "Gestión de nómina y remuneraciones", categorias: ["Identificación", "Contacto", "Financiero"], sensible: false },
  { id: "RAT-002", nombre: "Marketing directo por email", categorias: ["Identificación", "Contacto", "Preferencias"], sensible: false },
  { id: "RAT-003", nombre: "Videovigilancia oficinas", categorias: ["Biométricos", "Imagen"], sensible: true },
  { id: "RAT-005", nombre: "Programa de fidelización", categorias: ["Identificación", "Contacto", "Preferencias", "Transaccional"], sensible: false },
  { id: "RAT-006", nombre: "Control de acceso biométrico", categorias: ["Biométricos", "Identificación"], sensible: true },
  { id: "RAT-008", nombre: "Perfilamiento automatizado", categorias: ["Identificación", "Transaccional", "Comportamental"], sensible: false },
];

// ===== DEMO DATA =====
const initialRegistros = [
  {
    id: "REG-001", titularNombre: "Juan Pérez Morales", titularRut: "12.345.678-9", titularEmail: "jperez@email.com",
    consentimientos: [
      { id: "c1", ratId: "RAT-002", finalidad: "Envío de ofertas y promociones por email", estado: "Activo", fechaOtorgamiento: "2025-09-25", canal: "web", metodo: "Checkbox no pre-marcado en formulario web", informadoSobre: "Finalidad, destinatarios, plazo 2 años, derecho a revocar", terceros: "No se comparten" },
      { id: "c2", ratId: "RAT-002", finalidad: "Segmentación por preferencias de compra", estado: "Activo", fechaOtorgamiento: "2025-09-25", canal: "web", metodo: "Checkbox no pre-marcado en formulario web", informadoSobre: "Finalidad, destinatarios, plazo 2 años, derecho a revocar", terceros: "No se comparten" },
      { id: "c3", ratId: "RAT-002", finalidad: "Compartir datos con socios comerciales", estado: "Revocado", fechaOtorgamiento: "2025-09-25", fechaRevocacion: "2025-11-10", canal: "web", metodo: "Checkbox no pre-marcado en formulario web", motivoRevocacion: "Titular solicitó exclusión vía centro de preferencias", informadoSobre: "Finalidad, identidad socios, plazo 1 año", terceros: "RetailPartner SpA, AdNetwork Chile" },
    ],
    evidencia: { tipo: "Digital", hash: "sha256:a1b2c3d4e5f6789012345abcdef", ip: "200.14.50.12", userAgent: "Chrome 119/macOS 14.1", timestamp: "2025-09-25T14:32:11Z", url: "https://miempresa.cl/registro", version: "v2.3" },
  },
  {
    id: "REG-002", titularNombre: "María González López", titularRut: "14.567.890-1", titularEmail: "mgonzalez@email.com",
    consentimientos: [
      { id: "c1", ratId: "RAT-005", finalidad: "Acumulación y canje de puntos", estado: "Activo", fechaOtorgamiento: "2025-10-15", canal: "app", metodo: "Aceptación en app móvil con scroll completo de T&C", informadoSobre: "Finalidad, plazo indefinido mientras sea miembro, derecho a revocar", terceros: "No se comparten" },
      { id: "c2", ratId: "RAT-005", finalidad: "Envío de ofertas personalizadas", estado: "Activo", fechaOtorgamiento: "2025-10-15", canal: "app", metodo: "Toggle activado manualmente por titular", informadoSobre: "Finalidad, frecuencia semanal, derecho a revocar", terceros: "No se comparten" },
      { id: "c3", ratId: "RAT-005", finalidad: "Análisis de hábitos de compra", estado: "Activo", fechaOtorgamiento: "2025-10-15", canal: "app", metodo: "Toggle activado manualmente por titular", informadoSobre: "Finalidad, uso para mejorar servicio, plazo 2 años", terceros: "No se comparten" },
    ],
    evidencia: { tipo: "Digital", hash: "sha256:b2c3d4e5f67890abcdef12345", ip: "10.0.0.22", userAgent: "RegcheqApp/2.1 iOS 17.2", timestamp: "2025-10-15T09:15:33Z", url: "regcheq-app://consent", version: "v2.1" },
  },
  {
    id: "REG-003", titularNombre: "Carlos Muñoz Rivera", titularRut: "16.789.012-3", titularEmail: "cmunoz@email.com",
    consentimientos: [
      { id: "c1", ratId: "RAT-002", finalidad: "Envío de ofertas por email", estado: "Revocado", fechaOtorgamiento: "2025-08-10", fechaRevocacion: "2025-11-15", canal: "email", metodo: "Doble opt-in por email", motivoRevocacion: "Solicitud de supresión total (ARCO-003)", informadoSobre: "Finalidad, frecuencia, derecho a revocar", terceros: "No se comparten" },
      { id: "c2", ratId: "RAT-002", finalidad: "Segmentación por preferencias", estado: "Revocado", fechaOtorgamiento: "2025-08-10", fechaRevocacion: "2025-11-15", canal: "email", metodo: "Doble opt-in por email", motivoRevocacion: "Solicitud de supresión total (ARCO-003)", informadoSobre: "Finalidad, uso interno, derecho a revocar", terceros: "No se comparten" },
    ],
    evidencia: { tipo: "Digital", hash: "sha256:c3d4e5f67890abcdef1234567", ip: "172.16.0.5", userAgent: "Firefox 120/Windows 11", timestamp: "2025-08-10T11:00:45Z", url: "https://miempresa.cl/newsletter", version: "v2.0" },
  },
  {
    id: "REG-004", titularNombre: "Ana Silva Torres", titularRut: "18.901.234-5", titularEmail: "asilva@email.com",
    consentimientos: [
      { id: "c1", ratId: "RAT-001", finalidad: "Tratamiento de datos laborales para nómina", estado: "Activo", fechaOtorgamiento: "2025-09-01", canal: "presencial", metodo: "Firma manuscrita en cláusula 12 del contrato laboral", informadoSobre: "Finalidad, base legal subsidiaria (contrato), plazo relación laboral + 5 años", terceros: "AFP Capital, Fonasa, SII" },
      { id: "c2", ratId: "RAT-001", finalidad: "Envío de liquidaciones por email", estado: "Activo", fechaOtorgamiento: "2025-09-01", canal: "presencial", metodo: "Firma manuscrita en cláusula 12 del contrato laboral", informadoSobre: "Finalidad, medio digital, derecho a solicitar formato papel", terceros: "No se comparten" },
    ],
    evidencia: { tipo: "Físico", documentoRef: "Contrato laboral Cláusula 12, firmado ante notario 3° de Santiago, Repertorio N° 4521-2025", fechaFirma: "2025-09-01", testigos: "RRHH: Patricia Lobos / Trabajadora: Ana Silva", archivoFisico: "Carpeta personal N° 089, Caja 12, Archivo Central" },
  },
  {
    id: "REG-005", titularNombre: "Pedro Rojas Albornoz", titularRut: "11.223.344-6", titularEmail: "projas@email.com",
    consentimientos: [
      { id: "c1", ratId: "RAT-008", finalidad: "Tracking de navegación web", estado: "Activo", fechaOtorgamiento: "2025-11-01", canal: "web", metodo: "Banner de cookies — botón Aceptar seleccionado", informadoSobre: "Cookies analíticas y de seguimiento, plazo 1 año, enlace a política", terceros: "Google Analytics, Meta Pixel" },
      { id: "c2", ratId: "RAT-008", finalidad: "Análisis de comportamiento de compra", estado: "Rechazado", fechaOtorgamiento: "", canal: "web", metodo: "Banner de cookies — toggle desactivado por titular", informadoSobre: "Finalidad informada pero titular rechazó", terceros: "N/A" },
      { id: "c3", ratId: "RAT-008", finalidad: "Recomendaciones automatizadas", estado: "Rechazado", fechaOtorgamiento: "", canal: "web", metodo: "Banner de cookies — toggle desactivado por titular", informadoSobre: "Finalidad informada pero titular rechazó", terceros: "N/A" },
    ],
    evidencia: { tipo: "Digital", hash: "sha256:d4e5f6a1b2c3789012345abcdef", ip: "200.14.50.12", userAgent: "Chrome 120/Windows 11", timestamp: "2025-11-01T16:45:22Z", url: "https://miempresa.cl", version: "v3.0" },
  },
  {
    id: "REG-006", titularNombre: "Sofía Martínez Bravo", titularRut: "20.123.456-7", titularEmail: "smartinez@email.com",
    consentimientos: [
      { id: "c1", ratId: "RAT-006", finalidad: "Registro de huella dactilar para acceso a instalaciones", estado: "Activo", fechaOtorgamiento: "2025-10-20", canal: "presencial", metodo: "Formulario de consentimiento expreso firmado (dato sensible — Art. 16° bis)", informadoSobre: "Dato sensible (biométrico), finalidad de acceso, almacenamiento cifrado AES-256, plazo relación laboral, derecho a revocar y usar alternativa (tarjeta)", terceros: "No se comparten" },
    ],
    evidencia: { tipo: "Físico", documentoRef: "Formulario CS-BIO-001 firmado, anexo al contrato laboral", fechaFirma: "2025-10-20", testigos: "Seguridad: Roberto Díaz / Trabajadora: Sofía Martínez", archivoFisico: "Carpeta personal N° 102, Caja 14, Archivo Central" },
  },
  {
    id: "REG-007", titularNombre: "Roberto Díaz Castillo", titularRut: "13.456.789-0", titularEmail: "rdiaz@email.com",
    consentimientos: [
      { id: "c1", ratId: "RAT-005", finalidad: "Programa de puntos", estado: "Activo", fechaOtorgamiento: "2025-07-10", canal: "web", metodo: "Registro voluntario en sitio web", informadoSobre: "Finalidad, plazo indefinido, derecho a revocar", terceros: "No se comparten" },
      { id: "c2", ratId: "RAT-002", finalidad: "Newsletter semanal", estado: "Activo", fechaOtorgamiento: "2025-07-10", canal: "web", metodo: "Checkbox separado durante registro", informadoSobre: "Finalidad, frecuencia semanal, derecho a desuscribir", terceros: "No se comparten" },
    ],
    evidencia: { tipo: "Digital", hash: "sha256:e5f6a1b2c3d4789012345abcdef", ip: "190.20.100.8", userAgent: "Safari 17/macOS 14.0", timestamp: "2025-07-10T20:12:00Z", url: "https://miempresa.cl/registro", version: "v1.8" },
  },
  {
    id: "REG-008", titularNombre: "Claudia Fernández Bravo", titularRut: "15.678.901-2", titularEmail: "cfernandez@email.com",
    consentimientos: [
      { id: "c1", ratId: "RAT-002", finalidad: "Envío de ofertas por email", estado: "Activo", fechaOtorgamiento: "2025-06-01", canal: "email", metodo: "Doble opt-in confirmado", informadoSobre: "Finalidad, frecuencia, derecho a revocar", terceros: "No se comparten" },
    ],
    evidencia: { tipo: "Digital", hash: "sha256:f6a1b2c3d4e5789012345abcdef", ip: "201.50.30.15", userAgent: "Chrome 118/Android 14", timestamp: "2025-06-01T08:30:00Z", url: "https://miempresa.cl/confirm-email", version: "v1.5" },
  },
];

// ===== REVOCACIONES LOG =====
const initialRevocaciones = [
  { id: "REV-001", registroId: "REG-001", titularNombre: "Juan Pérez Morales", titularRut: "12.345.678-9", finalidad: "Compartir datos con socios comerciales", ratId: "RAT-002", fechaRevocacion: "2025-11-10", canal: "Centro de preferencias web", motivo: "Titular solicitó exclusión voluntaria", impacto: "Se detuvo transferencia a RetailPartner SpA y AdNetwork Chile", estadoEjecucion: "Ejecutada", notificadoTerceros: true, fechaEjecucion: "2025-11-10" },
  { id: "REV-002", registroId: "REG-003", titularNombre: "Carlos Muñoz Rivera", titularRut: "16.789.012-3", finalidad: "Envío de ofertas por email", ratId: "RAT-002", fechaRevocacion: "2025-11-15", canal: "Solicitud ARCO (ARCO-003)", motivo: "Solicitud de supresión total de datos", impacto: "Eliminado de todas las listas de marketing", estadoEjecucion: "Ejecutada", notificadoTerceros: false, fechaEjecucion: "2025-11-15" },
  { id: "REV-003", registroId: "REG-003", titularNombre: "Carlos Muñoz Rivera", titularRut: "16.789.012-3", finalidad: "Segmentación por preferencias", ratId: "RAT-002", fechaRevocacion: "2025-11-15", canal: "Solicitud ARCO (ARCO-003)", motivo: "Solicitud de supresión total de datos", impacto: "Eliminado de sistema de segmentación", estadoEjecucion: "Ejecutada", notificadoTerceros: false, fechaEjecucion: "2025-11-15" },
  { id: "REV-004", registroId: "REG-005", titularNombre: "Pedro Rojas Albornoz", titularRut: "11.223.344-6", finalidad: "Análisis de comportamiento de compra", ratId: "RAT-008", fechaRevocacion: "2025-11-01", canal: "Banner de cookies — rechazo inicial", motivo: "Titular no otorgó consentimiento", impacto: "Datos de compra no se analizan para este titular", estadoEjecucion: "Ejecutada", notificadoTerceros: false, fechaEjecucion: "2025-11-01" },
];

// ====================================================================
// UI COMPONENTS
// ====================================================================
const Badge = ({ text, color, bg }) => <span style={{ padding: "2px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: bg, color, whiteSpace: "nowrap" }}>{text}</span>;
const Btn = ({ children, onClick, variant = "primary", style: s = {}, disabled }) => {
  const base = { padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", border: "none", opacity: disabled ? 0.5 : 1, ...s };
  const v = { primary: { ...base, background: C.navyDark, color: "#fff" }, secondary: { ...base, background: C.white, color: C.text, border: `1px solid ${C.border}` }, ghost: { ...base, background: "transparent", color: C.textSec, padding: "9px 12px" }, danger: { ...base, background: C.redLt, color: C.red } };
  return <button onClick={disabled ? undefined : onClick} style={v[variant]}>{children}</button>;
};
const Input = ({ label, value, onChange, placeholder, type = "text", required }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>{label} {required && <span style={{ color: C.red }}>*</span>}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, boxSizing: "border-box" }} />
  </div>
);
const estadoBadge = (estado) => {
  const m = { Activo: [C.green, C.greenLt, "✅"], Revocado: [C.red, C.redLt, "🚫"], Rechazado: [C.orange, C.orangeLt, "✕"], Pendiente: [C.yellow, C.yellowLt, "⏳"] };
  const [color, bg, icon] = m[estado] || m.Pendiente;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: bg, color }}>{icon} {estado}</span>;
};

// ====================================================================
// TITULAR DETAIL VIEW
// ====================================================================
const TitularDetail = ({ registro, revocaciones, onBack }) => {
  const activos = registro.consentimientos.filter(c => c.estado === "Activo").length;
  const total = registro.consentimientos.length;
  const revocs = revocaciones.filter(r => r.registroId === registro.id);
  const hasSensible = registro.consentimientos.some(c => ratActividades.find(r => r.id === c.ratId)?.sensible);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Btn variant="ghost" onClick={onBack}>← Volver</Btn>
        <span style={{ fontSize: 12, color: C.textMut }}>{registro.id}</span>
      </div>

      {/* Header titular */}
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 14, boxShadow: C.cardShadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 20, color: C.text }}>{registro.titularNombre}</h2>
            <div style={{ display: "flex", gap: 12, fontSize: 12, color: C.textSec }}>
              <span>RUT: <strong>{registro.titularRut}</strong></span>
              <span>Email: <strong>{registro.titularEmail}</strong></span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {hasSensible && <Badge text="Datos sensibles ⚠️" color={C.red} bg={C.redLt} />}
            <Badge text={`${activos}/${total} activos`} color={activos === total ? C.green : C.orange} bg={activos === total ? C.greenLt : C.orangeLt} />
          </div>
        </div>

        {/* Tabla de consentimientos */}
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>Consentimientos por finalidad</div>
        {registro.consentimientos.map((c, i) => {
          const rat = ratActividades.find(r => r.id === c.ratId);
          return (
            <div key={i} style={{ padding: "14px 18px", borderRadius: 10, marginBottom: 8, border: `1px solid ${c.estado === "Activo" ? C.green + "44" : c.estado === "Revocado" ? C.red + "44" : C.border}`, background: c.estado === "Activo" ? "#f0fdf4" : c.estado === "Revocado" ? "#fef2f2" : C.white }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{c.finalidad}</div>
                  <div style={{ fontSize: 11, color: C.textMut, marginTop: 2 }}>{c.ratId} — {rat?.nombre || ""}</div>
                </div>
                {estadoBadge(c.estado)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { label: "Fecha otorgamiento", value: c.fechaOtorgamiento || "No otorgado" },
                  { label: "Canal", value: canalesCaptura.find(ch => ch.id === c.canal)?.label || c.canal },
                  { label: "Método de obtención", value: c.metodo },
                ].map(f => (
                  <div key={f.label} style={{ padding: "6px 10px", background: C.bg, borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: C.textMut }}>{f.label}</div>
                    <div style={{ fontSize: 11, color: C.text }}>{f.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                <div style={{ padding: "6px 10px", background: C.bg, borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: C.textMut }}>Información proporcionada al titular</div>
                  <div style={{ fontSize: 11, color: C.text }}>{c.informadoSobre}</div>
                </div>
                <div style={{ padding: "6px 10px", background: C.bg, borderRadius: 6 }}>
                  <div style={{ fontSize: 10, color: C.textMut }}>Terceros informados</div>
                  <div style={{ fontSize: 11, color: C.text }}>{c.terceros}</div>
                </div>
              </div>
              {c.estado === "Revocado" && c.motivoRevocacion && (
                <div style={{ marginTop: 8, padding: "8px 12px", background: C.redLt, borderRadius: 6, fontSize: 11, color: C.red }}>
                  🚫 Revocado el {c.fechaRevocacion} — {c.motivoRevocacion}
                </div>
              )}
              {rat?.sensible && (
                <div style={{ marginTop: 8, padding: "8px 12px", background: C.orangeLt, borderRadius: 6, fontSize: 11, color: C.orange }}>
                  ⚠️ Dato sensible — Requiere consentimiento expreso (Art. 16° bis). Método: {c.metodo}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Evidencia */}
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 14, boxShadow: C.cardShadow }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, color: C.text }}>🔐 Panel de Evidencia y Auditoría</h3>
        <div style={{ padding: "10px 14px", background: C.blueLt, borderRadius: 8, fontSize: 12, color: C.blue, marginBottom: 14, lineHeight: 1.5 }}>
          ℹ️ El responsable debe poder <strong>demostrar</strong> que el consentimiento fue otorgado de forma válida (Art. 12° Ley 21.719). Esta evidencia es exigible ante la Agencia de Protección de Datos.
        </div>
        {registro.evidencia.tipo === "Digital" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Tipo", value: "🌐 Digital", icon: true },
              { label: "Timestamp exacto", value: registro.evidencia.timestamp },
              { label: "Hash de integridad (SHA-256)", value: registro.evidencia.hash, mono: true },
              { label: "IP de origen", value: registro.evidencia.ip, mono: true },
              { label: "User Agent", value: registro.evidencia.userAgent },
              { label: "URL de captura", value: registro.evidencia.url, mono: true },
              { label: "Versión del formulario", value: registro.evidencia.version },
            ].map(e => (
              <div key={e.label} style={{ padding: "8px 12px", background: C.bg, borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: C.textMut }}>{e.label}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: C.text, fontFamily: e.mono ? "monospace" : "inherit", wordBreak: "break-all" }}>{e.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Tipo", value: "📄 Documento Físico" },
              { label: "Referencia documento", value: registro.evidencia.documentoRef },
              { label: "Fecha de firma", value: registro.evidencia.fechaFirma },
              { label: "Testigos", value: registro.evidencia.testigos },
              { label: "Ubicación archivo", value: registro.evidencia.archivoFisico },
            ].map(e => (
              <div key={e.label} style={{ padding: "8px 12px", background: C.bg, borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: C.textMut }}>{e.label}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: C.text }}>{e.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revocaciones */}
      {revocs.length > 0 && (
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, boxShadow: C.cardShadow }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, color: C.text }}>🚫 Historial de Revocaciones</h3>
          {revocs.map(r => (
            <div key={r.id} style={{ padding: "14px 18px", borderRadius: 10, marginBottom: 8, border: `1px solid ${C.red}33`, background: "#fef2f2" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{r.finalidad}</div>
                <Badge text={r.estadoEjecucion} color={r.estadoEjecucion === "Ejecutada" ? C.green : C.orange} bg={r.estadoEjecucion === "Ejecutada" ? C.greenLt : C.orangeLt} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 11 }}>
                <div><span style={{ color: C.textMut }}>Fecha:</span> <span style={{ color: C.text }}>{r.fechaRevocacion}</span></div>
                <div><span style={{ color: C.textMut }}>Canal:</span> <span style={{ color: C.text }}>{r.canal}</span></div>
                <div><span style={{ color: C.textMut }}>Terceros notificados:</span> <span style={{ color: r.notificadoTerceros ? C.green : C.red, fontWeight: 600 }}>{r.notificadoTerceros ? "Sí ✓" : "No ✕"}</span></div>
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: C.textSec }}>
                <strong>Motivo:</strong> {r.motivo} · <strong>Impacto:</strong> {r.impacto}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ====================================================================
// AI COPILOT ENGINE
// ====================================================================
const delay = (ms) => new Promise(r => setTimeout(r, ms));

const aiR = {
  list: {
    greet: "¡Hola! Soy tu asistente de gestión de consentimientos. Puedo ayudarte a:\n\n• Analizar el estado de los consentimientos de tus titulares\n• Detectar problemas de cumplimiento\n• Asesorarte sobre requisitos del Art. 12°\n• Revisar la evidencia y auditoría\n\n¿En qué te puedo ayudar?",
    analisis: "📊 **Diagnóstico de consentimientos:**\n\n**8 titulares** registrados con **15 consentimientos** en total:\n\n✅ **10 activos** — tratamiento en curso con consentimiento vigente\n🚫 **3 revocados** — tratamiento detenido correctamente\n✕ **2 rechazados** — titular no otorgó consentimiento (RAT-008)\n\n**Hallazgos críticos:**\n\n🔴 **REG-005 (Pedro Rojas)** — Rechazó 2 de 3 finalidades de perfilamiento. Si el sistema sigue analizando su comportamiento de compra, hay infracción grave al Art. 12°.\n\n🟡 **REG-001 (Juan Pérez)** — Revocó compartir datos con terceros. Verificar que RetailPartner SpA y AdNetwork Chile eliminaron los datos.\n\n⚠️ **REG-006 (Sofía Martínez)** — Consentimiento biométrico en papel. Aunque es válido, recomiendo digitalizar la evidencia como respaldo.\n\n**Score de cumplimiento: 82%** — Buen nivel, pero resolver los hallazgos pendientes.",
    evidencia: "🔐 **Estado de evidencia por titular:**\n\n| Titular | Tipo | Hash | Completa |\n|---|---|---|---|\n| Juan Pérez | Digital | ✅ | ✅ |\n| María González | Digital | ✅ | ✅ |\n| Carlos Muñoz | Digital | ✅ | ✅ |\n| Ana Silva | Físico | — | ✅ |\n| Pedro Rojas | Digital | ✅ | ✅ |\n| Sofía Martínez | Físico | — | ⚠️ |\n| Roberto Díaz | Digital | ✅ | ✅ |\n| Claudia Fernández | Digital | ✅ | ✅ |\n\n**6/8 con evidencia digital verificable.** 2 con evidencia física.\n\n💡 Para los registros físicos, recomiendo escanear y almacenar copia digital con hash de integridad como respaldo ante fiscalización.",
    revocaciones: "🚫 **Resumen de revocaciones:**\n\n**4 revocaciones** registradas:\n\n1. **Juan Pérez** → Revocó compartir con terceros (2025-11-10). Ejecutada. Terceros notificados: ✅\n2-3. **Carlos Muñoz** → Revocación total por ARCO-003 (2025-11-15). Ejecutada. Terceros: No aplica.\n4. **Pedro Rojas** → Rechazo inicial de análisis de comportamiento (2025-11-01). Ejecutada.\n\n**Verificación de cumplimiento:**\n✅ Todas las revocaciones están ejecutadas.\n⚠️ REV-002 y REV-003: No se notificó a terceros. Verificar si había terceros involucrados que debían ser informados.\n\n**Recordatorio legal:** La revocación debe ser tan fácil como dar el consentimiento. Si el titular consintió con un click, debe poder revocar con un click (Art. 12° Ley 21.719).",
  },
  detail: {
    analizar: (reg) => {
      const activos = reg.consentimientos.filter(c => c.estado === "Activo").length;
      const revocados = reg.consentimientos.filter(c => c.estado === "Revocado").length;
      const rechazados = reg.consentimientos.filter(c => c.estado === "Rechazado").length;
      const issues = [];
      if (revocados > 0) issues.push(`🚫 ${revocados} finalidad(es) revocada(s). Verificar cese efectivo del tratamiento.`);
      if (rechazados > 0) issues.push(`✕ ${rechazados} finalidad(es) rechazada(s). NO se puede tratar datos para estas finalidades.`);
      const sinTerceros = reg.consentimientos.filter(c => c.terceros === "No se comparten" && c.estado === "Activo");
      const conTerceros = reg.consentimientos.filter(c => c.terceros !== "No se comparten" && c.terceros !== "N/A" && c.estado === "Activo");
      if (conTerceros.length > 0) issues.push(`📤 ${conTerceros.length} finalidad(es) comparten datos con terceros. Verificar que los terceros cumplan la ley.`);
      const hasSensible = reg.consentimientos.some(c => ratActividades.find(r => r.id === c.ratId)?.sensible);
      if (hasSensible) issues.push("⚠️ Incluye datos sensibles. El consentimiento debe ser expreso y explícito (Art. 16° bis).");
      if (reg.evidencia.tipo === "Físico") issues.push("📄 Evidencia en papel. Recomiendo digitalizar como respaldo.");

      return `🔍 **Análisis de ${reg.titularNombre}:**\n\n**Consentimientos:** ${activos} activo(s), ${revocados} revocado(s), ${rechazados} rechazado(s)\n\n${issues.length > 0 ? "**Hallazgos:**\n" + issues.join("\n") : "✅ Sin hallazgos. Todos los consentimientos están correctamente documentados."}\n\n**Verificación Art. 12°:**\n• Previo al tratamiento: ${reg.consentimientos.some(c => c.fechaOtorgamiento) ? "✅" : "❌"}\n• Expreso (acción afirmativa): ✅ — "${reg.consentimientos[0]?.metodo}"\n• Específico (por finalidad): ${reg.consentimientos.length > 1 ? "✅ Separado en " + reg.consentimientos.length + " finalidades" : "⚠️ Una sola finalidad"}\n• Informado: ✅ — Se informó sobre: ${reg.consentimientos[0]?.informadoSobre}\n• Libre (sin coerción): ✅\n• Revocable: ${revocados > 0 ? "✅ Ya se ejerció revocación" : "✅ Mecanismo disponible"}`;
    },
  },
  actividad: {
    greet: "📋 Vista por actividad RAT. Aquí puedes ver qué titulares consintieron para cada actividad de tratamiento.\n\nPuedo ayudarte a:\n• Detectar actividades sin consentimientos suficientes\n• Identificar titulares que revocaron\n• Verificar cobertura por actividad",
    analisis: (registros) => {
      const byRat = {};
      registros.forEach(r => r.consentimientos.forEach(c => {
        if (!byRat[c.ratId]) byRat[c.ratId] = { activos: 0, revocados: 0, rechazados: 0, total: 0 };
        byRat[c.ratId].total++;
        if (c.estado === "Activo") byRat[c.ratId].activos++;
        if (c.estado === "Revocado") byRat[c.ratId].revocados++;
        if (c.estado === "Rechazado") byRat[c.ratId].rechazados++;
      }));
      let result = "📊 **Consentimientos por actividad RAT:**\n\n";
      Object.entries(byRat).forEach(([ratId, stats]) => {
        const rat = ratActividades.find(r => r.id === ratId);
        result += `**${ratId} — ${rat?.nombre || ""}:**\n`;
        result += `  ✅ ${stats.activos} activos · 🚫 ${stats.revocados} revocados · ✕ ${stats.rechazados} rechazados\n\n`;
      });
      return result + "💡 **Nota:** Toda actividad RAT que use consentimiento como base de licitud debe tener 100% de sus titulares con consentimiento activo para las finalidades declaradas.";
    },
  },
  general: {
    requisitos: "✋ **6 requisitos del consentimiento válido (Art. 12° Ley 21.719):**\n\n1. **Previo** — Antes de recolectar o tratar los datos.\n2. **Expreso** — Acción afirmativa clara: checkbox no pre-marcado, firma, click en \"Acepto\". Silencio NO es consentimiento.\n3. **Específico** — Un consentimiento por cada finalidad distinta. No vale \"acepto todo\".\n4. **Informado** — El titular debe saber: quién trata, para qué, por cuánto tiempo, con quién comparte, y sus derechos.\n5. **Inequívoco** — No puede haber duda de que el titular consintió.\n6. **Libre** — Sin coerción. No puedes condicionar un servicio a aceptar tratamientos innecesarios.\n\n📝 **Además debe ser:**\n• **Verificable** — Debes poder demostrar que se obtuvo (evidencia).\n• **Revocable** — El titular puede retirar en cualquier momento, tan fácil como lo dio.",
    demostrar: "🔐 **Cómo demostrar el consentimiento ante fiscalización:**\n\nLa Agencia de Protección de Datos puede exigir que demuestres que obtuviste consentimiento válido. Necesitas:\n\n**Para consentimiento digital:**\n• Timestamp exacto del momento\n• IP de origen y User Agent\n• Hash de integridad del formulario mostrado\n• Captura de la versión exacta del formulario/banner\n• Registro de qué finalidades aceptó/rechazó\n• URL donde se capturó\n\n**Para consentimiento físico:**\n• Documento firmado con identificación del titular\n• Fecha y lugar\n• Testigos si aplica\n• Copia del texto de información mostrado\n• Ubicación física del archivo\n\n**Plazo de conservación:** Durante todo el período de tratamiento + tiempo que establezca la ley para prescripción de acciones.",
    terceros: "📤 **Consentimiento y terceros:**\n\nSi compartes datos con terceros, debes:\n\n1. **Informar al titular** quiénes son los terceros (nombre, no categoría genérica).\n2. **Obtener consentimiento específico** para cada tercero o categoría.\n3. **Si el titular revoca**, notificar a los terceros para que cesen el tratamiento.\n4. **Verificar** que los terceros cumplan con la Ley 21.719.\n\n⚠️ En tu sistema detecto que REG-001 (Juan Pérez) tenía datos compartidos con RetailPartner SpA y AdNetwork Chile. Al revocar, ambos debieron ser notificados.",
  },
};

function getAIR(msg, ctx) {
  const lower = msg.toLowerCase().trim();
  const { currentView, currentTab, registro } = ctx;
  if (lower.includes("requisito") || lower.includes("art. 12") || lower.includes("válido")) return aiR.general.requisitos;
  if (lower.includes("demostrar") || lower.includes("probar") || lower.includes("fiscaliz") || lower.includes("auditor")) return aiR.general.demostrar;
  if (lower.includes("tercero")) return aiR.general.terceros;
  if (currentView === "detail" && registro) return aiR.detail.analizar(registro);
  if (currentView === "list") {
    if (currentTab === "actividad") {
      if (lower.includes("anali") || lower.includes("estado")) return aiR.actividad.analisis(initialRegistros);
      return aiR.actividad.greet;
    }
    if (currentTab === "revocaciones") return aiR.list.revocaciones;
    if (lower.includes("evidencia") || lower.includes("prueba")) return aiR.list.evidencia;
    if (lower.includes("revoc")) return aiR.list.revocaciones;
    if (lower.includes("anali") || lower.includes("estado") || lower.includes("diagnóstico")) return aiR.list.analisis;
    return aiR.list.greet;
  }
  return aiR.list.greet;
}

function getQA(view, tab) {
  if (view === "list" && tab === "titulares") return [
    { label: "📊 Diagnóstico general", msg: "Analiza el estado de mis consentimientos" },
    { label: "🔐 Estado de evidencia", msg: "¿Cómo está la evidencia de cada titular?" },
    { label: "✋ Requisitos Art. 12°", msg: "¿Cuáles son los requisitos del consentimiento?" },
    { label: "🔐 Demostrar consentimiento", msg: "¿Cómo demuestro el consentimiento ante fiscalización?" },
  ];
  if (view === "list" && tab === "actividad") return [
    { label: "📊 Por actividad RAT", msg: "Analiza consentimientos por actividad" },
    { label: "📤 Terceros", msg: "¿Qué pasa con el consentimiento y terceros?" },
  ];
  if (view === "list" && tab === "revocaciones") return [
    { label: "🚫 Resumen revocaciones", msg: "Dame un resumen de las revocaciones" },
    { label: "✋ Requisitos legales", msg: "¿Cuáles son los requisitos del consentimiento?" },
  ];
  if (view === "detail") return [
    { label: "🔍 Analizar titular", msg: "Analiza este consentimiento" },
    { label: "🔐 Demostrar ante Agencia", msg: "¿Puedo demostrar este consentimiento?" },
    { label: "📤 Terceros", msg: "¿Qué pasa con terceros?" },
  ];
  return [];
}

// ====================================================================
// AI COPILOT PANEL
// ====================================================================
const AICopilot = ({ open, onToggle, currentView, currentTab, registro }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState({});
  const chatEndRef = useRef(null);
  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);
  useEffect(() => {
    const key = `${currentView}-${currentTab}-${registro?.id || ""}`;
    if (!hasGreeted[key] && open) {
      const g = getAIR("", { currentView, currentTab, registro });
      setMessages(prev => [...prev, { role: "ai", text: g, ts: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) }]);
      setHasGreeted(prev => ({ ...prev, [key]: true }));
    }
  }, [currentView, currentTab, registro?.id, open]);

  const send = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: "user", text, ts: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) }]);
    setInput(""); setTyping(true);
    await delay(600 + Math.random() * 800);
    const r = getAIR(text, { currentView, currentTab, registro });
    setMessages(prev => [...prev, { role: "ai", text: r, ts: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) }]);
    setTyping(false);
  };
  const qa = getQA(currentView, currentTab);
  const renderText = (t) => t.split("\n").map((l, i) => {
    let p = l.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const isBullet = l.trim().startsWith("•") || l.trim().startsWith("-") || /^\d+\./.test(l.trim());
    return <div key={i} style={{ marginBottom: l.trim() === "" ? 6 : 2, paddingLeft: isBullet ? 4 : 0, lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: p }} />;
  });

  if (!open) return <button onClick={onToggle} style={{ position: "fixed", right: 20, bottom: 20, width: 54, height: 54, borderRadius: "50%", background: `linear-gradient(135deg, ${C.ai} 0%, #9333ea 100%)`, border: "none", color: "#fff", fontSize: 22, cursor: "pointer", zIndex: 200, boxShadow: `0 4px 20px ${C.ai}66`, display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>🤖</button>;

  return (
    <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 380, zIndex: 200, background: C.white, borderLeft: `1px solid ${C.border}`, display: "flex", flexDirection: "column", boxShadow: "-4px 0 30px rgba(20,18,66,0.08)", fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, background: `linear-gradient(135deg, ${C.ai}08 0%, ${C.ai}04 100%)`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${C.ai} 0%, #9333ea 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div><div><div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Asistente IA</div><div style={{ fontSize: 10, color: C.ai, fontWeight: 600 }}>Gestión de Consentimientos B2B</div></div></div>
        <div style={{ display: "flex", gap: 6 }}><button onClick={() => { setMessages([]); setHasGreeted({}); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: C.textMut, padding: 4 }}>🗑️</button><button onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.textMut, padding: 4 }}>✕</button></div>
      </div>
      <div style={{ padding: "8px 18px", background: C.aiGlow, borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.ai, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: C.ai }} />{currentView === "list" && currentTab === "titulares" && "Vista: Por titular"}{currentView === "list" && currentTab === "actividad" && "Vista: Por actividad RAT"}{currentView === "list" && currentTab === "revocaciones" && "Vista: Revocaciones"}{currentView === "detail" && `Detalle: ${registro?.titularNombre || ""}`}</div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && <div style={{ textAlign: "center", padding: "30px 10px", color: C.textMut, fontSize: 12 }}><div style={{ fontSize: 32, marginBottom: 8 }}>✋</div><div style={{ fontWeight: 600, color: C.textSec, marginBottom: 4 }}>Asistente de Consentimientos</div><div>Gestión operativa B2B — Art. 12° Ley 21.719</div></div>}
        {messages.map((msg, i) => <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}><div style={{ maxWidth: "92%", padding: "10px 14px", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: msg.role === "user" ? C.navyDark : C.bg, color: msg.role === "user" ? "#fff" : C.text, fontSize: 12.5 }}>{msg.role === "ai" ? renderText(msg.text) : msg.text}<div style={{ fontSize: 9, marginTop: 4, color: msg.role === "user" ? "rgba(255,255,255,0.5)" : C.textMut, textAlign: "right" }}>{msg.ts}</div></div></div>)}
        {typing && <div><div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: C.bg }}><span style={{ display: "inline-flex", gap: 4 }}>{[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.ai, opacity: 0.4, animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}</span></div></div>}
        <div ref={chatEndRef} />
      </div>
      {qa.length > 0 && <div style={{ padding: "8px 14px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 6, flexWrap: "wrap", background: C.aiGlow }}>{qa.map((q, i) => <button key={i} onClick={() => send(q.msg)} style={{ padding: "5px 10px", borderRadius: 14, border: `1px solid ${C.ai}33`, background: C.white, color: C.ai, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }} onMouseEnter={e => e.currentTarget.style.background = C.aiLt} onMouseLeave={e => e.currentTarget.style.background = C.white}>{q.label}</button>)}</div>}
      <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, alignItems: "flex-end" }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder="Pregunta sobre consentimientos..." rows={1} style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, color: C.text, resize: "none", fontFamily: "inherit", outline: "none", maxHeight: 80 }} onFocus={e => e.currentTarget.style.borderColor = C.ai} onBlur={e => e.currentTarget.style.borderColor = C.border} />
        <button onClick={() => send(input)} disabled={!input.trim()} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: input.trim() ? `linear-gradient(135deg, ${C.ai} 0%, #9333ea 100%)` : C.bg, color: input.trim() ? "#fff" : C.textMut, cursor: input.trim() ? "pointer" : "default", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>➤</button>
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1.15); } }`}</style>
    </div>
  );
};

// ====================================================================
// SIDEBAR
// ====================================================================
const sidebarItems = [
  { icon: "🏠", label: "Dashboard", id: "dashboard" },
  { icon: "📋", label: "Inventario RAT", id: "rat" },
  { icon: "⚖️", label: "Licitud", id: "licitud" },
  { icon: "✋", label: "Consentimientos", id: "consent1" },
  { icon: "📑", label: "Gestión Consent.", id: "consent2", active: true },
  { icon: "🔒", label: "Riesgos (EIPD)", id: "eipd" },
  { icon: "📩", label: "Derechos ARCO+", id: "arco" },
];
const Sidebar = ({ collapsed, onToggle }) => (
  <div style={{ width: collapsed ? 56 : 210, minHeight: "100vh", background: `linear-gradient(180deg, ${C.navyDark} 0%, ${C.navyMid} 100%)`, color: "#fff", display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, zIndex: 100, transition: "width 0.2s" }}>
    <div style={{ padding: collapsed ? "18px 8px" : "18px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
      {!collapsed && <span style={{ fontWeight: 800, fontSize: 20, fontFamily: "Georgia, serif" }}>Regcheq</span>}
      <button onClick={onToggle} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", cursor: "pointer", borderRadius: 4, padding: "3px 7px", fontSize: 12 }}>{collapsed ? "▶" : "◀"}</button>
    </div>
    <nav style={{ flex: 1, paddingTop: 6 }}>{sidebarItems.map(item => <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 0" : "10px 16px", justifyContent: collapsed ? "center" : "flex-start", cursor: "pointer", background: item.active ? "rgba(255,255,255,0.12)" : "transparent", borderLeft: item.active ? "3px solid #fff" : "3px solid transparent", fontSize: 13 }}><span style={{ fontSize: 15 }}>{item.icon}</span>{!collapsed && <span style={{ fontWeight: item.active ? 600 : 400 }}>{item.label}</span>}</div>)}</nav>
    {!collapsed && <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Protección de Datos · Ley 21.719</div>}
  </div>
);

// ====================================================================
// MAIN
// ====================================================================
export default function GestionConsentimientosB2B() {
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState("list");
  const [tab, setTab] = useState("titulares");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const registros = initialRegistros;
  const revocaciones = initialRevocaciones;

  const stats = useMemo(() => {
    const allC = registros.flatMap(r => r.consentimientos);
    return { titulares: registros.length, activos: allC.filter(c => c.estado === "Activo").length, revocados: allC.filter(c => c.estado === "Revocado").length, rechazados: allC.filter(c => c.estado === "Rechazado").length, sensibles: registros.filter(r => r.consentimientos.some(c => ratActividades.find(a => a.id === c.ratId)?.sensible)).length, totalRevocaciones: revocaciones.length };
  }, [registros, revocaciones]);

  const filteredRegistros = useMemo(() => {
    if (!search) return registros;
    const s = search.toLowerCase();
    return registros.filter(r => r.titularNombre.toLowerCase().includes(s) || r.titularRut.includes(s) || r.titularEmail.toLowerCase().includes(s));
  }, [registros, search]);

  // Agrupar por actividad RAT
  const byRat = useMemo(() => {
    const map = {};
    registros.forEach(r => r.consentimientos.forEach(c => {
      if (!map[c.ratId]) map[c.ratId] = { rat: ratActividades.find(a => a.id === c.ratId), titulares: [] };
      const existing = map[c.ratId].titulares.find(t => t.registroId === r.id);
      if (!existing) map[c.ratId].titulares.push({ registroId: r.id, nombre: r.titularNombre, rut: r.titularRut, consentimientos: [c] });
      else existing.consentimientos.push(c);
    }));
    return map;
  }, [registros]);

  const ml = collapsed ? 56 : 210;
  const mr = copilotOpen ? 380 : 0;
  const selectedReg = selectedId ? registros.find(r => r.id === selectedId) : null;

  const renderContent = () => {
    if (view === "detail" && selectedReg) return <TitularDetail registro={selectedReg} revocaciones={revocaciones} onBack={() => { setView("list"); setSelectedId(null); }} />;

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text }}>Gestión de Consentimientos</h1>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: C.textSec }}>Registro, evidencia y revocaciones · Art. 12° Ley 21.719</p>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { label: "Titulares", value: stats.titulares, color: C.blue },
            { label: "Consent. activos", value: stats.activos, color: C.green },
            { label: "Revocados", value: stats.revocados, color: C.red },
            { label: "Rechazados", value: stats.rechazados, color: C.orange },
            { label: "Datos sensibles", value: stats.sensibles, color: C.purple },
            { label: "Revocaciones", value: stats.totalRevocaciones, color: C.red },
          ].map(s => (
            <div key={s.label} style={{ background: C.white, borderRadius: 8, padding: "10px 16px", border: `1px solid ${C.border}`, flex: 1, minWidth: 90 }}>
              <div style={{ fontSize: 10, color: C.textSec }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 18, borderBottom: `2px solid ${C.border}` }}>
          {[{ id: "titulares", label: "👤 Por Titular" }, { id: "actividad", label: "📋 Por Actividad RAT" }, { id: "revocaciones", label: "🚫 Revocaciones" }].map(t => (
            <div key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: tab === t.id ? C.navyDark : C.textMut, borderBottom: tab === t.id ? `2px solid ${C.navyDark}` : "2px solid transparent", marginBottom: -2 }}>{t.label}</div>
          ))}
        </div>

        {/* TAB: Por Titular */}
        {tab === "titulares" && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar por nombre, RUT o email..." style={{ width: "100%", maxWidth: 400, padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, boxSizing: "border-box" }} />
            </div>
            <div style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: C.cardShadow }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr style={{ background: C.bg }}>{["Titular", "RUT", "Consentimientos", "Actividades", "Evidencia", "Estado"].map(h => <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: C.textSec, borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
                <tbody>
                  {filteredRegistros.map(r => {
                    const activos = r.consentimientos.filter(c => c.estado === "Activo").length;
                    const total = r.consentimientos.length;
                    const rats = [...new Set(r.consentimientos.map(c => c.ratId))];
                    const allRevoked = r.consentimientos.every(c => c.estado === "Revocado");
                    return (
                      <tr key={r.id} onClick={() => { setSelectedId(r.id); setView("detail"); }} style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer", background: allRevoked ? "#fef2f2" : "transparent" }} onMouseEnter={e => e.currentTarget.style.background = allRevoked ? "#fde8e8" : C.bg} onMouseLeave={e => e.currentTarget.style.background = allRevoked ? "#fef2f2" : "transparent"}>
                        <td style={{ padding: "10px 12px" }}><div style={{ fontWeight: 600, color: C.text }}>{r.titularNombre}</div><div style={{ fontSize: 10, color: C.textMut }}>{r.titularEmail}</div></td>
                        <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11, color: C.textSec }}>{r.titularRut}</td>
                        <td style={{ padding: "10px 12px" }}><Badge text={`${activos}/${total}`} color={activos === total ? C.green : C.orange} bg={activos === total ? C.greenLt : C.orangeLt} /></td>
                        <td style={{ padding: "10px 12px" }}><div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>{rats.map(id => <Badge key={id} text={id} color={C.blue} bg={C.blueLt} />)}</div></td>
                        <td style={{ padding: "10px 12px" }}><Badge text={r.evidencia.tipo === "Digital" ? "🌐 Digital" : "📄 Físico"} color={r.evidencia.tipo === "Digital" ? C.cyan : C.orange} bg={r.evidencia.tipo === "Digital" ? C.cyanLt : C.orangeLt} /></td>
                        <td style={{ padding: "10px 12px" }}>{allRevoked ? <Badge text="Todo revocado" color={C.red} bg={C.redLt} /> : activos === total ? <Badge text="Completo" color={C.green} bg={C.greenLt} /> : <Badge text="Parcial" color={C.orange} bg={C.orangeLt} />}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredRegistros.length === 0 && <div style={{ padding: 30, textAlign: "center", color: C.textMut }}>No se encontraron titulares.</div>}
            </div>
          </div>
        )}

        {/* TAB: Por Actividad RAT */}
        {tab === "actividad" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {Object.entries(byRat).map(([ratId, data]) => {
              const activos = data.titulares.flatMap(t => t.consentimientos).filter(c => c.estado === "Activo").length;
              const totalC = data.titulares.flatMap(t => t.consentimientos).length;
              return (
                <div key={ratId} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, boxShadow: C.cardShadow }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{ratId} — {data.rat?.nombre}</div>
                      <div style={{ fontSize: 11, color: C.textMut }}>{data.rat?.categorias.join(", ")} {data.rat?.sensible ? "⚠️ Sensible" : ""}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Badge text={`${data.titulares.length} titular${data.titulares.length > 1 ? "es" : ""}`} color={C.blue} bg={C.blueLt} />
                      <Badge text={`${activos}/${totalC} activos`} color={activos === totalC ? C.green : C.orange} bg={activos === totalC ? C.greenLt : C.orangeLt} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {data.titulares.map(t => (
                      <div key={t.registroId} onClick={() => { setSelectedId(t.registroId); setView("detail"); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 6, background: C.bg, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = C.blueLt} onMouseLeave={e => e.currentTarget.style.background = C.bg}>
                        <div><span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{t.nombre}</span> <span style={{ fontSize: 11, color: C.textMut }}>({t.rut})</span></div>
                        <div style={{ display: "flex", gap: 4 }}>{t.consentimientos.map((c, i) => <span key={i}>{estadoBadge(c.estado)}</span>)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: Revocaciones */}
        {tab === "revocaciones" && (
          <div>
            <div style={{ padding: "12px 18px", background: C.blueLt, borderRadius: 10, marginBottom: 16, fontSize: 12, color: C.blue, lineHeight: 1.5 }}>
              ℹ️ <strong>Registro de revocaciones.</strong> Cada vez que un titular retira su consentimiento, debe quedar documentado: fecha, canal, motivo, impacto en el tratamiento, y si se notificó a terceros. La revocación debe ser tan fácil como dar el consentimiento (Art. 12° Ley 21.719).
            </div>
            <div style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: C.cardShadow }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr style={{ background: C.bg }}>{["ID", "Titular", "Finalidad revocada", "Fecha", "Canal", "Terceros notif.", "Estado"].map(h => <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: C.textSec, borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
                <tbody>
                  {revocaciones.map(r => (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }} onMouseEnter={e => e.currentTarget.style.background = C.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11, fontWeight: 600, color: C.navyDark }}>{r.id}</td>
                      <td style={{ padding: "10px 12px" }}><div style={{ fontWeight: 600, color: C.text }}>{r.titularNombre}</div><div style={{ fontSize: 10, color: C.textMut }}>{r.titularRut}</div></td>
                      <td style={{ padding: "10px 12px", color: C.text, maxWidth: 200 }}>{r.finalidad}</td>
                      <td style={{ padding: "10px 12px", color: C.textSec }}>{r.fechaRevocacion}</td>
                      <td style={{ padding: "10px 12px", color: C.textSec, fontSize: 11 }}>{r.canal}</td>
                      <td style={{ padding: "10px 12px" }}><span style={{ color: r.notificadoTerceros ? C.green : C.textMut, fontWeight: 600 }}>{r.notificadoTerceros ? "Sí ✓" : "N/A"}</span></td>
                      <td style={{ padding: "10px 12px" }}><Badge text={r.estadoEjecucion} color={r.estadoEjecucion === "Ejecutada" ? C.green : C.orange} bg={r.estadoEjecucion === "Ejecutada" ? C.greenLt : C.orangeLt} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div style={{ flex: 1, marginLeft: ml, marginRight: mr, transition: "margin-left 0.2s, margin-right 0.3s" }}>
        <div style={{ height: 52, background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center" }}><span style={{ fontSize: 13, color: C.textSec }}>Protección de Datos</span><span style={{ color: C.textMut, margin: "0 6px" }}>›</span><span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Gestión de Consentimientos</span></div>
          {!copilotOpen && <button onClick={() => setCopilotOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, background: `linear-gradient(135deg, ${C.ai}12 0%, ${C.ai}06 100%)`, border: `1px solid ${C.ai}33`, color: C.ai, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>🤖 Asistente IA</button>}
        </div>
        <div style={{ padding: "22px 28px", maxWidth: 1200 }}>{renderContent()}</div>
      </div>
      <AICopilot open={copilotOpen} onToggle={() => setCopilotOpen(!copilotOpen)} currentView={view} currentTab={tab} registro={selectedReg} />
    </div>
  );
}

import { useState, useMemo, useRef, useEffect } from "react";

// ============================================
// REGCHEQ - Módulo de Setup / Configuración
// Solo visible para Super Administrador
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

// ===== DEMO DATA =====
const initialEmpresa = {
  razonSocial: "Empresa Demo SpA", rut: "76.123.456-7", giro: "Servicios tecnológicos",
  direccion: "Av. Providencia 1234, Of. 801, Providencia", comuna: "Providencia", ciudad: "Santiago",
  representanteLegal: "Andrea Soto Vergara", rutRepresentante: "12.345.678-9",
  dpd: "Carolina Méndez Ruiz", emailDpd: "cmendez@empresa.cl", telefonoDpd: "+56 9 8765 4321",
  sitioWeb: "https://www.empresa-demo.cl", fechaRegistro: "2025-08-01", agenciaNotificada: false,
};

const coloresArea = ["#3b82f6", "#8b5cf6", "#f97316", "#10b981", "#06b6d4", "#f59e0b", "#ef4444", "#ec4899", "#84cc16", "#6366f1"];

const initialAreas = [
  { id: "rrhh", nombre: "Recursos Humanos", responsable: "Andrea Soto Vergara", email: "asoto@empresa.cl", color: "#3b82f6", activa: true },
  { id: "marketing", nombre: "Marketing", responsable: "Felipe Araya Muñoz", email: "faraya@empresa.cl", color: "#8b5cf6", activa: true },
  { id: "seguridad", nombre: "Seguridad", responsable: "Roberto Díaz Castillo", email: "rdiaz@empresa.cl", color: "#f97316", activa: true },
  { id: "riesgo", nombre: "Riesgo y Cumplimiento", responsable: "Carolina Méndez Ruiz", email: "cmendez@empresa.cl", color: "#10b981", activa: true },
  { id: "comercial", nombre: "Comercial", responsable: "Daniela Vargas Pinto", email: "dvargas@empresa.cl", color: "#06b6d4", activa: true },
  { id: "data", nombre: "Data Analytics", responsable: "Tomás Herrera Lagos", email: "therrera@empresa.cl", color: "#f59e0b", activa: true },
  { id: "servicio", nombre: "Servicio al Cliente", responsable: "Patricia Lobos Reyes", email: "plobos@empresa.cl", color: "#ef4444", activa: true },
];

const rolesConfig = [
  { id: "superadmin", nombre: "Super Administrador", desc: "Acceso total + Setup", icon: "👑", modulos: ["dashboard", "rat", "licitud", "consentimientos", "eipd", "arco", "setup"], veTodasAreas: true, editable: false },
  { id: "admin", nombre: "Administrador", desc: "Acceso total sin Setup", icon: "🔑", modulos: ["dashboard", "rat", "licitud", "consentimientos", "eipd", "arco"], veTodasAreas: true, editable: true },
  { id: "dpd", nombre: "Delegado Protección Datos", desc: "Todos los módulos, todas las áreas", icon: "🛡️", modulos: ["dashboard", "rat", "licitud", "consentimientos", "eipd", "arco"], veTodasAreas: true, editable: true },
  { id: "responsable", nombre: "Responsable de Área", desc: "Todos los módulos, solo su área", icon: "👤", modulos: ["dashboard", "rat", "licitud", "consentimientos", "eipd", "arco"], veTodasAreas: false, editable: true },
  { id: "operador", nombre: "Operador", desc: "Solo ARCO+ y Consentimientos de su área", icon: "⚙️", modulos: ["dashboard", "arco", "consentimientos"], veTodasAreas: false, editable: true },
];

const modulosDisponibles = [
  { id: "dashboard", nombre: "Dashboard", icon: "🏠" },
  { id: "rat", nombre: "Inventario RAT", icon: "📋" },
  { id: "licitud", nombre: "Licitud", icon: "⚖️" },
  { id: "consentimientos", nombre: "Gestión Consent.", icon: "📑" },
  { id: "eipd", nombre: "Riesgos (EIPD)", icon: "🔒" },
  { id: "arco", nombre: "Derechos ARCO+", icon: "📩" },
];

const initialUsuarios = [
  { id: "USR-001", nombre: "Rebeca Lobos", email: "rlobos@empresa.cl", rol: "superadmin", area: null, activo: true },
  { id: "USR-002", nombre: "Carolina Méndez", email: "cmendez@empresa.cl", rol: "dpd", area: null, activo: true },
  { id: "USR-003", nombre: "Andrea Soto", email: "asoto@empresa.cl", rol: "responsable", area: "rrhh", activo: true },
  { id: "USR-004", nombre: "Felipe Araya", email: "faraya@empresa.cl", rol: "responsable", area: "marketing", activo: true },
  { id: "USR-005", nombre: "Roberto Díaz", email: "rdiaz@empresa.cl", rol: "responsable", area: "seguridad", activo: true },
  { id: "USR-006", nombre: "Tomás Herrera", email: "therrera@empresa.cl", rol: "operador", area: "data", activo: true },
  { id: "USR-007", nombre: "Patricia Lobos", email: "plobos@empresa.cl", rol: "operador", area: "servicio", activo: true },
];

const initialCategorias = [
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

// ===== SIDEBAR =====
const sidebarItems = [
  { icon: "🏠", label: "Dashboard", id: "dashboard" },
  { icon: "📋", label: "Inventario RAT", id: "rat" },
  { icon: "⚖️", label: "Licitud", id: "licitud" },
  { icon: "📑", label: "Gestión Consent.", id: "consentimientos" },
  { icon: "🔒", label: "Riesgos (EIPD)", id: "eipd" },
  { icon: "📩", label: "Derechos ARCO+", id: "arco" },
  { icon: "⚙️", label: "Setup", id: "setup", active: true },
];
const Sidebar = ({ collapsed, onToggle }) => (
  <div style={{ width: collapsed ? 56 : 210, minHeight: "100vh", background: `linear-gradient(180deg, ${C.navyDark} 0%, ${C.navyMid} 100%)`, color: "#fff", display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, zIndex: 100, transition: "width 0.2s" }}>
    <div style={{ padding: collapsed ? "18px 8px" : "18px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
      {!collapsed && <span style={{ fontWeight: 800, fontSize: 20, fontFamily: "Georgia, serif" }}>Regcheq</span>}
      <button onClick={onToggle} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", cursor: "pointer", borderRadius: 4, padding: "3px 7px", fontSize: 12 }}>{collapsed ? "▶" : "◀"}</button>
    </div>
    <nav style={{ flex: 1, paddingTop: 6 }}>
      {sidebarItems.map(item => {
        const isSetup = item.id === "setup";
        return (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 0" : "10px 16px", justifyContent: collapsed ? "center" : "flex-start", cursor: "pointer", background: item.active ? "rgba(255,255,255,0.12)" : "transparent", borderLeft: item.active ? "3px solid #fff" : "3px solid transparent", fontSize: 13, marginTop: isSetup ? 8 : 0, borderTop: isSetup ? "1px solid rgba(255,255,255,0.08)" : "none", paddingTop: isSetup ? 14 : undefined }}>
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            {!collapsed && <span style={{ fontWeight: item.active ? 600 : 400 }}>{item.label}</span>}
          </div>
        );
      })}
    </nav>
    {!collapsed && <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Protección de Datos · Ley 21.719</div>}
  </div>
);

// ===== UI =====
const Badge = ({ text, color, bg }) => <span style={{ padding: "2px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: bg, color, whiteSpace: "nowrap" }}>{text}</span>;
const Btn = ({ children, onClick, variant = "primary", style: s = {}, disabled }) => {
  const base = { padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", border: "none", opacity: disabled ? 0.5 : 1, ...s };
  const v = { primary: { ...base, background: C.navyDark, color: "#fff" }, secondary: { ...base, background: C.white, color: C.text, border: `1px solid ${C.border}` }, ghost: { ...base, background: "transparent", color: C.textSec, padding: "9px 12px" }, success: { ...base, background: C.green, color: "#fff" }, danger: { ...base, background: C.redLt, color: C.red } };
  return <button onClick={disabled ? undefined : onClick} style={v[variant]}>{children}</button>;
};
const Input = ({ label, value, onChange, placeholder, required, disabled }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>{label} {required && <span style={{ color: C.red }}>*</span>}</label>}
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: disabled ? C.textMut : C.text, boxSizing: "border-box", background: disabled ? C.bg : C.white }} />
  </div>
);

// ====================================================================
// SECTION 1: DATOS DE LA EMPRESA
// ====================================================================
const SeccionEmpresa = ({ empresa, setEmpresa }) => {
  const set = (k, v) => setEmpresa(prev => ({ ...prev, [k]: v }));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, color: C.text }}>Datos de la Empresa</h2>
          <p style={{ margin: 0, fontSize: 13, color: C.textSec }}>Información legal del responsable del tratamiento</p>
        </div>
        <Btn variant="success" style={{ fontSize: 12, padding: "7px 16px" }}>💾 Guardar</Btn>
      </div>
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, boxShadow: C.cardShadow }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Identificación Legal</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0 16px" }}>
          <Input label="Razón Social" value={empresa.razonSocial} onChange={v => set("razonSocial", v)} required />
          <Input label="RUT Empresa" value={empresa.rut} onChange={v => set("rut", v)} required />
          <Input label="Giro" value={empresa.giro} onChange={v => set("giro", v)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0 16px" }}>
          <Input label="Dirección" value={empresa.direccion} onChange={v => set("direccion", v)} />
          <Input label="Comuna" value={empresa.comuna} onChange={v => set("comuna", v)} />
          <Input label="Ciudad" value={empresa.ciudad} onChange={v => set("ciudad", v)} />
        </div>
        <Input label="Sitio Web" value={empresa.sitioWeb} onChange={v => set("sitioWeb", v)} />

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Representante Legal</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Input label="Nombre completo" value={empresa.representanteLegal} onChange={v => set("representanteLegal", v)} required />
            <Input label="RUT" value={empresa.rutRepresentante} onChange={v => set("rutRepresentante", v)} required />
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Delegado de Protección de Datos (DPD)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
            <Input label="Nombre DPD" value={empresa.dpd} onChange={v => set("dpd", v)} required />
            <Input label="Email DPD" value={empresa.emailDpd} onChange={v => set("emailDpd", v)} required />
            <Input label="Teléfono DPD" value={empresa.telefonoDpd} onChange={v => set("telefonoDpd", v)} />
          </div>
          <div style={{ padding: "10px 14px", background: C.blueLt, borderRadius: 8, fontSize: 12, color: C.blue, lineHeight: 1.5 }}>
            ℹ️ El DPD es obligatorio para organismos públicos y empresas que traten datos sensibles a gran escala (Art. 31° Ley 21.719). Debe notificarse a la Agencia de Protección de Datos.
          </div>
        </div>
      </div>
    </div>
  );
};

// ====================================================================
// SECTION 2: ÁREAS / DEPARTAMENTOS
// ====================================================================
const SeccionAreas = ({ areas, setAreas }) => {
  const [editingId, setEditingId] = useState(null);
  const [newArea, setNewArea] = useState({ nombre: "", responsable: "", email: "" });

  const addArea = () => {
    if (!newArea.nombre) return;
    const id = newArea.nombre.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z_]/g, "");
    setAreas(prev => [...prev, { ...newArea, id, color: coloresArea[prev.length % coloresArea.length], activa: true }]);
    setNewArea({ nombre: "", responsable: "", email: "" });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, color: C.text }}>Áreas y Departamentos</h2>
          <p style={{ margin: 0, fontSize: 13, color: C.textSec }}>Define las áreas de la empresa. Cada área agrupa actividades RAT y usuarios.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {areas.map(a => (
          <div key={a.id} style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 18px", boxShadow: C.cardShadow, display: "flex", alignItems: "center", gap: 14, opacity: a.activa ? 1 : 0.5 }}>
            <div style={{ width: 10, height: 40, borderRadius: 4, background: a.color }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{a.nombre}</span>
                {!a.activa && <Badge text="Inactiva" color={C.textMut} bg={C.bg} />}
              </div>
              <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{a.responsable} · {a.email}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setAreas(prev => prev.map(x => x.id === a.id ? { ...x, activa: !x.activa } : x))} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: "pointer", color: C.textSec }}>
                {a.activa ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div style={{ background: C.white, borderRadius: 10, border: `2px dashed ${C.border}`, padding: "16px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 10 }}>+ Agregar nueva área</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "0 12px", alignItems: "end" }}>
          <Input label="Nombre" value={newArea.nombre} onChange={v => setNewArea({ ...newArea, nombre: v })} placeholder="Ej: Tecnología" />
          <Input label="Responsable" value={newArea.responsable} onChange={v => setNewArea({ ...newArea, responsable: v })} placeholder="Nombre completo" />
          <Input label="Email" value={newArea.email} onChange={v => setNewArea({ ...newArea, email: v })} placeholder="email@empresa.cl" />
          <Btn onClick={addArea} disabled={!newArea.nombre} style={{ marginBottom: 14, padding: "8px 16px" }}>Agregar</Btn>
        </div>
      </div>
    </div>
  );
};

// ====================================================================
// SECTION 3: USUARIOS Y ROLES
// ====================================================================
const SeccionUsuarios = ({ usuarios, setUsuarios, areas }) => {
  const [showNew, setShowNew] = useState(false);
  const [newUser, setNewUser] = useState({ nombre: "", email: "", rol: "operador", area: "" });

  const addUser = () => {
    if (!newUser.nombre || !newUser.email) return;
    setUsuarios(prev => [...prev, { ...newUser, id: `USR-${String(prev.length + 1).padStart(3, "0")}`, activo: true }]);
    setNewUser({ nombre: "", email: "", rol: "operador", area: "" });
    setShowNew(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, color: C.text }}>Usuarios y Roles</h2>
          <p style={{ margin: 0, fontSize: 13, color: C.textSec }}>Gestiona quién accede al sistema y qué puede ver</p>
        </div>
        <Btn onClick={() => setShowNew(!showNew)}>+ Nuevo Usuario</Btn>
      </div>

      {/* Roles explanation */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {rolesConfig.map(r => (
          <div key={r.id} style={{ padding: "10px 14px", background: C.white, borderRadius: 8, border: `1px solid ${C.border}`, flex: 1, minWidth: 140 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{r.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{r.nombre}</span>
            </div>
            <div style={{ fontSize: 10, color: C.textMut }}>{r.desc}</div>
            <div style={{ fontSize: 10, color: C.textMut, marginTop: 4 }}>
              {r.veTodasAreas ? "🌐 Todas las áreas" : "🏢 Solo su área"} · {r.modulos.length} módulos
            </div>
          </div>
        ))}
      </div>

      {/* New user form */}
      {showNew && (
        <div style={{ background: C.white, borderRadius: 10, border: `2px solid ${C.blue}`, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Nuevo usuario</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0 12px", alignItems: "end" }}>
            <Input label="Nombre" value={newUser.nombre} onChange={v => setNewUser({ ...newUser, nombre: v })} placeholder="Nombre completo" required />
            <Input label="Email" value={newUser.email} onChange={v => setNewUser({ ...newUser, email: v })} placeholder="email@empresa.cl" required />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>Rol <span style={{ color: C.red }}>*</span></label>
              <select value={newUser.rol} onChange={e => setNewUser({ ...newUser, rol: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, boxSizing: "border-box" }}>
                {rolesConfig.filter(r => r.id !== "superadmin").map(r => <option key={r.id} value={r.id}>{r.icon} {r.nombre}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>Área</label>
              <select value={newUser.area} onChange={e => setNewUser({ ...newUser, area: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, boxSizing: "border-box" }}>
                <option value="">Todas las áreas</option>
                {areas.filter(a => a.activa).map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" onClick={() => setShowNew(false)}>Cancelar</Btn>
            <Btn onClick={addUser} disabled={!newUser.nombre || !newUser.email}>💾 Crear Usuario</Btn>
          </div>
        </div>
      )}

      {/* Users table */}
      <div style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: C.cardShadow }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ background: C.bg }}>
            {["Usuario", "Email", "Rol", "Área", "Estado", "Acciones"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: C.textSec, borderBottom: `1px solid ${C.border}` }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {usuarios.map(u => {
              const rol = rolesConfig.find(r => r.id === u.rol);
              const area = areas.find(a => a.id === u.area);
              return (
                <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}`, opacity: u.activo ? 1 : 0.5 }}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.navyDark, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{u.nombre.charAt(0)}</div>
                      <span style={{ fontWeight: 600, color: C.text }}>{u.nombre}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", color: C.textSec }}>{u.email}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span>{rol?.icon}</span>
                      <span style={{ fontSize: 12, color: C.text }}>{rol?.nombre}</span>
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {area ? <Badge text={area.nombre} color={area.color} bg={area.color + "18"} /> : <span style={{ color: C.textMut, fontSize: 11 }}>Todas</span>}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <Badge text={u.activo ? "Activo" : "Inactivo"} color={u.activo ? C.green : C.textMut} bg={u.activo ? C.greenLt : C.bg} />
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {u.rol !== "superadmin" && (
                      <button onClick={() => setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, activo: !x.activo } : x))} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: "pointer", color: C.textSec }}>
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ====================================================================
// SECTION 4: CATEGORÍAS DE DATOS
// ====================================================================
const SeccionCategorias = ({ categorias, setCategorias }) => {
  const [newCat, setNewCat] = useState({ nombre: "", sensible: false, riesgoBase: "Bajo" });

  const addCat = () => {
    if (!newCat.nombre) return;
    const id = newCat.nombre.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z_]/g, "");
    setCategorias(prev => [...prev, { ...newCat, id, activa: true }]);
    setNewCat({ nombre: "", sensible: false, riesgoBase: "Bajo" });
  };

  const riesgoColors = { Bajo: [C.green, C.greenLt], Medio: [C.yellow, C.yellowLt], Alto: [C.red, C.redLt] };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 18, color: C.text }}>Categorías de Datos Personales</h2>
        <p style={{ margin: 0, fontSize: 13, color: C.textSec }}>Personaliza las categorías que tu empresa necesita. Las categorías sensibles requieren consentimiento expreso y EIPD obligatoria.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {categorias.map(cat => {
          const [rColor, rBg] = riesgoColors[cat.riesgoBase] || riesgoColors.Bajo;
          return (
            <div key={cat.id} style={{ background: C.white, borderRadius: 10, border: `1px solid ${cat.activa ? C.border : C.border}`, padding: "12px 16px", boxShadow: C.cardShadow, opacity: cat.activa ? 1 : 0.4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{cat.nombre}</span>
                  {cat.sensible && <Badge text="Sensible ⚠️" color={C.red} bg={C.redLt} />}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <Badge text={`Riesgo: ${cat.riesgoBase}`} color={rColor} bg={rBg} />
                  {!cat.activa && <Badge text="Desactivada" color={C.textMut} bg={C.bg} />}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setCategorias(prev => prev.map(x => x.id === cat.id ? { ...x, sensible: !x.sensible } : x))} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`, background: cat.sensible ? C.redLt : C.white, fontSize: 10, cursor: "pointer", color: cat.sensible ? C.red : C.textMut }}>
                  {cat.sensible ? "🔴 Sensible" : "Marcar sensible"}
                </button>
                <button onClick={() => setCategorias(prev => prev.map(x => x.id === cat.id ? { ...x, activa: !x.activa } : x))} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 10, cursor: "pointer", color: C.textSec }}>
                  {cat.activa ? "✕" : "✓"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add new category */}
      <div style={{ background: C.white, borderRadius: 10, border: `2px dashed ${C.border}`, padding: "16px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.textSec, marginBottom: 10 }}>+ Agregar categoría personalizada</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "0 12px", alignItems: "end" }}>
          <Input label="Nombre" value={newCat.nombre} onChange={v => setNewCat({ ...newCat, nombre: v })} placeholder="Ej: Genético" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>Riesgo base</label>
            <select value={newCat.riesgoBase} onChange={e => setNewCat({ ...newCat, riesgoBase: e.target.value })} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, boxSizing: "border-box" }}>
              {["Bajo", "Medio", "Alto"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 6, paddingTop: 22 }}>
            <input type="checkbox" checked={newCat.sensible} onChange={e => setNewCat({ ...newCat, sensible: e.target.checked })} />
            <span style={{ fontSize: 12, color: C.textSec }}>Dato sensible</span>
          </div>
          <Btn onClick={addCat} disabled={!newCat.nombre} style={{ marginBottom: 14, padding: "8px 16px" }}>Agregar</Btn>
        </div>
      </div>

      <div style={{ marginTop: 12, padding: "10px 14px", background: C.orangeLt, borderRadius: 8, fontSize: 12, color: C.orange, lineHeight: 1.5 }}>
        ⚠️ Las categorías marcadas como <strong>sensibles</strong> activarán automáticamente: consentimiento expreso obligatorio, EIPD obligatoria, y medidas de seguridad reforzadas (Art. 16° bis Ley 21.719).
      </div>
    </div>
  );
};

// ====================================================================
// MAIN MODULE
// ====================================================================
export default function ModuloSetup() {
  const [collapsed, setCollapsed] = useState(false);
  const [seccion, setSeccion] = useState("empresa");
  const [empresa, setEmpresa] = useState(initialEmpresa);
  const [areas, setAreas] = useState(initialAreas);
  const [usuarios, setUsuarios] = useState(initialUsuarios);
  const [categorias, setCategorias] = useState(initialCategorias);

  const ml = collapsed ? 56 : 210;

  const secciones = [
    { id: "empresa", icon: "🏢", label: "Datos de la Empresa", desc: "Razón social, representante legal, DPD" },
    { id: "areas", icon: "🏗️", label: "Áreas y Departamentos", desc: `${areas.filter(a => a.activa).length} áreas activas` },
    { id: "usuarios", icon: "👥", label: "Usuarios y Roles", desc: `${usuarios.filter(u => u.activo).length} usuarios activos` },
    { id: "categorias", icon: "📂", label: "Categorías de Datos", desc: `${categorias.filter(c => c.activa).length} categorías · ${categorias.filter(c => c.sensible && c.activa).length} sensibles` },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div style={{ flex: 1, marginLeft: ml, transition: "margin-left 0.2s" }}>
        <div style={{ height: 52, background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: C.textSec }}>Protección de Datos</span>
            <span style={{ color: C.textMut, margin: "0 6px" }}>›</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Setup</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Badge text="👑 Super Administrador" color={C.ai} bg={C.aiLt} />
            <span style={{ fontSize: 12, color: C.textSec }}>Rebeca Lobos</span>
          </div>
        </div>

        <div style={{ padding: "22px 28px", maxWidth: 1200 }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: C.text }}>⚙️ Configuración del Sistema</h1>
            <p style={{ margin: 0, fontSize: 13, color: C.textSec }}>Personaliza Regcheq según las necesidades de tu empresa. Solo visible para Super Administradores.</p>
          </div>

          {/* Section navigation */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            {secciones.map(s => (
              <div key={s.id} onClick={() => setSeccion(s.id)} style={{
                flex: 1, minWidth: 180, padding: "14px 18px", borderRadius: 10, cursor: "pointer",
                background: seccion === s.id ? C.navyDark : C.white,
                color: seccion === s.id ? "#fff" : C.text,
                border: seccion === s.id ? "none" : `1px solid ${C.border}`,
                boxShadow: seccion === s.id ? "0 4px 16px rgba(20,18,66,0.15)" : C.cardShadow,
                transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>

          {/* Active section */}
          {seccion === "empresa" && <SeccionEmpresa empresa={empresa} setEmpresa={setEmpresa} />}
          {seccion === "areas" && <SeccionAreas areas={areas} setAreas={setAreas} />}
          {seccion === "usuarios" && <SeccionUsuarios usuarios={usuarios} setUsuarios={setUsuarios} areas={areas} />}
          {seccion === "categorias" && <SeccionCategorias categorias={categorias} setCategorias={setCategorias} />}
        </div>
      </div>
    </div>
  );
}

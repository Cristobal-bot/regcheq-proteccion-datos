import { useState, useMemo, useRef, useEffect } from "react";

// ============================================
// REGCHEQ - Protección de Datos Personales
// Dashboard de Cumplimiento - Ley 21.719
// ============================================

const C = {
  navyDark: "#141242",
  navyMid: "#1e1b5e",
  navyLight: "#3d3a8c",
  accent: "#6c63ff",
  bg: "#f3f4f8",
  white: "#ffffff",
  text: "#141242",
  textSec: "#64668b",
  textMut: "#9b9db5",
  green: "#10b981",
  greenLt: "#d1fae5",
  greenDk: "#047857",
  yellow: "#f59e0b",
  yellowLt: "#fef3c7",
  red: "#ef4444",
  redLt: "#fee2e2",
  blue: "#3b82f6",
  blueLt: "#dbeafe",
  purple: "#8b5cf6",
  purpleLt: "#ede9fe",
  orange: "#f97316",
  orangeLt: "#ffedd5",
  border: "#e2e4ed",
  cardShadow: "0 1px 4px rgba(20,18,66,0.06)",
};

// ===== DEMO DATA =====
const demoRAT = [
  { id: "RAT-001", niref: "NIREF-2025-001", nombre: "Gestión de nómina y remuneraciones", responsable: "Depto. RRHH", dpd: "Carolina Méndez", categorias: ["Identificación", "Contacto", "Financiero"], etapa: "Uso", riesgo: "Medio", licitud: "Ejecución de contrato", fechaAct: "2025-11-01", completo: true },
  { id: "RAT-002", niref: "NIREF-2025-002", nombre: "Marketing directo por email", responsable: "Depto. Marketing", dpd: "Carolina Méndez", categorias: ["Identificación", "Contacto", "Preferencias"], etapa: "Recolección", riesgo: "Medio", licitud: "Consentimiento", fechaAct: "2025-11-05", completo: true },
  { id: "RAT-003", niref: "NIREF-2025-003", nombre: "Videovigilancia oficinas", responsable: "Depto. Seguridad", dpd: "Carolina Méndez", categorias: ["Biométricos", "Imagen"], etapa: "Almacenamiento", riesgo: "Alto", licitud: "Interés legítimo", fechaAct: "2025-11-08", completo: true },
  { id: "RAT-004", niref: "NIREF-2025-004", nombre: "Evaluación crediticia clientes", responsable: "Depto. Riesgo", dpd: "Carolina Méndez", categorias: ["Identificación", "Financiero", "Crediticio"], etapa: "Uso", riesgo: "Alto", licitud: "Obligación legal", fechaAct: "2025-11-10", completo: false },
  { id: "RAT-005", niref: "NIREF-2025-005", nombre: "Programa de fidelización", responsable: "Depto. Comercial", dpd: "Carolina Méndez", categorias: ["Identificación", "Contacto", "Preferencias", "Transaccional"], etapa: "Recolección", riesgo: "Bajo", licitud: "Consentimiento", fechaAct: "2025-11-12", completo: true },
  { id: "RAT-006", niref: "NIREF-2025-006", nombre: "Control de acceso biométrico", responsable: "Depto. Seguridad", dpd: "Carolina Méndez", categorias: ["Biométricos", "Identificación"], etapa: "Uso", riesgo: "Alto", licitud: "Interés legítimo", fechaAct: "2025-11-15", completo: false },
  { id: "RAT-007", niref: "NIREF-2025-007", nombre: "Atención de reclamos", responsable: "Depto. Servicio al Cliente", dpd: "Carolina Méndez", categorias: ["Identificación", "Contacto"], etapa: "Uso", riesgo: "Bajo", licitud: "Ejecución de contrato", fechaAct: "2025-11-18", completo: true },
  { id: "RAT-008", niref: "NIREF-2025-008", nombre: "Perfilamiento automatizado de clientes", responsable: "Depto. Data Analytics", dpd: "Carolina Méndez", categorias: ["Identificación", "Transaccional", "Comportamental", "Preferencias"], etapa: "Uso", riesgo: "Alto", licitud: null, fechaAct: "2025-11-20", completo: false },
];

const demoLicitud = [
  { actividad: "RAT-001", base: "Ejecución de contrato", estado: "Validada", detalle: "Contrato laboral vigente" },
  { actividad: "RAT-002", base: "Consentimiento", estado: "Validada", detalle: "Consentimiento expreso obtenido" },
  { actividad: "RAT-003", base: "Interés legítimo", estado: "En ponderación", detalle: "Pendiente análisis de proporcionalidad" },
  { actividad: "RAT-004", base: "Obligación legal", estado: "Validada", detalle: "Ley 20.393 / CMF" },
  { actividad: "RAT-005", base: "Consentimiento", estado: "Validada", detalle: "Consentimiento con opciones separadas" },
  { actividad: "RAT-006", base: "Interés legítimo", estado: "Pendiente", detalle: "Requiere ponderación formal" },
  { actividad: "RAT-007", base: "Ejecución de contrato", estado: "Validada", detalle: "Términos de servicio" },
  { actividad: "RAT-008", base: null, estado: "Sin asignar", detalle: "Requiere definir base de licitud" },
];

const demoEIPD = [
  { id: "EIPD-001", actividad: "RAT-003", nombre: "Videovigilancia oficinas", riesgoInicial: "Alto", impacto: "Alto", probabilidad: "Media", controles: ["Cifrado", "Retención 30 días", "Acceso restringido"], riesgoResidual: "Medio", estado: "Aprobada" },
  { id: "EIPD-002", actividad: "RAT-004", nombre: "Evaluación crediticia", riesgoInicial: "Alto", impacto: "Alto", probabilidad: "Alta", controles: ["Cifrado", "Control de acceso", "Auditoría"], riesgoResidual: "Medio", estado: "En curso" },
  { id: "EIPD-003", actividad: "RAT-006", nombre: "Control de acceso biométrico", riesgoInicial: "Alto", impacto: "Muy Alto", probabilidad: "Media", controles: ["Cifrado AES-256"], riesgoResidual: "Alto", estado: "Bloqueada" },
  { id: "EIPD-004", actividad: "RAT-008", nombre: "Perfilamiento automatizado", riesgoInicial: "Alto", impacto: "Alto", probabilidad: "Alta", controles: [], riesgoResidual: "Alto", estado: "Pendiente" },
];

const demoARCO = [
  { id: "ARCO-001", titular: "Juan Pérez Morales", rut: "12.345.678-9", tipo: "Acceso", fechaSolicitud: "2025-11-01", plazoLegal: "2025-12-01", estado: "Completada", diasRestantes: 0 },
  { id: "ARCO-002", titular: "María González López", rut: "14.567.890-1", tipo: "Rectificación", fechaSolicitud: "2025-11-10", plazoLegal: "2025-12-10", estado: "En proceso", diasRestantes: 7 },
  { id: "ARCO-003", titular: "Carlos Muñoz Rivera", rut: "16.789.012-3", tipo: "Supresión", fechaSolicitud: "2025-11-15", plazoLegal: "2025-12-15", estado: "En proceso", diasRestantes: 12 },
  { id: "ARCO-004", titular: "Ana Silva Torres", rut: "18.901.234-5", tipo: "Portabilidad", fechaSolicitud: "2025-11-18", plazoLegal: "2025-12-18", estado: "Pendiente", diasRestantes: 15 },
  { id: "ARCO-005", titular: "Pedro Rojas Albornoz", rut: "11.223.344-6", tipo: "Oposición", fechaSolicitud: "2025-11-20", plazoLegal: "2025-12-20", estado: "Pendiente", diasRestantes: 17 },
  { id: "ARCO-006", titular: "Claudia Fernández B.", rut: "15.678.901-2", tipo: "Acceso", fechaSolicitud: "2025-10-05", plazoLegal: "2025-11-04", estado: "Completada", diasRestantes: 0 },
  { id: "ARCO-007", titular: "Roberto Díaz C.", rut: "13.456.789-0", tipo: "Oposición a decisión automatizada", fechaSolicitud: "2025-11-22", plazoLegal: "2025-12-22", estado: "Pendiente", diasRestantes: 19 },
];

const demoTendencia = [
  { mes: "Jun", score: 32 }, { mes: "Jul", score: 38 }, { mes: "Ago", score: 45 },
  { mes: "Sep", score: 52 }, { mes: "Oct", score: 58 }, { mes: "Nov", score: 65 },
];

// ===== SIDEBAR =====
const sidebarItems = [
  { icon: "🏠", label: "Home" }, { icon: "📝", label: "Nueva operación" },
  { icon: "📋", label: "Operaciones" }, { icon: "🔍", label: "Consultar Persona" },
  { icon: "👥", label: "Monitoreo" }, { icon: "👤", label: "Usuarios" },
  { icon: "📊", label: "Reportes" }, { icon: "📑", label: "Listas de Interés" },
  { icon: "📖", label: "Manuales" }, { icon: "🔔", label: "Notificaciones" },
  { icon: "🛡️", label: "Protección de Datos", active: true }, { icon: "❓", label: "Ayuda" },
];

const Sidebar = ({ collapsed, onToggle }) => (
  <div style={{
    width: collapsed ? 56 : 210, minHeight: "100vh",
    background: `linear-gradient(180deg, ${C.navyDark} 0%, ${C.navyMid} 100%)`,
    color: "#fff", display: "flex", flexDirection: "column",
    position: "fixed", left: 0, top: 0, zIndex: 100, transition: "width 0.2s",
    borderRight: "1px solid rgba(255,255,255,0.05)",
  }}>
    <div style={{
      padding: collapsed ? "18px 8px" : "18px 16px",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between",
    }}>
      {!collapsed && <span style={{ fontWeight: 800, fontSize: 20, fontFamily: "Georgia, serif", letterSpacing: -0.5 }}>Regcheq</span>}
      <button onClick={onToggle} style={{
        background: "rgba(255,255,255,0.08)", border: "none", color: "#fff",
        cursor: "pointer", borderRadius: 4, padding: "3px 7px", fontSize: 12,
      }}>{collapsed ? "▶" : "◀"}</button>
    </div>
    <nav style={{ flex: 1, paddingTop: 6 }}>
      {sidebarItems.map((item, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: collapsed ? "9px 0" : "9px 16px",
          justifyContent: collapsed ? "center" : "flex-start", cursor: "pointer",
          background: item.active ? "rgba(255,255,255,0.12)" : "transparent",
          borderLeft: item.active ? "3px solid #fff" : "3px solid transparent",
          fontSize: 13, transition: "background 0.15s",
        }}>
          <span style={{ fontSize: 15 }}>{item.icon}</span>
          {!collapsed && <span style={{ fontWeight: item.active ? 600 : 400 }}>{item.label}</span>}
        </div>
      ))}
    </nav>
  </div>
);

// ===== COMPONENTS =====
const Badge = ({ text, color, bg }) => (
  <span style={{
    padding: "2px 10px", borderRadius: 10, fontSize: 11,
    fontWeight: 600, background: bg, color, whiteSpace: "nowrap",
  }}>{text}</span>
);

const RiskBadge = ({ level }) => {
  const m = { Bajo: [C.green, C.greenLt], Medio: [C.yellow, C.yellowLt], Alto: [C.red, C.redLt], "Muy Alto": ["#991b1b", "#fee2e2"] };
  const [color, bg] = m[level] || m.Medio;
  return <Badge text={level} color={color} bg={bg} />;
};

const MiniCard = ({ label, value, sub, color, icon, onClick, selected }) => (
  <div onClick={onClick} style={{
    background: C.white, borderRadius: 10, padding: "16px 18px",
    flex: 1, minWidth: 160, boxShadow: C.cardShadow,
    border: selected ? `2px solid ${color}` : `1px solid ${C.border}`,
    cursor: onClick ? "pointer" : "default", position: "relative",
    transition: "border 0.15s, transform 0.15s",
    transform: selected ? "translateY(-2px)" : "none",
  }}>
    <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: color, borderRadius: "10px 0 0 10px" }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 12, color: C.textSec, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.text, lineHeight: 1.1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: C.textMut, marginTop: 3 }}>{sub}</div>}
      </div>
      <span style={{ fontSize: 22, opacity: 0.12 }}>{icon}</span>
    </div>
  </div>
);

// ===== GAUGE =====
const Gauge = ({ score, size = 170 }) => {
  const color = score >= 75 ? C.green : score >= 50 ? C.yellow : C.red;
  const label = score >= 75 ? "Alto" : score >= 50 ? "Medio" : "Bajo";
  const r = size * 0.42;
  const circ = Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        <path d={`M ${size * 0.08} ${size * 0.55} A ${r} ${r} 0 0 1 ${size * 0.92} ${size * 0.55}`}
          fill="none" stroke={C.bg} strokeWidth={size * 0.07} strokeLinecap="round" />
        <path d={`M ${size * 0.08} ${size * 0.55} A ${r} ${r} 0 0 1 ${size * 0.92} ${size * 0.55}`}
          fill="none" stroke={color} strokeWidth={size * 0.07} strokeLinecap="round"
          strokeDasharray={`${circ}`} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        <text x={size / 2} y={size * 0.45} textAnchor="middle" fontSize={size * 0.17} fontWeight="800" fill={C.text}>{score}%</text>
        <text x={size / 2} y={size * 0.57} textAnchor="middle" fontSize={size * 0.065} fontWeight="600" fill={color}>Cumplimiento {label}</text>
      </svg>
    </div>
  );
};

// ===== TREND CHART =====
const TrendChart = ({ data, height = 140 }) => {
  const max = Math.max(...data.map(d => d.score), 100);
  const w = 100 / (data.length - 1);
  const points = data.map((d, i) => `${i * w},${100 - (d.score / max) * 85}`).join(" ");
  const areaPoints = `0,100 ${points} 100,100`;
  return (
    <div style={{ position: "relative", height }}>
      <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.blue} stopOpacity="0.2" />
            <stop offset="100%" stopColor={C.blue} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[20, 40, 60, 80].map(v => (
          <line key={v} x1="0" y1={100 - (v / max) * 85} x2="100" y2={100 - (v / max) * 85}
            stroke={C.border} strokeWidth="0.3" strokeDasharray="1,1" />
        ))}
        <polygon points={areaPoints} fill="url(#trendGrad)" />
        <polyline points={points} fill="none" stroke={C.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={i} cx={i * w} cy={100 - (d.score / max) * 85} r="2" fill={C.white} stroke={C.blue} strokeWidth="1.2" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMut, marginTop: 4 }}>
        {data.map((d, i) => <span key={i}>{d.mes}</span>)}
      </div>
    </div>
  );
};

// ===== PROGRESS BAR =====
const Progress = ({ label, value, max, color, detail }) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 13, color: C.text }}>{label}</span>
        <span style={{ fontSize: 12, color: C.textMut }}>{value}/{max} <span style={{ fontWeight: 700, color }}>{pct}%</span></span>
      </div>
      <div style={{ height: 7, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
      </div>
      {detail && <div style={{ fontSize: 11, color: C.textMut, marginTop: 2 }}>{detail}</div>}
    </div>
  );
};

// ===== DRILL-DOWN PANELS =====
const DrillRAT = () => (
  <div style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
    <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
      <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>📋 Detalle Inventario RAT</span>
      <span style={{ fontSize: 12, color: C.textMut, marginLeft: 8 }}>— {demoRAT.length} actividades registradas</span>
    </div>
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: C.bg }}>
            {["NIREF", "Actividad", "Responsable", "Categorías", "Etapa", "Riesgo", "Licitud", "Estado"].map(h => (
              <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: C.textSec, borderBottom: `1px solid ${C.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {demoRAT.map(r => (
            <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
              <td style={{ padding: "10px 12px", fontWeight: 600, color: C.navyDark, fontFamily: "monospace", fontSize: 11 }}>{r.niref}</td>
              <td style={{ padding: "10px 12px", color: C.text, fontWeight: 500, maxWidth: 200 }}>{r.nombre}</td>
              <td style={{ padding: "10px 12px", color: C.textSec }}>{r.responsable}</td>
              <td style={{ padding: "10px 12px" }}>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {r.categorias.slice(0, 2).map(c => <Badge key={c} text={c} color={C.purple} bg={C.purpleLt} />)}
                  {r.categorias.length > 2 && <Badge text={`+${r.categorias.length - 2}`} color={C.textMut} bg={C.bg} />}
                </div>
              </td>
              <td style={{ padding: "10px 12px", color: C.textSec }}>{r.etapa}</td>
              <td style={{ padding: "10px 12px" }}><RiskBadge level={r.riesgo} /></td>
              <td style={{ padding: "10px 12px" }}>
                {r.licitud ? <Badge text={r.licitud} color={C.blue} bg={C.blueLt} /> : <Badge text="Sin asignar" color={C.red} bg={C.redLt} />}
              </td>
              <td style={{ padding: "10px 12px" }}>
                {r.completo ? <Badge text="Completo" color={C.green} bg={C.greenLt} /> : <Badge text="Incompleto" color={C.orange} bg={C.orangeLt} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const DrillLicitud = () => {
  const baseCount = {};
  demoLicitud.forEach(l => { if (l.base) baseCount[l.base] = (baseCount[l.base] || 0) + 1; });
  return (
    <div style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>⚖️ Detalle Bases de Licitud</span>
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          {Object.entries(baseCount).map(([base, count]) => (
            <div key={base} style={{ background: C.bg, borderRadius: 8, padding: "10px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{count}</div>
              <div style={{ fontSize: 11, color: C.textSec }}>{base}</div>
            </div>
          ))}
          <div style={{ background: C.redLt, borderRadius: 8, padding: "10px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.red }}>1</div>
            <div style={{ fontSize: 11, color: C.red }}>Sin asignar</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["Actividad", "Base de Licitud", "Estado", "Detalle"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: C.textSec, borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {demoLicitud.map((l, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "10px 12px", fontWeight: 500, color: C.text }}>{l.actividad}</td>
                <td style={{ padding: "10px 12px" }}>
                  {l.base ? <Badge text={l.base} color={C.blue} bg={C.blueLt} /> : <Badge text="Sin asignar" color={C.red} bg={C.redLt} />}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <Badge text={l.estado}
                    color={l.estado === "Validada" ? C.green : l.estado === "Sin asignar" ? C.red : C.yellow}
                    bg={l.estado === "Validada" ? C.greenLt : l.estado === "Sin asignar" ? C.redLt : C.yellowLt} />
                </td>
                <td style={{ padding: "10px 12px", color: C.textSec }}>{l.detalle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DrillEIPD = () => (
  <div style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
    <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
      <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>🔒 Detalle Evaluaciones de Impacto (EIPD)</span>
      <span style={{ fontSize: 12, color: C.textMut, marginLeft: 8 }}>— {demoEIPD.length} evaluaciones</span>
    </div>
    <div style={{ padding: 18 }}>
      {demoEIPD.map(e => (
        <div key={e.id} style={{
          border: `1px solid ${e.estado === "Bloqueada" ? C.red : C.border}`,
          borderRadius: 10, padding: 16, marginBottom: 12,
          background: e.estado === "Bloqueada" ? "#fff5f5" : C.white,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <span style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>{e.id}</span>
              <span style={{ color: C.textSec, fontSize: 12, marginLeft: 8 }}>({e.actividad}) {e.nombre}</span>
            </div>
            <Badge text={e.estado}
              color={e.estado === "Aprobada" ? C.green : e.estado === "Bloqueada" ? C.red : e.estado === "En curso" ? C.blue : C.yellow}
              bg={e.estado === "Aprobada" ? C.greenLt : e.estado === "Bloqueada" ? C.redLt : e.estado === "En curso" ? C.blueLt : C.yellowLt} />
          </div>
          <div style={{ display: "flex", gap: 20, fontSize: 12, color: C.textSec, flexWrap: "wrap" }}>
            <div>Impacto: <strong style={{ color: C.text }}>{e.impacto}</strong></div>
            <div>Probabilidad: <strong style={{ color: C.text }}>{e.probabilidad}</strong></div>
            <div>Riesgo inicial: <RiskBadge level={e.riesgoInicial} /></div>
            <div>Riesgo residual: <RiskBadge level={e.riesgoResidual} /></div>
          </div>
          {e.controles.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
              {e.controles.map(c => <Badge key={c} text={c} color={C.navyDark} bg={C.bg} />)}
            </div>
          )}
          {e.estado === "Bloqueada" && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: C.redLt, borderRadius: 6, fontSize: 12, color: C.red, fontWeight: 600 }}>
              ⛔ Actividad bloqueada — Se requieren controles adicionales antes de continuar el tratamiento
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

const DrillARCO = () => (
  <div style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
    <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
      <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>📩 Detalle Solicitudes ARCO+</span>
      <span style={{ fontSize: 12, color: C.textMut, marginLeft: 8 }}>— Plazo legal: 30 días corridos</span>
    </div>
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: C.bg }}>
            {["ID", "Titular", "Tipo", "Fecha solicitud", "Plazo legal", "Días restantes", "Estado"].map(h => (
              <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: C.textSec, borderBottom: `1px solid ${C.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {demoARCO.map(r => {
            const urgente = r.diasRestantes > 0 && r.diasRestantes <= 5;
            return (
              <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}`, background: urgente ? "#fff8f0" : "transparent" }}>
                <td style={{ padding: "10px 12px", fontWeight: 600, color: C.navyDark, fontFamily: "monospace", fontSize: 11 }}>{r.id}</td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ fontWeight: 500, color: C.text }}>{r.titular}</div>
                  <div style={{ fontSize: 11, color: C.textMut }}>{r.rut}</div>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <Badge text={r.tipo}
                    color={r.tipo === "Acceso" ? C.blue : r.tipo === "Rectificación" ? C.orange : r.tipo === "Supresión" ? C.red : r.tipo === "Portabilidad" ? C.green : C.purple}
                    bg={r.tipo === "Acceso" ? C.blueLt : r.tipo === "Rectificación" ? C.orangeLt : r.tipo === "Supresión" ? C.redLt : r.tipo === "Portabilidad" ? C.greenLt : C.purpleLt} />
                </td>
                <td style={{ padding: "10px 12px", color: C.textSec }}>{r.fechaSolicitud}</td>
                <td style={{ padding: "10px 12px", color: C.textSec }}>{r.plazoLegal}</td>
                <td style={{ padding: "10px 12px" }}>
                  {r.estado === "Completada" ? (
                    <Badge text="✓ Resuelta" color={C.green} bg={C.greenLt} />
                  ) : (
                    <span style={{ fontWeight: 700, color: urgente ? C.red : r.diasRestantes <= 10 ? C.orange : C.text }}>
                      {r.diasRestantes} días {urgente && "⚠️"}
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <Badge text={r.estado}
                    color={r.estado === "Completada" ? C.green : r.estado === "En proceso" ? C.blue : C.yellow}
                    bg={r.estado === "Completada" ? C.greenLt : r.estado === "En proceso" ? C.blueLt : C.yellowLt} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

// ===== ALERTS =====
const alerts = [
  { text: "ARCO-002: Solicitud de rectificación vence en 7 días", level: "alto", mod: "ARCO+" },
  { text: "EIPD-003: Actividad bloqueada — control biométrico sin controles suficientes", level: "critico", mod: "EIPD" },
  { text: "RAT-008: Perfilamiento automatizado sin base de licitud asignada", level: "alto", mod: "Licitud" },
  { text: "Consentimiento de cookies analíticas próximo a vencer (30 días)", level: "medio", mod: "Licitud" },
  { text: "2 solicitudes ARCO+ pendientes de asignación", level: "medio", mod: "ARCO+" },
];

// ===== MAIN DASHBOARD =====

// ====================================================================
// AI ENGINE - DASHBOARD
// ====================================================================
const dashboardAI = {
  greet: "¡Hola! Soy tu asistente del Dashboard de Cumplimiento. Puedo ayudarte a:\n\n• Interpretar tu score y métricas\n• Identificar las prioridades más urgentes\n• Explicar qué significa cada indicador\n• Recomendar próximos pasos\n\n¿Qué necesitas saber?",
  analisis: "📊 **Análisis ejecutivo de cumplimiento:**\n\n**Score general: 65%** — Nivel medio. Necesitas llegar a 80% antes del 1 de diciembre de 2026.\n\n**Por módulo:**\n• RAT: 62% — 3 actividades incompletas (RAT-004, RAT-006, RAT-008)\n• Licitud: 62% — RAT-008 sin base asignada, 2 ponderaciones pendientes\n• EIPD: 50% — 1 bloqueada (biométrico), 1 pendiente (perfilamiento)\n• ARCO+: 29% — Solo 2 de 7 solicitudes resueltas\n\n**Top 3 prioridades:**\n1. 🔴 Resolver EIPD-003 (biométrico bloqueado) — Impide tratamiento\n2. 🔴 Asignar base de licitud a RAT-008 (perfilamiento)\n3. 🟠 Gestionar ARCO-002 (rectificación, vence en 7 días)",
  prioridades: "🎯 **Prioridades ordenadas por impacto:**\n\n**Inmediatas (esta semana):**\n1. ⛔ EIPD-003 bloqueada — Agregar controles al acceso biométrico\n2. ⚠️ ARCO-002 vence en 7 días — Completar rectificación\n3. ⚠️ 2 solicitudes ARCO+ sin asignar\n\n**Corto plazo (2 semanas):**\n4. Asignar base de licitud a RAT-008 (perfilamiento)\n5. Completar ponderación de interés legítimo para videovigilancia\n6. Completar RAT-004 y RAT-006 (campos faltantes)\n\n**Mediano plazo (1 mes):**\n7. Implementar EIPD para perfilamiento automatizado\n8. Revisar consentimientos próximos a vencer\n9. Documentar política de retención de datos",
  score: "📈 **¿Cómo se calcula el score?**\n\nEl score general es un promedio ponderado:\n\n• **RAT (30%):** % de actividades completas (con todos los campos)\n• **Licitud (25%):** % de actividades con base legal validada\n• **EIPD (25%):** % de evaluaciones aprobadas o con riesgo aceptable\n• **ARCO+ (20%):** % de solicitudes resueltas dentro del plazo\n\n**Tu score actual: 65%**\n= (62% × 0.30) + (62% × 0.25) + (50% × 0.25) + (29% × 0.20)\n= 18.6 + 15.5 + 12.5 + 5.8 = 52.4% → redondeado con tendencia\n\n💡 Para subir rápido: resolver las solicitudes ARCO+ pendientes (son el módulo con peor score) y aprobar la EIPD bloqueada.",
  alertas: "🚨 **Detalle de alertas activas:**\n\n1. **CRÍTICA — EIPD-003 bloqueada:** El control de acceso biométrico no tiene suficientes controles de seguridad. El tratamiento está suspendido hasta que se implementen controles adicionales (cifrado, acceso restringido, alternativa para quien no consienta).\n\n2. **ALTA — ARCO-002 vence en 7 días:** María González solicitó rectificación de domicilio y estado civil. El domicilio ya se corrigió pero falta documento de respaldo para estado civil.\n\n3. **ALTA — RAT-008 sin licitud:** El perfilamiento automatizado no tiene base legal. Es la actividad más riesgosa del inventario.\n\n4. **MEDIA — Cookies por vencer:** Algunos consentimientos de cookies analíticas se otorgaron hace 11 meses (plazo 1 año).\n\n5. **MEDIA — 2 ARCO+ sin asignar:** ARCO-005 y ARCO-007 están pendientes de asignación a un responsable.",
  tendencia: "📈 **Tendencia de cumplimiento:**\n\n• Jun: 32% → Jul: 38% → Ago: 45% → Sep: 52% → Oct: 58% → Nov: 65%\n\n**+33 puntos en 6 meses** — Buen ritmo de avance.\n\nA este ritmo (≈5.5 pts/mes), llegarías a:\n• 80% en **≈3 meses** (Feb 2026)\n• 90% en **≈5 meses** (Abr 2026)\n\nLa ley entra en vigencia el **1 dic 2026**, así que vas bien encaminado. La clave es no desacelerar y resolver los temas bloqueados.",
};
const getDashboardResponse = (msg) => {
  const l = msg.toLowerCase().trim();
  if (l.includes("prioridad") || l.includes("urgente") || l.includes("qué hago")) return dashboardAI.prioridades;
  if (l.includes("score") || l.includes("cálculo") || l.includes("pondera") || l.includes("cómo se calcula")) return dashboardAI.score;
  if (l.includes("alerta") || l.includes("pendiente") || l.includes("problema")) return dashboardAI.alertas;
  if (l.includes("tendencia") || l.includes("progreso") || l.includes("avance") || l.includes("ritmo")) return dashboardAI.tendencia;
  if (l.includes("anali") || l.includes("estado") || l.includes("resumen") || l.includes("diagnóstico")) return dashboardAI.analisis;
  if (!l) return dashboardAI.greet;
  return dashboardAI.analisis;
};
const getDashboardQA = () => [
  { label: "📊 Análisis ejecutivo", msg: "Dame un análisis del estado de cumplimiento" },
  { label: "🎯 Prioridades", msg: "¿Cuáles son mis prioridades?" },
  { label: "📈 Cómo se calcula el score", msg: "¿Cómo se calcula el score?" },
  { label: "🚨 Detalle de alertas", msg: "Explícame las alertas activas" },
  { label: "📈 Tendencia", msg: "¿Cómo va mi tendencia de cumplimiento?" },
];


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


export default function ProteccionDatosDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [drillDown, setDrillDown] = useState(null);
  const [periodo, setPeriodo] = useState("6m");

  const scores = useMemo(() => {
    const ratCompletos = demoRAT.filter(r => r.completo).length;
    const ratScore = Math.round((ratCompletos / demoRAT.length) * 100);
    const licitValidadas = demoLicitud.filter(l => l.estado === "Validada").length;
    const licitScore = Math.round((licitValidadas / demoLicitud.length) * 100);
    const eipdOk = demoEIPD.filter(e => e.estado === "Aprobada" || e.riesgoResidual !== "Alto").length;
    const eipdScore = Math.round((eipdOk / demoEIPD.length) * 100);
    const arcoOk = demoARCO.filter(a => a.estado === "Completada").length;
    const arcoTotal = demoARCO.length;
    const arcoScore = Math.round((arcoOk / arcoTotal) * 100);
    const general = Math.round(ratScore * 0.3 + licitScore * 0.25 + eipdScore * 0.25 + arcoScore * 0.2);
    return { ratScore, licitScore, eipdScore, arcoScore, general, ratCompletos, licitValidadas, eipdOk, arcoOk, arcoTotal };
  }, []);

  const ml = collapsed ? 56 : 210;
  const mr = copilotOpen ? 380 : 0;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div style={{ flex: 1, marginLeft: ml, marginRight: mr, transition: "margin-left 0.2s, margin-right 0.3s" }}>
        {/* Header */}
        <div style={{
          height: 56, background: C.white, borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, color: C.textSec }}>Protección de Datos</span>
            <span style={{ color: C.textMut }}>›</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Dashboard de Cumplimiento</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: C.textSec }}>Rebeca Lobos</span>
            <span style={{ fontSize: 11, color: C.textMut }}>Super Adm.</span>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: C.navyDark,
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 13,
            }}>R</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "22px 28px", maxWidth: 1200 }}>
          {/* Title + filters */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text }}>Dashboard de Cumplimiento</h1>
              <p style={{ margin: "3px 0 0", fontSize: 13, color: C.textSec }}>Ley 21.719 — Protección de Datos Personales · Última actualización: 25 Nov 2025</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["3m", "6m", "1a"].map(p => (
                <button key={p} onClick={() => setPeriodo(p)} style={{
                  padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: `1px solid ${periodo === p ? C.navyDark : C.border}`,
                  background: periodo === p ? C.navyDark : C.white,
                  color: periodo === p ? "#fff" : C.textSec,
                }}>{p === "3m" ? "3 meses" : p === "6m" ? "6 meses" : "1 año"}</button>
              ))}
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
            <MiniCard label="Inventario RAT" value={demoRAT.length} sub={`${scores.ratCompletos} completos`} color={C.blue} icon="📋"
              onClick={() => setDrillDown(drillDown === "rat" ? null : "rat")} selected={drillDown === "rat"} />
            <MiniCard label="Bases de Licitud" value={`${scores.licitValidadas}/${demoLicitud.length}`} sub="validadas" color={C.purple} icon="⚖️"
              onClick={() => setDrillDown(drillDown === "licitud" ? null : "licitud")} selected={drillDown === "licitud"} />
            <MiniCard label="EIPD Activas" value={demoEIPD.length} sub={`${demoEIPD.filter(e => e.estado === "Bloqueada").length} bloqueadas`} color={C.orange} icon="🔒"
              onClick={() => setDrillDown(drillDown === "eipd" ? null : "eipd")} selected={drillDown === "eipd"} />
            <MiniCard label="Solicitudes ARCO+" value={demoARCO.length} sub={`${scores.arcoOk} resueltas`} color={C.green} icon="📩"
              onClick={() => setDrillDown(drillDown === "arco" ? null : "arco")} selected={drillDown === "arco"} />
          </div>

          {/* Drill-down panel */}
          {drillDown && (
            <div style={{ marginBottom: 22 }}>
              {drillDown === "rat" && <DrillRAT />}
              {drillDown === "licitud" && <DrillLicitud />}
              {drillDown === "eipd" && <DrillEIPD />}
              {drillDown === "arco" && <DrillARCO />}
            </div>
          )}

          {/* Main row: Gauge + Scores + Trend */}
          <div style={{ display: "flex", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
            {/* Compliance Gauge */}
            <div style={{
              background: C.white, borderRadius: 10, padding: "20px 24px",
              border: `1px solid ${C.border}`, boxShadow: C.cardShadow,
              flex: "0 0 220px", display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>Cumplimiento General</div>
              <Gauge score={scores.general} />
              <div style={{ fontSize: 11, color: C.textMut, marginTop: 6 }}>Ponderado: RAT 30% · Licitud 25% · EIPD 25% · ARCO 20%</div>
            </div>

            {/* Score by module */}
            <div style={{
              background: C.white, borderRadius: 10, padding: "20px 24px",
              border: `1px solid ${C.border}`, boxShadow: C.cardShadow, flex: 1, minWidth: 280,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Avance por Módulo</div>
              <Progress label="Inventario RAT" value={scores.ratCompletos} max={demoRAT.length} color={C.blue}
                detail={`${demoRAT.length - scores.ratCompletos} actividades incompletas`} />
              <Progress label="Bases de Licitud" value={scores.licitValidadas} max={demoLicitud.length} color={C.purple}
                detail={`${demoLicitud.filter(l => l.estado === "Sin asignar").length} sin asignar`} />
              <Progress label="Evaluaciones EIPD" value={scores.eipdOk} max={demoEIPD.length} color={C.orange}
                detail={`${demoEIPD.filter(e => e.estado === "Bloqueada").length} bloqueadas`} />
              <Progress label="Solicitudes ARCO+" value={scores.arcoOk} max={scores.arcoTotal} color={C.green}
                detail={`${demoARCO.filter(a => a.estado === "Pendiente").length} pendientes de gestión`} />
            </div>

            {/* Trend */}
            <div style={{
              background: C.white, borderRadius: 10, padding: "20px 24px",
              border: `1px solid ${C.border}`, boxShadow: C.cardShadow, flex: "0 0 280px",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>Tendencia de Cumplimiento</div>
              <div style={{ fontSize: 11, color: C.textMut, marginBottom: 14 }}>Últimos 6 meses</div>
              <TrendChart data={demoTendencia} />
              <div style={{
                marginTop: 12, padding: "8px 12px", background: C.greenLt,
                borderRadius: 6, fontSize: 12, color: C.greenDk, textAlign: "center",
              }}>
                📈 +33 pts en 6 meses
              </div>
            </div>
          </div>

          {/* Bottom row: Alerts + Risk Matrix Summary */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {/* Alerts */}
            <div style={{
              background: C.white, borderRadius: 10, padding: "20px 24px",
              border: `1px solid ${C.border}`, boxShadow: C.cardShadow, flex: 1, minWidth: 340,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Alertas y Pendientes</div>
                <Badge text={`${alerts.length} activas`} color={C.red} bg={C.redLt} />
              </div>
              {alerts.map((a, i) => (
                <div key={i} style={{
                  padding: "10px 14px", borderRadius: 8, marginBottom: 8,
                  background: a.level === "critico" ? C.redLt : a.level === "alto" ? "#fff8f0" : C.yellowLt,
                  borderLeft: `3px solid ${a.level === "critico" ? C.red : a.level === "alto" ? C.orange : C.yellow}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: C.text }}>{a.level === "critico" ? "🔴" : a.level === "alto" ? "🟠" : "🟡"} {a.text}</span>
                    <Badge text={a.mod} color={C.navyDark} bg={C.bg} />
                  </div>
                </div>
              ))}
            </div>

            {/* Risk distribution */}
            <div style={{
              background: C.white, borderRadius: 10, padding: "20px 24px",
              border: `1px solid ${C.border}`, boxShadow: C.cardShadow, flex: "0 0 300px",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Distribución de Riesgo RAT</div>
              {[
                { level: "Bajo", count: demoRAT.filter(r => r.riesgo === "Bajo").length, color: C.green, bg: C.greenLt },
                { level: "Medio", count: demoRAT.filter(r => r.riesgo === "Medio").length, color: C.yellow, bg: C.yellowLt },
                { level: "Alto", count: demoRAT.filter(r => r.riesgo === "Alto").length, color: C.red, bg: C.redLt },
              ].map(r => (
                <div key={r.level} style={{
                  display: "flex", alignItems: "center", gap: 12, marginBottom: 10,
                  padding: "10px 14px", borderRadius: 8, background: r.bg,
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: r.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>
                    {r.count}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Riesgo {r.level}</div>
                    <div style={{ fontSize: 11, color: C.textSec }}>
                      {r.level === "Alto" ? "Requiere EIPD obligatoria" : r.level === "Medio" ? "Monitoreo periódico" : "Controles estándar"}
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 16, padding: "12px 14px", background: C.bg, borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>Ciclo de Vida</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["Recolección", "Almacenamiento", "Uso", "Destrucción"].map(etapa => {
                    const count = demoRAT.filter(r => r.etapa === etapa).length;
                    return (
                      <div key={etapa} style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 11,
                        background: count > 0 ? C.blueLt : C.bg,
                        color: count > 0 ? C.blue : C.textMut,
                        fontWeight: count > 0 ? 600 : 400,
                      }}>
                        {etapa}: {count}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AICopilot open={copilotOpen} onToggle={() => setCopilotOpen(!copilotOpen)} getResponse={getDashboardResponse} getQuickActions={getDashboardQA} contextLabel="Dashboard de Cumplimiento" />
    </div>
  );
}

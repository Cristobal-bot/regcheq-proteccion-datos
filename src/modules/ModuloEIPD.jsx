import { useState, useMemo, useRef, useEffect } from "react";

// ============================================
// REGCHEQ - Módulo de Riesgos (EIPD)
// Evaluación de Impacto en Protección de Datos
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
  border: "#e2e4ed",
  shadow: "0 1px 4px rgba(20,18,66,0.06)",
};

// ===== RAT de alto riesgo =====
const ratAltoRiesgo = [
  { id: "RAT-003", niref: "NIREF-2025-003", nombre: "Videovigilancia oficinas", responsable: "Depto. Seguridad", categorias: ["Biométricos", "Imagen"], riesgo: "Alto" },
  { id: "RAT-004", niref: "NIREF-2025-004", nombre: "Evaluación crediticia clientes", responsable: "Depto. Riesgo", categorias: ["Identificación", "Financiero", "Crediticio"], riesgo: "Alto" },
  { id: "RAT-006", niref: "NIREF-2025-006", nombre: "Control de acceso biométrico", responsable: "Depto. Seguridad", categorias: ["Biométricos", "Identificación"], riesgo: "Alto" },
  { id: "RAT-008", niref: "NIREF-2025-008", nombre: "Perfilamiento automatizado de clientes", responsable: "Depto. Data Analytics", categorias: ["Identificación", "Transaccional", "Comportamental", "Preferencias"], riesgo: "Alto" },
];

// ===== Catálogos =====
const dimensiones = [
  { id: "confidencialidad", label: "Confidencialidad", icon: "🔐", desc: "Acceso no autorizado a datos personales" },
  { id: "integridad", label: "Integridad", icon: "🛡️", desc: "Modificación no autorizada o corrupción de datos" },
  { id: "disponibilidad", label: "Disponibilidad", icon: "⚡", desc: "Pérdida de acceso o destrucción de datos" },
];

const amenazasCatalogo = [
  { id: "A01", nombre: "Acceso no autorizado por terceros", dimension: "confidencialidad" },
  { id: "A02", nombre: "Fuga de datos por empleados", dimension: "confidencialidad" },
  { id: "A03", nombre: "Interceptación de comunicaciones", dimension: "confidencialidad" },
  { id: "A04", nombre: "Ataque de ransomware", dimension: "confidencialidad" },
  { id: "A05", nombre: "Alteración maliciosa de registros", dimension: "integridad" },
  { id: "A06", nombre: "Errores de procesamiento de datos", dimension: "integridad" },
  { id: "A07", nombre: "Falla en integridad de backups", dimension: "integridad" },
  { id: "A08", nombre: "Falla de infraestructura / caída de sistemas", dimension: "disponibilidad" },
  { id: "A09", nombre: "Desastre natural (incendio, terremoto)", dimension: "disponibilidad" },
  { id: "A10", nombre: "Eliminación accidental de datos", dimension: "disponibilidad" },
  { id: "A11", nombre: "Uso indebido de datos para fines no autorizados", dimension: "confidencialidad" },
  { id: "A12", nombre: "Transferencia internacional sin garantías", dimension: "confidencialidad" },
];

const controlesCatalogo = [
  { id: "C01", nombre: "Cifrado de datos en reposo", tipo: "Técnico", dimension: ["confidencialidad"], reduccion: 2 },
  { id: "C02", nombre: "Cifrado de datos en tránsito (TLS/SSL)", tipo: "Técnico", dimension: ["confidencialidad"], reduccion: 2 },
  { id: "C03", nombre: "Control de acceso basado en roles (RBAC)", tipo: "Técnico", dimension: ["confidencialidad", "integridad"], reduccion: 2 },
  { id: "C04", nombre: "Autenticación multifactor (MFA)", tipo: "Técnico", dimension: ["confidencialidad"], reduccion: 1 },
  { id: "C05", nombre: "Copias de seguridad automáticas", tipo: "Técnico", dimension: ["disponibilidad", "integridad"], reduccion: 2 },
  { id: "C06", nombre: "Plan de recuperación ante desastres (DRP)", tipo: "Organizativo", dimension: ["disponibilidad"], reduccion: 2 },
  { id: "C07", nombre: "Registro de auditoría (logs)", tipo: "Técnico", dimension: ["confidencialidad", "integridad"], reduccion: 1 },
  { id: "C08", nombre: "Política de retención y destrucción", tipo: "Organizativo", dimension: ["confidencialidad"], reduccion: 1 },
  { id: "C09", nombre: "Capacitación en protección de datos", tipo: "Organizativo", dimension: ["confidencialidad", "integridad"], reduccion: 1 },
  { id: "C10", nombre: "Monitoreo de seguridad en tiempo real (SIEM)", tipo: "Técnico", dimension: ["confidencialidad", "disponibilidad"], reduccion: 2 },
  { id: "C11", nombre: "Seudonimización de datos", tipo: "Técnico", dimension: ["confidencialidad"], reduccion: 2 },
  { id: "C12", nombre: "Minimización de datos", tipo: "Organizativo", dimension: ["confidencialidad"], reduccion: 1 },
  { id: "C13", nombre: "Evaluación periódica de vulnerabilidades", tipo: "Técnico", dimension: ["confidencialidad", "integridad"], reduccion: 1 },
  { id: "C14", nombre: "Acuerdos de confidencialidad (NDA)", tipo: "Legal", dimension: ["confidencialidad"], reduccion: 1 },
  { id: "C15", nombre: "Segregación de ambientes (dev/prod)", tipo: "Técnico", dimension: ["confidencialidad", "integridad"], reduccion: 1 },
];

const nivelesImpacto = [
  { value: 1, label: "Bajo", color: C.green, desc: "Impacto menor, sin consecuencias significativas" },
  { value: 2, label: "Medio", color: C.yellow, desc: "Impacto moderado, afectación temporal" },
  { value: 3, label: "Alto", color: C.orange, desc: "Impacto significativo en derechos del titular" },
  { value: 4, label: "Muy Alto", color: C.red, desc: "Daño grave e irreversible para el titular" },
];

const nivelesProbabilidad = [
  { value: 1, label: "Baja", color: C.green, desc: "Poco probable que ocurra" },
  { value: 2, label: "Media", color: C.yellow, desc: "Puede ocurrir ocasionalmente" },
  { value: 3, label: "Alta", color: C.red, desc: "Es probable o ha ocurrido antes" },
];

const getRiskLevel = (score) => {
  if (score <= 2) return { label: "Bajo", color: C.green, bg: C.greenLt };
  if (score <= 4) return { label: "Medio", color: C.yellow, bg: C.yellowLt };
  if (score <= 8) return { label: "Alto", color: C.orange, bg: C.orangeLt };
  return { label: "Muy Alto", color: C.red, bg: C.redLt };
};

// ===== DEMO =====
const initialEIPDs = [
  {
    id: "EIPD-001", ratId: "RAT-003", estado: "Aprobada", fechaInicio: "2025-10-05", fechaFin: "2025-10-20", evaluador: "Carolina Méndez",
    amenazas: [
      { amenazaId: "A01", impacto: 3, probabilidad: 2 },
      { amenazaId: "A02", impacto: 3, probabilidad: 2 },
      { amenazaId: "A11", impacto: 3, probabilidad: 1 },
    ],
    controlesSeleccionados: ["C01", "C03", "C07", "C08", "C09"],
    observaciones: "Se implementaron controles de cifrado y acceso restringido. La retención se limita a 30 días con destrucción automática. El riesgo residual es aceptable.",
    riesgoResidualOverride: null,
  },
  {
    id: "EIPD-002", ratId: "RAT-004", estado: "En curso", fechaInicio: "2025-10-15", fechaFin: "", evaluador: "Carolina Méndez",
    amenazas: [
      { amenazaId: "A01", impacto: 4, probabilidad: 2 },
      { amenazaId: "A04", impacto: 4, probabilidad: 2 },
      { amenazaId: "A06", impacto: 3, probabilidad: 2 },
      { amenazaId: "A12", impacto: 3, probabilidad: 1 },
    ],
    controlesSeleccionados: ["C01", "C02", "C03", "C04", "C07", "C10"],
    observaciones: "Evaluación en curso. Se han implementado controles técnicos principales pero falta completar la evaluación de transferencias internacionales.",
    riesgoResidualOverride: null,
  },
  {
    id: "EIPD-003", ratId: "RAT-006", estado: "Bloqueada", fechaInicio: "2025-10-20", fechaFin: "", evaluador: "Carolina Méndez",
    amenazas: [
      { amenazaId: "A01", impacto: 4, probabilidad: 3 },
      { amenazaId: "A02", impacto: 4, probabilidad: 2 },
      { amenazaId: "A05", impacto: 4, probabilidad: 2 },
      { amenazaId: "A11", impacto: 4, probabilidad: 2 },
    ],
    controlesSeleccionados: ["C01"],
    observaciones: "Riesgo residual inaceptable. Solo se ha implementado cifrado básico. Se requieren controles adicionales de acceso, auditoría y minimización antes de continuar.",
    riesgoResidualOverride: null,
  },
  {
    id: "EIPD-004", ratId: "RAT-008", estado: "Pendiente", fechaInicio: "", fechaFin: "", evaluador: "",
    amenazas: [],
    controlesSeleccionados: [],
    observaciones: "",
    riesgoResidualOverride: null,
  },
];

// ===== SIDEBAR =====
// ===== UI COMPONENTS =====
const Badge = ({ text, color, bg }) => <span style={{ padding: "2px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: bg, color, whiteSpace: "nowrap" }}>{text}</span>;
const RiskBadge = ({ score }) => { const r = getRiskLevel(score); return <Badge text={`${r.label} (${score})`} color={r.color} bg={r.bg} />; };
const StatusBadge = ({ estado }) => {
  const m = { "Aprobada": [C.green, C.greenLt], "En curso": [C.blue, C.blueLt], "Bloqueada": [C.red, C.redLt], "Pendiente": [C.orange, C.orangeLt] };
  const [color, bg] = m[estado] || [C.textMut, C.bg];
  return <Badge text={estado} color={color} bg={bg} />;
};
const Btn = ({ children, onClick, variant = "primary", style: s = {}, disabled }) => {
  const base = { padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", border: "none", opacity: disabled ? 0.5 : 1, ...s };
  const v = { primary: { ...base, background: C.navyDark, color: "#fff" }, secondary: { ...base, background: C.white, color: C.text, border: `1px solid ${C.border}` }, ghost: { ...base, background: "transparent", color: C.textSec, padding: "9px 12px" }, danger: { ...base, background: C.redLt, color: C.red } };
  return <button onClick={disabled ? undefined : onClick} style={v[variant]}>{children}</button>;
};

// ===== RISK MATRIX VISUAL =====
const RiskMatrix = ({ amenazas }) => {
  const cells = {};
  amenazas.forEach(a => {
    const key = `${a.impacto}-${a.probabilidad}`;
    cells[key] = (cells[key] || 0) + 1;
  });

  const getCellColor = (imp, prob) => {
    const score = imp * prob;
    if (score <= 2) return { bg: C.greenLt, border: C.green };
    if (score <= 4) return { bg: C.yellowLt, border: C.yellow };
    if (score <= 8) return { bg: C.orangeLt, border: C.orange };
    return { bg: C.redLt, border: C.red };
  };

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Matriz de Riesgo</div>
      <div style={{ display: "inline-block" }}>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <div style={{ width: 80, textAlign: "right", paddingRight: 8, fontSize: 11, color: C.textSec, transform: "rotate(-0deg)", writingMode: "vertical-rl" }}>
          </div>
          <div>
            <div style={{ display: "flex", marginBottom: 2 }}>
              <div style={{ width: 80 }} />
              {nivelesProbabilidad.map(p => (
                <div key={p.value} style={{ width: 80, textAlign: "center", fontSize: 11, fontWeight: 600, color: C.textSec, padding: "4px 0" }}>{p.label}</div>
              ))}
            </div>
            {[...nivelesImpacto].reverse().map(imp => (
              <div key={imp.value} style={{ display: "flex", marginBottom: 2 }}>
                <div style={{ width: 80, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8, fontSize: 11, fontWeight: 600, color: C.textSec }}>{imp.label}</div>
                {nivelesProbabilidad.map(prob => {
                  const key = `${imp.value}-${prob.value}`;
                  const count = cells[key] || 0;
                  const colors = getCellColor(imp.value, prob.value);
                  return (
                    <div key={key} style={{
                      width: 80, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
                      background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, margin: "0 1px",
                    }}>
                      {count > 0 && <span style={{ fontSize: 16, fontWeight: 800, color: colors.border }}>{count}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
            <div style={{ display: "flex", marginTop: 4 }}>
              <div style={{ width: 80 }} />
              <div style={{ flex: 1, textAlign: "center", fontSize: 11, color: C.textSec }}>Probabilidad →</div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: C.textMut, marginTop: 2 }}>↑ Impacto</div>
      </div>
    </div>
  );
};

// ===== DETAIL / EDIT VIEW =====
const EIPDDetail = ({ eipd: initial, rat, onBack, onUpdate }) => {
  const [eipd, setEipd] = useState(initial);
  const [editMode, setEditMode] = useState(initial.estado === "Pendiente");
  const [activeStep, setActiveStep] = useState(1);

  const set = (k, v) => setEipd(prev => ({ ...prev, [k]: v }));

  // Risk calculations
  const riesgoInicial = useMemo(() => {
    if (eipd.amenazas.length === 0) return 0;
    return Math.max(...eipd.amenazas.map(a => a.impacto * a.probabilidad));
  }, [eipd.amenazas]);

  const reduccionTotal = useMemo(() => {
    return eipd.controlesSeleccionados.reduce((sum, cId) => {
      const ctrl = controlesCatalogo.find(c => c.id === cId);
      return sum + (ctrl?.reduccion || 0);
    }, 0);
  }, [eipd.controlesSeleccionados]);

  const riesgoResidual = useMemo(() => {
    const residual = Math.max(1, riesgoInicial - reduccionTotal);
    return Math.min(residual, 12);
  }, [riesgoInicial, reduccionTotal]);

  const residualLevel = getRiskLevel(riesgoResidual);
  const isBlocked = riesgoResidual > 6 && eipd.controlesSeleccionados.length > 0;

  // Amenaza management
  const addAmenaza = (amenazaId) => {
    if (eipd.amenazas.find(a => a.amenazaId === amenazaId)) return;
    set("amenazas", [...eipd.amenazas, { amenazaId, impacto: 2, probabilidad: 2 }]);
  };
  const removeAmenaza = (amenazaId) => set("amenazas", eipd.amenazas.filter(a => a.amenazaId !== amenazaId));
  const updateAmenaza = (amenazaId, field, value) => {
    set("amenazas", eipd.amenazas.map(a => a.amenazaId === amenazaId ? { ...a, [field]: value } : a));
  };

  // Control toggle
  const toggleControl = (cId) => {
    const list = eipd.controlesSeleccionados.includes(cId)
      ? eipd.controlesSeleccionados.filter(id => id !== cId)
      : [...eipd.controlesSeleccionados, cId];
    set("controlesSeleccionados", list);
  };

  const handleSave = () => {
    const updated = {
      ...eipd,
      estado: isBlocked ? "Bloqueada" : riesgoResidual <= 4 ? "Aprobada" : "En curso",
      fechaFin: isBlocked ? "" : riesgoResidual <= 4 ? new Date().toISOString().slice(0, 10) : "",
    };
    onUpdate(updated);
    setEditMode(false);
  };

  const stepsConfig = [
    { num: 1, label: "Amenazas" },
    { num: 2, label: "Riesgo Inicial" },
    { num: 3, label: "Controles" },
    { num: 4, label: "Riesgo Residual" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Btn variant="ghost" onClick={onBack}>← Volver</Btn>
        <span style={{ fontSize: 12, color: C.textMut }}>{eipd.id}</span>
        <StatusBadge estado={eipd.estado} />
      </div>

      {/* RAT Info Header */}
      <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "18px 24px", marginBottom: 14, boxShadow: C.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: C.textMut }}>Actividad evaluada · {rat.niref}</div>
            <h2 style={{ margin: "2px 0 0", fontSize: 18, color: C.text }}>{rat.nombre}</h2>
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              {rat.categorias.map(c => <Badge key={c} text={c} color={["Biométricos", "Sensibles", "Salud"].includes(c) ? C.red : C.purple} bg={["Biométricos", "Sensibles", "Salud"].includes(c) ? C.redLt : C.purpleLt} />)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            {!editMode && eipd.estado !== "Pendiente" && <Btn variant="secondary" onClick={() => setEditMode(true)} style={{ fontSize: 12, padding: "6px 12px" }}>✏️ Editar</Btn>}
          </div>
        </div>
      </div>

      {/* Step indicator (edit mode) */}
      {editMode && (
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {stepsConfig.map((s, i) => (
            <div key={s.num} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div onClick={() => setActiveStep(s.num)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                background: activeStep === s.num ? C.navyDark : activeStep > s.num ? C.greenLt : C.bg,
                color: activeStep === s.num ? "#fff" : activeStep > s.num ? C.green : C.textMut,
                fontSize: 12, fontWeight: 600,
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: activeStep === s.num ? "rgba(255,255,255,0.2)" : activeStep > s.num ? C.green : C.border,
                  color: activeStep === s.num ? "#fff" : activeStep > s.num ? "#fff" : C.textMut, fontSize: 11, fontWeight: 700,
                }}>{activeStep > s.num ? "✓" : s.num}</span>
                {s.label}
              </div>
              {i < stepsConfig.length - 1 && <div style={{ width: 20, height: 1, background: C.border }} />}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1: Amenazas */}
      {(editMode ? activeStep === 1 : true) && (
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 14, boxShadow: C.shadow }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, color: C.text }}>1. Identificación de Amenazas</h3>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: C.textSec }}>Evalúe riesgos para la confidencialidad, integridad y disponibilidad de los datos.</p>

          {dimensiones.map(dim => {
            const amenazasDim = eipd.amenazas.filter(a => amenazasCatalogo.find(ac => ac.id === a.amenazaId)?.dimension === dim.id);
            const disponibles = amenazasCatalogo.filter(ac => ac.dimension === dim.id && !eipd.amenazas.find(a => a.amenazaId === ac.id));

            return (
              <div key={dim.id} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>{dim.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{dim.label}</span>
                  <span style={{ fontSize: 11, color: C.textMut }}>— {dim.desc}</span>
                </div>

                {amenazasDim.map(a => {
                  const info = amenazasCatalogo.find(ac => ac.id === a.amenazaId);
                  const score = a.impacto * a.probabilidad;
                  const level = getRiskLevel(score);
                  return (
                    <div key={a.amenazaId} style={{
                      padding: "10px 14px", borderRadius: 8, marginBottom: 6,
                      border: `1px solid ${level.border || C.border}`, background: `${level.bg}44`,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: editMode ? 8 : 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{info?.nombre}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <RiskBadge score={score} />
                          {editMode && <button onClick={() => removeAmenaza(a.amenazaId)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 14 }}>✕</button>}
                        </div>
                      </div>
                      {editMode && (
                        <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                          <div>
                            <div style={{ fontSize: 11, color: C.textSec, marginBottom: 3 }}>Impacto</div>
                            <div style={{ display: "flex", gap: 4 }}>
                              {nivelesImpacto.map(n => (
                                <div key={n.value} onClick={() => updateAmenaza(a.amenazaId, "impacto", n.value)}
                                  style={{
                                    padding: "3px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600,
                                    border: a.impacto === n.value ? `2px solid ${n.color}` : `1px solid ${C.border}`,
                                    background: a.impacto === n.value ? `${n.color}22` : C.white, color: a.impacto === n.value ? n.color : C.textMut,
                                  }}>{n.label}</div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: C.textSec, marginBottom: 3 }}>Probabilidad</div>
                            <div style={{ display: "flex", gap: 4 }}>
                              {nivelesProbabilidad.map(n => (
                                <div key={n.value} onClick={() => updateAmenaza(a.amenazaId, "probabilidad", n.value)}
                                  style={{
                                    padding: "3px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600,
                                    border: a.probabilidad === n.value ? `2px solid ${n.color}` : `1px solid ${C.border}`,
                                    background: a.probabilidad === n.value ? `${n.color}22` : C.white, color: a.probabilidad === n.value ? n.color : C.textMut,
                                  }}>{n.label}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {!editMode && (
                        <div style={{ fontSize: 11, color: C.textSec, marginTop: 4 }}>
                          Impacto: {nivelesImpacto.find(n => n.value === a.impacto)?.label} · Probabilidad: {nivelesProbabilidad.find(n => n.value === a.probabilidad)?.label}
                        </div>
                      )}
                    </div>
                  );
                })}

                {editMode && disponibles.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <select onChange={e => { if (e.target.value) { addAmenaza(e.target.value); e.target.value = ""; } }}
                      style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, color: C.textSec, width: "100%", boxSizing: "border-box" }}>
                      <option value="">+ Agregar amenaza de {dim.label.toLowerCase()}...</option>
                      {disponibles.map(ac => <option key={ac.id} value={ac.id}>{ac.nombre}</option>)}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* STEP 2: Risk Matrix */}
      {(editMode ? activeStep === 2 : true) && eipd.amenazas.length > 0 && (
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 14, boxShadow: C.shadow }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, color: C.text }}>2. Cálculo de Riesgo Inicial</h3>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: C.textSec }}>Matriz de Impacto × Probabilidad.</p>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <RiskMatrix amenazas={eipd.amenazas} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ padding: "14px 18px", background: C.bg, borderRadius: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: C.textSec }}>Riesgo inicial máximo</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: getRiskLevel(riesgoInicial).color }}>{riesgoInicial}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: getRiskLevel(riesgoInicial).color }}>{getRiskLevel(riesgoInicial).label}</div>
              </div>
              <div style={{ fontSize: 11, color: C.textMut, lineHeight: 1.5 }}>
                {eipd.amenazas.length} amenaza{eipd.amenazas.length > 1 ? "s" : ""} identificada{eipd.amenazas.length > 1 ? "s" : ""} en {new Set(eipd.amenazas.map(a => amenazasCatalogo.find(ac => ac.id === a.amenazaId)?.dimension)).size} dimensión(es).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Controles */}
      {(editMode ? activeStep === 3 : true) && (
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 14, boxShadow: C.shadow }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, color: C.text }}>3. Aplicación de Controles</h3>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: C.textSec }}>Seleccione las medidas de seguridad a implementar para mitigar los riesgos.</p>

          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {["Técnico", "Organizativo", "Legal"].map(tipo => {
              const count = eipd.controlesSeleccionados.filter(cId => controlesCatalogo.find(c => c.id === cId)?.tipo === tipo).length;
              return <Badge key={tipo} text={`${tipo}: ${count}`} color={count > 0 ? C.blue : C.textMut} bg={count > 0 ? C.blueLt : C.bg} />;
            })}
            <Badge text={`Reducción total: -${reduccionTotal} pts`} color={C.green} bg={C.greenLt} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {controlesCatalogo.map(ctrl => {
              const selected = eipd.controlesSeleccionados.includes(ctrl.id);
              return (
                <div key={ctrl.id} onClick={editMode ? () => toggleControl(ctrl.id) : undefined}
                  style={{
                    padding: "10px 14px", borderRadius: 8,
                    border: selected ? `2px solid ${C.green}` : `1px solid ${C.border}`,
                    background: selected ? C.greenLt : C.white,
                    cursor: editMode ? "pointer" : "default",
                    opacity: editMode ? 1 : (selected ? 1 : 0.4),
                    transition: "all 0.15s",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: selected ? C.green : C.text }}>
                      {selected ? "✓ " : ""}{ctrl.nombre}
                    </span>
                    <Badge text={`-${ctrl.reduccion}`} color={C.green} bg={selected ? "#fff" : C.bg} />
                  </div>
                  <div style={{ fontSize: 11, color: C.textMut, marginTop: 2 }}>
                    {ctrl.tipo} · {ctrl.dimension.join(", ")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: Residual Risk */}
      {(editMode ? activeStep === 4 : true) && eipd.amenazas.length > 0 && (
        <div style={{
          background: C.white, borderRadius: 12, padding: 24, marginBottom: 14, boxShadow: C.shadow,
          border: isBlocked ? `2px solid ${C.red}` : `1px solid ${C.border}`,
        }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, color: C.text }}>4. Estimación de Riesgo Residual</h3>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: C.textSec }}>Riesgo resultante después de aplicar los controles seleccionados.</p>

          <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ padding: "16px 20px", background: C.bg, borderRadius: 10, textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 11, color: C.textSec }}>Riesgo Inicial</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: getRiskLevel(riesgoInicial).color }}>{riesgoInicial}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: getRiskLevel(riesgoInicial).color }}>{getRiskLevel(riesgoInicial).label}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", fontSize: 24, color: C.textMut }}>→</div>
            <div style={{ padding: "16px 20px", background: C.bg, borderRadius: 10, textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 11, color: C.textSec }}>Reducción por controles</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: C.green }}>-{reduccionTotal}</div>
              <div style={{ fontSize: 12, color: C.textSec }}>{eipd.controlesSeleccionados.length} controles</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", fontSize: 24, color: C.textMut }}>→</div>
            <div style={{
              padding: "16px 20px", borderRadius: 10, textAlign: "center", flex: 1,
              background: residualLevel.bg, border: `2px solid ${residualLevel.color}`,
            }}>
              <div style={{ fontSize: 11, color: C.textSec }}>Riesgo Residual</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: residualLevel.color }}>{riesgoResidual}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: residualLevel.color }}>{residualLevel.label}</div>
            </div>
          </div>

          {isBlocked && (
            <div style={{
              padding: "14px 18px", background: C.redLt, borderRadius: 10, marginBottom: 14,
              borderLeft: `4px solid ${C.red}`,
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.red, marginBottom: 4 }}>⛔ ACTIVIDAD BLOQUEADA</div>
              <div style={{ fontSize: 13, color: C.red, lineHeight: 1.5 }}>
                El riesgo residual sigue siendo alto después de aplicar los controles seleccionados.
                El tratamiento de datos no puede continuar hasta que se implementen medidas adicionales que reduzcan el riesgo a un nivel aceptable.
              </div>
            </div>
          )}

          {!isBlocked && riesgoResidual <= 4 && eipd.amenazas.length > 0 && (
            <div style={{ padding: "12px 18px", background: C.greenLt, borderRadius: 10, marginBottom: 14, borderLeft: `4px solid ${C.green}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>✅ Riesgo residual aceptable</div>
              <div style={{ fontSize: 12, color: C.green }}>El tratamiento puede continuar con los controles implementados.</div>
            </div>
          )}

          {editMode && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>Observaciones</div>
              <textarea value={eipd.observaciones} onChange={e => set("observaciones", e.target.value)}
                placeholder="Documente las conclusiones de la evaluación, medidas pendientes y recomendaciones..."
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, color: C.text, resize: "vertical", minHeight: 80, fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
          )}

          {!editMode && eipd.observaciones && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textSec, marginBottom: 4 }}>Observaciones</div>
              <div style={{ fontSize: 13, color: C.text, padding: "10px 14px", background: C.bg, borderRadius: 8, lineHeight: 1.5 }}>{eipd.observaciones}</div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {editMode && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <Btn variant="secondary" onClick={() => activeStep > 1 && setActiveStep(activeStep - 1)} style={{ opacity: activeStep === 1 ? 0.4 : 1 }}>← Anterior</Btn>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" onClick={() => { setEipd(initial); setEditMode(false); }}>Cancelar</Btn>
            {activeStep < 4 ? (
              <Btn onClick={() => setActiveStep(activeStep + 1)}>Siguiente →</Btn>
            ) : (
              <Btn onClick={handleSave}>💾 Guardar Evaluación</Btn>
            )}
          </div>
        </div>
      )}

      {!editMode && eipd.fechaInicio && (
        <div style={{ display: "flex", gap: 16, fontSize: 11, color: C.textMut, marginTop: 8 }}>
          <span>Inicio: {eipd.fechaInicio}</span>
          {eipd.fechaFin && <span>Cierre: {eipd.fechaFin}</span>}
          {eipd.evaluador && <span>Evaluador: {eipd.evaluador}</span>}
        </div>
      )}
    </div>
  );
};

// ===== MAIN =====

// ====================================================================
// AI ENGINE - EIPD
// ====================================================================
const eipdAI = {
  greet: "¡Hola! Soy tu asistente de Evaluación de Impacto (EIPD). Puedo ayudarte a:\n\n• Analizar el estado de tus evaluaciones\n• Sugerir amenazas relevantes según la actividad\n• Recomendar controles de seguridad\n• Evaluar si el riesgo residual es aceptable\n\n¿En qué te puedo ayudar?",
  analisis: "📊 **Estado de evaluaciones EIPD:**\n\n**4 evaluaciones** para actividades de alto riesgo:\n\n✅ **EIPD-001 (Videovigilancia)** — Aprobada. 3 amenazas, 5 controles, riesgo residual aceptable.\n🟡 **EIPD-002 (Evaluación crediticia)** — En curso. 4 amenazas, 6 controles. Falta definir resultado final.\n🔴 **EIPD-003 (Control biométrico)** — **BLOQUEADA.** Solo 1 control (cifrado), insuficiente para datos sensibles. Necesita al menos 4-5 controles adicionales.\n🟡 **EIPD-004 (Perfilamiento)** — Pendiente. Sin amenazas identificadas. Urgente completar.\n\n**Acciones inmediatas:**\n1. Resolver EIPD-003 agregando controles (RBAC, MFA, backups, auditoría)\n2. Iniciar evaluación de EIPD-004",
  amenazas: (ratNombre) => "🔍 **Amenazas sugeridas para \"" + (ratNombre || "esta actividad") + "\":**\n\n**Confidencialidad:**\n• A01 — Acceso no autorizado por terceros (Impacto: Alto, Prob: Media)\n• A02 — Fuga de datos por empleados (Impacto: Alto, Prob: Media)\n• A11 — Uso indebido para fines no autorizados (Impacto: Muy Alto, Prob: Baja)\n\n**Integridad:**\n• A05 — Alteración maliciosa de registros (Impacto: Alto, Prob: Baja)\n• A06 — Errores de procesamiento (Impacto: Medio, Prob: Media)\n\n**Disponibilidad:**\n• A08 — Falla de infraestructura (Impacto: Alto, Prob: Media)\n• A10 — Eliminación accidental (Impacto: Alto, Prob: Baja)\n\n💡 Para datos sensibles (biométricos, salud), las amenazas de confidencialidad tienen impacto automáticamente \"Muy Alto\".",
  controles: "🛡️ **Controles recomendados por prioridad:**\n\n**Imprescindibles (todo tratamiento):**\n1. C01 — Cifrado en reposo (reduce -2 pts riesgo)\n2. C02 — Cifrado en tránsito (-2 pts)\n3. C03 — Control de acceso RBAC (-2 pts)\n4. C05 — Backups automáticos (-1 pt)\n\n**Para datos sensibles (biométricos, salud):**\n5. C04 — Autenticación MFA (-2 pts)\n6. C06 — Logs de auditoría (-1 pt)\n7. C12 — Pseudonimización (-2 pts)\n\n**Para alto volumen:**\n8. C07 — SIEM / monitoreo (-1 pt)\n9. C13 — Evaluación de vulnerabilidades (-1 pt)\n\n**Organizacionales:**\n10. C10 — Plan de recuperación ante desastres (-1 pt)\n11. C14 — Capacitación al personal (-1 pt)\n\n⚠️ Si después de aplicar controles el riesgo residual sigue > 6, la actividad queda **bloqueada**.",
  bloqueada: "⛔ **¿Por qué se bloquea una actividad?**\n\nSegún Art. 18° Ley 21.719, si la EIPD determina que el riesgo residual es inaceptablemente alto (score > 6 en nuestra escala), el tratamiento **no puede continuar** hasta que:\n\n1. Se implementen controles adicionales que reduzcan el riesgo\n2. Se modifique el alcance del tratamiento\n3. Se obtenga autorización expresa de la Agencia de Protección de Datos\n\n**EIPD-003 está bloqueada** porque:\n• Riesgo inicial: 12 (Muy Alto) — 4 amenazas de alto impacto\n• Solo tiene 1 control: Cifrado en reposo (-2 pts)\n• Riesgo residual: 10 → Sigue siendo Muy Alto\n\n**Para desbloquear**, necesita al mínimo:\n• C03 RBAC (-2), C04 MFA (-2), C05 Backups (-1), C06 Auditoría (-1)\n• Esto llevaría el residual a 10 - 2 - 2 - 2 - 1 - 1 = 2 (Bajo) ✅",
  riesgo: "📊 **Escala de riesgo (Impacto × Probabilidad):**\n\n| Score | Nivel | Acción |\n|---|---|---|\n| 1-2 | 🟢 Bajo | Controles estándar suficientes |\n| 3-4 | 🟡 Medio | Monitoreo periódico recomendado |\n| 5-8 | 🟠 Alto | Controles adicionales obligatorios |\n| 9-12 | 🔴 Muy Alto | Actividad bloqueada si es residual |\n\n**Impacto:** Bajo (1), Medio (2), Alto (3), Muy Alto (4)\n**Probabilidad:** Baja (1), Media (2), Alta (3)\n\n**Riesgo residual** = max(1, Riesgo inicial - Suma de reducciones de controles)",
};
const getEIPDResponse = (msg, ctx) => {
  const l = msg.toLowerCase().trim();
  if (l.includes("amenaz") || l.includes("identific") || l.includes("sugier")) return eipdAI.amenazas(ctx?.ratNombre);
  if (l.includes("control") || l.includes("mitig") || l.includes("seguridad") || l.includes("recomien")) return eipdAI.controles;
  if (l.includes("bloqu") || l.includes("por qué")) return eipdAI.bloqueada;
  if (l.includes("escala") || l.includes("riesgo") || l.includes("matriz") || l.includes("cómo se calcula")) return eipdAI.riesgo;
  if (l.includes("anali") || l.includes("estado") || l.includes("diagnóstico")) return eipdAI.analisis;
  if (!l) return eipdAI.greet;
  return eipdAI.analisis;
};
const getEIPDQA = (ctx) => {
  const base = [
    { label: "📊 Analizar evaluaciones", msg: "Analiza el estado de mis evaluaciones EIPD" },
    { label: "🛡️ Controles recomendados", msg: "¿Qué controles recomiendas?" },
    { label: "📊 Escala de riesgo", msg: "Explícame la escala de riesgo" },
    { label: "⛔ ¿Por qué se bloquea?", msg: "¿Por qué se bloquea una actividad?" },
  ];
  if (ctx?.ratNombre) base.unshift({ label: "🔍 Sugerir amenazas", msg: "Sugiere amenazas para esta actividad" });
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


export default function ModuloEIPD() {
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [view, setView] = useState("list");
  const [eipds, setEipds] = useState(initialEIPDs);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("todos");

  const stats = useMemo(() => ({
    total: eipds.length,
    aprobadas: eipds.filter(e => e.estado === "Aprobada").length,
    enCurso: eipds.filter(e => e.estado === "En curso").length,
    bloqueadas: eipds.filter(e => e.estado === "Bloqueada").length,
    pendientes: eipds.filter(e => e.estado === "Pendiente").length,
  }), [eipds]);

  const filtered = useMemo(() => {
    if (filter === "aprobadas") return eipds.filter(e => e.estado === "Aprobada");
    if (filter === "bloqueadas") return eipds.filter(e => e.estado === "Bloqueada");
    if (filter === "pendientes") return eipds.filter(e => e.estado === "Pendiente" || e.estado === "En curso");
    return eipds;
  }, [eipds, filter]);

  const handleUpdate = (updated) => setEipds(eipds.map(e => e.id === updated.id ? updated : e));

  const mr = copilotOpen ? 380 : 0;

  if (view === "detail" && selectedId) {
    const eipd = eipds.find(e => e.id === selectedId);
    const rat = ratAltoRiesgo.find(a => a.id === eipd?.ratId);
    if (!eipd || !rat) return null;
    return (
      <div>
        <div style={{ flex: 1, marginLeft: 0, marginRight: mr, transition: "margin-right 0.3s" }}>
          <div style={{ height: 52, background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 28px", position: "sticky", top: 0, zIndex: 50 }}>
            <span style={{ fontSize: 13, color: C.textSec }}>Protección de Datos</span>
            <span style={{ color: C.textMut, margin: "0 6px" }}>›</span>
            <span style={{ fontSize: 13, color: C.textSec }}>Riesgos (EIPD)</span>
            <span style={{ color: C.textMut, margin: "0 6px" }}>›</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{eipd.id}</span>
          </div>
          <div style={{ padding: "22px 28px", maxWidth: 1200 }}>
            <EIPDDetail eipd={eipd} rat={rat} onBack={() => { setView("list"); setSelectedId(null); }} onUpdate={handleUpdate} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ flex: 1, marginLeft: 0, marginRight: mr, transition: "margin-right 0.3s" }}>
        <div style={{ height: 52, background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 28px", position: "sticky", top: 0, zIndex: 50 }}>
          <span style={{ fontSize: 13, color: C.textSec }}>Protección de Datos</span>
          <span style={{ color: C.textMut, margin: "0 6px" }}>›</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Riesgos (EIPD)</span>
        </div>
        <div style={{ padding: "22px 28px", maxWidth: 1200 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text }}>Evaluaciones de Impacto (EIPD)</h1>
              <p style={{ margin: "3px 0 0", fontSize: 13, color: C.textSec }}>Evaluación obligatoria para actividades de alto riesgo · Art. 18° Ley 21.719</p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            {[
              { label: "Total", value: stats.total, color: C.blue, f: "todos" },
              { label: "Aprobadas", value: stats.aprobadas, color: C.green, f: "aprobadas" },
              { label: "En curso / Pendientes", value: stats.enCurso + stats.pendientes, color: C.yellow, f: "pendientes" },
              { label: "Bloqueadas", value: stats.bloqueadas, color: C.red, f: "bloqueadas" },
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

          {/* Bloqueadas alert */}
          {stats.bloqueadas > 0 && (
            <div style={{ padding: "12px 18px", background: C.redLt, borderRadius: 10, marginBottom: 16, borderLeft: `3px solid ${C.red}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.red }}>⛔ {stats.bloqueadas} evaluación{stats.bloqueadas > 1 ? "es" : ""} con actividad bloqueada</div>
              <div style={{ fontSize: 12, color: C.red }}>El tratamiento de datos no puede continuar hasta implementar controles adicionales.</div>
            </div>
          )}

          {/* Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {filtered.map(e => {
              const rat = ratAltoRiesgo.find(a => a.id === e.ratId);
              if (!rat) return null;
              const riesgoInicial = e.amenazas.length > 0 ? Math.max(...e.amenazas.map(a => a.impacto * a.probabilidad)) : 0;
              const reduccion = e.controlesSeleccionados.reduce((s, cId) => s + (controlesCatalogo.find(c => c.id === cId)?.reduccion || 0), 0);
              const residual = Math.max(1, riesgoInicial - reduccion);
              const residualLevel = getRiskLevel(residual);
              const isBlocked = e.estado === "Bloqueada";

              return (
                <div key={e.id} onClick={() => { setSelectedId(e.id); setView("detail"); }}
                  style={{
                    background: C.white, borderRadius: 12, padding: 20, cursor: "pointer",
                    border: isBlocked ? `2px solid ${C.red}` : `1px solid ${C.border}`,
                    boxShadow: C.shadow, transition: "transform 0.15s",
                  }}
                  onMouseEnter={ev => ev.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={ev => ev.currentTarget.style.transform = "none"}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.textMut }}>{e.id} · {rat.niref}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 2 }}>{rat.nombre}</div>
                      <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{rat.responsable}</div>
                    </div>
                    <StatusBadge estado={e.estado} />
                  </div>

                  <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                    {rat.categorias.map(c => <Badge key={c} text={c} color={["Biométricos"].includes(c) ? C.red : C.purple} bg={["Biométricos"].includes(c) ? C.redLt : C.purpleLt} />)}
                  </div>

                  {e.amenazas.length > 0 ? (
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ padding: "8px 12px", background: C.bg, borderRadius: 6, textAlign: "center", flex: 1 }}>
                        <div style={{ fontSize: 10, color: C.textMut }}>Amenazas</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{e.amenazas.length}</div>
                      </div>
                      <div style={{ padding: "8px 12px", background: C.bg, borderRadius: 6, textAlign: "center", flex: 1 }}>
                        <div style={{ fontSize: 10, color: C.textMut }}>Controles</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{e.controlesSeleccionados.length}</div>
                      </div>
                      <div style={{ padding: "8px 12px", background: residualLevel.bg, borderRadius: 6, textAlign: "center", flex: 1, border: `1px solid ${residualLevel.color}` }}>
                        <div style={{ fontSize: 10, color: C.textSec }}>R. Residual</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: residualLevel.color }}>{residualLevel.label}</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "10px 14px", background: C.orangeLt, borderRadius: 6, fontSize: 12, color: C.orange, textAlign: "center" }}>
                      Evaluación pendiente — Sin amenazas identificadas
                    </div>
                  )}

                  {isBlocked && (
                    <div style={{ marginTop: 10, padding: "8px 12px", background: C.redLt, borderRadius: 6, fontSize: 11, fontWeight: 700, color: C.red, textAlign: "center" }}>
                      ⛔ Tratamiento bloqueado hasta implementar controles adicionales
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AICopilot open={copilotOpen} onToggle={() => setCopilotOpen(!copilotOpen)} getResponse={(msg) => getEIPDResponse(msg, { ratNombre: selectedId ? evaluaciones.find(e => e.id === selectedId)?.ratId : "" })} getQuickActions={() => getEIPDQA({ ratNombre: selectedId ? "actividad seleccionada" : "" })} contextLabel={view === "detail" ? "Detalle EIPD" : "Evaluaciones EIPD"} />
    </div>
  );
}

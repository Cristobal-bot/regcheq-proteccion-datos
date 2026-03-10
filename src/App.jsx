import { useState, useMemo } from "react";
import Dashboard from "./modules/Dashboard";
import ModuloRAT from "./modules/ModuloRAT";
import ModuloLicitud from "./modules/ModuloLicitud";
import ModuloConsentimientos from "./modules/ModuloConsentimientos";
import ModuloEIPD from "./modules/ModuloEIPD";
import ModuloARCO from "./modules/ModuloARCO";
import ModuloSetup from "./modules/ModuloSetup";
import { initialUsuarios, roles, initialAreas } from "./shared/userContext";

const C = {
  navyDark: "#141242", navyMid: "#1e1b5e",
  bg: "#f3f4f8", white: "#ffffff",
  text: "#141242", textSec: "#64668b", textMut: "#9b9db5",
  blue: "#3b82f6", blueLt: "#dbeafe",
  border: "#e2e4ed",
  ai: "#7c3aed", aiLt: "#ede9fe",
};

const allSidebarItems = [
  { icon: "🏠", label: "Dashboard", id: "dashboard" },
  { icon: "📋", label: "Inventario RAT", id: "rat" },
  { icon: "⚖️", label: "Licitud", id: "licitud" },
  { icon: "📑", label: "Gestión Consent.", id: "consentimientos" },
  { icon: "🔒", label: "Riesgos (EIPD)", id: "eipd" },
  { icon: "📩", label: "Derechos ARCO+", id: "arco" },
  { icon: "⚙️", label: "Setup", id: "setup", requiresSuperAdmin: true },
];

export default function App() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("USR-001");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentUser = initialUsuarios.find(u => u.id === currentUserId) || initialUsuarios[0];
  const currentRole = roles.find(r => r.id === currentUser.rol) || roles[0];
  const currentArea = currentUser.area ? initialAreas.find(a => a.id === currentUser.area) : null;
  const isSuperAdmin = currentRole.id === "superadmin";

  const visibleModules = useMemo(() => {
    return allSidebarItems.filter(item => {
      if (item.requiresSuperAdmin && !isSuperAdmin) return false;
      return currentRole.modulos.includes(item.id);
    });
  }, [currentRole, isSuperAdmin]);

  const effectiveModule = useMemo(() => {
    if (visibleModules.find(m => m.id === activeModule)) return activeModule;
    return "dashboard";
  }, [activeModule, visibleModules]);

  const ml = sidebarCollapsed ? 56 : 210;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* SIDEBAR */}
      <div style={{ width: sidebarCollapsed ? 56 : 210, minHeight: "100vh", background: `linear-gradient(180deg, ${C.navyDark} 0%, ${C.navyMid} 100%)`, color: "#fff", display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, zIndex: 100, transition: "width 0.2s" }}>
        <div style={{ padding: sidebarCollapsed ? "18px 8px" : "18px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: sidebarCollapsed ? "center" : "space-between" }}>
          {!sidebarCollapsed && <span style={{ fontWeight: 800, fontSize: 20, fontFamily: "Georgia, serif" }}>Regcheq</span>}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", cursor: "pointer", borderRadius: 4, padding: "3px 7px", fontSize: 12 }}>{sidebarCollapsed ? "▶" : "◀"}</button>
        </div>
        <nav style={{ flex: 1, paddingTop: 6 }}>
          {visibleModules.map(item => {
            const isSetup = item.id === "setup";
            const isActive = effectiveModule === item.id;
            return (
              <div key={item.id} onClick={() => setActiveModule(item.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: sidebarCollapsed ? "10px 0" : "10px 16px",
                justifyContent: sidebarCollapsed ? "center" : "flex-start", cursor: "pointer",
                background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                borderLeft: isActive ? "3px solid #fff" : "3px solid transparent",
                fontSize: 13, transition: "background 0.15s",
                marginTop: isSetup ? 8 : 0, borderTop: isSetup ? "1px solid rgba(255,255,255,0.08)" : "none",
                paddingTop: isSetup ? 14 : undefined,
              }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {!sidebarCollapsed && <span style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>}
              </div>
            );
          })}
        </nav>
        {!sidebarCollapsed && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{currentUser.nombre.charAt(0)}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2 }}>{currentUser.nombre}</div>
                <div style={{ fontSize: 9, opacity: 0.5 }}>{currentRole.icon} {currentRole.nombre}</div>
              </div>
            </div>
            {currentArea && <div style={{ fontSize: 9, opacity: 0.4 }}>🏢 {currentArea.nombre}</div>}
            <div style={{ fontSize: 9, opacity: 0.3, marginTop: 4 }}>Ley 21.719 · Protección de Datos</div>
          </div>
        )}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, marginLeft: ml, transition: "margin-left 0.2s" }}>
        {/* Top bar with user selector */}
        <div style={{ height: 44, background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 20px", position: "sticky", top: 0, zIndex: 90 }}>
          {currentArea && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 10, padding: "2px 10px", borderRadius: 10, background: currentArea.color + "18" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: currentArea.color }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: currentArea.color }}>{currentArea.nombre}</span>
            </div>
          )}
          {!currentArea && currentRole.veTodasAreas && <span style={{ fontSize: 11, color: C.textMut, marginRight: 10 }}>🌐 Todas las áreas</span>}
          <span style={{ padding: "2px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: isSuperAdmin ? C.aiLt : C.blueLt, color: isSuperAdmin ? C.ai : C.blue, marginRight: 8 }}>{currentRole.icon} {currentRole.nombre}</span>
          
          <div style={{ position: "relative" }}>
            <div onClick={() => setShowUserMenu(!showUserMenu)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "3px 10px 3px 3px", borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.navyDark, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11 }}>{currentUser.nombre.charAt(0)}</div>
              <span style={{ fontSize: 12, color: C.text }}>{currentUser.nombre}</span>
              <span style={{ fontSize: 9, color: C.textMut }}>{showUserMenu ? "▲" : "▼"}</span>
            </div>
            {showUserMenu && (
              <div style={{ position: "absolute", top: 38, right: 0, width: 290, background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, boxShadow: "0 8px 30px rgba(20,18,66,0.12)", zIndex: 200, overflow: "hidden" }}>
                <div style={{ padding: "8px 14px", background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, color: C.textMut, fontWeight: 600 }}>Cambiar usuario (demo)</div>
                {initialUsuarios.filter(u => u.activo).map(u => {
                  const rol = roles.find(r => r.id === u.rol);
                  const area = u.area ? initialAreas.find(a => a.id === u.area) : null;
                  const isSel = u.id === currentUserId;
                  return (
                    <div key={u.id} onClick={() => { setCurrentUserId(u.id); setShowUserMenu(false); if (!roles.find(r => r.id === u.rol)?.modulos.includes(activeModule)) setActiveModule("dashboard"); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer", background: isSel ? C.blueLt : "transparent", borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = C.bg; }}
                      onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: isSel ? C.blue : C.navyDark, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{u.nombre.charAt(0)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{u.nombre}</div>
                        <div style={{ fontSize: 10, color: C.textMut }}>{rol?.icon} {rol?.nombre}{area ? ` · ${area.nombre}` : rol?.veTodasAreas ? " · Todas" : ""}</div>
                      </div>
                      {isSel && <span style={{ color: C.blue, fontWeight: 700 }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div onClick={() => showUserMenu && setShowUserMenu(false)}>
          {effectiveModule === "dashboard" && <Dashboard />}
          {effectiveModule === "rat" && <ModuloRAT />}
          {effectiveModule === "licitud" && <ModuloLicitud />}
          {effectiveModule === "consentimientos" && <ModuloConsentimientos />}
          {effectiveModule === "eipd" && <ModuloEIPD />}
          {effectiveModule === "arco" && <ModuloARCO />}
          {effectiveModule === "setup" && <ModuloSetup />}
        </div>
      </div>
    </div>
  );
}

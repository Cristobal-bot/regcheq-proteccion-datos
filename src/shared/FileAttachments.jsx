import { useState, useRef } from "react";

// ============================================
// REGCHEQ — Componente de Adjunción de Archivos
// Funcional con FileReader (almacenamiento local)
// Reutilizable en todos los módulos
// ============================================

const C = {
  navyDark: "#141242", bg: "#f3f4f8", white: "#ffffff",
  text: "#141242", textSec: "#64668b", textMut: "#9b9db5",
  green: "#10b981", greenLt: "#d1fae5",
  red: "#ef4444", redLt: "#fee2e2",
  blue: "#3b82f6", blueLt: "#dbeafe",
  purple: "#8b5cf6", purpleLt: "#ede9fe",
  orange: "#f97316", orangeLt: "#ffedd5",
  border: "#e2e4ed",
};

// ===== Íconos por tipo de archivo =====
const fileIcons = {
  pdf: "📄", doc: "📝", docx: "📝", xls: "📊", xlsx: "📊",
  jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️", webp: "🖼️",
  csv: "📊", txt: "📃", zip: "📦", rar: "📦",
  mp4: "🎬", mp3: "🎵", pptx: "📽️", ppt: "📽️",
  default: "📎",
};

const getFileIcon = (filename) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  return fileIcons[ext] || fileIcons.default;
};

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
};

// ===== Categorías de archivos por módulo =====
export const categoriasArchivos = {
  rat: [
    { id: "politica", label: "Política de privacidad" },
    { id: "contrato", label: "Contrato / Acuerdo" },
    { id: "procedimiento", label: "Procedimiento interno" },
    { id: "diagrama", label: "Diagrama de flujo de datos" },
    { id: "otro", label: "Otro documento" },
  ],
  licitud: [
    { id: "acta_consentimiento", label: "Acta de consentimiento" },
    { id: "ponderacion", label: "Ponderación de interés legítimo" },
    { id: "norma_legal", label: "Norma legal de respaldo" },
    { id: "contrato_base", label: "Contrato que fundamenta licitud" },
    { id: "otro", label: "Otro documento" },
  ],
  consentimientos: [
    { id: "formulario_firmado", label: "Formulario firmado" },
    { id: "captura_pantalla", label: "Captura de pantalla" },
    { id: "registro_auditoria", label: "Registro de auditoría" },
    { id: "comunicacion_titular", label: "Comunicación al titular" },
    { id: "otro", label: "Otro documento" },
  ],
  eipd: [
    { id: "informe_auditoria", label: "Informe de auditoría" },
    { id: "certificado_seguridad", label: "Certificado de seguridad" },
    { id: "analisis_riesgo", label: "Análisis de riesgo externo" },
    { id: "plan_mitigacion", label: "Plan de mitigación" },
    { id: "otro", label: "Otro documento" },
  ],
  arco: [
    { id: "solicitud_titular", label: "Solicitud del titular" },
    { id: "documento_identidad", label: "Documento de identidad" },
    { id: "respuesta_enviada", label: "Respuesta enviada" },
    { id: "informe_datos", label: "Informe de datos entregado" },
    { id: "respaldo_legal", label: "Respaldo legal" },
    { id: "otro", label: "Otro documento" },
  ],
  setup: [
    { id: "politica_empresa", label: "Política de la empresa" },
    { id: "organigrama", label: "Organigrama" },
    { id: "certificado", label: "Certificado / Licencia" },
    { id: "otro", label: "Otro documento" },
  ],
};

// ===== Archivos demo pre-cargados =====
export const archivosDemoByModule = {
  rat: {
    "RAT-001": [
      { id: "f1", nombre: "Politica_Privacidad_RRHH_v3.pdf", size: 245760, tipo: "pdf", categoria: "politica", subidoPor: "Carolina Méndez", fecha: "2025-09-15", notas: "Versión aprobada por directorio" },
      { id: "f2", nombre: "Diagrama_Flujo_Nomina.png", size: 189440, tipo: "png", categoria: "diagrama", subidoPor: "Andrea Soto", fecha: "2025-09-20", notas: "" },
    ],
    "RAT-003": [
      { id: "f3", nombre: "Protocolo_Videovigilancia_2025.pdf", size: 512000, tipo: "pdf", categoria: "procedimiento", subidoPor: "Roberto Díaz", fecha: "2025-10-01", notas: "Incluye señalización y plazos de retención" },
    ],
    "RAT-006": [
      { id: "f4", nombre: "Contrato_Proveedor_Biometrico.docx", size: 98304, tipo: "docx", categoria: "contrato", subidoPor: "Roberto Díaz", fecha: "2025-10-15", notas: "Contrato con proveedor de sistemas biométricos" },
    ],
  },
  licitud: {
    "LIC-002": [
      { id: "f5", nombre: "Modelo_Consentimiento_Marketing_v2.pdf", size: 156672, tipo: "pdf", categoria: "acta_consentimiento", subidoPor: "Carolina Méndez", fecha: "2025-09-25", notas: "Template aprobado para campañas de marketing" },
    ],
    "LIC-003": [
      { id: "f6", nombre: "Ponderacion_Interes_Legitimo_CCTV.pdf", size: 287744, tipo: "pdf", categoria: "ponderacion", subidoPor: "Carolina Méndez", fecha: "2025-11-01", notas: "Análisis de proporcionalidad videovigilancia" },
    ],
    "LIC-004": [
      { id: "f7", nombre: "Ley_20393_Extracto.pdf", size: 409600, tipo: "pdf", categoria: "norma_legal", subidoPor: "Carolina Méndez", fecha: "2025-10-10", notas: "Artículos relevantes para evaluación crediticia" },
    ],
  },
  consentimientos: {
    "REG-004": [
      { id: "f8", nombre: "Contrato_Laboral_ASilva_Clausula12.pdf", size: 1048576, tipo: "pdf", categoria: "formulario_firmado", subidoPor: "Andrea Soto", fecha: "2025-09-01", notas: "Cláusula 12 con consentimiento firmado ante notario" },
    ],
    "REG-006": [
      { id: "f9", nombre: "Formulario_Consentimiento_Biometrico_SMartinez.pdf", size: 204800, tipo: "pdf", categoria: "formulario_firmado", subidoPor: "Roberto Díaz", fecha: "2025-10-20", notas: "Consentimiento expreso para dato sensible" },
    ],
  },
  eipd: {
    "EIPD-001": [
      { id: "f10", nombre: "Informe_Seguridad_CCTV_2025.pdf", size: 614400, tipo: "pdf", categoria: "informe_auditoria", subidoPor: "Roberto Díaz", fecha: "2025-11-08", notas: "Auditoría de seguridad del sistema de videovigilancia" },
      { id: "f11", nombre: "Certificado_Cifrado_DVR.pdf", size: 102400, tipo: "pdf", categoria: "certificado_seguridad", subidoPor: "Roberto Díaz", fecha: "2025-10-15", notas: "" },
    ],
    "EIPD-003": [
      { id: "f12", nombre: "Plan_Controles_Biometrico_PENDIENTE.docx", size: 81920, tipo: "docx", categoria: "plan_mitigacion", subidoPor: "Carolina Méndez", fecha: "2025-11-20", notas: "Borrador — requiere aprobación para desbloquear actividad" },
    ],
  },
  arco: {
    "ARCO-001": [
      { id: "f13", nombre: "Respuesta_Acceso_JPerez_2025-11-07.pdf", size: 327680, tipo: "pdf", categoria: "respuesta_enviada", subidoPor: "Carolina Méndez", fecha: "2025-11-07", notas: "Informe completo de datos tratados enviado por email cifrado" },
    ],
    "ARCO-002": [
      { id: "f14", nombre: "Solicitud_Rectificacion_MGonzalez.pdf", size: 143360, tipo: "pdf", categoria: "solicitud_titular", subidoPor: "Sistema", fecha: "2025-11-10", notas: "Solicitud ingresada por email" },
    ],
    "ARCO-003": [
      { id: "f15", nombre: "Solicitud_Supresion_CMunoz.pdf", size: 163840, tipo: "pdf", categoria: "solicitud_titular", subidoPor: "Sistema", fecha: "2025-11-15", notas: "" },
      { id: "f16", nombre: "Analisis_Retencion_Legal_CMunoz.xlsx", size: 45056, tipo: "xlsx", categoria: "respaldo_legal", subidoPor: "Carolina Méndez", fecha: "2025-11-19", notas: "Análisis de obligaciones de retención tributaria" },
    ],
  },
};

// ====================================================================
// COMPONENTE PRINCIPAL: FileAttachments
// ====================================================================
export default function FileAttachments({ modulo, registroId, archivosIniciales, onArchivosChange, compact = false }) {
  const [archivos, setArchivos] = useState(() => {
    if (archivosIniciales) return archivosIniciales;
    return archivosDemoByModule[modulo]?.[registroId] || [];
  });
  const [dragging, setDragging] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [categoria, setCategoria] = useState("");
  const [notas, setNotas] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);

  const categorias = categoriasArchivos[modulo] || categoriasArchivos.rat;

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return {
        id: `f_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        nombre: file.name,
        size: file.size,
        tipo: file.name.split(".").pop()?.toLowerCase() || "unknown",
        categoria: categoria || "otro",
        subidoPor: "Usuario actual",
        fecha: new Date().toISOString().slice(0, 10),
        notas: notas,
        fileObj: file,
        dataUrl: null,
      };
    });

    // Read each file
    newFiles.forEach((nf, i) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        nf.dataUrl = e.target.result;
        if (i === newFiles.length - 1) {
          const updated = [...archivos, ...newFiles];
          setArchivos(updated);
          if (onArchivosChange) onArchivosChange(updated);
        }
      };
      reader.readAsDataURL(fileList[i]);
    });

    if (newFiles.length === 0) return;
    const updated = [...archivos, ...newFiles];
    setArchivos(updated);
    if (onArchivosChange) onArchivosChange(updated);
    setShowUpload(false);
    setCategoria("");
    setNotas("");
  };

  const removeFile = (fileId) => {
    const updated = archivos.filter(f => f.id !== fileId);
    setArchivos(updated);
    if (onArchivosChange) onArchivosChange(updated);
  };

  const downloadFile = (file) => {
    if (file.dataUrl) {
      const a = document.createElement("a");
      a.href = file.dataUrl;
      a.download = file.nombre;
      a.click();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // ===== COMPACT VIEW =====
  if (compact) {
    return (
      <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.textSec }}>📎 Archivos adjuntos ({archivos.length})</span>
          <button onClick={() => fileInputRef.current?.click()} style={{ padding: "3px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: "pointer", color: C.textSec }}>+ Adjuntar</button>
        </div>
        {archivos.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {archivos.map(f => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 6, background: C.bg, border: `1px solid ${C.border}`, fontSize: 11 }}>
                <span>{getFileIcon(f.nombre)}</span>
                <span style={{ color: C.text, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.nombre}</span>
                <span style={{ color: C.textMut }}>({formatSize(f.size)})</span>
                <button onClick={(e) => { e.stopPropagation(); removeFile(f.id); }} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 10, padding: 0 }}>✕</button>
              </div>
            ))}
          </div>
        )}
        <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={e => { if (e.target.files.length) handleFiles(e.target.files); e.target.value = ""; }} />
      </div>
    );
  }

  // ===== FULL VIEW =====
  return (
    <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, boxShadow: "0 1px 4px rgba(20,18,66,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, color: C.text }}>📎 Documentos Adjuntos</h3>
          <div style={{ fontSize: 11, color: C.textMut, marginTop: 2 }}>{archivos.length} archivo{archivos.length !== 1 ? "s" : ""}</div>
        </div>
        <button onClick={() => setShowUpload(!showUpload)} style={{
          padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
          border: "none", background: C.navyDark, color: "#fff",
        }}>+ Subir Archivo</button>
      </div>

      {/* Upload zone */}
      {showUpload && (
        <div style={{ marginBottom: 16, padding: 16, borderRadius: 10, border: `2px dashed ${dragging ? C.blue : C.border}`, background: dragging ? C.blueLt : C.bg, transition: "all 0.15s" }}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}>
          
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>📁</div>
            <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>Arrastra archivos aquí o haz click para seleccionar</div>
            <div style={{ fontSize: 11, color: C.textMut, marginTop: 2 }}>PDF, Word, Excel, imágenes — Máximo 10 MB por archivo</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0 12px", alignItems: "end", marginTop: 10 }}>
            <div style={{ marginBottom: 0 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 3 }}>Categoría</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, color: C.text, boxSizing: "border-box" }}>
                <option value="">Sin categoría</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 0 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 3 }}>Notas (opcional)</label>
              <input value={notas} onChange={e => setNotas(e.target.value)} placeholder="Comentario sobre el archivo..." style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, color: C.text, boxSizing: "border-box" }} />
            </div>
            <button onClick={() => fileInputRef.current?.click()} style={{ padding: "6px 16px", borderRadius: 6, border: `1px solid ${C.blue}`, background: C.blueLt, color: C.blue, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Seleccionar archivo
            </button>
          </div>
          <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={e => { if (e.target.files.length) handleFiles(e.target.files); e.target.value = ""; }} />
        </div>
      )}

      {/* File list */}
      {archivos.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", color: C.textMut, fontSize: 12 }}>
          No hay archivos adjuntos. Haz click en "Subir Archivo" para agregar documentos.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {archivos.map(f => {
            const catLabel = categorias.find(c => c.id === f.categoria)?.label || "";
            return (
              <div key={f.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                borderRadius: 8, border: `1px solid ${C.border}`, background: C.white,
                transition: "background 0.1s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg}
                onMouseLeave={e => e.currentTarget.style.background = C.white}>
                
                {/* Icon */}
                <div style={{ width: 38, height: 38, borderRadius: 8, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {getFileIcon(f.nombre)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.nombre}</div>
                  <div style={{ display: "flex", gap: 8, fontSize: 11, color: C.textMut, marginTop: 2 }}>
                    <span>{formatSize(f.size)}</span>
                    <span>·</span>
                    <span>{formatDate(f.fecha)}</span>
                    <span>·</span>
                    <span>{f.subidoPor}</span>
                    {catLabel && <><span>·</span><span style={{ color: C.purple }}>{catLabel}</span></>}
                  </div>
                  {f.notas && <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{f.notas}</div>}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {f.dataUrl && f.tipo && ["jpg", "jpeg", "png", "gif", "webp"].includes(f.tipo) && (
                    <button onClick={() => setPreviewFile(f)} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: "pointer", color: C.textSec }}>👁️</button>
                  )}
                  {f.dataUrl && (
                    <button onClick={() => downloadFile(f)} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: "pointer", color: C.blue }}>⬇️</button>
                  )}
                  <button onClick={() => removeFile(f.id)} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 11, cursor: "pointer", color: C.red }}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image preview modal */}
      {previewFile && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setPreviewFile(null)}>
          <div style={{ background: C.white, borderRadius: 12, padding: 16, maxWidth: "80vw", maxHeight: "80vh" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{previewFile.nombre}</span>
              <button onClick={() => setPreviewFile(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.textMut }}>✕</button>
            </div>
            <img src={previewFile.dataUrl} alt={previewFile.nombre} style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 8 }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ===== EXPORT COMPACT VERSION =====
export function FileAttachmentsCompact(props) {
  return <FileAttachments {...props} compact={true} />;
}

# Regcheq — Protección de Datos Personales
## Ley 21.719 Chile · Sistema de Compliance B2B

---

## Arquitectura: 7 Módulos

| # | Módulo | Archivo | IA Copilot | Líneas |
|---|--------|---------|-----------|--------|
| 1 | Dashboard | Dashboard.jsx | ❌ | 650 |
| 2 | Inventario RAT | ModuloRAT.jsx | ✅ | 1,004 |
| 3 | Motor de Licitud | ModuloLicitud.jsx | ✅ | 677 |
| 4 | Gestión de Consentimientos | ModuloConsentimientos.jsx | ✅ | 661 |
| 5 | Riesgos (EIPD) | ModuloEIPD.jsx | ❌ | 775 |
| 6 | Derechos ARCO+ | ModuloARCO.jsx | ❌ | 817 |
| **Total** | | | **3 con IA** | **4,584** |

---

## Módulo 1: Dashboard
KPIs de cumplimiento con score general ponderado (RAT 30%, Licitud 25%, EIPD 25%, ARCO+ 20%), alertas por severidad, tendencia 6 meses, distribución de riesgo. Cards clickeables con drill-down.

## Módulo 2: Inventario RAT (+ IA)
Registro de Actividades de Tratamiento (Art. 8°). CRUD completo con flujo de 4 pasos: Identificación → Actores → Ciclo de Vida → Clasificación. 8 actividades demo. IA sugiere nombres, descripciones, nivel de riesgo, categorías de datos, y analiza cumplimiento.

## Módulo 3: Motor de Licitud (+ IA)
Validación de bases legales para cada actividad RAT. 4 bases implementadas: Consentimiento (multi-finalidad), Ejecución de Contrato, Interés Legítimo (ponderación 5 campos), Obligación Legal (normas). IA recomienda base legal, genera justificaciones, redacta ponderaciones completas, identifica normas por industria.

## Módulo 4: Gestión de Consentimientos B2B (+ IA)
Plataforma operativa para que la empresa gestione los consentimientos de sus titulares:
- **Tab Por Titular**: Búsqueda por nombre/RUT/email, detalle con cada finalidad, método de obtención, información proporcionada, terceros informados
- **Tab Por Actividad RAT**: Vista agrupada por actividad, qué titulares consintieron, cobertura
- **Tab Revocaciones**: Log de cada revocación con fecha, canal, motivo, impacto, notificación a terceros
- **Panel de Evidencia**: Hash SHA-256, IP, user agent, timestamp, URL, versión del formulario (digital) o referencia documental + testigos (físico)
- IA analiza cumplimiento del Art. 12° (6 requisitos), diagnostica estado general, asesora sobre evidencia ante fiscalización

## Módulo 5: Riesgos (EIPD)
Evaluación de Impacto en Protección de Datos (Art. 18°). 12 amenazas en 3 dimensiones (CIA), 15 controles técnicos/organizacionales/legales, matriz de riesgo 4x3, cálculo de riesgo residual. Si residual > 6 → actividad bloqueada.

## Módulo 6: Derechos ARCO+
Portal de gestión de 6 tipos de solicitud: Acceso, Rectificación, Supresión, Bloqueo, Portabilidad, Oposición a Decisión Automatizada. Plazo legal 30 días con barra visual. Flujos específicos por tipo (rectificación con comparativa, supresión con evaluación de retención, portabilidad con formatos de export).

---

## Design System

### Paleta
```
Navy:    #141242 (dark), #1e1b5e (mid)
BG:      #f3f4f8
Text:    #141242 (primary), #64668b (secondary), #9b9db5 (muted)
Green:   #10b981 / #d1fae5
Yellow:  #f59e0b / #fef3c7
Red:     #ef4444 / #fee2e2
Blue:    #3b82f6 / #dbeafe
Purple:  #8b5cf6 / #ede9fe (AI accent: #7c3aed)
Orange:  #f97316 / #ffedd5
```

### Layout
- Sidebar: 210px / 56px colapsada, gradient navy, position fixed
- Header: 52px sticky con breadcrumb
- Content: max-width 1200px
- AI Copilot: 380px panel fijo derecho

---

## Referencias legales

- Art. 3° — Principios del tratamiento
- Art. 5°-10° — Derechos ARCO+
- Art. 8° — RAT obligatorio
- Art. 8° bis — Decisiones automatizadas
- Art. 12° — Consentimiento (libre, informado, específico, inequívoco, previo, revocable)
- Art. 13° — Bases de licitud
- Art. 16° bis — Datos sensibles
- Art. 16° quáter — Menores de 14/16 años
- Art. 18° — EIPD obligatoria
- Art. 27° — Transferencia internacional
- Art. 31° — DPD

## Demo data

- 8 actividades RAT
- 7 vinculaciones de licitud + 1 sin asignar
- 8 titulares con 15 consentimientos + 4 revocaciones
- 4 evaluaciones EIPD
- 7 solicitudes ARCO+
- Fecha simulada: 2025-11-25

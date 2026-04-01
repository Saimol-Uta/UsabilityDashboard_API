// Script para generar presentacion_hci.pptx
// Ejecutar con: node generate_pptx.mjs

import PptxGenJS from 'pptxgenjs';
import { writeFileSync } from 'fs';

const pptx = new PptxGenJS();
pptx.author = 'Usability Dashboard Team';
pptx.title = 'Usability Test Plan Dashboard — Presentación HCI';
pptx.subject = 'Interacción Humano-Computador';

// ── Paleta ──
const NAVY = '1E2761';
const LIGHT_BG = 'F5F7FA';
const ACCENT = '4A90D9';
const TEXT_DARK = '1A1A2E';
const WHITE = 'FFFFFF';
const EMERALD = '10B981';
const AMBER = 'F59E0B';
const RED = 'EF4444';

// Helper: add top accent bar
function addAccentBar(slide) {
    slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0, y: 0, w: '100%', h: 0.08,
        fill: { color: ACCENT }
    });
}

// Helper: add footer
function addFooter(slide, slideNum) {
    slide.addText(`Usability Test Plan Dashboard  •  HCI 2026  •  ${slideNum}/10`, {
        x: 0.5, y: 5.2, w: 9, h: 0.3,
        fontSize: 8, color: '999999', fontFace: 'Calibri',
        align: 'center'
    });
}

// Helper: add section title with icon
function addSectionHeader(slide, icon, title) {
    slide.addText([
        { text: icon + '  ', fontSize: 28 },
        { text: title, fontSize: 36, bold: true, color: TEXT_DARK, fontFace: 'Calibri' }
    ], { x: 0.6, y: 0.35, w: 8.8, h: 0.7 });
    slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0.6, y: 1.1, w: 2, h: 0.04,
        fill: { color: ACCENT }
    });
}

// ══════════════════════════════════════════════════════════════
// SLIDE 1 — PORTADA
// ══════════════════════════════════════════════════════════════
const slide1 = pptx.addSlide();
slide1.background = { fill: NAVY };

// Decorative circle
slide1.addShape(pptx.shapes.OVAL, {
    x: 7.5, y: -1.5, w: 4, h: 4,
    fill: { color: ACCENT, transparency: 85 }
});
slide1.addShape(pptx.shapes.OVAL, {
    x: -1, y: 3.5, w: 3, h: 3,
    fill: { color: ACCENT, transparency: 90 }
});

slide1.addText('📊', { x: 4.2, y: 1.0, w: 1.5, h: 0.8, fontSize: 48, align: 'center' });

slide1.addText('Usability Test Plan\nDashboard', {
    x: 0.8, y: 1.8, w: 8.4, h: 1.6,
    fontSize: 40, bold: true, color: WHITE, fontFace: 'Calibri',
    align: 'center', lineSpacing: 48
});

slide1.addShape(pptx.shapes.RECTANGLE, {
    x: 3.5, y: 3.5, w: 3, h: 0.04,
    fill: { color: ACCENT }
});

slide1.addText('Presentación HCI — Abril 2026', {
    x: 0.8, y: 3.7, w: 8.4, h: 0.5,
    fontSize: 18, color: ACCENT, fontFace: 'Calibri',
    align: 'center'
});

slide1.addText('Evaluación de Usabilidad con WAVE • Lighthouse • Stark', {
    x: 0.8, y: 4.4, w: 8.4, h: 0.4,
    fontSize: 12, color: '8899BB', fontFace: 'Calibri',
    align: 'center'
});

// ══════════════════════════════════════════════════════════════
// SLIDE 2 — ¿QUÉ ES EL SISTEMA?
// ══════════════════════════════════════════════════════════════
const slide2 = pptx.addSlide();
slide2.background = { fill: LIGHT_BG };
addAccentBar(slide2);
addSectionHeader(slide2, '🎯', '¿Qué es el Sistema?');

// Main description card
slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 1.5, w: 8.8, h: 1.4,
    fill: { color: WHITE },
    shadow: { type: 'outer', blur: 6, offset: 2, color: '00000015' },
    rectRadius: 0.15
});
slide2.addText('Sistema web para planificar, ejecutar y analizar pruebas de usabilidad siguiendo la metodología Think Aloud con herramientas WAVE, Lighthouse y Stark.', {
    x: 0.9, y: 1.6, w: 8.2, h: 1.2,
    fontSize: 16, color: TEXT_DARK, fontFace: 'Calibri', lineSpacing: 24
});

// Objective card
slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 3.2, w: 8.8, h: 1.2,
    fill: { color: WHITE },
    shadow: { type: 'outer', blur: 6, offset: 2, color: '00000015' },
    rectRadius: 0.15
});
slide2.addShape(pptx.shapes.RECTANGLE, {
    x: 0.6, y: 3.2, w: 0.06, h: 1.2,
    fill: { color: ACCENT }
});
slide2.addText([
    { text: '🎯 Objetivo: ', bold: true, fontSize: 14, color: ACCENT },
    { text: 'Centralizar todo el ciclo de evaluación de usabilidad, desde la creación del plan hasta el seguimiento de acciones de mejora.', fontSize: 14, color: TEXT_DARK }
], { x: 0.9, y: 3.3, w: 8.2, h: 1.0, fontFace: 'Calibri', lineSpacing: 22 });

// Users card
slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 4.6, w: 8.8, h: 0.6,
    fill: { color: ACCENT, transparency: 90 },
    rectRadius: 0.1
});
slide2.addText('👥 Usuarios: Moderadores de pruebas, evaluadores HCI, investigadores UX, docentes de IHC', {
    x: 0.9, y: 4.6, w: 8.2, h: 0.6,
    fontSize: 13, color: TEXT_DARK, fontFace: 'Calibri'
});

addFooter(slide2, 2);

// ══════════════════════════════════════════════════════════════
// SLIDE 3 — MÓDULOS DEL SISTEMA
// ══════════════════════════════════════════════════════════════
const slide3 = pptx.addSlide();
slide3.background = { fill: LIGHT_BG };
addAccentBar(slide3);
addSectionHeader(slide3, '📦', 'Módulos del Sistema');

const modules = [
    { icon: '📊', name: 'Dashboard', desc: 'KPIs y métricas globales' },
    { icon: '📋', name: 'Plan de Prueba', desc: 'Gestión de planes CRUD' },
    { icon: '✅', name: 'Tareas', desc: 'Escenarios y criterios' },
    { icon: '🎙️', name: 'Guión Moderador', desc: 'Intro, preguntas, cierre' },
    { icon: '👥', name: 'Participantes', desc: 'Directorio de usuarios' },
    { icon: '📅', name: 'Sesiones', desc: 'Agenda de campo' },
    { icon: '▶️', name: 'Sesión Guiada', desc: '3 fases del moderador' },
    { icon: '👁️', name: 'Observaciones', desc: 'Registro de resultados' },
    { icon: '🔍', name: 'Hallazgos', desc: 'Síntesis de problemas' },
    { icon: '💡', name: 'Mejoras', desc: 'Acciones correctivas' },
];

modules.forEach((mod, i) => {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const x = 0.5 + col * 1.9;
    const y = 1.5 + row * 1.7;

    slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y, w: 1.7, h: 1.4,
        fill: { color: WHITE },
        shadow: { type: 'outer', blur: 4, offset: 2, color: '00000012' },
        rectRadius: 0.12
    });

    slide3.addText(mod.icon, { x, y: y + 0.1, w: 1.7, h: 0.4, fontSize: 22, align: 'center' });
    slide3.addText(mod.name, { x, y: y + 0.5, w: 1.7, h: 0.35, fontSize: 11, bold: true, color: TEXT_DARK, fontFace: 'Calibri', align: 'center' });
    slide3.addText(mod.desc, { x, y: y + 0.85, w: 1.7, h: 0.4, fontSize: 9, color: '666666', fontFace: 'Calibri', align: 'center', lineSpacing: 12 });
});

addFooter(slide3, 3);

// ══════════════════════════════════════════════════════════════
// SLIDE 4 — FLUJO PRINCIPAL
// ══════════════════════════════════════════════════════════════
const slide4 = pptx.addSlide();
slide4.background = { fill: LIGHT_BG };
addAccentBar(slide4);
addSectionHeader(slide4, '🔄', 'Flujo Principal del Sistema');

const steps = [
    { num: '1', text: 'Crear Plan de Prueba' },
    { num: '2', text: 'Definir Tareas y Escenarios' },
    { num: '3', text: 'Redactar Guion del Moderador' },
    { num: '4', text: 'Registrar Participantes' },
    { num: '5', text: 'Programar Sesiones' },
    { num: '6', text: 'Ejecutar Sesión Guiada ▶' },
    { num: '7', text: 'Registrar Observaciones' },
    { num: '8', text: 'Sintetizar Hallazgos' },
    { num: '9', text: 'Crear Acciones de Mejora' },
    { num: '10', text: 'Monitorear en Dashboard' },
];

steps.forEach((step, i) => {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const x = 0.4 + col * 1.9;
    const y = 1.5 + row * 1.8;

    // Circle with number
    slide4.addShape(pptx.shapes.OVAL, {
        x: x + 0.55, y, w: 0.55, h: 0.55,
        fill: { color: i === 5 ? EMERALD : ACCENT }
    });
    slide4.addText(step.num, {
        x: x + 0.55, y, w: 0.55, h: 0.55,
        fontSize: 16, bold: true, color: WHITE, fontFace: 'Calibri', align: 'center', valign: 'middle'
    });

    // Label
    slide4.addText(step.text, {
        x, y: y + 0.65, w: 1.7, h: 0.6,
        fontSize: 11, color: TEXT_DARK, fontFace: 'Calibri', align: 'center', lineSpacing: 14
    });

    // Arrow between items (horizontal)
    if (col < 4 && i < steps.length - 1) {
        slide4.addText('→', {
            x: x + 1.55, y: y + 0.1, w: 0.4, h: 0.4,
            fontSize: 18, color: ACCENT, align: 'center', valign: 'middle'
        });
    }
});

addFooter(slide4, 4);

// ══════════════════════════════════════════════════════════════
// SLIDE 5 — ARQUITECTURA TÉCNICA
// ══════════════════════════════════════════════════════════════
const slide5 = pptx.addSlide();
slide5.background = { fill: LIGHT_BG };
addAccentBar(slide5);
addSectionHeader(slide5, '🏗️', 'Arquitectura Técnica');

const archItems = [
    { icon: '⚛️', title: 'Frontend', desc: 'React 19.2 + TypeScript 5.9\nVite 8 + Tailwind CSS 4\nReact Router DOM 7\nAxios + Lucide Icons', color: '3B82F6' },
    { icon: '⚙️', title: 'Backend', desc: '.NET 8 Web API\nClean Architecture\nRepo + Service + DTO\nAutoMapper + Swagger', color: '8B5CF6' },
    { icon: '🗄️', title: 'Base de Datos', desc: 'SQL Server\nEntity Framework Core\nCode First + Migrations\nBaseEntity (audit fields)', color: EMERALD },
    { icon: '🔒', title: 'Autenticación', desc: 'No implementada\nAcceso directo\nCORS habilitado\nMiddleware de errores', color: AMBER },
];

archItems.forEach((item, i) => {
    const x = 0.4 + i * 2.35;
    
    slide5.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y: 1.5, w: 2.15, h: 3.0,
        fill: { color: WHITE },
        shadow: { type: 'outer', blur: 6, offset: 2, color: '00000015' },
        rectRadius: 0.15
    });
    
    // Color top bar
    slide5.addShape(pptx.shapes.RECTANGLE, {
        x, y: 1.5, w: 2.15, h: 0.06,
        fill: { color: item.color }
    });

    slide5.addText(item.icon, { x, y: 1.7, w: 2.15, h: 0.5, fontSize: 28, align: 'center' });
    slide5.addText(item.title, { x, y: 2.2, w: 2.15, h: 0.4, fontSize: 15, bold: true, color: TEXT_DARK, fontFace: 'Calibri', align: 'center' });
    
    slide5.addShape(pptx.shapes.RECTANGLE, {
        x: x + 0.5, y: 2.65, w: 1.15, h: 0.03,
        fill: { color: item.color, transparency: 60 }
    });

    slide5.addText(item.desc, {
        x: x + 0.15, y: 2.8, w: 1.85, h: 1.5,
        fontSize: 10, color: '555555', fontFace: 'Calibri', align: 'center', lineSpacing: 15
    });
});

addFooter(slide5, 5);

// ══════════════════════════════════════════════════════════════
// SLIDE 6 — DECISIONES DE DISEÑO HCI
// ══════════════════════════════════════════════════════════════
const slide6 = pptx.addSlide();
slide6.background = { fill: LIGHT_BG };
addAccentBar(slide6);
addSectionHeader(slide6, '🎨', 'Decisiones de Diseño HCI');

const hciPatterns = [
    { pattern: 'Feedback Visual', why: 'El usuario necesita saber que su acción fue procesada', benefit: 'Toasts de éxito/error con auto-dismiss reducen incertidumbre' },
    { pattern: 'Navegación Consistente', why: 'Reducir carga cognitiva en sistema multi-módulo', benefit: 'Sidebar fija + breadcrumbs + iconos = orientación constante' },
    { pattern: 'Confirmación Destructiva', why: 'Prevenir eliminaciones accidentales', benefit: 'Modales de confirmación antes de cada delete' },
    { pattern: 'Codificación por Color', why: 'Identificar severidad y estado rápidamente', benefit: 'Rojo/naranja/amarillo/verde = lectura instantánea' },
    { pattern: 'Empty States', why: 'Guiar al usuario cuando no hay datos', benefit: 'Iconos + texto + botón CTA = no hay pantallas vacías' },
    { pattern: 'Responsive Design', why: 'Acceso desde cualquier dispositivo', benefit: 'Mobile-first con sidebar hamburger + estados adaptativos' },
];

// Table header
const headerY = 1.4;
slide6.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.4, y: headerY, w: 9.2, h: 0.45,
    fill: { color: ACCENT },
    rectRadius: 0.08
});
slide6.addText('Patrón Aplicado', { x: 0.5, y: headerY, w: 2.6, h: 0.45, fontSize: 11, bold: true, color: WHITE, fontFace: 'Calibri', valign: 'middle' });
slide6.addText('Por qué', { x: 3.1, y: headerY, w: 3.2, h: 0.45, fontSize: 11, bold: true, color: WHITE, fontFace: 'Calibri', valign: 'middle' });
slide6.addText('Beneficio al Usuario', { x: 6.3, y: headerY, w: 3.2, h: 0.45, fontSize: 11, bold: true, color: WHITE, fontFace: 'Calibri', valign: 'middle' });

hciPatterns.forEach((p, i) => {
    const y = 1.9 + i * 0.55;
    const bgColor = i % 2 === 0 ? WHITE : 'F0F4F8';

    slide6.addShape(pptx.shapes.RECTANGLE, {
        x: 0.4, y, w: 9.2, h: 0.52,
        fill: { color: bgColor }
    });
    slide6.addText(p.pattern, { x: 0.5, y, w: 2.6, h: 0.52, fontSize: 10, bold: true, color: ACCENT, fontFace: 'Calibri', valign: 'middle' });
    slide6.addText(p.why, { x: 3.1, y, w: 3.2, h: 0.52, fontSize: 10, color: TEXT_DARK, fontFace: 'Calibri', valign: 'middle' });
    slide6.addText(p.benefit, { x: 6.3, y, w: 3.2, h: 0.52, fontSize: 10, color: '555555', fontFace: 'Calibri', valign: 'middle' });
});

addFooter(slide6, 6);

// ══════════════════════════════════════════════════════════════
// SLIDE 7 — PROBLEMAS DETECTADOS Y SOLUCIONES
// ══════════════════════════════════════════════════════════════
const slide7 = pptx.addSlide();
slide7.background = { fill: LIGHT_BG };
addAccentBar(slide7);
addSectionHeader(slide7, '🔧', 'Problemas Detectados y Soluciones');

const problems = [
    { problem: 'Guión separado de la sesión de prueba', module: 'Guión / Sesiones', solution: 'Creación del Modo Guía de Sesión con panel lateral integrado' },
    { problem: 'Sin flujo de ejecución guiada', module: 'Sesiones', solution: 'SessionRunner con 3 fases: Apertura → Prueba → Cierre' },
    { problem: 'Sin timer para medir tareas', module: 'Observaciones', solution: 'Timer integrado con botón "Usar tiempo del cronómetro"' },
    { problem: 'Sin progreso visual de tareas', module: 'Sesiones', solution: 'Barra de progreso + stepper con estados por tarea' },
    { problem: 'Preguntas Think Aloud inaccesibles', module: 'Guión', solution: 'Tabs en panel lateral: Intro / Preguntas / Cierre' },
];

// Header row
const h7y = 1.4;
slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.4, y: h7y, w: 9.2, h: 0.45,
    fill: { color: RED },
    rectRadius: 0.08
});
slide7.addText('Problema', { x: 0.5, y: h7y, w: 3.3, h: 0.45, fontSize: 11, bold: true, color: WHITE, fontFace: 'Calibri', valign: 'middle' });
slide7.addText('Módulo', { x: 3.8, y: h7y, w: 1.8, h: 0.45, fontSize: 11, bold: true, color: WHITE, fontFace: 'Calibri', valign: 'middle' });
slide7.addText('Solución Aplicada', { x: 5.6, y: h7y, w: 4, h: 0.45, fontSize: 11, bold: true, color: WHITE, fontFace: 'Calibri', valign: 'middle' });

problems.forEach((p, i) => {
    const y = 1.9 + i * 0.62;
    const bgColor = i % 2 === 0 ? WHITE : 'FEF2F2';

    slide7.addShape(pptx.shapes.RECTANGLE, {
        x: 0.4, y, w: 9.2, h: 0.58,
        fill: { color: bgColor }
    });
    slide7.addText('⚠ ' + p.problem, { x: 0.5, y, w: 3.3, h: 0.58, fontSize: 10, color: TEXT_DARK, fontFace: 'Calibri', valign: 'middle' });
    slide7.addText(p.module, { x: 3.8, y, w: 1.8, h: 0.58, fontSize: 10, color: ACCENT, fontFace: 'Calibri', valign: 'middle', bold: true });
    slide7.addText('✓ ' + p.solution, { x: 5.6, y, w: 4, h: 0.58, fontSize: 10, color: EMERALD, fontFace: 'Calibri', valign: 'middle' });
});

// Highlight box
slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.4, y: 4.6, w: 9.2, h: 0.6,
    fill: { color: EMERALD, transparency: 90 },
    line: { color: EMERALD, width: 1.5 },
    rectRadius: 0.1
});
slide7.addText('💡 Corrección principal: El Modo Guía de Sesión integra el guion del moderador directamente en la ejecución de la sesión de prueba.', {
    x: 0.6, y: 4.6, w: 8.8, h: 0.6,
    fontSize: 11, color: TEXT_DARK, fontFace: 'Calibri', valign: 'middle', bold: true
});

addFooter(slide7, 7);

// ══════════════════════════════════════════════════════════════
// SLIDE 8 — DEMO / CAPTURAS
// ══════════════════════════════════════════════════════════════
const slide8 = pptx.addSlide();
slide8.background = { fill: LIGHT_BG };
addAccentBar(slide8);
addSectionHeader(slide8, '📸', 'Demo / Capturas de Pantalla');

const screenshots = [
    { title: 'Dashboard Principal', desc: 'KPIs, gráficos y métricas de usabilidad' },
    { title: 'Sesión Guiada — Apertura', desc: 'Texto de introducción para el participante' },
    { title: 'Sesión Guiada — En Prueba', desc: 'Panel lateral del guion + registro de observaciones' },
    { title: 'Sesión Guiada — Cierre', desc: 'Instrucciones de cierre + resumen' },
];

screenshots.forEach((ss, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 4.7;
    const y = 1.5 + row * 1.8;

    slide8.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y, w: 4.3, h: 1.5,
        fill: { color: WHITE },
        shadow: { type: 'outer', blur: 4, offset: 2, color: '00000012' },
        rectRadius: 0.12
    });

    // Placeholder area
    slide8.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: x + 0.15, y: y + 0.12, w: 4.0, h: 0.85,
        fill: { color: 'E8ECF1' },
        rectRadius: 0.08
    });
    slide8.addText('[ SCREENSHOT ]', {
        x: x + 0.15, y: y + 0.12, w: 4.0, h: 0.85,
        fontSize: 14, color: '999999', fontFace: 'Calibri', align: 'center', valign: 'middle'
    });

    slide8.addText(ss.title, {
        x: x + 0.15, y: y + 1.0, w: 4.0, h: 0.25,
        fontSize: 12, bold: true, color: TEXT_DARK, fontFace: 'Calibri'
    });
    slide8.addText(ss.desc, {
        x: x + 0.15, y: y + 1.2, w: 4.0, h: 0.22,
        fontSize: 9, color: '888888', fontFace: 'Calibri'
    });
});

addFooter(slide8, 8);

// ══════════════════════════════════════════════════════════════
// SLIDE 9 — CONCLUSIONES
// ══════════════════════════════════════════════════════════════
const slide9 = pptx.addSlide();
slide9.background = { fill: LIGHT_BG };
addAccentBar(slide9);
addSectionHeader(slide9, '✅', 'Conclusiones');

const conclusions = [
    { icon: '🏆', title: 'Ciclo completo de usabilidad', desc: 'El sistema cubre desde la planificación hasta el seguimiento de mejoras en una sola plataforma.' },
    { icon: '🎙️', title: 'Integración del guion en la sesión', desc: 'El Modo Guía de Sesión resuelve el problema principal: el moderador ahora tiene el guion visible durante toda la prueba.' },
    { icon: '📊', title: 'Métricas en tiempo real', desc: 'El dashboard centraliza KPIs, distribución de hallazgos y estado de acciones de mejora.' },
    { icon: '🔄', title: 'Mejoras futuras', desc: 'Autenticación de usuarios, exportación de reportes PDF, grabación de sesiones y colaboración en tiempo real.' },
];

conclusions.forEach((c, i) => {
    const y = 1.5 + i * 0.9;

    slide9.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.5, y, w: 9, h: 0.75,
        fill: { color: WHITE },
        shadow: { type: 'outer', blur: 4, offset: 2, color: '00000012' },
        rectRadius: 0.12
    });

    // Left accent bar
    slide9.addShape(pptx.shapes.RECTANGLE, {
        x: 0.5, y, w: 0.05, h: 0.75,
        fill: { color: i === 3 ? AMBER : ACCENT }
    });

    slide9.addText(c.icon, { x: 0.7, y, w: 0.5, h: 0.75, fontSize: 22, valign: 'middle' });
    slide9.addText(c.title, { x: 1.3, y: y + 0.05, w: 8, h: 0.3, fontSize: 14, bold: true, color: TEXT_DARK, fontFace: 'Calibri' });
    slide9.addText(c.desc, { x: 1.3, y: y + 0.35, w: 8, h: 0.35, fontSize: 11, color: '666666', fontFace: 'Calibri' });
});

addFooter(slide9, 9);

// ══════════════════════════════════════════════════════════════
// SLIDE 10 — PREGUNTAS
// ══════════════════════════════════════════════════════════════
const slide10 = pptx.addSlide();
slide10.background = { fill: NAVY };

// Decorative shapes
slide10.addShape(pptx.shapes.OVAL, {
    x: 8, y: -1, w: 3, h: 3,
    fill: { color: ACCENT, transparency: 85 }
});
slide10.addShape(pptx.shapes.OVAL, {
    x: -1.5, y: 4, w: 4, h: 4,
    fill: { color: ACCENT, transparency: 90 }
});

slide10.addText('❓', { x: 3.5, y: 1.2, w: 3, h: 1, fontSize: 64, align: 'center' });

slide10.addText('¿Preguntas?', {
    x: 1, y: 2.3, w: 8, h: 1,
    fontSize: 44, bold: true, color: WHITE, fontFace: 'Calibri',
    align: 'center'
});

slide10.addShape(pptx.shapes.RECTANGLE, {
    x: 3.5, y: 3.4, w: 3, h: 0.04,
    fill: { color: ACCENT }
});

slide10.addText('Gracias por su atención', {
    x: 1, y: 3.7, w: 8, h: 0.5,
    fontSize: 18, color: ACCENT, fontFace: 'Calibri',
    align: 'center'
});

slide10.addText('Usability Test Plan Dashboard — HCI 2026', {
    x: 1, y: 4.4, w: 8, h: 0.4,
    fontSize: 12, color: '8899BB', fontFace: 'Calibri',
    align: 'center'
});

// ── EXPORT ──
const outputPath = './presentacion_hci.pptx';
pptx.writeFile({ fileName: outputPath }).then(() => {
    console.log(`✅ Presentación generada: ${outputPath}`);
}).catch(err => {
    console.error('Error al generar:', err);
});

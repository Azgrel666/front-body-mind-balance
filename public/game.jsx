/* global React, ReactDOM */
const { useState, useMemo, useEffect } = React;

// =================================================================
// LEVELS — 15 preguntas agrupadas en 3 grupos temáticos
// Reducimos a 3 laberintos (uno al final de cada grupo)
// Cada respuesta vale 0–3 → score máximo 45
// =================================================================

const LEVELS = [
  {
    n: "01",
    tag: "Nivel 01",
    title: "Distorsión",
    titleEm: "corporal",
    desc:
      "Reconoce los pensamientos que distorsionan cómo te ves a ti mismo cuando te miras al espejo o en una foto.",
    context:
      "Las siguientes preguntas están relacionadas con la forma en que percibes tu cuerpo. Todas las respuestas son válidas; responde con honestidad.",
    questions: [
      "Paso mucho tiempo del día pensando en defectos de mi apariencia que otras personas dicen no notar.",
      "Siento que algunas partes de mí son deformes, horribles o anormales.",
      "Me preocupa intensamente que mi estructura corporal sea demasiado pequeña o poco musculosa.",
      "Siento que pequeñas imperfecciones en alguna parte de mi cuerpo arruinan mi imagen corporal.",
      "Estoy completamente convencido de que mi cuerpo es deforme, aun cuando me dicen lo contrario.",
    ],
  },
  {
    n: "02",
    tag: "Nivel 02",
    title: "Conductas",
    titleEm: "automáticas",
    desc:
      "Identifica las conductas y hábitos que repites casi sin darte cuenta para revisar, camuflar o evitar a tu cuerpo.",
    context:
      "A continuación, preguntas sobre conductas automáticas y hábitos. Piensa en cómo te has comportado durante el último mes.",
    questions: [
      "Siento la necesidad compulsiva de mirarme a cualquier espejo que encuentre.",
      "Paso demasiado tiempo intentando arreglar o camuflar lo que no me gusta de mi físico.",
      "Trato de ocultar partes de mi cuerpo con maquillaje, ropa o posturas para que nadie las vea.",
      "Mi preocupación por la imagen corporal me genera tanta ansiedad que prefiero evitar reuniones sociales.",
      "He dejado de asistir a clases, el trabajo o a compromisos importantes por no sentirme bien con mi apariencia.",
    ],
  },
  {
    n: "03",
    tag: "Nivel 03",
    title: "Estereotipos",
    titleEm: "y redes sociales",
    desc:
      "Cuestiona los modelos de cuerpo que consumes cada día y los estándares que han pasado a determinar cómo te ves.",
    context:
      "Preguntas relacionadas con estereotipos, comparación y redes sociales. Por favor responda con sinceridad.",
    questions: [
      "Invierto mucho tiempo comparando mi apariencia con la de otras personas (redes sociales, la calle, el gym).",
      "Siento que mi defecto es tan evidente que los demás se burlan o me juzgan por eso.",
      "Siento que mi valor como persona depende totalmente de mi apariencia.",
      "A veces me siento mal cuando alguien me da un cumplido porque siento que no está viendo la realidad.",
      "Busco constantemente en internet productos que me ayuden a mejorar mi apariencia.",
    ],
  },
];

const TOTAL_QUESTIONS = LEVELS.reduce((a, l) => a + l.questions.length, 0); // 15

const ANSWER_OPTIONS = [
  { label: "Nunca", num: "00", value: 0 },
  { label: "A veces", num: "01", value: 1 },
  { label: "Con frecuencia", num: "02", value: 2 },
  { label: "Casi siempre", num: "03", value: 3 },
];

const AVATAR_CATEGORIES = [
  { icon: "F", name: "Forma de la cara" },
  { icon: "O", name: "Ojos" },
  { icon: "N", name: "Nariz" },
  { icon: "C", name: "Cejas" },
  { icon: "L", name: "Labios" },
  { icon: "H", name: "Cabello" },
  { icon: "R", name: "Ropa" },
  { icon: "A", name: "Accesorios" },
];

// =================================================================
// SEMÁFORO — tiers según puntuación total
// =================================================================
const TIERS = {
  g: {
    key: "g",
    color: "#5FAD7A",
    label: "Verde · Equilibrio",
    title: "Hay equilibrio.",
    range: "0 – 15 puntos",
    text:
      "Tus respuestas indican que, por el momento, las preocupaciones sobre tu apariencia no dominan tu vida cotidiana. Es normal tener días en los que no nos sentimos del todo conformes, pero en tu caso parece haber un equilibrio que te permite seguir adelante sin malestar significativo.",
  },
  y: {
    key: "y",
    color: "#E0B458",
    label: "Amarillo · Vale observar",
    title: "Vale la pena observar.",
    range: "16 – 29 puntos",
    text:
      "Las preocupaciones sobre tu imagen aparecen con una frecuencia que merece atención. Puede que estés invirtiendo tiempo o energía mental en \"corregir\" o pensar en ciertos defectos, lo cual podría estar generando desgaste emocional o limitando experiencias sociales.",
  },
  r: {
    key: "r",
    color: "#D4547A",
    label: "Rojo · Acompañamiento",
    title: "Busca acompañamiento.",
    range: "30 – 45 puntos",
    text:
      "Tus respuestas muestran que la preocupación por tu apariencia está generando un malestar intenso y está interfiriendo de manera importante en tu vida (clases, trabajo, relaciones, bienestar). Sentir que tu valor depende de la imagen o evitar actividades por miedo al juicio puede ser agotador. Acompañarte con un profesional es un paso valioso.",
  },
};

function tierForScore(score) {
  if (score <= 15) return TIERS.g;
  if (score <= 29) return TIERS.y;
  return TIERS.r;
}

// =================================================================
// BUILD ORDERED SCREEN LIST
// Flow: splash → avatar → for each level: intro + 5 questions + maze → end
// =================================================================
function buildScreens() {
  const screens = [{ type: "splash" }, { type: "avatar" }];
  let globalQ = 0;
  LEVELS.forEach((lvl, li) => {
    screens.push({ type: "level", level: li });
    lvl.questions.forEach((_, qi) => {
      screens.push({ type: "question", level: li, qIndex: qi, globalQ });
      globalQ += 1;
    });
    screens.push({ type: "maze", level: li });
  });
  screens.push({ type: "end" });
  return screens;
}

// =================================================================
// SCREEN CHROME — top bar + step dots + restart button
// =================================================================
function ScreenChrome({ stageKey, onBack, canGoBack, onRestart, extraLabel, children }) {
  const stages = ["splash", "avatar", "l1", "l2", "l3", "end"];
  const labels = ["INICIO", "AVATAR", "NIVEL 01", "NIVEL 02", "NIVEL 03", "FIN"];
  const currentStage = stages.indexOf(stageKey);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRestart = () => {
    setShowConfirm(false);
    onRestart();
  };

  // On first screen, back button goes to home; otherwise goes back in game
  const handleBack = () => {
    if (!canGoBack) {
      window.location.href = "/";
    } else {
      onBack();
    }
  };

  return (
    <div className="screen-inner">
      <div className="screen-top">
        <div className="screen-top-left">
          {canGoBack ? (
            <>
              <button className="screen-back" onClick={handleBack} aria-label="Atrás">←</button>
              <a href="/" className="screen-home" aria-label="Volver al Home">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </a>
            </>
          ) : (
            <a href="/" className="screen-back-home" aria-label="Volver al Home">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </a>
          )}
        </div>
        <span className="stage-label">
          {labels[currentStage]}
          {extraLabel ? <span style={{ opacity: 0.6 }}> · {extraLabel}</span> : null}
        </span>
        <div className="screen-top-right">
          <div className="step-count">
            {stages.map((_, i) => (
              <span
                key={i}
                className={`step-dot ${i === currentStage ? "active" : ""} ${i < currentStage ? "done" : ""}`}
              ></span>
            ))}
          </div>
          {stageKey !== "splash" && stageKey !== "end" && (
            <button className="restart-btn" onClick={() => setShowConfirm(true)} aria-label="Reiniciar">
              ↺
            </button>
          )}
        </div>
      </div>
      {children}

      {/* Confirm restart dialog */}
      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <p>¿Reiniciar la autoevaluación?</p>
            <span className="confirm-sub">Se perderá todo el progreso actual.</span>
            <div className="confirm-buttons">
              <button className="btn btn-ghost" onClick={() => setShowConfirm(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleRestart}>Reiniciar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =================================================================
// SCREENS
// =================================================================
function Splash({ onNext }) {
  return (
    <>
      <div className="screen-body">
        <div className="splash-logo"><img src="/assets/logo.png" alt="" /></div>
        <span className="eyebrow">Bodymind Balance · Autoevaluación</span>
        <h1>Reconociendo<br /><em>mis pensamientos.</em></h1>
        <p>15 preguntas distribuidas en tres niveles temáticos. Al final, un semáforo te orientará sobre tu relación con tu cuerpo.</p>
        <div className="splash-meta">
          <span>3 NIVELES</span><span className="dot"></span>
          <span>15 PREGUNTAS</span><span className="dot"></span>
          <span>ANÓNIMO</span>
        </div>
      </div>
      <div className="screen-cta">
        <button className="btn btn-primary" onClick={onNext}>Comenzar →</button>
      </div>
    </>
  );
}

function Avatar({ onNext }) {
  return (
    <>
      <div className="screen-body">
        <div className="avatar-stage">
          <div className="avatar-figure">
            <svg viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="28" r="14" stroke="currentColor" strokeWidth="2" />
              <path d="M16 72c0-14 11-22 24-22s24 8 24 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="avatar-name">Tu avatar</span>
          <span className="avatar-status">Pendiente de personalizar</span>
        </div>
        <h2 className="avatar-intro">Antes de empezar,<br /><em>creemos tu avatar.</em></h2>
        <p className="avatar-desc">Personaliza un avatar que te represente. Será tu compañero a través de los tres niveles.</p>
        <div className="avatar-categories">
          {AVATAR_CATEGORIES.map((c, i) => (
            <div key={i} className="avatar-cat">
              <span className="icon"><em style={{ fontStyle: "italic" }}>{c.icon}</em></span>
              <span>{c.name}</span>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(242,237,232,0.45)", marginTop: 8 }}>
          ⚙ Constructor de avatar — próximamente
        </div>
      </div>
      <div className="screen-cta">
        <button className="btn btn-primary" onClick={onNext}>Saltar y comenzar →</button>
      </div>
    </>
  );
}

function Level({ data, onNext }) {
  return (
    <>
      <div className="screen-body">
        <div className="level-big-num">{data.n}</div>
        <div className="level-tag">{data.tag} · 5 preguntas</div>
        <h2 className="level-title">{data.title}<br /><em>{data.titleEm}.</em></h2>
        <p className="level-desc">{data.desc}</p>
        <div className="level-meta">
          <span className="chip"><span className="dot"></span>5 preguntas</span>
          <span className="chip"><span className="dot"></span>1 laberinto</span>
          <span className="chip"><span className="dot"></span>≈ 3 min</span>
        </div>
      </div>
      <div className="screen-cta">
        <button className="btn btn-primary" onClick={onNext}>Empezar nivel →</button>
      </div>
    </>
  );
}

function Question({ data, qIndex, globalQ, selected, onSelect, onNext }) {
  const isFirstOfLevel = qIndex === 0;
  return (
    <>
      <div className="screen-body">
        <div className="q-eyebrow">
          Pregunta {String(globalQ + 1).padStart(2, "0")} / {TOTAL_QUESTIONS} · {data.tag}
        </div>
        {isFirstOfLevel && <div className="q-context">{data.context}</div>}
        <div className="q-text">"{data.questions[qIndex]}"</div>
        <div className="q-options">
          {ANSWER_OPTIONS.map((opt, i) => (
            <button
              key={i}
              className={`q-option ${selected === opt.value ? "selected" : ""}`}
              onClick={() => onSelect(opt.value)}
            >
              <span className="radio"></span>
              <span>{opt.label}</span>
              <span className="label-num">{opt.num}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="screen-cta">
        <button className="btn btn-primary" disabled={selected === null || selected === undefined} onClick={onNext}>
          Continuar →
        </button>
      </div>
    </>
  );
}

// =================================================================
// MAZE DATA — 3 unique mazes, one per level
// Uses pixel-based collision detection with offscreen canvas
// Higher levels = more difficult (more turns, narrower paths)
// =================================================================
const MAZES = [
  // Level 1 — Serpentine with 5 turns (Easy)
  {
    walls: [
      "M0 0 L280 0 L280 280 L0 280 Z", // Border
      "M56 0 L56 168",      // Wall 1
      "M112 112 L112 280",  // Wall 2
      "M168 0 L168 168",    // Wall 3
      "M224 112 L224 280",  // Wall 4
    ],
    start: { x: 28, y: 28 },
    end: { x: 252, y: 252 },
  },
  // Level 2 — Zigzag with tricky forks and dead-ends (Medium)
  {
    walls: [
      "M0 0 L280 0 L280 280 L0 280 Z", // Border
      "M70 0 L70 210",       // Wall 1
      "M140 70 L140 280",    // Wall 2
      "M210 0 L210 210",     // Wall 3
      
      // Horizontal traps and dead-ends
      "M0 140 L40 140",      // Dead end in first column
      "M70 140 L110 140",    // Obstacle forcing zigzag
      "M170 140 L210 140",   // Obstacle in third column
      "M140 70 L180 70",     // Trap in second column (creates a tricky loop)
      "M210 210 L250 210",   // Bottom obstacle
    ],
    start: { x: 35, y: 35 },
    end: { x: 245, y: 245 },
  },
  // Level 3 — Highly winding labyrinth with shortcuts, forks and dead-ends (Hard)
  {
    walls: [
      "M0 0 L280 0 L280 280 L0 280 Z", // Border
      "M46 0 L46 220",       // Wall 1
      "M92 60 L92 280",      // Wall 2
      "M138 0 L138 80",      // Wall 3 Segment A
      "M138 140 L138 220",   // Wall 3 Segment B (leaves a tricky fork/shortcut at y = 80-140)
      "M184 60 L184 160",    // Wall 4 Segment A
      "M184 220 L184 280",   // Wall 4 Segment B (leaves another fork/shortcut at y = 160-220)
      "M230 0 L230 220",     // Wall 5
      
      // Obstacles & Devious Traps
      "M138 240 L184 240",   // Dead-end blocker at bottom of column 4 (punishes shortcut takers!)
      "M0 120 L30 120",      // Obstacle 1
      "M62 80 L92 80",       // Obstacle 2
      "M46 180 L76 180",     // Obstacle 3
      "M108 120 L138 120",   // Obstacle 4
      "M200 120 L230 120",   // Obstacle 5
      "M230 80 L260 80",     // Obstacle 6
      "M250 180 L280 180",   // Obstacle 7
    ],
    start: { x: 23, y: 23 },
    end: { x: 257, y: 257 },
  },
];

function Maze({ data, onNext }) {
  const levelIndex = parseInt(data.n, 10) - 1;
  const mazeData = MAZES[levelIndex] || MAZES[0];

  const canvasRef = React.useRef(null);
  const collisionCanvasRef = React.useRef(null);
  const collisionCtxRef = React.useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [path, setPath] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [startedFromStart, setStartedFromStart] = useState(false);

  const CANVAS_SIZE = 280;
  const START_RADIUS = 25;
  const END_RADIUS = 25;
  const WALL_THICKNESS = 8; // Collision wall thickness

  // Create offscreen collision canvas on mount
  useEffect(() => {
    const offscreen = document.createElement("canvas");
    offscreen.width = CANVAS_SIZE;
    offscreen.height = CANVAS_SIZE;
    collisionCanvasRef.current = offscreen;
    const ctx = offscreen.getContext("2d");
    collisionCtxRef.current = ctx;

    // Fill entire canvas with "valid" color (green)
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw walls in "invalid" color (red) with thick strokes
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = WALL_THICKNESS;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    mazeData.walls.forEach((wallPath) => {
      const path2D = new Path2D(wallPath);
      ctx.stroke(path2D);
    });

    // Also fill outside the border as invalid
    // The border is the first wall path (M0 0 L280 0 L280 280 L0 280 Z)
    // We need to mark outside as invalid - draw thick border
    ctx.lineWidth = WALL_THICKNESS * 2;
    ctx.strokeRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }, [mazeData.walls]);

  // Check if point is in valid area using pixel sampling
  const isInValidZone = (x, y) => {
    const ctx = collisionCtxRef.current;
    if (!ctx) return true; // Fallback to valid if canvas not ready

    // Clamp coordinates to canvas bounds
    const px = Math.max(0, Math.min(CANVAS_SIZE - 1, Math.floor(x)));
    const py = Math.max(0, Math.min(CANVAS_SIZE - 1, Math.floor(y)));

    // Get pixel color at position
    const imageData = ctx.getImageData(px, py, 1, 1);
    const [r, g] = imageData.data;

    // Green = valid, Red = invalid
    return g > r;
  };

  // Check if point is near start
  const isNearStart = (x, y) => {
    const dx = x - mazeData.start.x;
    const dy = y - mazeData.start.y;
    return Math.sqrt(dx * dx + dy * dy) < START_RADIUS;
  };

  // Check if point is near end
  const isNearEnd = (x, y) => {
    const dx = x - mazeData.end.x;
    const dy = y - mazeData.end.y;
    return Math.sqrt(dx * dx + dy * dy) < END_RADIUS;
  };

  // Get coordinates from event
  const getCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Draw the path on canvas
  const drawPath = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (path.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.strokeStyle = failed ? "#D4547A" : completed ? "#5FAD7A" : "#F2EDE8";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }, [path, failed, completed]);

  useEffect(() => {
    drawPath();
  }, [drawPath]);

  const handleStart = (e) => {
    if (completed) return;
    e.preventDefault();
    const coords = getCoords(e);

    if (isNearStart(coords.x, coords.y)) {
      setIsDrawing(true);
      setStartedFromStart(true);
      setPath([coords]);
      setFailed(false);
    }
  };

  const handleMove = (e) => {
    if (!isDrawing || completed) return;
    e.preventDefault();
    const coords = getCoords(e);

    // Check if still in valid zone
    if (!isInValidZone(coords.x, coords.y) && !isNearStart(coords.x, coords.y) && !isNearEnd(coords.x, coords.y)) {
      setFailed(true);
      setIsDrawing(false);
      setTimeout(() => {
        setPath([]);
        setFailed(false);
      }, 800);
      return;
    }

    setPath(prev => [...prev, coords]);

    // Check if reached end
    if (isNearEnd(coords.x, coords.y) && startedFromStart) {
      setCompleted(true);
      setIsDrawing(false);
    }
  };

  const handleEnd = () => {
    if (isDrawing && !completed) {
      setIsDrawing(false);
      if (!completed) {
        setTimeout(() => {
          setPath([]);
        }, 300);
      }
    }
  };

  const resetMaze = () => {
    setPath([]);
    setCompleted(false);
    setFailed(false);
    setStartedFromStart(false);
  };

  return (
    <>
      <div className="screen-body">
        <div className="q-eyebrow" style={{ color: "var(--rosa)" }}>{data.tag} · Laberinto</div>
        <h3 style={{ fontFamily: "var(--display)", fontSize: 32, lineHeight: 1, marginBottom: 8 }}>
          Atraviesa el <em style={{ fontStyle: "italic", color: "var(--rosa)" }}>laberinto.</em>
        </h3>
        <p style={{ color: "rgba(242,237,232,0.65)", fontSize: 14, marginBottom: 8 }}>
          {completed
            ? "¡Excelente! Has completado el laberinto."
            : failed
              ? "¡Ups! Tocaste un muro. Intenta de nuevo."
              : "Arrastra desde el punto rosa hasta el punto crema sin tocar los muros."}
        </p>
        <div className="maze-board" style={{ position: "relative" }}>
          <svg
            className="maze-svg"
            viewBox="0 0 280 280"
            fill="none"
            strokeLinecap="round"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          >
            {/* Valid path zones (debug: uncomment to see) */}
            {/* {mazeData.pathZones.map((zone, i) => (
              <rect key={i} x={zone.x} y={zone.y} width={zone.w} height={zone.h} fill="rgba(95,173,122,0.2)" />
            ))} */}

            {/* Walls */}
            {mazeData.walls.map((wall, i) => (
              <path key={i} d={wall} stroke="rgba(242,237,232,0.3)" strokeWidth="3" fill="none" />
            ))}

            {/* Start point */}
            <circle
              cx={mazeData.start.x}
              cy={mazeData.start.y}
              r="10"
              fill="#D4547A"
              className={!completed && !isDrawing ? "maze-pulse" : ""}
            />
            <circle cx={mazeData.start.x} cy={mazeData.start.y} r="5" fill="#F2EDE8" />

            {/* End point */}
            <circle
              cx={mazeData.end.x}
              cy={mazeData.end.y}
              r="10"
              fill={completed ? "#5FAD7A" : "#F2EDE8"}
            />
            <circle cx={mazeData.end.x} cy={mazeData.end.y} r="5" fill={completed ? "#F2EDE8" : "#D4547A"} />
          </svg>

          {/* Canvas for drawing path */}
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              touchAction: "none",
              cursor: completed ? "default" : "crosshair"
            }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />

          {/* Labels */}
          <div className="maze-start" style={{ left: mazeData.start.x - 30, top: mazeData.start.y + 20 }}>
            <span>Inicio</span>
          </div>
          <div className="maze-end" style={{ left: mazeData.end.x - 20, top: mazeData.end.y - 35 }}>
            <span>Meta</span>
          </div>

          {/* Success overlay */}
          {completed && (
            <div className="maze-success">
              <span className="success-icon">✓</span>
              <span>¡Completado!</span>
            </div>
          )}
        </div>

        {!completed && path.length > 0 && (
          <button
            onClick={resetMaze}
            style={{
              marginTop: 12,
              background: "transparent",
              border: "1px solid rgba(242,237,232,0.3)",
              color: "rgba(242,237,232,0.7)",
              padding: "8px 16px",
              borderRadius: 999,
              fontSize: 12,
              cursor: "pointer"
            }}
          >
            Reiniciar laberinto
          </button>
        )}
      </div>
      <div className="screen-cta">
        <button className="btn btn-primary" onClick={onNext}>
          {completed ? "Continuar →" : "Saltar laberinto →"}
        </button>
      </div>
    </>
  );
}

function End({ answers, onRestart }) {
  const score = answers.reduce((a, b) => a + (b ?? 0), 0);
  const tier = tierForScore(score);

  // Score per level
  const perLevel = LEVELS.map((lvl, li) => {
    let offset = 0;
    for (let i = 0; i < li; i++) offset += LEVELS[i].questions.length;
    const slice = answers.slice(offset, offset + lvl.questions.length);
    return {
      level: lvl,
      score: slice.reduce((a, b) => a + (b ?? 0), 0),
      max: lvl.questions.length * 3,
    };
  });

  return (
    <>
      <div className="screen-body" style={{ justifyContent: "flex-start", paddingTop: 8 }}>
        <span className="eyebrow">Tu resultado</span>

        <div className="result-score-block">
          <div className="result-num">
            {score}<small>/ {TOTAL_QUESTIONS * 3}</small>
          </div>
          <div className={`result-light light-${tier.key}`}>
            <span className="light-dot light-on" style={{ background: tier.color }}></span>
            <div>
              <div className="light-label" style={{ color: tier.color }}>{tier.label}</div>
              <div className="light-range">{tier.range}</div>
            </div>
          </div>
        </div>

        <h1 style={{ marginTop: 24 }}>{tier.title}</h1>
        <p style={{ textAlign: "left", maxWidth: "none" }}>{tier.text}</p>

        <div className="per-level-breakdown">
          {perLevel.map((p, i) => {
            const pct = p.score / p.max;
            const lvlTier = tierForScore(p.score * (45 / 15)); // scale per-level to global tier
            return (
              <div key={i} className="per-level-row">
                <div className="pl-head">
                  <span className="pl-name">{p.level.tag} · {p.level.title}</span>
                  <span className="pl-score">{p.score}<small>/{p.max}</small></span>
                </div>
                <div className="pl-bar">
                  <div className="pl-bar-fill" style={{ width: `${pct * 100}%`, background: lvlTier.color }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="screen-cta" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <a href="/#modulos" className="btn btn-primary">
          {tier.key === "r" ? "Conocer plan Premium →" : "Explorar planes →"}
        </a>
        <button className="btn btn-ghost" onClick={onRestart}>Repetir la autoevaluación</button>
      </div>
    </>
  );
}

// =================================================================
// STORAGE KEYS
// =================================================================
const STORAGE_KEY = "bodymind_game_progress";

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { step, answers } = JSON.parse(saved);
      return { step: step || 0, answers: answers || Array(TOTAL_QUESTIONS).fill(null) };
    }
  } catch (e) {
    console.warn("Could not load progress:", e);
  }
  return { step: 0, answers: Array(TOTAL_QUESTIONS).fill(null) };
}

function saveProgress(step, answers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, answers }));
  } catch (e) {
    console.warn("Could not save progress:", e);
  }
}

function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Could not clear progress:", e);
  }
}

// =================================================================
// APP
// =================================================================
function App() {
  const screens = useMemo(() => buildScreens(), []);

  // Load saved progress on mount
  const [step, setStep] = useState(() => {
    const { step } = loadProgress();
    return step;
  });
  const [answers, setAnswers] = useState(() => {
    const { answers } = loadProgress();
    return answers;
  });

  // Save progress whenever step or answers change (but not on end screen)
  useEffect(() => {
    const s = screens[step];
    if (s && s.type !== "end") {
      saveProgress(step, answers);
    }
  }, [step, answers, screens]);

  // Clear progress when reaching end screen
  useEffect(() => {
    const s = screens[step];
    if (s && s.type === "end") {
      clearProgress();
    }
  }, [step, screens]);

  const go = (n) => setStep(Math.max(0, Math.min(screens.length - 1, n)));
  const next = () => { go(step + 1); window.scrollTo(0, 0); };
  const back = () => { go(step - 1); window.scrollTo(0, 0); };
  const restart = () => {
    clearProgress();
    setAnswers(Array(TOTAL_QUESTIONS).fill(null));
    go(0);
    window.scrollTo(0, 0);
  };

  const s = screens[step];

  // Map screen type → stage key for the progress dots
  const stageKey = (() => {
    if (s.type === "splash") return "splash";
    if (s.type === "avatar") return "avatar";
    if (s.type === "end") return "end";
    return `l${s.level + 1}`;
  })();

  let cls = "screen";
  if (s.type === "splash") cls += " splash";
  if (s.type === "avatar") cls += " avatar-screen";
  if (s.type === "level") cls += " level-screen";
  if (s.type === "question") cls += " question-screen";
  if (s.type === "maze") cls += " maze-screen";
  if (s.type === "end") cls += " end-screen";

  // Toggle light-screen body class for floating exit-link theming
  useEffect(() => {
    document.body.classList.toggle("has-light-screen", s.type === "question");
  }, [s.type]);

  // Extra label for the top bar
  let extraLabel = null;
  if (s.type === "question") extraLabel = `P${String(s.globalQ + 1).padStart(2, "0")}`;

  const handleSelect = (val) => {
    if (s.type !== "question") return;
    const next = [...answers];
    next[s.globalQ] = val;
    setAnswers(next);
  };

  return (
    <>
      <a href="/" className="exit-link">← Volver al Home</a>
      <div className={cls}>
        <ScreenChrome stageKey={stageKey} onBack={back} canGoBack={step > 0} onRestart={restart} extraLabel={extraLabel}>
          {s.type === "splash" && <Splash onNext={next} />}
          {s.type === "avatar" && <Avatar onNext={next} />}
          {s.type === "level" && <Level data={LEVELS[s.level]} onNext={next} />}
          {s.type === "question" && (
            <Question
              data={LEVELS[s.level]}
              qIndex={s.qIndex}
              globalQ={s.globalQ}
              selected={answers[s.globalQ]}
              onSelect={handleSelect}
              onNext={next}
            />
          )}
          {s.type === "maze" && <Maze data={LEVELS[s.level]} onNext={next} />}
          {s.type === "end" && <End answers={answers} onRestart={restart} />}
        </ScreenChrome>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

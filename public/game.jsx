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
    title: "Rituales",
    titleEm: "y evitación",
    desc:
      "Identifica las conductas que repites para revisar, camuflar o evitar a tu cuerpo, y cómo afectan tu día a día.",
    context:
      "A continuación, preguntas sobre rituales y conductas. Piensa en cómo te has comportado durante el último mes.",
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
// SCREEN CHROME — top bar + step dots
// =================================================================
function ScreenChrome({ stageKey, onBack, canGoBack, extraLabel, children }) {
  const stages = ["splash", "avatar", "l1", "l2", "l3", "end"];
  const labels = ["INICIO", "AVATAR", "NIVEL 01", "NIVEL 02", "NIVEL 03", "FIN"];
  const currentStage = stages.indexOf(stageKey);

  return (
    <div className="screen-inner">
      <div className="screen-top">
        <button className="screen-back" onClick={onBack} disabled={!canGoBack} aria-label="Atrás">←</button>
        <span className="stage-label">
          {labels[currentStage]}
          {extraLabel ? <span style={{ opacity: 0.6 }}> · {extraLabel}</span> : null}
        </span>
        <div className="step-count">
          {stages.map((_, i) => (
            <span
              key={i}
              className={`step-dot ${i === currentStage ? "active" : ""} ${i < currentStage ? "done" : ""}`}
            ></span>
          ))}
        </div>
      </div>
      {children}
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

function Maze({ data, onNext }) {
  return (
    <>
      <div className="screen-body">
        <div className="q-eyebrow" style={{ color: "var(--rosa)" }}>{data.tag} · Laberinto</div>
        <h3 style={{ fontFamily: "var(--display)", fontSize: 32, lineHeight: 1, marginBottom: 8 }}>
          Atraviesa el <em style={{ fontStyle: "italic", color: "var(--rosa)" }}>laberinto.</em>
        </h3>
        <p style={{ color: "rgba(242,237,232,0.65)", fontSize: 14, marginBottom: 8 }}>
          Recorre con tu dedo el camino desde el punto rosa hasta el punto crema, sin tocar los muros.
        </p>
        <div className="maze-board">
          <svg className="maze-svg" viewBox="0 0 280 280" fill="none" stroke="rgba(242,237,232,0.25)" strokeWidth="3" strokeLinecap="round">
            <path d="M30 30 L30 90 L90 90 L90 50 L150 50 L150 110 L210 110 L210 50 L250 50" />
            <path d="M30 130 L90 130 L90 190 L30 190 L30 250 L150 250 L150 190 L210 190 L210 250 L250 250" />
            <path d="M150 130 L210 130 L210 170 L250 170 L250 110" />
            <circle cx="40" cy="40" r="6" fill="#D4547A" stroke="none" />
            <circle cx="240" cy="240" r="6" fill="#F2EDE8" stroke="none" />
          </svg>
          <div className="maze-start"><span className="marker"></span><span>Inicio</span></div>
          <div className="maze-end"><span className="marker"></span><span>Final</span></div>
          <div className="maze-overlay">
            <span className="pill">PRÓXIMAMENTE</span>
            <h4>Laberinto<br /><em>táctil.</em></h4>
            <p>Esta mecánica se construirá en la siguiente fase. Tu progreso ya quedó registrado.</p>
          </div>
        </div>
      </div>
      <div className="screen-cta">
        <button className="btn btn-primary" onClick={onNext}>Siguiente →</button>
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
          {tier.key === "r" ? "Conocer plan Premium →" : "Explorar módulos →"}
        </a>
        <button className="btn btn-ghost" onClick={onRestart}>Repetir la autoevaluación</button>
      </div>
    </>
  );
}

// =================================================================
// APP
// =================================================================
function App() {
  const screens = useMemo(() => buildScreens(), []);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(TOTAL_QUESTIONS).fill(null));

  const go = (n) => setStep(Math.max(0, Math.min(screens.length - 1, n)));
  const next = () => { go(step + 1); window.scrollTo(0, 0); };
  const back = () => { go(step - 1); window.scrollTo(0, 0); };
  const restart = () => {
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
      <a href="/" className="exit-link">← Volver al sitio</a>
      <div className={cls}>
        <ScreenChrome stageKey={stageKey} onBack={back} canGoBack={step > 0} extraLabel={extraLabel}>
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

/* global React, ReactDOM */
const { useState } = React;

// =================================================================
// MODULES TOGGLE (Contenido gratuito vs Plan Premium)
// =================================================================
function Modules() {
  const [plan, setPlan] = useState("free"); // free | premium

  const FREE = [
    {
      tag: "APRENDE",
      title: "Trastorno Dismórfico Corporal",
      desc: "Una guía clara, sin estigmas, sobre qué es el TDC, cómo se manifiesta y por qué afecta a jóvenes deportistas.",
      bullets: [],
    },
    {
      tag: "COMUNIDAD",
      title: "Testimonios",
      desc: "Historias reales de personas que vivieron el TDC y encontraron herramientas para reconciliarse con su cuerpo.",
      bullets: ["Verificadas por equipo clínico", "Actualización mensual"],
    },
  ];

  const PREMIUM = [
    {
      tag: "EVALUACIÓN CLÍNICA",
      title: "EDI-3 · STAI · BDQ",
      desc: "Pruebas estandarizadas aplicadas y analizadas por psicólogos para obtener un perfil integral de tu relación con el cuerpo.",
      bullets: ["Informe detallado", "Sesión de devolución", "Confidencial"],
    },
    {
      tag: "TERAPIA INDIVIDUAL",
      title: "Psicólogo · Nutricionista",
      desc: "Sesiones uno-a-uno con profesionales especializados en imagen corporal y deporte. Modalidad virtual o presencial.",
      bullets: ["4 sesiones/mes", "Equipo certificado", "Plan a 12 semanas"],
    },
    {
      tag: "PLAN PERSONALIZADO",
      title: "Entrenamiento · Nutrición",
      desc: "Un plan que prioriza tu bienestar, no la estética. Diseñado por entrenadores y nutricionistas con visión psicológica.",
      bullets: ["Ajuste semanal", "App de seguimiento", "Sin dietas restrictivas"],
    },
  ];

  const items = plan === "free" ? FREE : PREMIUM;

  return (
    <>
      <div className="modulos-toggle">
        <button className={plan === "free" ? "active" : ""} onClick={() => setPlan("free")}>
          Contenido gratuito
        </button>
        <button className={plan === "premium" ? "active" : ""} onClick={() => setPlan("premium")}>
          Plan Premium ✦
        </button>
      </div>

      <div className={`modulos-grid ${plan === "free" ? "two-cols" : ""}`}>
        {items.map((m, i) => (
          <div key={i} className={`module-card ${plan === "premium" ? "premium" : ""}`}>
            <span className="module-num">M.{String(i + 1).padStart(2, "0")}</span>
            <span className={`module-tag ${plan === "free" ? "free" : "prem"}`}>{m.tag}</span>
            <h4>{m.title}</h4>
            <p>{m.desc}</p>
            <ul>
              {m.bullets.map((b, j) => <li key={j}>{b}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

// =================================================================
// MOUNT
// =================================================================
const modulesRoot = document.getElementById("modules-root");
if (modulesRoot) ReactDOM.createRoot(modulesRoot).render(<Modules />);

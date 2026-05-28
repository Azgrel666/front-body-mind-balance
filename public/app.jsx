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
      desc: "Una guía clara, sin estigmas, sobre qué es el TDC, cómo se manifiesta y por qué afecta a jóvenes que realizan actividad física.",
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
      title: "EDI-3 · STAI · BSQ",
      desc: "Pruebas estandarizadas aplicadas y analizadas por psicólogos para obtener un perfil integral de tu relación con el cuerpo.",
      bullets: ["Informe detallado", "Sesión de devolución", "Confidencial"],
    },
    {
      tag: "TERAPIA INDIVIDUAL",
      title: "Psicólogo · Nutricionista",
      desc: "Sesiones uno-a-uno con profesionales especializados en imagen corporal y deporte. Modalidad virtual o presencial.",
      bullets: ["4 sesiones/mes", "Equipo certificado"],
    },
    {
      tag: "PLAN PERSONALIZADO",
      title: "Entrenamiento · Nutrición",
      desc: "Un plan que prioriza tu bienestar, no la estética. Diseñado por entrenadores y nutricionistas con visión psicológica.",
      bullets: ["Ajuste semanal", "Sin dietas restrictivas"],
    },
  ];

  const PLANS = {
    amarillo: {
      label: "Amarillo · Sintomas de alerta",
      color: "#E0B458",
      plans: [
        { name: "Plan Mensual", price: "300.000", period: "mes" },
      ],
    },
    rojo: {
      label: "Rojo · Alta sospecha de TDC",
      color: "#D4547A",
      plans: [
        { name: "Plan Mensual", price: "400.000", period: "mes" },
        { name: "Plan Semestral", price: "1.450.000", period: "semestre" },
      ],
    },
  };

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

      {plan === "premium" && (
        <div className="plans-pricing-grouped">
          {Object.entries(PLANS).map(([key, group]) => (
            <div key={key} className="plan-group">
              <div className="plan-group-label" style={{ color: group.color }}>
                {group.label}
              </div>
              <div className="plan-group-cards">
                {group.plans.map((p, i) => (
                  <div key={i} className="plan-price-card">
                    <span className="plan-name">{p.name}</span>
                    <div className="plan-price">
                      <span className="price-symbol">$</span>
                      <span className="price-amount">{p.price}</span>
                      <span className="price-period">COP / {p.period}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={`modulos-grid ${plan === "free" ? "two-cols" : ""}`}>
        {items.map((m, i) => (
          <div key={i} className={`module-card ${plan === "premium" ? "premium" : ""}`}>
            <span className="module-num">M.{String(i + 1).padStart(2, "0")}</span>
            <span className={`module-tag ${plan === "free" ? "free" : "prem"}`}>{m.tag}</span>
            <h4>{m.title}</h4>
            <p>{m.desc}</p>
            {m.bullets.length > 0 && (
              <ul>
                {m.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            )}
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

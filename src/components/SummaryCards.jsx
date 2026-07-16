import { LayersIcon } from "./Icons.jsx";

// Headline stat tile. `count` is the number of teacher-corrected exams shown
// (student self-exams are already excluded upstream).
export default function SummaryCards({ count, hasData, loading }) {
  const cards = [
    {
      key: "exams",
      icon: <LayersIcon size={19} />,
      label: "Total exams",
      value: hasData ? Number(count || 0).toLocaleString() : "—",
      sub: "matching current filters",
      accent: "indigo",
    },
  ];

  return (
    <div className={`kpi-row ${loading ? "is-loading" : ""}`}>
      {cards.map((c) => (
        <article key={c.key} className={`kpi-card accent-${c.accent}`}>
          <div className="kpi-top">
            <span className="kpi-icon">{c.icon}</span>
            <span className="kpi-label">{c.label}</span>
          </div>
          <div className="kpi-value">{c.value}</div>
          <div className="kpi-sub">{c.sub}</div>
        </article>
      ))}
    </div>
  );
}

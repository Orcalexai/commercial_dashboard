import { LayersIcon, UsersIcon, CoinsIcon } from "./Icons.jsx";
import { formatInr } from "../utils/format.js";

// Headline stat tiles for the current visible result set.
export default function SummaryCards({ count, hasData, loading, totals }) {
  const cards = [
    {
      key: "exams",
      icon: <LayersIcon size={19} />,
      label: "Total exams",
      value: hasData ? Number(count || 0).toLocaleString() : "-",
      accent: "indigo",
    },
    {
      key: "bucket-1-10",
      icon: <UsersIcon size={19} />,
      label: "1-10 pages",
      value: hasData ? Number(totals?.b1to10 || 0).toLocaleString() : "-",
      accent: "violet",
    },
    {
      key: "bucket-11-20",
      icon: <UsersIcon size={19} />,
      label: "11-20 pages",
      value: hasData ? Number(totals?.b11to20 || 0).toLocaleString() : "-",
      accent: "teal",
    },
    {
      key: "bucket-21-30",
      icon: <UsersIcon size={19} />,
      label: "21-30 pages",
      value: hasData ? Number(totals?.b21to30 || 0).toLocaleString() : "-",
      accent: "warn",
    },
    {
      key: "bucket-gt-30",
      icon: <UsersIcon size={19} />,
      label: "> 30 pages",
      value: hasData ? Number(totals?.above30 || 0).toLocaleString() : "-",
      accent: "bad",
    },
    {
      key: "total-price",
      icon: <CoinsIcon size={19} />,
      label: "Total cost",
      value: hasData ? formatInr(totals?.totalPrice || 0) : "-",
      accent: "ok",
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
        </article>
      ))}
    </div>
  );
}

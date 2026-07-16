import MetadataRow from "./MetadataRow.jsx";

const COLUMNS = [
  { label: "", cls: "col-expand" },
  { label: "Exam" },
  { label: "Teacher" },
  { label: "School" },
  { label: "Section" },
  { label: "Processed" },
  { label: "Students evaluated", cls: "num" },
  { label: "Total pages", cls: "num" },
  { label: "< 5 pages (₹5)", cls: "num" },
  { label: "5–15 pages (₹10)", cls: "num" },
  { label: "> 15 pages (₹15)", cls: "num" },
  { label: "Total price", cls: "num" },
];

function SkeletonRows({ rows }) {
  return Array.from({ length: rows }).map((_, r) => (
    <tr key={r} className="skeleton-row">
      {COLUMNS.map((c, i) => (
        <td key={i} className={c.cls || ""}>
          <span className={`sk ${i === 0 ? "short" : c.cls === "num" ? "short" : "w-80"}`} />
        </td>
      ))}
    </tr>
  ));
}

export default function MetadataTable({ results, loading, pageSize = 6 }) {
  const showSkeleton = loading && results.length === 0;

  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="metadata-table">
          <thead>
            <tr>
              {COLUMNS.map((col, i) => (
                <th key={i} className={col.cls || ""}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {showSkeleton && <SkeletonRows rows={Math.min(pageSize, 8)} />}

            {!showSkeleton && results.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="empty-cell">
                  <div className="empty-title">No records found</div>
                  <div>No exam correction metadata matches these filters.</div>
                </td>
              </tr>
            )}

            {!showSkeleton &&
              results.map((item) => <MetadataRow key={item.id} item={item} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

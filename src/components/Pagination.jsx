import { ChevronIcon } from "./Icons.jsx";

// Page-number pagination. `next` / `previous` are relative URLs returned by the
// API and must be called exactly as returned, so we hand them straight back up.
export default function Pagination({ count, pageSize, next, previous, onNavigate, loading }) {
  const totalPages = pageSize ? Math.max(1, Math.ceil(count / pageSize)) : 1;

  return (
    <div className="pagination">
      <span className="pagination-info">
        <b>{count.toLocaleString()}</b> record{count === 1 ? "" : "s"} ·{" "}
        <b>{totalPages}</b> page{totalPages === 1 ? "" : "s"}
      </span>
      <div className="pagination-buttons">
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => onNavigate(previous)}
          disabled={!previous || loading}
        >
          <ChevronIcon size={15} style={{ transform: "rotate(180deg)" }} />
          Previous
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => onNavigate(next)}
          disabled={!next || loading}
        >
          Next
          <ChevronIcon size={15} />
        </button>
      </div>
    </div>
  );
}

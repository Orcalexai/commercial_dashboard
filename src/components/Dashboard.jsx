import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchExamMetadata } from "../api/client.js";
import { excludeHiddenExams } from "../utils/filters.js";
import FilterBar from "./FilterBar.jsx";
import SummaryCards from "./SummaryCards.jsx";
import MetadataTable from "./MetadataTable.jsx";
import Pagination from "./Pagination.jsx";
import { LogoutIcon, AlertIcon } from "./Icons.jsx";

// Admin audit dashboard for the Exam Correction Metadata API.
export default function Dashboard() {
  const { username, logout } = useAuth();

  const [page, setPage] = useState(null); // { count, next, previous, page_size, results }
  const [filters, setFilters] = useState({ page_size: "20" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load a page either from a filter object or from a next/previous URL.
  const load = useCallback(async (paramsOrUrl) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExamMetadata(paramsOrUrl);
      setPage(data);
    } catch (err) {
      if (err.status === 403) {
        setError("Only admin users can access exam correction metadata (403).");
      } else {
        setError(err.message || "Failed to load metadata.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load.
  useEffect(() => {
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleApply(values) {
    setFilters(values);
    load(values); // Filter change => restart from base endpoint with new params.
  }

  const initials = (username || "?").slice(0, 2).toUpperCase();

  // Hide student self-exams and HPS records client-side when the API returns them.
  const results = excludeHiddenExams(page?.results || []);
  // When everything fits on one page, the filtered length is the true total.
  // Across multiple pages the exact filtered total is unknown server-side, so
  // we fall back to the API's count.
  const isSinglePage = page ? !page.next && !page.previous : true;
  const examCount = page ? (isSinglePage ? results.length : page.count || 0) : 0;
  const pageSize = Number(page?.page_size) || Number(filters.page_size) || 20;

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="brand">
          <div>
            <div className="brand-title">Correction Console</div>
            <div className="brand-sub">Exam correction</div>
          </div>
        </div>
        <div className="topbar-right">
          {username && (
            <span className="user-chip">
              {username}
              <span className="user-avatar">{initials}</span>
            </span>
          )}
          <button className="btn btn-ghost icon-btn" onClick={logout} title="Sign out">
            <LogoutIcon size={17} />
          </button>
        </div>
      </header>

      <div className="page">
        <div className="page-head">
          <h1 className="page-title">Exam Correction</h1>
        </div>

        <main className="main">
          <SummaryCards count={examCount} hasData={!!page} loading={loading} />

          <FilterBar onApply={handleApply} loading={loading} />

          {error && (
            <div className="alert alert-error">
              <AlertIcon size={18} />
              <span>{error}</span>
            </div>
          )}

          <MetadataTable results={results} loading={loading} pageSize={pageSize} />

          {page && (
            <Pagination
              count={examCount}
              pageSize={pageSize}
              next={page.next}
              previous={page.previous}
              onNavigate={(url) => url && load(url)}
              loading={loading}
            />
          )}
        </main>
      </div>
    </div>
  );
}

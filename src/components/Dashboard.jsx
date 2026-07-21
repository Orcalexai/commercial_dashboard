import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchExamMetadata } from "../api/client.js";
import { excludeHiddenExams } from "../utils/filters.js";
import FilterBar from "./FilterBar.jsx";
import SummaryCards from "./SummaryCards.jsx";
import MetadataTable from "./MetadataTable.jsx";
import Pagination from "./Pagination.jsx";
import { LogoutIcon, AlertIcon } from "./Icons.jsx";
import { pageStats } from "./MetadataRow.jsx";

const EMPTY_TOTALS = {
  b1to10: 0,
  b11to20: 0,
  b21to30: 0,
  above30: 0,
  totalPrice: 0,
};

const SUMMARY_PAGE_SIZE = "500";

function aggregateStats(results) {
  return results.reduce(
    (acc, item) => {
      const stats = pageStats(item);
      if (!stats.hasData) return acc;

      acc.b1to10 += stats.b1to10;
      acc.b11to20 += stats.b11to20;
      acc.b21to30 += stats.b21to30;
      acc.above30 += stats.above30;
      acc.totalPrice += stats.totalPrice;
      return acc;
    },
    { ...EMPTY_TOTALS }
  );
}

function buildSummaryParams(values) {
  return {
    ...values,
    page_size: SUMMARY_PAGE_SIZE,
  };
}

async function fetchSummaryAcrossAllPages(initialParams) {
  const firstPage = await fetchExamMetadata(initialParams);
  const allResults = [...excludeHiddenExams(firstPage?.results || [])];

  let nextUrl = firstPage?.next;
  while (nextUrl) {
    const nextPage = await fetchExamMetadata(nextUrl);
    allResults.push(...excludeHiddenExams(nextPage?.results || []));
    nextUrl = nextPage?.next;
  }

  return {
    count: allResults.length,
    totals: aggregateStats(allResults),
  };
}

// Admin audit dashboard for the Exam Correction Metadata API.
export default function Dashboard() {
  const { username, logout } = useAuth();
  const requestIdRef = useRef(0);

  const [page, setPage] = useState(null); // { count, next, previous, page_size, results }
  const [filters, setFilters] = useState({ page_size: "20" });
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ count: 0, totals: EMPTY_TOTALS });

  const loadPageOnly = useCallback(async (paramsOrUrl) => {
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

  const loadWithSummary = useCallback(async (values) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setSummaryLoading(true);
    setError(null);

    try {
      const pagePromise = fetchExamMetadata(values);
      const summaryPromise = fetchSummaryAcrossAllPages(buildSummaryParams(values));

      const firstPage = await pagePromise;
      if (requestIdRef.current !== requestId) return;

      setPage(firstPage);
      setLoading(false);

      const nextSummary = await summaryPromise;
      if (requestIdRef.current !== requestId) return;

      setSummary(nextSummary);
    } catch (err) {
      if (requestIdRef.current !== requestId) return;
      if (err.status === 403) {
        setError("Only admin users can access exam correction metadata (403).");
      } else {
        setError(err.message || "Failed to load metadata.");
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
        setSummaryLoading(false);
      }
    }
  }, []);

  // Initial load.
  useEffect(() => {
    loadWithSummary(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleApply(values) {
    setFilters(values);
    loadWithSummary(values);
  }

  const initials = (username || "?").slice(0, 2).toUpperCase();

  // Hide student self-exams and HPS records client-side when the API returns them.
  const results = excludeHiddenExams(page?.results || []);
  const examCount = summary.count;
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
          <SummaryCards
            count={examCount}
            hasData={!!page && !summaryLoading}
            loading={summaryLoading}
            totals={summary.totals}
          />

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
              count={examCount || results.length}
              pageSize={pageSize}
              next={page.next}
              previous={page.previous}
              onNavigate={(url) => url && loadPageOnly(url)}
              loading={loading}
            />
          )}
        </main>
      </div>
    </div>
  );
}

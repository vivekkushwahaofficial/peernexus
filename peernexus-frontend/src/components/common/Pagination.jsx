import React from "react";

export function Pagination({ pageData, onPageChange }) {
  if (!pageData) return null;

  const { totalPages, number: currentPage, first, last } = pageData;

  // Don't show pagination if there's only 1 page
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(0, currentPage - 2);
  let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(0, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      {/* First Page */}
      <button
        onClick={() => onPageChange(0)}
        disabled={first}
        className="flex items-center justify-center w-8 h-8 rounded-full border border-ink/10 hover:bg-ink/5 disabled:opacity-30 disabled:hover:bg-transparent transition text-ink text-sm"
        aria-label="First page"
      >
        &laquo;
      </button>

      {/* Prev Page */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={first}
        className="flex items-center justify-center w-8 h-8 rounded-full border border-ink/10 hover:bg-ink/5 disabled:opacity-30 disabled:hover:bg-transparent transition text-ink text-sm"
        aria-label="Previous page"
      >
        &lsaquo;
      </button>

      {/* Page Numbers */}
      {startPage > 0 && <span className="text-ink/40 px-1 text-sm">...</span>}

      {pageNumbers.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-full text-sm font-semibold transition ${
            currentPage === p
              ? "bg-accent text-white"
              : "border border-ink/10 hover:bg-ink/5 text-ink"
          }`}
        >
          {p + 1}
        </button>
      ))}

      {endPage < totalPages - 1 && <span className="text-ink/40 px-1 text-sm">...</span>}

      {/* Next Page */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={last}
        className="flex items-center justify-center w-8 h-8 rounded-full border border-ink/10 hover:bg-ink/5 disabled:opacity-30 disabled:hover:bg-transparent transition text-ink text-sm"
        aria-label="Next page"
      >
        &rsaquo;
      </button>

      {/* Last Page */}
      <button
        onClick={() => onPageChange(totalPages - 1)}
        disabled={last}
        className="flex items-center justify-center w-8 h-8 rounded-full border border-ink/10 hover:bg-ink/5 disabled:opacity-30 disabled:hover:bg-transparent transition text-ink text-sm"
        aria-label="Last page"
      >
        &raquo;
      </button>
    </div>
  );
}

export default Pagination;

import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useDoubts, useDoubtsByCategory, useDoubtSearch } from "../../hooks/useDoubts.js";
import DoubtCard from "../../components/common/DoubtCard.jsx";
import { DoubtCardSkeleton } from "../../components/common/Skeleton.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";

const CATEGORIES = [
  { id: "", name: "All Topics" },
  { id: "1", name: "Java" },
  { id: "2", name: "Spring Boot" },
  { id: "3", name: "React" },
  { id: "4", name: "DSA" },
  { id: "5", name: "DBMS" },
  { id: "6", name: "Operating Systems" },
  { id: "7", name: "Computer Networks" },
  { id: "8", name: "OOP" },
  { id: "9", name: "Aptitude" },
  { id: "10", name: "Interview Preparation" },
];

export function DoubtFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamQuery = searchParams.get("search") || "";
  
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [searchVal, setSearchVal] = useState(searchParamQuery);
  const [submittedQuery, setSubmittedQuery] = useState(searchParamQuery);
  const [page, setPage] = useState(0);

  // Sync search input if URL changes
  useEffect(() => {
    setSearchVal(searchParamQuery);
    setSubmittedQuery(searchParamQuery);
  }, [searchParamQuery]);

  // Handle queries based on selected filters
  const params = { page, size: 10, sort: "createdAt,desc" };

  const isSearching = Boolean(submittedQuery.trim());
  const isFiltered = Boolean(activeCategoryId);

  // Determine query parameters hook with conditional execution
  const { data: searchData, isLoading: searchLoading } = useDoubtSearch(submittedQuery, params, {
    enabled: isSearching,
  });
  const { data: categoryData, isLoading: categoryLoading } = useDoubtsByCategory(activeCategoryId, params, {
    enabled: isFiltered && !isSearching,
  });
  const { data: allData, isLoading: allLoading } = useDoubts(params, {
    enabled: !isSearching && !isFiltered,
  });

  const activeData = isSearching
    ? searchData
    : isFiltered
    ? categoryData
    : allData;

  const isLoading = isSearching
    ? searchLoading
    : isFiltered
    ? categoryLoading
    : allLoading;

  const doubts = activeData?.content || [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    setSubmittedQuery(searchVal);
    setSearchParams(searchVal.trim() ? { search: searchVal.trim() } : {});
  };

  const handleCategorySelect = (id) => {
    setPage(0);
    setSearchVal("");
    setSubmittedQuery("");
    setSearchParams({});
    setActiveCategoryId(id);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink font-display">Doubt Forum</h1>
          <p className="text-xs text-ink/40 mt-1">Get verified solutions and search peer questions.</p>
        </div>

        <Link to="/doubts/new">
          <Button variant="primary">Post a Doubt</Button>
        </Link>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search questions, keywords, or error codes..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3 pl-11 text-sm text-ink placeholder:text-ink/30 outline-none transition-all duration-200 focus:border-accent/80 focus:ring-4 focus:ring-accent/10 shadow-[0_2px_8px_rgba(16,21,26,0.02)]"
          />
          <svg className="w-5 h-5 text-ink/30 absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Button type="submit" variant="secondary" className="px-5">
          Search
        </Button>
      </form>

      {/* Category Pills Slider */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategoryId === cat.id && !isSearching;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                isActive
                  ? "bg-accent text-white border-accent shadow-sm"
                  : "bg-white text-ink/60 border-ink/5 hover:bg-slate-50 hover:text-ink hover:border-ink/10"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Doubts List Feed */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <DoubtCardSkeleton />
          <DoubtCardSkeleton />
          <DoubtCardSkeleton />
        </div>
      ) : doubts.length === 0 ? (
        <EmptyState
          title="No doubts found"
          description="We couldn't find any questions matching your selection. Try checking other categories or post your own question!"
          actionText="Post a Doubt"
          onAction={() => handleCategorySelect("")}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {doubts.map((doubt) => (
            <DoubtCard key={doubt.id} doubt={doubt} />
          ))}

          <Pagination pageData={activeData} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
}

export default DoubtFeed;

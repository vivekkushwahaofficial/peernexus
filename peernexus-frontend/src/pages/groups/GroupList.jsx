import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGroups, useSearchGroups, useMyGroups, useJoinGroup, useRequestToJoinGroup } from "../../hooks/useGroups.js";
import { useToast } from "../../hooks/useToast.js";
import GroupCard from "../../components/groups/GroupCard.jsx";
import { DoubtCardSkeleton } from "../../components/common/Skeleton.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";

export function GroupList() {
  const toast = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all"); // "all" | "my"
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [page, setPage] = useState(0);

  const params = { page, size: 12 };

  // Queries
  const isSearching = Boolean(submittedQuery.trim());
  const { data: searchPage, isLoading: searchLoading } = useSearchGroups(submittedQuery, params);
  const { data: myPage, isLoading: myLoading } = useMyGroups(params);
  const { data: allPage, isLoading: allLoading } = useGroups(params);

  // Mutations
  const joinGroupMutation = useJoinGroup();
  const joinRequestMutation = useRequestToJoinGroup();

  const handleJoinGroup = async (groupId, isPrivate) => {
    try {
      if (isPrivate) {
        const message = window.prompt("Enter an optional message for your request to join:");
        if (message === null) return; // cancelled prompt
        await joinRequestMutation.mutateAsync({ message });
        toast.success("Join request submitted to group admins!");
      } else {
        await joinGroupMutation.mutateAsync(groupId);
        toast.success("Successfully joined the study group!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to join group");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    setSubmittedQuery(searchQuery);
  };

  const isLoading = isSearching
    ? searchLoading
    : activeTab === "my"
    ? myLoading
    : allLoading;

  const activePageData = isSearching
    ? searchPage
    : activeTab === "my"
    ? myPage
    : allPage;

  const groups = activePageData?.content || [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink font-display">Study Groups</h1>
          <p className="text-xs text-ink/50 mt-1">Join specialized peer sub-communities to study together.</p>
        </div>

        <Link to="/groups/new">
          <Button variant="primary">Create Study Group</Button>
        </Link>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search study groups by topic or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 pl-11 text-sm text-ink placeholder:text-ink/40 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15 shadow-sm"
          />
          <svg className="w-5 h-5 text-ink/40 absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Button type="submit" variant="secondary" className="px-5">
          Search
        </Button>
      </form>

      {/* Tabs */}
      {!isSearching && (
        <div className="flex border-b border-ink/8">
          <button
            onClick={() => {
              setActiveTab("all");
              setPage(0);
            }}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "all"
                ? "border-accent text-accent"
                : "border-transparent text-ink/50 hover:text-ink"
            }`}
          >
            All Groups
          </button>
          <button
            onClick={() => {
              setActiveTab("my");
              setPage(0);
            }}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "my"
                ? "border-accent text-accent"
                : "border-transparent text-ink/50 hover:text-ink"
            }`}
          >
            My Groups
          </button>
        </div>
      )}

      {/* Group Grid List */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="h-64 animate-pulse bg-ink/5 rounded-2xl" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          title={isSearching ? "No groups found" : "No study groups yet"}
          description={
            isSearching
              ? "We couldn't find any groups matching your query. Try a different topic."
              : activeTab === "my"
              ? "You haven't joined any study groups yet. Explore available groups to get started!"
              : "No study groups have been created yet."
          }
          actionText={!isSearching && activeTab === "my" ? "Explore Groups" : "Create Group"}
          onAction={() => {
            if (activeTab === "my" && !isSearching) {
              setActiveTab("all");
            } else {
              navigate("/groups/new");
            }
          }}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onJoin={handleJoinGroup}
                joining={joinGroupMutation.isPending || joinRequestMutation.isPending}
              />
            ))}
          </div>

          <Pagination pageData={activePageData} onPageChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );
}

export default GroupList;

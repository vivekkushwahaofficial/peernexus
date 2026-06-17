import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLeaderboard } from "../../hooks/useReputation.js";
import Avatar from "../../components/common/Avatar.jsx";
import Badge from "../../components/common/Badge.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export function Leaderboard() {
  const [page, setPage] = useState(0);
  const { data: leaderboardPage, isLoading } = useLeaderboard({ page, size: 20 });

  const entries = leaderboardPage?.content || [];

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-ink font-display">Student Leaderboard</h1>
        <p className="text-xs text-ink/40 mt-1">
          Explore top active students ranked by reputation points.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          title="No entries found"
          description="Leaderboard data is currently empty. Ask or answer doubts to start earning points!"
        />
      ) : (
        <div className="card overflow-hidden bg-white shadow-sm border border-ink/5 flex flex-col">
          <div className="flex flex-col">
            {entries.map((entry, index) => {
              const rank = page * 20 + index + 1;
              return (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between p-4 border-b border-ink/5 last:border-0 hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Rank indicator */}
                    <div className="w-8 text-center font-bold text-sm text-ink/30 shrink-0">
                      {rank === 1 ? (
                        <span className="text-lg">🥇</span>
                      ) : rank === 2 ? (
                        <span className="text-lg">🥈</span>
                      ) : rank === 3 ? (
                        <span className="text-lg">🥉</span>
                      ) : (
                        `#${rank}`
                      )}
                    </div>

                    <Link to={`/profile/${entry.userId}`} className="flex items-center gap-3 min-w-0">
                      <Avatar name={entry.userName} size="sm" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-ink truncate leading-tight">
                          {entry.userName}
                        </span>
                        <span className="text-[9px] text-ink/40 font-bold uppercase tracking-wider mt-1">
                          Level: {entry.reputationLevel || "Beginner"}
                        </span>
                      </div>
                    </Link>
                  </div>

                  <span className="font-bold text-accent bg-accent/8 border border-transparent px-3 py-1 rounded-xl text-xs shrink-0 select-none">
                    {entry.reputationPoints} pts
                  </span>
                </div>
              );
            })}
          </div>

          <Pagination pageData={leaderboardPage} onPageChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );
}

export default Leaderboard;

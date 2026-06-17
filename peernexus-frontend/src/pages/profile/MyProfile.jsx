import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useMyReputation, useReputationHistory } from "../../hooks/useReputation.js";
import Avatar from "../../components/common/Avatar.jsx";
import Badge, { RoleBadge } from "../../components/common/Badge.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import Button from "../../components/common/Button.jsx";

export function MyProfile() {
  const { user } = useAuth();
  const { data: repSummary, isLoading: summaryLoading } = useMyReputation();
  const { data: repHistory, isLoading: historyLoading } = useReputationHistory({ page: 0, size: 5, sort: "createdAt,desc" });

  const formatDate = (isoStr) => {
    if (!isoStr) return "";
    return new Date(isoStr).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const parseTags = (commaString) => {
    if (!commaString) return [];
    return commaString.split(",").map((s) => s.trim()).filter(Boolean);
  };

  const skills = parseTags(user?.skills);
  const interests = parseTags(user?.interests);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto animate-fade-in">
      {/* Upper Info Box */}
      <div className="card p-6 sm:p-8 bg-white flex flex-col sm:flex-row gap-6 items-center sm:items-start relative border border-ink/5 shadow-sm">
        <Avatar name={user?.name} size="xl" className="shadow-md border-2 border-white ring-4 ring-ink/[0.03]" />

        <div className="flex-1 flex flex-col gap-3 text-center sm:text-left min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-xl font-bold text-ink truncate leading-tight font-display">
              {user?.name}
            </h1>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <RoleBadge role={user?.role} />
              {user?.verified && (
                <svg className="w-4.5 h-4.5 text-accent shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>

          <p className="text-xs text-ink/40 font-medium leading-none">{user?.email}</p>

          <p className="text-sm text-ink/60 leading-relaxed break-words">
            {user?.bio || "No biography provided. Tell the student community about yourself!"}
          </p>

          <div className="flex flex-wrap gap-4 mt-1 justify-center sm:justify-start text-xs font-bold text-ink/50">
            <span className="flex items-center gap-1.5">
              <span className="text-accent text-sm font-black">
                {repSummary?.totalPoints || user?.reputationPoints || 0}
              </span>{" "}
              Reputation
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              Level: <Badge variant="primary">{repSummary?.level || user?.reputationLevel || "Beginner"}</Badge>
            </span>
            <span className="text-[10px] text-ink/30 font-medium">Joined {formatDate(user?.createdAt)}</span>
          </div>
        </div>

        <div className="sm:absolute sm:top-6 sm:right-6 shrink-0 mt-3 sm:mt-0 w-full sm:w-auto flex justify-center">
          <Link to="/profile/edit" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto font-bold text-xs px-5">Edit Profile</Button>
          </Link>
        </div>
      </div>

      {/* Skills & Interests grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6 bg-white border border-ink/5 shadow-sm">
          <h3 className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-4">Skills</h3>
          {skills.length === 0 ? (
            <p className="text-xs text-ink/40 italic">No skills listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span key={idx} className="text-xs font-semibold text-ink/70 bg-ink/5 border border-transparent px-3 py-1 rounded-xl hover:bg-ink/8 transition-colors duration-150 cursor-default">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6 bg-white border border-ink/5 shadow-sm">
          <h3 className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-4">Interests</h3>
          {interests.length === 0 ? (
            <p className="text-xs text-ink/40 italic">No interests listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {interests.map((s, idx) => (
                <span key={idx} className="text-xs font-semibold text-accent bg-accent/8 border border-transparent px-3 py-1 rounded-xl hover:bg-accent/12 transition-colors duration-150 cursor-default">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reputation Ledger / Transaction History */}
      <div className="card p-6 bg-white border border-ink/5 shadow-sm flex flex-col gap-4">
        <h3 className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-1">Reputation Ledger</h3>

        {historyLoading ? (
          <div className="flex justify-center py-6">
            <Spinner size="md" />
          </div>
        ) : !repHistory || repHistory.content?.length === 0 ? (
          <p className="text-xs text-ink/40 italic py-2 text-center">No reputation transactions recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {repHistory.content.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center text-xs py-2 border-b border-ink/5 last:border-0">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-ink/80">{tx.description || "Activity Reward"}</span>
                  <span className="text-[10px] text-ink/40">{formatDate(tx.createdAt)}</span>
                </div>
                <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${tx.points >= 0 ? "text-success bg-success/5 border border-success/10" : "text-error bg-error/5 border border-error/10"}`}>
                  {tx.points >= 0 ? `+${tx.points}` : tx.points} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyProfile;

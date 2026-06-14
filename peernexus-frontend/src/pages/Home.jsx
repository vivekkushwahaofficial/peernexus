import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useDoubts } from "../hooks/useDoubts.js";
import { useLeaderboard } from "../hooks/useReputation.js";
import DoubtCard from "../components/common/DoubtCard.jsx";
import { DoubtCardSkeleton } from "../components/common/Skeleton.jsx";
import Avatar from "../components/common/Avatar.jsx";
import Button from "../components/common/Button.jsx";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const { data: doubtsPage, isLoading: doubtsLoading } = useDoubts(
    { size: 5, sort: "createdAt,desc" },
    { enabled: isAuthenticated }
  );
  const { data: leaderboardPage, isLoading: leaderboardLoading } = useLeaderboard(
    { size: 5 },
    { enabled: isAuthenticated }
  );

  const doubts = doubtsPage?.content || [];
  const leaders = leaderboardPage?.content || [];

  if (!isAuthenticated) {
    // Premium Landing Page for Unauthenticated Users
    return (
      <section className="mx-auto max-w-6xl py-12 md:py-20 animate-fade-in">
        <div className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="flex flex-col gap-6">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-ember">
              Student Community Platform
            </span>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight text-ink font-display">
              Learn faster with <span className="text-accent">trusted peers</span>, study groups, and real answers.
            </h1>
            <p className="text-base text-ink/60 leading-relaxed max-w-lg">
              PeerNexus is a student-first academic collaboration network. Post doubts, get verified solutions, earn reputation points, and chat in real-time study rooms.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link to="/register">
                <Button variant="primary" size="lg">
                  Join PeerNexus
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Explore Doubts
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual card */}
          <div className="rounded-3xl border border-ink/8 bg-white p-8 shadow-xl flex flex-col gap-6">
            <h2 className="text-lg font-bold text-ink font-display">Active Platform Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-ink/5">
                <span className="text-2xl font-black text-accent">98%</span>
                <span className="text-[10px] font-semibold text-ink/40 uppercase tracking-wider mt-1">Doubt Resolution</span>
              </div>
              <div className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-ink/5">
                <span className="text-2xl font-black text-ember">1.2k+</span>
                <span className="text-[10px] font-semibold text-ink/40 uppercase tracking-wider mt-1">Verified Students</span>
              </div>
            </div>
            <ul className="space-y-3.5 text-xs text-ink/75 font-medium border-t border-ink/8 pt-4">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Reputation based user gamification</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Sub-communities (Study Groups) & Live Chat</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Academic Moderation & Audit Logs</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

  // Dashboard Page for Logged In Users
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px] animate-fade-in">
      {/* Left side: Doubt feed */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink font-display">Recent Doubts</h2>
          <Link to="/doubts/new">
            <Button variant="primary" size="sm">
              Ask Doubt
            </Button>
          </Link>
        </div>

        {doubtsLoading ? (
          <div className="flex flex-col gap-4">
            <DoubtCardSkeleton />
            <DoubtCardSkeleton />
          </div>
        ) : doubts.length === 0 ? (
          <div className="card p-8 text-center text-ink/40 text-xs">
            No doubts have been posted yet. Be the first to ask!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {doubts.map((doubt) => (
              <DoubtCard key={doubt.id} doubt={doubt} />
            ))}
          </div>
        )}
      </div>

      {/* Right side: Sidebar metrics / leaders */}
      <div className="flex flex-col gap-6">
        {/* User Stats Summary */}
        <div className="card p-5 bg-white flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatarUrl} name={user?.name} size="md" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-ink leading-tight">{user?.name}</span>
              <span className="text-[10px] text-ink/40">{user?.role?.replace("ROLE_", "")}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-ink/8 pt-3 text-center">
            <div className="flex flex-col">
              <span className="text-lg font-black text-accent">{user?.reputationPoints || 0}</span>
              <span className="text-[9px] font-semibold text-ink/40 uppercase tracking-wider">Reputation</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-ember">
                {user?.verified ? "Verified" : "Student"}
              </span>
              <span className="text-[9px] font-semibold text-ink/40 uppercase tracking-wider">Status</span>
            </div>
          </div>
        </div>

        {/* Reputation Leaderboard */}
        <div className="card p-5 bg-white flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-ink font-display">Reputation Leaders</h3>
            <Link to="/leaderboard" className="text-[10px] font-bold text-accent hover:underline">
              View All
            </Link>
          </div>

          {leaderboardLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 w-full animate-pulse bg-ink/5 rounded-xl" />
              ))}
            </div>
          ) : leaders.length === 0 ? (
            <div className="text-[11px] text-ink/30 text-center py-2">No leaders yet.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {leaders.map((leader, index) => (
                <div key={leader.userId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-ink/30 w-4">#{index + 1}</span>
                    <span className="font-semibold text-ink/80 truncate max-w-[120px]">{leader.userName}</span>
                  </div>
                  <span className="font-bold text-accent bg-accent/5 px-2 py-0.5 rounded-full text-[10px]">
                    {leader.reputationPoints} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

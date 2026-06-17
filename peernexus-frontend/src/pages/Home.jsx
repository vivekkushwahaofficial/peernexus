import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useDoubts } from "../hooks/useDoubts.js";
import { useLeaderboard } from "../hooks/useReputation.js";
import DoubtCard from "../components/common/DoubtCard.jsx";
import { DoubtCardSkeleton } from "../components/common/Skeleton.jsx";
import Avatar from "../components/common/Avatar.jsx";
import Button from "../components/common/Button.jsx";
import Badge from "../components/common/Badge.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// Audited SaaS Landing Page Subcomponent (Authentic & Recruiter-Friendly)
// ─────────────────────────────────────────────────────────────────────────────
function LandingPage() {
  const [activeShowcase, setActiveShowcase] = useState("dashboard");
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Smooth scroll handler for incoming subpage route hash mappings
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }, 150);
      }
    }
  }, []);

  const faqData = [
    {
      q: "Is PeerNexus free?",
      a: "Yes! PeerNexus is completely open-source and free for all students. We built it to support peer learning without financial barriers.",
    },
    {
      q: "How do study groups work?",
      a: "You can discover study groups via the groups board. Public groups are open to all. Private groups require a join request, which group owners or administrators review and approve.",
    },
    {
      q: "How is reputation calculated?",
      a: "Reputation is calculated using an immutable points ledger. You earn +10 points when your answers receive an upvote, and +15 points when a doubt author accepts your response as the correct solution. Points upgrade your rank tier from Beginner up to Legend.",
    },
    {
      q: "Can I connect with other students?",
      a: "Absolutely! You can send connection requests to peers. Once a connection request is accepted, your peer connection is established, and direct messaging becomes active.",
    },
    {
      q: "Is the chat system real-time?",
      a: "Yes! All chat rooms (private messages and study group channels) communicate via low-latency WebSockets using the STOMP protocol. You will see instant typing indicators, delivery tickmarks, and emoji reactions.",
    },
  ];

  const showcaseScreens = {
    dashboard: {
      title: "Interactive Student Dashboard",
      desc: "Get an overview of your current academic status, reputation points, earned level badges, and the latest doubt posts.",
      ui: (
        <div className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-ink/5 shadow-sm">
          {/* User profile card row */}
          <div className="flex items-center justify-between border-b border-ink/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">JD</div>
              <div>
                <h4 className="text-xs font-bold text-ink">John Doe</h4>
                <p className="text-[10px] text-ink/40 font-medium uppercase mt-0.5">Verified Student</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-accent bg-accent/5 px-2 py-1 rounded-full uppercase">Level: Expert</span>
            </div>
          </div>
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-ink/5">
              <span className="block text-sm font-black text-ink">380</span>
              <span className="text-[8px] text-ink/40 uppercase font-semibold">Reputation</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-ink/5">
              <span className="block text-sm font-black text-ink">14</span>
              <span className="text-[8px] text-ink/40 uppercase font-semibold">Doubts Solved</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-ink/5">
              <span className="block text-sm font-black text-ink">8</span>
              <span className="text-[8px] text-ink/40 uppercase font-semibold">Study Groups</span>
            </div>
          </div>
          {/* Recent doubt card mockup */}
          <div className="p-3 bg-slate-50 border border-ink/5 rounded-xl flex flex-col gap-2">
            <div className="flex justify-between items-center text-[8px] text-ink/40 font-bold uppercase">
              <span>Category: Spring Boot</span>
              <span>2 hours ago</span>
            </div>
            <h5 className="text-[10px] font-bold text-ink">How to resolve LazyInitializationException in JPA?</h5>
            <p className="text-[9px] text-ink/60 truncate">I am fetching a student entity with a lazy list of courses...</p>
          </div>
        </div>
      ),
    },
    doubt: {
      title: "Forum Doubt Solving Engine",
      desc: "Post academic doubts, write replies, upvote helpful comments, and accept the correct resolution to reward contributors.",
      ui: (
        <div className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-ink/5 shadow-sm">
          {/* Main Doubt Question Mock */}
          <div className="flex flex-col gap-2 border-b border-ink/5 pb-4">
            <div className="flex justify-between items-start">
              <h4 className="text-xs font-bold text-ink leading-snug">JPA Fetch Join vs Entity Graph efficiency differences?</h4>
              <span className="text-[8px] text-accent bg-accent/5 px-2 py-0.5 rounded font-bold uppercase">Open</span>
            </div>
            <p className="text-[9px] text-ink/65 leading-relaxed">What is the performance difference when fetching loaded children using a dynamic JPA Entity Graph mapping?</p>
          </div>
          {/* Solution Replier Mock */}
          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-[8px] font-bold text-accent flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              Accepted Solution
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-[9px] flex items-center justify-center font-bold">AL</div>
              <span className="text-[9px] font-bold text-ink">Alice Lee</span>
            </div>
            <p className="text-[9px] text-ink/75">JOIN FETCH is evaluated at query compile-time. Entity Graphs are evaluated dynamically and allow custom load paths per repository method...</p>
          </div>
        </div>
      ),
    },
    groups: {
      title: "Structured Study Groups",
      desc: "Create and join public or invite-only study groups, manage active member rosters, and review private entry requests.",
      ui: (
        <div className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-ink/5 shadow-sm">
          {/* Study Group Discovery Card */}
          <div className="flex flex-col gap-3 p-3 bg-slate-50 border border-ink/5 rounded-xl">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-ink">Algorithms & Data Structures</h4>
              <span className="text-[8px] text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded font-bold uppercase">Private</span>
            </div>
            <p className="text-[9px] text-ink/50">Weekly practice sessions covering sorting, tree traversal algorithms, and graph structures.</p>
            <div className="flex justify-between items-center border-t border-ink/5 pt-2 text-[8px] text-ink/40 font-bold">
              <span>Members: 42</span>
              <span>Creator: Arjun M.</span>
            </div>
          </div>
          {/* Join requests list mock */}
          <div className="flex flex-col gap-2 border-t border-ink/5 pt-3">
            <span className="text-[8px] font-bold text-ink/40 uppercase">Pending Access Requests (1)</span>
            <div className="flex justify-between items-center bg-slate-50/50 border border-ink/[0.03] p-2 rounded-xl text-[9px]">
              <span className="font-bold text-ink">Bobby Chen</span>
              <div className="flex gap-1.5">
                <button className="bg-accent text-white px-2 py-0.5 rounded text-[8px] font-bold">Approve</button>
                <button className="border border-ink/10 text-ink/50 px-2 py-0.5 rounded text-[8px] font-bold">Reject</button>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    chat: {
      title: "WebSocket Real-Time Messaging",
      desc: "Collaborate instantly inside chat feeds with read receipts, dynamic edit/delete tracking, reactions, and typing states.",
      ui: (
        <div className="flex flex-col h-48 bg-slate-50 border border-ink/5 rounded-2xl overflow-hidden">
          {/* Top chat details header */}
          <div className="bg-white border-b border-ink/5 p-2.5 flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-accent rounded-full animate-ping shrink-0" />
            <span className="text-[10px] font-bold text-ink">Study Group Chat</span>
          </div>
          {/* Chat thread mockup */}
          <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto text-[9px]">
            <div className="flex flex-col gap-1 items-start max-w-[80%]">
              <span className="text-[7px] text-ink/40 font-bold ml-1">Arjun M.</span>
              <div className="bg-white p-2 rounded-2xl border border-ink/5 text-ink/80 rounded-tl-none">
                Let's review graph search traversal tomorrow at 4 PM.
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end max-w-[80%] self-end">
              <div className="bg-accent p-2 rounded-2xl text-white rounded-tr-none">
                Sounds perfect. I'll prepare the mock questions!
              </div>
              <span className="text-[6px] text-accent/80 font-bold mr-1 uppercase">Read</span>
            </div>
          </div>
          {/* Typing status bar */}
          <div className="bg-white px-3 py-1 text-[8px] text-ink/40 border-t border-ink/5 flex items-center gap-1 font-medium">
            <span className="font-bold">Bobby Chen</span> is typing
            <span className="flex gap-0.5 items-center">
              <span className="w-1 h-1 bg-ink/40 rounded-full animate-bounce" />
              <span className="w-1 h-1 bg-ink/40 rounded-full animate-bounce delay-75" />
              <span className="w-1 h-1 bg-ink/40 rounded-full animate-bounce delay-150" />
            </span>
          </div>
        </div>
      ),
    },
    leaderboard: {
      title: "Gamified Academic Leaderboard",
      desc: "View student community rankings. Point edits occur dynamically upon answer resolutions and community upvotes.",
      ui: (
        <div className="flex flex-col gap-3.5 bg-white p-5 rounded-2xl border border-ink/5 shadow-sm">
          <h4 className="text-[10px] font-bold text-ink font-display border-b border-ink/5 pb-2.5">Top Contributor Standings</h4>
          {/* Leaders rows */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center text-[9px] bg-amber-500/5 border border-amber-500/10 p-2 rounded-xl">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-amber-500 font-bold">★ #1</span>
                <span className="font-bold text-ink">Arjun Mehta</span>
              </div>
              <span className="font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">850 pts</span>
            </div>
            <div className="flex justify-between items-center text-[9px] bg-slate-400/5 border border-slate-400/10 p-2 rounded-xl">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-slate-400 font-bold">★ #2</span>
                <span className="font-bold text-ink">Sara Lin</span>
              </div>
              <span className="font-bold text-slate-500 bg-slate-400/10 px-2 py-0.5 rounded-full">720 pts</span>
            </div>
            <div className="flex justify-between items-center text-[9px] bg-amber-700/5 border border-amber-700/10 p-2 rounded-xl">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-amber-700 font-bold">★ #3</span>
                <span className="font-bold text-ink">David K.</span>
              </div>
              <span className="font-bold text-amber-700 bg-amber-700/10 px-2 py-0.5 rounded-full">685 pts</span>
            </div>
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="mx-auto w-full -mt-8">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden py-16 md:py-28 bg-gradient-to-b from-pearl/40 via-white to-pearl/20 border-b border-ink/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,21,26,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,21,26,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />
        <div className="max-w-6xl mx-auto px-4 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 self-start bg-accent/10 border border-accent/20 px-3 py-1 rounded-full text-[10px] font-bold text-accent uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
              Collaborative Student Learning Network
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-ink font-display tracking-tight">
              Where Academic Drive Meets <span className="text-gradient">Peer Collaboration.</span>
            </h1>
            <p className="text-sm md:text-base text-ink/60 leading-relaxed max-w-xl">
              PeerNexus connects university students for real-time doubt solving, structured study groups, and gamified knowledge sharing. Built with clean software architectures and low-latency communication channels.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link to="/register">
                <Button variant="primary" size="lg" className="shadow-lg shadow-accent/20 px-8">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="px-8 bg-white/50 backdrop-blur-sm">
                  Explore Community
                </Button>
              </Link>
            </div>
          </div>
          {/* Mockup visualization card */}
          <div className="relative group">
            <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-accent to-emerald-400 opacity-20 blur-xl group-hover:opacity-30 transition duration-500" />
            <div className="relative card p-6 bg-white shadow-2xl border border-ink/8 flex flex-col gap-5 rounded-3xl overflow-hidden backdrop-blur-md bg-white/95">
              <div className="flex items-center justify-between border-b border-ink/5 pb-3">
                <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Workspace Mockup</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
              </div>
              {showcaseScreens.dashboard.ui}
            </div>
          </div>
        </div>
      </section>

      {/* 2. ECOSYSTEM CORE / SOCIAL PROOF (NO FAKE METRICS) */}
      <section className="py-10 bg-slate-50 border-b border-ink/5">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-[10px] font-bold text-ink/40 uppercase tracking-[0.2em] mb-8">
            Core Learning Capabilities
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="flex flex-col gap-1.5 p-4 bg-white border border-ink/5 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-accent">Real-Time Discussions</span>
              <span className="text-[10px] text-ink/60 leading-normal">WebSocket-powered private and study group messaging threads.</span>
            </div>
            <div className="flex flex-col gap-1.5 p-4 bg-white border border-ink/5 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-ink">Trust Connection Network</span>
              <span className="text-[10px] text-ink/60 leading-normal">Safe direct messaging restricted to verified peer connection agreements.</span>
            </div>
            <div className="flex flex-col gap-1.5 p-4 bg-white border border-ink/5 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-accent">Doubt-Solving Forum</span>
              <span className="text-[10px] text-ink/60 leading-normal">Threaded database queries with upvotes and resolved checkmarks.</span>
            </div>
            <div className="flex flex-col gap-1.5 p-4 bg-white border border-ink/5 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-ink">Reputation Ledger</span>
              <span className="text-[10px] text-ink/60 leading-normal">Persisted point transactions and badges reward active user assistance.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY PEERNEXUS SECTION */}
      <section className="py-20 bg-white border-b border-ink/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">The Challenge</span>
            <h2 className="text-3xl font-extrabold text-ink font-display">Studying is hard. Studying alone is harder.</h2>
            <p className="text-xs text-ink/50 leading-relaxed">Traditional platforms suffer from noise, delays, and isolation. PeerNexus brings structure back to student collaboration.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-6 bg-slate-50/50 border border-ink/5 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider text-rose-600">The Problem</h3>
              <ul className="flex flex-col gap-3.5 text-xs text-ink/65 font-medium">
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Isolated Learning:</strong> No instant validation on conceptual roadblocks.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Roadblock Delays:</strong> Posting queries in forums only to wait days for a response.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span><strong>Chat Spam:</strong> Public channels overrun by off-topic notifications and advertising.</span>
                </li>
              </ul>
            </div>
            <div className="card p-6 bg-emerald-50/20 border border-emerald-100 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider text-accent">The PeerNexus Solution</h3>
              <ul className="flex flex-col gap-3.5 text-xs text-ink/65 font-medium">
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold shrink-0">✓</span>
                  <span><strong>WebSocket Messaging:</strong> Chat directly inside structured real-time workspace rooms.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold shrink-0">✓</span>
                  <span><strong>Reputation System:</strong> Get rewarded for answering doubts, motivating peers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold shrink-0">✓</span>
                  <span><strong>Strict Trust Connection:</strong> Direct messaging is gated behind mutual friend agreements.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BUILT FOR MODERN COLLABORATION (RECRUITER-FOCUSED FEATURES) */}
      <section id="features" className="py-20 bg-pearl/10 border-b border-ink/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Built for Modern Student Collaboration</span>
            <h2 className="text-3xl font-extrabold text-ink font-display">Engineering Capabilities</h2>
            <p className="text-xs text-ink/50 leading-relaxed">Every tool you need to study, clarify questions, and connect in one application.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-5 bg-white border border-ink/5 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Doubt Solving</h3>
              <p className="text-[11px] text-ink/50 leading-relaxed">Ask academic questions, upload image attachments, and mark best replies to reward authors.</p>
            </div>

            <div className="card p-5 bg-white border border-ink/5 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Study Groups</h3>
              <p className="text-[11px] text-ink/50 leading-relaxed">Form public discoverable boards or private workspaces. Review entry logs as a group moderator.</p>
            </div>

            <div className="card p-5 bg-white border border-ink/5 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Real-Time Chat</h3>
              <p className="text-[11px] text-ink/50 leading-relaxed">Instant messaging powered by WebSockets. Enjoy typing bubbles, pin lists, and active indicators.</p>
            </div>

            <div className="card p-5 bg-white border border-ink/5 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Peer Connections</h3>
              <p className="text-[11px] text-ink/50 leading-relaxed">Establish connection links securely. Send direct private messages only to accepted peers.</p>
            </div>

            <div className="card p-5 bg-white border border-ink/5 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Leaderboards</h3>
              <p className="text-[11px] text-ink/50 leading-relaxed">Gamified ranking feeds tracking the top students. Climb standings by answering doubt posts.</p>
            </div>

            <div className="card p-5 bg-white border border-ink/5 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7.463 8.2h14.926M4.537 16.2h14.926" />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Reputation system</h3>
              <p className="text-[11px] text-ink/50 leading-relaxed">Accumulate points from peer upvotes and solution resolutions. Unlock custom levels from Beginner to Legend.</p>
            </div>

            <div className="card p-5 bg-white border border-ink/5 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Live Alerts</h3>
              <p className="text-[11px] text-ink/50 leading-relaxed">Receive instant in-app alerts when answers are posted, connections requested, or mentions triggered.</p>
            </div>

            <div className="card p-5 bg-white border border-ink/5 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Student Portfolios</h3>
              <p className="text-[11px] text-ink/50 leading-relaxed">Highlight your academic profile page, presenting skills, interests, and reputation points to peers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-white border-b border-ink/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Process Flow</span>
            <h2 className="text-3xl font-extrabold text-ink font-display">How PeerNexus Works</h2>
            <p className="text-xs text-ink/50 leading-relaxed">Clarify conceptual questions and find peers in 5 simple steps.</p>
          </div>
          <div className="grid md:grid-cols-5 gap-6 relative">
            <div className="flex flex-col gap-3 relative z-10 text-center md:text-left">
              <span className="text-3xl font-black text-accent font-display opacity-40">01</span>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Create Profile</h3>
              <p className="text-[11px] text-ink/50 leading-relaxed">Select academic skills and areas of interest so peers can connect.</p>
            </div>
            <div className="flex flex-col gap-3 relative z-10 text-center md:text-left">
              <span className="text-3xl font-black text-accent font-display opacity-40">02</span>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Ask or Answer</h3>
              <p className="text-[11px] text-ink/50 leading-relaxed">Post doubts with image attachments or write replies to earn reputation points.</p>
            </div>
            <div className="flex flex-col gap-3 relative z-10 text-center md:text-left">
              <span className="text-3xl font-black text-accent font-display opacity-40">03</span>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Join Study Groups</h3>
              <p className="text-[11px] text-ink/50 leading-relaxed">Enter private or public study rooms to chat and exchange course resources.</p>
            </div>
            <div className="flex flex-col gap-3 relative z-10 text-center md:text-left">
              <span className="text-3xl font-black text-accent font-display opacity-40">04</span>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Build Reputation</h3>
              <p className="text-[11px] text-ink/50 leading-relaxed">Climb the global leaderboard standings by resolving questions correctly.</p>
            </div>
            <div className="flex flex-col gap-3 relative z-10 text-center md:text-left">
              <span className="text-3xl font-black text-accent font-display opacity-40">05</span>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Grow Your Network</h3>
              <p className="text-[11px] text-ink/50 leading-relaxed">Verify connections to enable secure direct messaging with mentors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PLATFORM SHOWCASE SECTION (HIGH PRIORITY) */}
      <section id="showcase" className="py-20 bg-slate-50 border-b border-ink/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Platform Tour</span>
            <h2 className="text-3xl font-extrabold text-ink font-display">Explore the Platform</h2>
            <p className="text-xs text-ink/50 leading-relaxed">Get a live preview of our actual student-collaboration interfaces.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[280px_1fr] items-start">
            {/* Tab selection links */}
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none whitespace-nowrap lg:whitespace-normal">
              {Object.keys(showcaseScreens).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveShowcase(key)}
                  className={`w-full text-left px-5 py-3.5 rounded-xl text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
                    activeShowcase === key
                      ? "bg-white text-accent border-accent/20 shadow-sm font-bold"
                      : "bg-transparent text-ink/60 border-transparent hover:bg-white/50 hover:text-ink"
                  }`}
                >
                  {showcaseScreens[key].title}
                </button>
              ))}
            </div>

            {/* Showcase details and visual preview mockup */}
            <div className="card p-6 md:p-8 bg-white border border-ink/8 shadow-xl rounded-3xl flex flex-col md:flex-row gap-8 items-center min-h-[300px]">
              <div className="flex-1 flex flex-col gap-4">
                <span className="text-[9px] font-bold text-accent uppercase tracking-widest">Interface Spotlight</span>
                <h3 className="text-lg font-bold text-ink font-display leading-tight">{showcaseScreens[activeShowcase].title}</h3>
                <p className="text-xs text-ink/65 leading-relaxed">{showcaseScreens[activeShowcase].desc}</p>
                <div className="mt-2">
                  <Link to="/register">
                    <Button variant="outline" size="sm" className="font-bold text-xs">Test This Flow</Button>
                  </Link>
                </div>
              </div>
              <div className="w-full md:w-[350px] shrink-0">
                {showcaseScreens[activeShowcase].ui}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BENEFITS SECTION */}
      <section className="py-20 bg-white border-b border-ink/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Measurable Gains</span>
            <h2 className="text-3xl font-extrabold text-ink font-display">Designed for Every Stakeholder</h2>
            <p className="text-xs text-ink/50 leading-relaxed">Whether seeking support, tutoring peers, or running groups, PeerNexus delivers direct value.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="card p-6 bg-slate-50/50 border border-ink/5 flex flex-col gap-3">
              <span className="text-xs font-bold text-accent uppercase tracking-wide">For Students</span>
              <p className="text-[11px] text-ink/60 leading-relaxed">Unblock assignment bugs in minutes. Connect with domain-expert classmates from other departments.</p>
            </div>
            <div className="card p-6 bg-slate-50/50 border border-ink/5 flex flex-col gap-3">
              <span className="text-xs font-bold text-accent uppercase tracking-wide">For Learners</span>
              <p className="text-[11px] text-ink/60 leading-relaxed">Find structured public study rooms or access invite-only groups to review DBMS, DSA, or interview prep questions.</p>
            </div>
            <div className="card p-6 bg-slate-50/50 border border-ink/5 flex flex-col gap-3">
              <span className="text-xs font-bold text-accent uppercase tracking-wide">For Contributors</span>
              <p className="text-[11px] text-ink/60 leading-relaxed">Gain reputation validation, climb global rankings, and show off credentials directly on your student portfolio page.</p>
            </div>
            <div className="card p-6 bg-slate-50/50 border border-ink/5 flex flex-col gap-3">
              <span className="text-xs font-bold text-accent uppercase tracking-wide">For Leaders</span>
              <p className="text-[11px] text-ink/60 leading-relaxed">Run sub-communities, suspend bad actors, approve join request streams, and review audit logging trails.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SYSTEM ARCHITECTURE & TECH STACK SECTION (RECRUITER-FOCUSED) */}
      <section id="architecture" className="py-20 bg-pearl/10 border-b border-ink/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Engineering Architecture</span>
            <h2 className="text-3xl font-extrabold text-ink font-display">System Architecture & Tech Stack</h2>
            <p className="text-xs text-ink/50 leading-relaxed">PeerNexus is an enterprise-grade platform built on clean code, secure JWTs, and reactive architectures.</p>
          </div>

          <div id="tech-stack" className="grid gap-6 md:grid-cols-3 lg:grid-cols-5 text-center">
            <div className="card p-5 bg-white border border-ink/5 flex flex-col gap-3 items-center">
              <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Frontend</span>
              <p className="text-[9px] text-ink/50 leading-normal">SPA client handling server queries and low-latency state hooks.</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                <Badge variant="primary">React</Badge>
                <Badge variant="neutral">Vite</Badge>
                <Badge variant="info">Tailwind CSS</Badge>
              </div>
            </div>
            <div className="card p-5 bg-white border border-ink/5 flex flex-col gap-3 items-center">
              <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Backend</span>
              <p className="text-[9px] text-ink/50 leading-normal">Stateless MVC API mapping permissions, models, and WebSocket logs.</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                <Badge variant="primary">Spring Boot</Badge>
                <Badge variant="neutral">Spring Sec</Badge>
                <Badge variant="info">JWT (JJWT)</Badge>
              </div>
            </div>
            <div className="card p-5 bg-white border border-ink/5 flex flex-col gap-3 items-center">
              <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Database</span>
              <p className="text-[9px] text-ink/50 leading-normal">Postgres schema with indexed queries and relational versioning.</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                <Badge variant="primary">PostgreSQL</Badge>
                <Badge variant="neutral">Flyway</Badge>
                <Badge variant="info">JPA / SQL</Badge>
              </div>
            </div>
            <div className="card p-5 bg-white border border-ink/5 flex flex-col gap-3 items-center">
              <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Real-Time</span>
              <p className="text-[9px] text-ink/50 leading-normal">Stomp channel handlers validating user token signatures on connect.</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                <Badge variant="primary">WebSocket</Badge>
                <Badge variant="neutral">STOMP Protocol</Badge>
              </div>
            </div>
            <div className="card p-5 bg-white border border-ink/5 flex flex-col gap-3 items-center">
              <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Deployment</span>
              <p className="text-[9px] text-ink/50 leading-normal">Fully containerized full-stack deployment setups deployable on cloud nodes.</p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                <Badge variant="primary">Render</Badge>
                <Badge variant="neutral">Vercel</Badge>
                <Badge variant="info">Docker</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. DEVELOPER STORY SHOWCASE */}
      <section className="py-20 bg-white border-b border-ink/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="flex flex-col gap-6 text-left">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Engineering Scope</span>
              <h2 className="text-3xl font-extrabold text-ink font-display leading-tight">Why PeerNexus Was Built</h2>
              <p className="text-xs md:text-sm text-ink/60 leading-relaxed">
                PeerNexus was built to solve the core challenges of isolated learning by enabling students to ask questions, share knowledge, build study groups, and network securely. Instead of jumping between unmoderated channels and forum queues, students collaborate in a structured workspace.
              </p>
              <div className="grid grid-cols-2 gap-4 border-t border-ink/5 pt-5">
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wide">Real-Time Messaging</h4>
                  <p className="text-[10px] text-ink/50 leading-relaxed">Optimized WebSockets with typing states, read receipts, and reactions.</p>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wide">Gamified Reputation</h4>
                  <p className="text-[10px] text-ink/50 leading-relaxed">Point transaction ledgers rewarding resolved answers dynamically.</p>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wide">Secure Authentication</h4>
                  <p className="text-[10px] text-ink/50 leading-relaxed">Double-token validation with short access and long refresh cycles.</p>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wide">Scalable Architecture</h4>
                  <p className="text-[10px] text-ink/50 leading-relaxed">PostgreSQL schema, indexed database queries, and clean MVC packages.</p>
                </div>
              </div>
            </div>
            {/* Visual motivation card */}
            <div className="card p-6 bg-slate-50 border border-ink/5 rounded-3xl flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl -mr-6 -mt-6" />
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Project Motivation</h4>
              <p className="text-xs text-ink/65 italic leading-relaxed">
                "The core engineering challenge was bridging high-speed WebSockets communication with reliable database transactional states. PeerNexus ensures that presence tracking, notifications, and group moderations scale securely while providing a distraction-free student networking ecosystem."
              </p>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs">VK</div>
                <div>
                  <h5 className="text-xs font-bold text-ink">Vivek Kushwaha</h5>
                  <p className="text-[9px] text-ink/40 font-medium mt-0.5">Lead Architect & Lead Engineer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. COMMUNITY HIGHLIGHTS & REVIEWS SECTION (NO FAKE TESTIMONIALS) */}
      <section className="py-20 bg-slate-50 border-b border-ink/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Ecosystem Highlights</span>
            <h2 className="text-3xl font-extrabold text-ink font-display">Collaborative Ecosystem</h2>
            <p className="text-xs text-ink/50 leading-relaxed">Designed to bridge peer-to-peer knowledge sharing with real-time verification.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="card p-5 bg-white border border-ink/5 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-accent uppercase tracking-wider">Real-Time Peer Learning</h4>
              <p className="text-[11px] text-ink/60 leading-relaxed">Instant feedback loop via WebSocket connections ensures questions get answered without delay.</p>
            </div>
            <div className="card p-5 bg-white border border-ink/5 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Study Group Collaboration</h4>
              <p className="text-[11px] text-ink/60 leading-relaxed">Create structured group lobbies, manage roles, and review private requests to block chat spam.</p>
            </div>
            <div className="card p-5 bg-white border border-ink/5 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-accent uppercase tracking-wider">Doubt-Solving Ecosystem</h4>
              <p className="text-[11px] text-ink/60 leading-relaxed">Verify resolutions using accepted answer flags that stand out in thread listings.</p>
            </div>
            <div className="card p-5 bg-white border border-ink/5 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Reputation Point Ledgers</h4>
              <p className="text-[11px] text-ink/60 leading-relaxed">Track user contributions objectively. Reward helpful replies using clear gamified reputation points.</p>
            </div>
          </div>

          {/* Placeholders for growing community reviews */}
          <div className="card p-8 bg-white border border-ink/5 text-center max-w-xl mx-auto shadow-sm">
            <svg className="w-8 h-8 text-ink/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h4 className="text-xs font-bold text-ink mb-1.5">User Feedback</h4>
            <p className="text-[11px] text-ink/40 leading-relaxed">
              Community feedback will appear here as PeerNexus grows. Check out the open-source repository to contribute your reviews!
            </p>
          </div>
        </div>
      </section>

      {/* 11. OPEN SOURCE & COMMUNITY SECTION */}
      <section className="py-20 bg-white border-b border-ink/5">
        <div className="max-w-4xl mx-auto px-4 text-center flex flex-col items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center text-accent">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-ink font-display">Open Source & Community</h2>
          <p className="text-xs md:text-sm text-ink/60 max-w-xl leading-relaxed">
            PeerNexus is fully open-source, community-driven, and open to contributions. Whether you are interested in optimizing SQL schema migrations, resolving JPA query execution pathways, or integrating Redis cache state layers, contributions are highly welcome.
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com/vivekkushwahaofficial/peernexus"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-semibold text-pearl hover:bg-ink/90 transition"
            >
              Explore GitHub Repository
            </a>
          </div>
        </div>
      </section>

      {/* 12. FAQ SECTION */}
      <section id="faq" className="py-20 bg-slate-50 border-b border-ink/5">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Frequently Asked Questions</span>
            <h2 className="text-3xl font-extrabold text-ink font-display">Common Queries</h2>
            <p className="text-xs text-ink/50 leading-relaxed">Quick answers regarding study groups, reputation credits, and connections.</p>
          </div>

          <div className="flex flex-col gap-3">
            {faqData.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="card bg-white border border-ink/5 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center px-6 py-4.5 text-left text-xs font-bold text-ink hover:text-accent transition duration-150 cursor-pointer focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-sm transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 border-t border-ink/5 pt-4 text-xs text-ink/60 leading-relaxed animate-fade-in bg-slate-50/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 13. CTA SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative overflow-hidden bg-gradient-to-r from-ink to-slate-900 text-white rounded-3xl p-8 md:p-14 border border-ink shadow-2xl flex flex-col items-center text-center gap-6">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#fff_70%,transparent_100%)] -z-10" />
            <h2 className="text-3xl md:text-4xl font-extrabold font-display leading-tight">Join PeerNexus Today</h2>
            <p className="text-xs md:text-sm text-pearl/60 max-w-lg leading-relaxed">
              Sign up today to ask doubts, collaborate in study groups, and connect with academic peers from other departments.
            </p>
            <div className="flex flex-wrap gap-4 mt-2 justify-center">
              <Link to="/register">
                <Button variant="primary" size="lg" className="shadow-lg shadow-accent/20 px-8">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="px-8 border-white/20 text-white hover:bg-white/10 hover:text-white">
                  Explore Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 14. FOOTER SECTION */}
      <footer className="bg-ink text-pearl/80 border-t border-white/10 py-12 text-xs">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-white/10 pb-12">
          <div className="col-span-2 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white font-display">PeerNexus</h3>
            <p className="text-pearl/40 max-w-xs leading-relaxed">
              A production-grade, secure, and highly scalable collaborative student learning network.
            </p>
          </div>
          <div className="flex flex-col gap-3.5">
            <span className="font-bold text-white uppercase tracking-wider text-[10px]">Product</span>
            <Link to="/login" className="hover:text-white transition">Features</Link>
            <Link to="/login" className="hover:text-white transition">Study Rooms</Link>
            <Link to="/login" className="hover:text-white transition">Discussions</Link>
          </div>
          <div className="flex flex-col gap-3.5">
            <span className="font-bold text-white uppercase tracking-wider text-[10px]">Resources</span>
            <Link to="/login" className="hover:text-white transition">Documentation</Link>
            <Link to="/login" className="hover:text-white transition">FAQ Guide</Link>
          </div>
          <div className="flex flex-col gap-3.5">
            <span className="font-bold text-white uppercase tracking-wider text-[10px]">Community</span>
            <Link to="/login" className="hover:text-white transition">Leaderboard</Link>
            <Link to="/login" className="hover:text-white transition">Networking</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-pearl/40">
          <span>&copy; {new Date().getFullYear()} PeerNexus. Created under MIT License.</span>
          <div className="flex gap-4">
            <a href="https://github.com/vivekkushwahaofficial" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Home Dashboard Component
// ─────────────────────────────────────────────────────────────────────────────
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
    return <LandingPage />;
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
        <div className="card p-6 bg-white flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatarUrl} name={user?.name} size="md" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-ink leading-tight">{user?.name}</span>
              <span className="text-[10px] font-bold text-accent tracking-wider uppercase mt-0.5">{user?.role?.replace("ROLE_", "")}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-ink/5 pt-4 text-center">
            <div className="flex flex-col p-2 bg-ink/[0.01] rounded-xl border border-ink/[0.03]">
              <span className="text-xl font-black text-accent">{user?.reputationPoints || 0}</span>
              <span className="text-[9px] font-bold text-ink/40 uppercase tracking-wider mt-0.5">Reputation</span>
            </div>
            <div className="flex flex-col p-2 bg-ink/[0.01] rounded-xl border border-ink/[0.03]">
              <span className="text-xs font-bold text-ink h-7 flex items-center justify-center">
                {user?.verified ? (
                  <span className="text-accent font-bold">Verified</span>
                ) : (
                  <span className="text-ink/60 font-semibold">Student</span>
                )}
              </span>
              <span className="text-[9px] font-bold text-ink/40 uppercase tracking-wider mt-0.5">Status</span>
            </div>
          </div>
        </div>

        {/* Reputation Leaderboard */}
        <div className="card p-6 bg-white flex flex-col gap-5">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-ink font-display">Reputation Leaders</h3>
            <Link to="/leaderboard" className="text-[10px] font-bold text-accent hover:underline uppercase tracking-wider">
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
            <div className="flex flex-col gap-3.5">
              {leaders.map((leader, index) => {
                const isTopThree = index < 3;
                const medalColors = ["text-amber-500", "text-slate-400", "text-amber-700"];
                return (
                  <div key={leader.userId} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[10px] font-bold w-4 flex-shrink-0 ${isTopThree ? medalColors[index] : "text-ink/30"}`}>
                        {isTopThree ? "★" : `#${index + 1}`}
                      </span>
                      <span className="font-semibold text-ink/80 truncate max-w-[125px]">{leader.userName}</span>
                    </div>
                    <span className="font-bold text-accent bg-accent/5 px-2.5 py-0.5 rounded-full text-[10px]">
                      {leader.reputationPoints} pts
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

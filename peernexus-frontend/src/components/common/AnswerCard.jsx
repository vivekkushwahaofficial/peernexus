import React from "react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar.jsx";
import Badge from "./Badge.jsx";

export function AnswerCard({
  answer,
  isDoubtOwner,
  onAccept,
  onVote,
  currentUserId,
  onDelete,
  onEdit,
}) {
  if (!answer) return null;

  const { id, content, accepted, upvotes, downvotes, author, createdAt } = answer;
  const isAuthor = author?.id === currentUserId;

  const formatDate = (isoStr) => {
    if (!isoStr) return "";
    const date = new Date(isoStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`card p-5 flex flex-col gap-4 transition-all ${
        accepted ? "border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500/10" : "bg-white"
      }`}
    >
      {/* Top Header */}
      <div className="flex justify-between items-start">
        <Link to={isAuthor ? "/profile" : `/profile/${author?.id}`} className="flex items-center gap-3 group">
          <Avatar name={author?.name} size="sm" className="group-hover:opacity-90 transition-opacity" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-ink/90 group-hover:text-accent transition-colors">{author?.name}</span>
              {author?.verified && (
                <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-[10px] text-ink/40">{formatDate(createdAt)}</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {accepted && (
            <Badge variant="success" className="flex items-center gap-1 normal-case font-medium">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span>Accepted</span>
            </Badge>
          )}

          {isDoubtOwner && !accepted && (
            <button
              onClick={() => onAccept && onAccept(id)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition"
            >
              Accept Answer
            </button>
          )}
        </div>
      </div>

      {/* Answer content */}
      <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-wrap break-words">{content}</p>

      {/* Footer controls: upvote/downvote and edit/delete */}
      <div className="flex justify-between items-center border-t border-ink/8 pt-3 mt-1 text-xs">
        {/* Voting */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onVote && onVote(id, "UPVOTE")}
            className="flex items-center gap-1 text-ink/50 hover:text-accent transition px-2 py-1 rounded-lg hover:bg-slate-100"
            aria-label="Upvote"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
            </svg>
            <span className="font-semibold">{upvotes}</span>
          </button>

          <button
            onClick={() => onVote && onVote(id, "DOWNVOTE")}
            className="flex items-center gap-1 text-ink/50 hover:text-ember transition px-2 py-1 rounded-lg hover:bg-slate-100"
            aria-label="Downvote"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="font-semibold">{downvotes}</span>
          </button>
        </div>

        {/* Edit/Delete actions */}
        {isAuthor && (
          <div className="flex gap-1.5">
            <button
              onClick={() => onEdit && onEdit(answer)}
              className="text-ink/50 hover:text-ink transition px-2 py-1 rounded-lg hover:bg-slate-100 font-semibold"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(id)}
              className="text-ember/70 hover:text-ember transition px-2 py-1 rounded-lg hover:bg-rose-50 font-semibold"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnswerCard;

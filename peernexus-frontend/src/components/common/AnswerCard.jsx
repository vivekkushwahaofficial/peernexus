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
      className={`card p-6 flex flex-col gap-4 transition-all duration-300 ${
        accepted ? "border-success bg-success/[0.03] ring-1 ring-success/10" : "bg-white"
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 w-full">
        <Link to={isAuthor ? "/profile" : `/profile/${author?.id}`} className="flex items-center gap-3 group min-w-0">
          <Avatar name={author?.name} src={author?.avatarUrl} size="sm" className="group-hover:opacity-90 transition-opacity" />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-ink hover:text-accent transition-colors truncate">{author?.name}</span>
              {author?.verified && (
                <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-[10px] text-ink/40 font-medium">{formatDate(createdAt)}</span>
          </div>
        </Link>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end mt-1 sm:mt-0">
          {accepted && (
            <Badge variant="success" className="flex items-center gap-1 normal-case font-semibold">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span>Accepted Solution</span>
            </Badge>
          )}

          {isDoubtOwner && !accepted && (
            <button
              onClick={() => onAccept && onAccept(id)}
              className="text-xs font-bold text-success hover:text-success/90 hover:bg-success/5 px-3 py-1.5 rounded-xl border border-success/20 transition w-full sm:w-auto text-center cursor-pointer"
            >
              Accept Answer
            </button>
          )}
        </div>
      </div>

      {/* Answer content */}
      <p className="text-sm text-ink/70 leading-relaxed whitespace-pre-wrap break-words">{content}</p>

      {/* Footer controls: upvote/downvote and edit/delete */}
      <div className="flex justify-between items-center border-t border-ink/5 pt-4 mt-1 text-xs">
        {/* Voting */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onVote && onVote(id, "UPVOTE")}
            className="flex items-center gap-1.5 text-ink/50 hover:text-accent transition px-2.5 py-1 rounded-lg hover:bg-ink/5 font-semibold cursor-pointer"
            aria-label="Upvote"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
            </svg>
            <span>{upvotes}</span>
          </button>

          <button
            onClick={() => onVote && onVote(id, "DOWNVOTE")}
            className="flex items-center gap-1.5 text-ink/50 hover:text-ember transition px-2.5 py-1 rounded-lg hover:bg-ink/5 font-semibold cursor-pointer"
            aria-label="Downvote"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
            <span>{downvotes}</span>
          </button>
        </div>

        {/* Edit/Delete actions */}
        {isAuthor && (
          <div className="flex gap-1.5">
            <button
              onClick={() => onEdit && onEdit(answer)}
              className="text-ink/50 hover:text-ink transition px-2.5 py-1 rounded-lg hover:bg-ink/5 font-semibold cursor-pointer"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(id)}
              className="text-error/70 hover:text-error transition px-2.5 py-1 rounded-lg hover:bg-error/5 font-semibold cursor-pointer"
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

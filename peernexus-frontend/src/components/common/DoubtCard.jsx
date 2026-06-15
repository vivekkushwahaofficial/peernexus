import React from "react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar.jsx";
import Badge, { RoleBadge } from "./Badge.jsx";
import { useAuth } from "../../hooks/useAuth.js";

export function DoubtCard({ doubt }) {
  if (!doubt) return null;

  const { id, title, content, status, category, author, tags, images, createdAt } = doubt;
  const { user } = useAuth();
  const currentUserId = user?.id;
  const isAuthor = author?.id === currentUserId;

  const formatDate = (isoStr) => {
    if (!isoStr) return "";
    const date = new Date(isoStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const statusColors = {
    OPEN: "info",
    ANSWERED: "success",
    CLOSED: "neutral",
  };

  // Truncate content to 140 chars for preview
  const previewText = content.length > 140 ? `${content.substring(0, 140)}...` : content;

  return (
    <div className="card p-5 hover:shadow-md hover:border-ink/15 transition-all duration-200 flex flex-col gap-4 bg-white">
      {/* Top row: User Info & Meta */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 w-full">
        <Link to={isAuthor ? "/profile" : `/profile/${author?.id}`} className="flex items-center gap-3 group min-w-0">
          <Avatar name={author?.name} size="sm" className="group-hover:opacity-90 transition-opacity" />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-ink/90 group-hover:text-accent transition-colors truncate">{author?.name}</span>
              {author?.verified && (
                <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-[10px] text-ink/40">{formatDate(createdAt)}</span>
          </div>
        </Link>

        <div className="flex gap-2 self-start sm:self-auto flex-wrap">
          {category && (
            <Badge variant="primary" className="normal-case font-medium">
              {category.name}
            </Badge>
          )}
          <Badge variant={statusColors[status] || "neutral"}>
            {status}
          </Badge>
        </div>
      </div>

      {/* Middle row: Content */}
      <div className="flex flex-col gap-1.5">
        <Link to={`/doubts/${id}`} className="hover:text-accent transition">
          <h3 className="text-base font-bold text-ink leading-snug">{title}</h3>
        </Link>
        <p className="text-sm text-ink/70 leading-relaxed break-words">{previewText}</p>
      </div>

      {/* Images preview if any */}
      {images && images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img) => (
            <img
              key={img.id}
              src={img.url}
              alt="doubt attachment"
              className="h-16 w-24 object-cover rounded-lg border border-ink/8 shrink-0"
            />
          ))}
        </div>
      )}

      {/* Bottom row: Tags & CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/8 pt-3 mt-1">
        <div className="flex flex-wrap gap-1.5">
          {tags && tags.map((t, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
            >
              #{t}
            </span>
          ))}
        </div>

        <Link
          to={`/doubts/${id}`}
          className="text-xs font-bold text-accent hover:text-accent/80 flex items-center gap-1 group transition"
        >
          <span>View Details</span>
          <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default DoubtCard;

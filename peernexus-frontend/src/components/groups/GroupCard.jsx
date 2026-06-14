import React from "react";
import { Link } from "react-router-dom";
import Badge from "../common/Badge.jsx";
import Button from "../common/Button.jsx";

export function GroupCard({ group, onJoin, joining }) {
  if (!group) return null;

  const { id, name, description, topic, imageUrl, isPrivate, memberCount, myRole, ownerName } = group;

  const handleJoinClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onJoin) onJoin(id, isPrivate);
  };

  const defaultBanner = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=400&auto=format&fit=crop";

  return (
    <div className="card overflow-hidden bg-white hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* Banner/Image */}
      <div className="h-32 w-full relative">
        <img
          src={imageUrl || defaultBanner}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 flex gap-1.5">
          <Badge variant={isPrivate ? "warning" : "success"} className="shadow-sm">
            {isPrivate ? "Private" : "Public"}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            {topic && (
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
                #{topic}
              </span>
            )}
            <span className="text-[10px] text-ink/40 font-medium">{memberCount} Members</span>
          </div>

          <Link to={`/groups/${id}`} className="hover:text-accent transition">
            <h3 className="text-sm font-bold text-ink leading-tight truncate">{name}</h3>
          </Link>
          <p className="text-xs text-ink/60 leading-relaxed line-clamp-3">
            {description || "No description provided for this study group."}
          </p>
        </div>

        <div className="border-t border-ink/8 pt-3 flex items-center justify-between">
          <span className="text-[10px] text-ink/40 truncate">
            Owner: <span className="font-semibold">{ownerName}</span>
          </span>

          {myRole ? (
            <Link
              to={`/groups/${id}`}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-pearl transition hover:bg-slate-800 active:scale-95"
            >
              Enter Group
            </Link>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleJoinClick}
              loading={joining}
            >
              {isPrivate ? "Request" : "Join"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupCard;

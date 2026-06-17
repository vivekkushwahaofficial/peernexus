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
    <div className="card card-hover overflow-hidden bg-white flex flex-col h-full border border-ink/5">
      {/* Banner/Image */}
      <div className="h-32 w-full relative overflow-hidden">
        <img
          src={imageUrl || defaultBanner}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                #{topic}
              </span>
            )}
            <span className="text-[10px] text-ink/40 font-bold uppercase tracking-wider">{memberCount} Members</span>
          </div>

          <Link to={`/groups/${id}`} className="hover:text-accent group transition">
            <h3 className="text-sm font-bold text-ink leading-tight truncate group-hover:text-accent transition-colors">{name}</h3>
          </Link>
          <p className="text-xs text-ink/50 leading-relaxed line-clamp-3">
            {description || "No description provided for this study group."}
          </p>
        </div>

        <div className="border-t border-ink/5 pt-3.5 flex items-center justify-between">
          <span className="text-[10px] text-ink/40 truncate">
            Owner: <span className="font-semibold text-ink/75">{ownerName}</span>
          </span>

          {myRole ? (
            <Link
              to={`/groups/${id}`}
              className="inline-flex items-center justify-center rounded-xl bg-ink px-4 py-1.5 text-xs font-bold text-pearl transition hover:bg-ink/90 active:scale-95 shadow-sm"
            >
              Enter Group
            </Link>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleJoinClick}
              loading={joining}
              className="font-bold text-xs px-4"
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

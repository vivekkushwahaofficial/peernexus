import React from "react";
import Avatar from "../common/Avatar.jsx";
import Badge from "../common/Badge.jsx";

export function GroupMemberList({
  members = [],
  myRole,
  currentUserId,
  onRemoveMember,
  onPromoteMember,
  onTransferOwnership,
}) {
  const isOwner = myRole === "OWNER";
  const isAdmin = myRole === "ADMIN";

  const getRoleLabel = (role) => {
    if (role === "OWNER") return "Owner";
    if (role === "ADMIN") return "Admin";
    return "Member";
  };

  const getRoleBadgeVariant = (role) => {
    if (role === "OWNER") return "admin";
    if (role === "ADMIN") return "moderator";
    return "student";
  };

  return (
    <div className="flex flex-col gap-3">
      {members.length === 0 ? (
        <div className="text-center py-6 text-ink/30 text-xs">
          No members in this group.
        </div>
      ) : (
        members.map((m) => {
          const isTargetMe = m.userId === currentUserId;
          const isTargetOwner = m.role === "OWNER";
          const isTargetAdmin = m.role === "ADMIN";

          // Calculate permission guards
          const canKick =
            !isTargetMe &&
            !isTargetOwner &&
            (isOwner || (isAdmin && !isTargetAdmin));

          const canPromote =
            isOwner && m.role === "MEMBER";

          const canTransfer =
            isOwner && !isTargetMe;

          return (
            <div key={m.memberId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-ink/5 bg-white hover:bg-slate-50 transition">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar src={m.userProfilePicture} name={m.userName} size="sm" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-ink truncate">{m.userName}</span>
                  <span className="text-[10px] text-ink/40 truncate">{m.userEmail}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 justify-end w-full sm:w-auto">
                <Badge variant={getRoleBadgeVariant(m.role)}>
                  {getRoleLabel(m.role)}
                </Badge>

                {/* Management Actions */}
                {!isTargetMe && (canPromote || canTransfer || canKick) && (
                  <div className="flex items-center gap-1.5">
                    {canPromote && (
                      <button
                        onClick={() => onPromoteMember && onPromoteMember(m.memberId)}
                        className="text-[10px] font-semibold text-accent hover:bg-accent/10 px-2 py-1 rounded-lg border border-accent/25 transition"
                        title="Promote to Admin"
                      >
                        Make Admin
                      </button>
                    )}
                    {canTransfer && (
                      <button
                        onClick={() => onTransferOwnership && onTransferOwnership(m.memberId)}
                        className="text-[10px] font-semibold text-amber-600 hover:bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 transition"
                        title="Transfer Ownership"
                      >
                        Transfer Owner
                      </button>
                    )}
                    {canKick && (
                      <button
                        onClick={() => onRemoveMember && onRemoveMember(m.memberId)}
                        className="text-[10px] font-semibold text-ember hover:bg-rose-50 px-2 py-1 rounded-lg border border-ember/25 transition"
                        title="Remove Member"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default GroupMemberList;

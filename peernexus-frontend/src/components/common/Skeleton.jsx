import React from "react";

export function Skeleton({ variant = "text", width, height, className = "" }) {
  const classes = {
    text: "h-3 w-full rounded",
    title: "h-6 w-2/3 rounded-md",
    circle: "rounded-full shrink-0",
    rect: "rounded-xl w-full",
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      style={style}
      className={`animate-pulse bg-ink/10 ${classes[variant]} ${className}`}
    />
  );
}

export function DoubtCardSkeleton() {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" width="40px" height="40px" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton variant="text" width="120px" height="12px" />
          <Skeleton variant="text" width="80px" height="10px" />
        </div>
      </div>
      <Skeleton variant="title" />
      <Skeleton variant="text" className="h-16" />
      <div className="flex gap-2">
        <Skeleton variant="text" width="60px" height="24px" className="rounded-full" />
        <Skeleton variant="text" width="60px" height="24px" className="rounded-full" />
      </div>
    </div>
  );
}

export default Skeleton;

import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button.jsx";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 gap-6 animate-fade-in">
      <div className="text-[120px] font-black leading-none text-ink/10 select-none font-display">
        404
      </div>

      <div className="max-w-md flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-ink font-display">Lost in Orbit?</h1>
        <p className="text-sm text-ink/50 leading-relaxed">
          The page you are looking for has either been moved, deleted, or never existed in the first place.
        </p>
      </div>

      <Link to="/">
        <Button variant="primary">
          Back to Safety
        </Button>
      </Link>
    </div>
  );
}

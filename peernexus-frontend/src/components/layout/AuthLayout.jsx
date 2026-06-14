import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl via-white to-amber-50 text-ink">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white/80 p-8 shadow-xl backdrop-blur">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

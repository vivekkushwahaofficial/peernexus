import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl via-white to-accent/5 text-ink flex items-center justify-center">
      <div className="mx-auto flex w-full max-w-md items-center justify-center px-6 py-12">
        <div className="w-full rounded-2xl border border-ink/5 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-slide-up">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

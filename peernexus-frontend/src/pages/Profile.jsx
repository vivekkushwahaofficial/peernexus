import { useAuth } from "../hooks/useAuth.js";

export default function Profile() {
  const { user } = useAuth();

  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-black/10 bg-white p-8 shadow-xl">
      <h1 className="text-2xl font-semibold">Your Profile</h1>
      <p className="mt-2 text-sm text-ink/70">Verified status and bio will appear here.</p>
      <div className="mt-6 space-y-3 text-sm">
        <p><span className="font-semibold">Name:</span> {user?.name || "-"}</p>
        <p><span className="font-semibold">Email:</span> {user?.email || "-"}</p>
        <p><span className="font-semibold">Role:</span> {user?.role || "-"}</p>
      </div>
    </section>
  );
}

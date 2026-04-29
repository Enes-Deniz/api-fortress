import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";

type Props = {
  variant?: "auth" | "dashboard";
  onLogout?: () => void;
};

export default function Header({ variant = "auth", onLogout }: Props) {
  return (
    <header className="border-b border-slate-800/80 bg-fortress-900/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            API Fortress
          </h1>
          <p className="text-sm text-slate-400">Güvenlik laboratuvarı — Hacker vs Defender</p>
        </div>
        <nav className="flex shrink-0 flex-wrap items-center justify-end gap-3 text-sm">
          {variant === "dashboard" ? (
            <>
              <Link
                to={ROUTES.dashboard}
                className="rounded-lg bg-fortress-accent/90 px-3 py-1.5 font-medium text-fortress-950 transition hover:bg-sky-300"
              >
                Dashboard
              </Link>
              {onLogout ? (
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-1.5 text-red-100 transition hover:border-red-400/60 hover:bg-red-950/50"
                >
                  Çıkış
                </button>
              ) : (
                <Link
                  to={ROUTES.auth}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-slate-200 transition hover:border-slate-500 hover:bg-fortress-800"
                >
                  Oturum
                </Link>
              )}
            </>
          ) : (
            <span className="rounded-lg border border-slate-600/80 bg-fortress-950/50 px-3 py-1.5 font-medium text-slate-200">
              Giriş / Kayıt
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}

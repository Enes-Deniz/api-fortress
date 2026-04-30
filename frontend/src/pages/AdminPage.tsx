import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { ROUTES, clearAccessToken, readAccessToken } from "@/lib/constants";
import { LEARNING_PATH_ORDER, readCompletedTaskIds } from "@/lib/progress";
import { ctfTasks } from "@/data/ctfTasks";
import { fetchHealth, getInsecureApiBase, getJson, getSecureApiBase } from "@/services/http";
import type { HealthResponse, UserMeResponse } from "@/types";

export default function AdminPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserMeResponse | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [insecureHealth, setInsecureHealth] = useState<HealthResponse | null>(null);
  const [secureHealth, setSecureHealth] = useState<HealthResponse | null>(null);
  const [insecureHealthError, setInsecureHealthError] = useState<string | null>(null);
  const [secureHealthError, setSecureHealthError] = useState<string | null>(null);

  const handleLogout = useCallback(() => {
    clearAccessToken();
    navigate(ROUTES.auth, { replace: true });
  }, [navigate]);

  useEffect(() => {
    const token = readAccessToken();
    if (!token) {
      navigate(ROUTES.auth, { replace: true });
      return;
    }

    const platformApiBase = getSecureApiBase();
    let cancelled = false;
    setLoadingUser(true);
    setUserError(null);

    getJson<UserMeResponse>(platformApiBase, "/users/me", { token })
      .then((data) => {
        if (cancelled) return;
        setUser({
          ...data,
          is_admin: Boolean(data.is_admin),
        });
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Profil yüklenemedi.";
        if (msg.toLowerCase().includes("unauthorized")) {
          clearAccessToken();
          navigate(ROUTES.auth, { replace: true });
          return;
        }
        setUserError(msg);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingUser(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (loadingUser) return;
    if (user && !user.is_admin) {
      navigate(ROUTES.dashboard, { replace: true });
    }
  }, [loadingUser, user, navigate]);

  useEffect(() => {
    const progressKey = user?.email || (user ? String(user.id) : null);
    setCompletedTaskIds(readCompletedTaskIds(progressKey));
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const insecureBase = getInsecureApiBase();
    const secureBase = getSecureApiBase();

    Promise.allSettled([fetchHealth(insecureBase), fetchHealth(secureBase)]).then((results) => {
      if (cancelled) return;
      const [insecureRes, secureRes] = results;

      if (insecureRes.status === "fulfilled") {
        setInsecureHealth(insecureRes.value);
        setInsecureHealthError(null);
      } else {
        setInsecureHealth(null);
        setInsecureHealthError(
          insecureRes.reason instanceof Error ? insecureRes.reason.message : "Erişilemiyor"
        );
      }

      if (secureRes.status === "fulfilled") {
        setSecureHealth(secureRes.value);
        setSecureHealthError(null);
      } else {
        setSecureHealth(null);
        setSecureHealthError(
          secureRes.reason instanceof Error ? secureRes.reason.message : "Erişilemiyor"
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const taskById = useMemo(
    () => new Map(ctfTasks.map((task) => [task.id, task])),
    []
  );

  const completedOrdered = useMemo(
    () => LEARNING_PATH_ORDER.filter((id) => completedTaskIds.includes(id)),
    [completedTaskIds]
  );

  const remainingOrdered = useMemo(
    () => LEARNING_PATH_ORDER.filter((id) => !completedTaskIds.includes(id)),
    [completedTaskIds]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="dashboard" onLogout={handleLogout} isAdmin={Boolean(user?.is_admin)} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <header className="border-b border-slate-800/80 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fortress-accent">
            Admin Panel
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Kullanıcı ve öğrenme durumu
          </h2>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-slate-700/60 bg-fortress-900/60 p-5 shadow-card">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Kullanıcı Bilgisi</h3>
            {loadingUser ? (
              <p className="mt-3 text-sm text-slate-400">Kullanıcı yükleniyor...</p>
            ) : userError ? (
              <p className="mt-3 text-sm text-red-300">{userError}</p>
            ) : user ? (
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-slate-500">email</dt>
                  <dd className="font-medium text-slate-100">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">id</dt>
                  <dd className="font-medium text-slate-100">{user.id}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-slate-400">Kullanıcı bilgisi yok.</p>
            )}
          </article>

          <article className="rounded-xl border border-slate-700/60 bg-fortress-900/60 p-5 shadow-card">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Sistem Durumu</h3>
            <div className="mt-3 space-y-3 text-sm">
              <div className="rounded-lg border border-slate-800 bg-fortress-950/60 p-3">
                <p className="text-slate-500">Secure API health</p>
                <p className="mt-1 font-medium text-slate-100">
                  {secureHealth ? `${secureHealth.status} (${secureHealth.service})` : secureHealthError || "Yüklenemedi"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-fortress-950/60 p-3">
                <p className="text-slate-500">Insecure API health</p>
                <p className="mt-1 font-medium text-slate-100">
                  {insecureHealth ? `${insecureHealth.status} (${insecureHealth.service})` : insecureHealthError || "Yüklenemedi"}
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-xl border border-slate-700/60 bg-fortress-900/60 p-5 shadow-card">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Learning Path Durumu</h3>
          <p className="mt-2 text-sm text-slate-300">
            Tamamlanan görev:{" "}
            <span className="font-semibold text-emerald-300">
              {completedOrdered.length} / {LEARNING_PATH_ORDER.length}
            </span>
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Tamamlananlar</p>
              {completedOrdered.length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">Henüz tamamlanan görev yok.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-slate-200">
                  {completedOrdered.map((id) => (
                    <li key={id}>- {taskById.get(id)?.title || id}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-lg border border-slate-700/70 bg-fortress-950/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Kalanlar</p>
              {remainingOrdered.length === 0 ? (
                <p className="mt-2 text-sm text-emerald-300">Tebrikler, tüm görevler tamamlandı.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-slate-200">
                  {remainingOrdered.map((id) => (
                    <li key={id}>- {taskById.get(id)?.title || id}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

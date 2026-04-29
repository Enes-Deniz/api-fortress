import Header from "@/components/layout/Header";
import AuthTabs from "@/components/auth/AuthTabs";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="auth" />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 sm:gap-12 sm:px-6 sm:py-14">
        <header className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fortress-accent">
              Bitirme projesi · API Fortress
            </p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.35rem] lg:leading-tight">
              Çift yüzlü REST laboratuvarına giriş
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400">
              Aynı endpoint tasarımı üzerinde iki ayrı Flask servisi: bilinçli olarak zafiyetli
              <span className="text-amber-200/90"> Insecure </span>
              ve savunmacı referans
              <span className="text-sky-200/90"> Secure </span>. Kimlik doğrulama platformda tek
              oturum olarak yönetilir; giriş sonrası Dashboard&apos;dan API modunu seçerek
              laboratuvar görevlerine geçebilirsiniz.
            </p>
          </div>
          <ul className="grid gap-3 text-sm text-slate-400 sm:grid-cols-2 lg:grid-cols-1 lg:text-right">
            <li className="rounded-xl border border-slate-800/80 bg-fortress-950/40 px-4 py-3 lg:ml-auto lg:max-w-sm">
              <span className="font-medium text-slate-200">JWT oturumu</span>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Giriş ve kayıt Secure API üzerinden yapılır; token tarayıcıda saklanır ve mod
                değiştirildiğinde düşürülmez.
              </p>
            </li>
            <li className="rounded-xl border border-slate-800/80 bg-fortress-950/40 px-4 py-3 lg:ml-auto lg:max-w-sm">
              <span className="font-medium text-slate-200">Sunum modu</span>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Insecure / Secure arası geçiş görev ekranından yapılır; eğitim akışı tek ekranda kalır.
              </p>
            </li>
          </ul>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <div className="order-2 lg:order-1">
            <AuthTabs />
          </div>
          <aside className="order-1 space-y-4 rounded-2xl border border-dashed border-slate-700/60 bg-fortress-950/30 p-5 text-sm text-slate-400 lg:order-2 lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Akış özeti</p>
            <ol className="list-decimal space-y-2.5 pl-4 leading-relaxed">
              <li>Aşağıdan hesap oluşturun veya giriş yapın (platform kimliği).</li>
              <li>Dashboard&apos;a geçiş yapın.</li>
              <li>Orada Insecure / Secure modunu seçerek CTF ve sağlık durumuna bakın.</li>
            </ol>
          </aside>
        </div>
      </main>
    </div>
  );
}

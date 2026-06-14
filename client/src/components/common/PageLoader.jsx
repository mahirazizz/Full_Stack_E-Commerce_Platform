function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg rounded-[1.75rem] border border-slate-200/80 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        </div>
        <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-950">
          Loading your store
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Checking your session and preparing a personalized workspace.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-950 px-4 py-3 text-left text-white">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">
              Secure
            </p>
            <p className="mt-2 text-sm font-semibold">Verifying login state</p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-left text-slate-950">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
              Fast
            </p>
            <p className="mt-2 text-sm font-semibold">
              Preparing your dashboard
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-left text-slate-950">
            <p className="text-[11px] uppercase tracking-[0.22em] text-amber-700">
              Ready
            </p>
            <p className="mt-2 text-sm font-semibold">
              Syncing cart and orders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageLoader;

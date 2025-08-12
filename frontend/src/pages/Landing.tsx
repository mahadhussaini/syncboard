import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-sm" />
            <span className="font-semibold text-lg tracking-tight text-slate-900">SyncBoard</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#realtime" className="hover:text-slate-900 transition-colors">Realtime</a>
            <a href="#ai" className="hover:text-slate-900 transition-colors">AI</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-slate-700 hover:text-slate-900">Log in</Link>
            <Link to="/register" className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
              Collaborate in real-time. <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Plan with AI</span>. Deliver as one.
            </h1>
            <p className="mt-5 text-lg text-slate-600 leading-7 max-w-xl">
              SyncBoard unifies whiteboards, tasks, and notes with instant updates. AI helps your team summarize, prioritize, and ship faster.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Link to="/register" className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow">
                Start free trial
              </Link>
              <a href="#features" className="inline-flex items-center justify-center px-5 py-3 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">
                Explore features
              </a>
            </div>
            <div className="mt-6 text-xs text-slate-500">No credit card required • Free during beta</div>
            <div className="mt-8 flex items-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-green-500"/> Live sync</div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500"/> AI assistant</div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"/> Offline-first</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-indigo-100/60 rounded-2xl blur-2xl" />
            <div className="relative rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
                <div className="h-3 w-3 bg-red-400 rounded-full" />
                <div className="h-3 w-3 bg-yellow-400 rounded-full" />
                <div className="h-3 w-3 bg-green-400 rounded-full" />
                <div className="ml-auto text-xs text-slate-500">Preview</div>
              </div>
              <div className="p-6 grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-slate-50 border">
                  <div className="text-sm font-semibold mb-2">Realtime Boards</div>
                  <p className="text-sm text-slate-600">Drag-and-drop tasks with instant sync across your team.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border">
                  <div className="text-sm font-semibold mb-2">AI Assist</div>
                  <p className="text-sm text-slate-600">Summarize meetings, generate timelines, and suggest tasks.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border">
                  <div className="text-sm font-semibold mb-2">Offline-first</div>
                  <p className="text-sm text-slate-600">Keep working without internet. Sync when you’re back.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border">
                  <div className="text-sm font-semibold mb-2">RBAC</div>
                  <p className="text-sm text-slate-600">Granular roles for owners, admins, members and viewers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section id="features" className="py-16 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Everything you need to move work forward</h2>
          <p className="text-slate-600 mt-2">Built for fast-moving teams that value clarity and speed.</p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Live collaboration', desc: 'See edits as they happen with presence and cursors.', icon: '👥' },
              { title: 'Kanban + Whiteboards', desc: 'Visualize work the way your team prefers.', icon: '🧩' },
              { title: 'Notifications', desc: 'Stay in sync with real-time updates and mentions.', icon: '🔔' },
              { title: 'Attachments', desc: 'Share docs and media with previews and metadata.', icon: '📎' },
              { title: 'Analytics', desc: 'Understand velocity, blockers, and trends.', icon: '📈' },
              { title: 'Templates', desc: 'Kickstart with best-practice workspace setups.', icon: '📦' },
            ].map((f) => (
              <div key={f.title} className="p-5 rounded-xl border bg-white shadow-sm hover:shadow transition-shadow">
                <div className="h-10 w-10 rounded bg-indigo-600/10 text-indigo-700 flex items-center justify-center mb-3">
                  <span aria-hidden>{f.icon}</span>
                </div>
                <div className="font-semibold text-slate-900">{f.title}</div>
                <div className="text-sm text-slate-600 mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Realtime */}
      <section id="realtime" className="py-16 border-t bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Designed for realtime collaboration</h2>
            <p className="mt-3 text-slate-600 max-w-xl">Presence, cursors, instant updates. Ship together without stepping on toes.</p>
            <ul className="mt-6 space-y-3 text-slate-700">
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" /> Live presence and cursors</li>
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" /> Socket.IO + Redis Pub/Sub</li>
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-amber-500" /> Offline queue with background sync</li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-200/60 to-violet-200/60 rounded-2xl blur-2xl" />
            <div className="relative bg-white border rounded-2xl shadow-xl p-6 min-h-[220px]">
              <div className="h-6 w-24 rounded bg-slate-100 mb-4" />
              <div className="grid grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-20 rounded-lg border bg-slate-50" />
                ))}
              </div>
              <div className="mt-4 h-6 w-32 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      </section>

      {/* AI */}
      <section id="ai" className="py-16 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-fuchsia-200/60 to-indigo-200/60 rounded-2xl blur-2xl" />
            <div className="relative bg-white border rounded-2xl shadow-xl p-6 min-h-[220px]">
              <div className="h-6 w-28 rounded bg-slate-100 mb-4" />
              <div className="space-y-3">
                <div className="h-10 rounded-lg border bg-slate-50" />
                <div className="h-10 rounded-lg border bg-slate-50" />
                <div className="h-10 rounded-lg border bg-slate-50" />
              </div>
              <div className="mt-4 h-6 w-24 rounded bg-slate-100" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-2xl font-bold text-slate-900">AI that accelerates your team</h2>
            <p className="mt-3 text-slate-600 max-w-xl">Turn chaos into clarity. Summaries, task suggestions, and timelines at your fingertips.</p>
            <ul className="mt-6 space-y-3 text-slate-700">
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" /> Summarize meetings into action items</li>
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-fuchsia-500" /> Suggest tasks and estimate timelines</li>
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-blue-500" /> Context-aware insights across boards</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="py-16 border-t bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border bg-white p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Simple pricing for growing teams</h3>
              <p className="text-slate-600 mt-1">Free during beta. Team plans coming soon.</p>
            </div>
            <Link to="/register" className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow">
              Join the beta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-indigo-600" />
            <span className="font-medium text-slate-800">SyncBoard</span>
            <span className="ml-2">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <a className="hover:text-slate-900" href="#">Privacy</a>
            <a className="hover:text-slate-900" href="#">Terms</a>
            <a className="hover:text-slate-900" href="#">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
import { ReactNode, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore();

  const userInitials = useMemo(() => {
    const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    if (name) {
      return name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0]?.toUpperCase())
        .slice(0, 2)
        .join('');
    }
    const email = user?.email || '';
    return email ? email[0]?.toUpperCase() : 'U';
  }, [user]);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/teams', label: 'Teams' },
    { to: '/workspaces', label: 'Workspaces' },
    { to: '/analytics', label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r bg-gray-900 text-white">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <div className="h-8 w-8 rounded bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
          <div>
            <div className="text-sm tracking-wider uppercase text-white/70">SyncBoard</div>
            <div className="text-xs text-white/50">Collaborate in real-time</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-2 text-[11px] uppercase tracking-wider text-white/40">Navigation</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm transition-colors duration-150 ` +
                (isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/80 hover:text-white hover:bg-white/5')
              }
              end
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold">
              {userInitials}
            </div>
            <div className="min-w-0">
              <div className="text-sm truncate">{user?.firstName ? `${user.firstName} ${user?.lastName || ''}` : user?.email}</div>
              <div className="text-xs text-white/50 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 w-full text-sm px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 active:bg-white/20 text-white/90"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="font-medium text-gray-700">{new Date().toLocaleDateString()}</div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-sm text-gray-500">Welcome, {user?.firstName || user?.email}</div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
            </div>
          </div>
        </header>

        <div className="flex-1">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
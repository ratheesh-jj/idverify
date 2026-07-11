import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  HiOutlineHome, HiOutlineDocumentAdd, HiOutlineClipboardList, HiOutlineUsers,
  HiOutlineChartBar, HiOutlineLogout, HiOutlineMoon, HiOutlineSun,
  HiOutlineMenu, HiOutlineX, HiOutlineShieldCheck, HiOutlineDocumentSearch,
  HiOutlineClock,
} from 'react-icons/hi';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const makerLinks = [
    { to: '/maker', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/maker/new-request', icon: HiOutlineDocumentAdd, label: 'New Request' },
    { to: '/maker/requests', icon: HiOutlineClipboardList, label: 'My Requests' },
  ];

  const checkerLinks = [
    { to: '/checker', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/checker/pending', icon: HiOutlineClock, label: 'Pending' },
    { to: '/checker/verified', icon: HiOutlineShieldCheck, label: 'Verified' },
    { to: '/checker/rejected', icon: HiOutlineX, label: 'Rejected' },
  ];

  const adminLinks = [
    { to: '/admin', icon: HiOutlineChartBar, label: 'Dashboard' },
    { to: '/admin/users', icon: HiOutlineUsers, label: 'Users' },
    { to: '/admin/requests', icon: HiOutlineClipboardList, label: 'Requests' },
    { to: '/admin/audit-logs', icon: HiOutlineDocumentSearch, label: 'Audit Logs' },
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'checker' ? checkerLinks : makerLinks;

  const roleColors = {
    maker: 'bg-blue-500',
    checker: 'bg-emerald-500',
    admin: 'bg-purple-500',
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out bg-white dark:bg-navy-900 border-r border-navy-100 dark:border-navy-800 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-navy-100 dark:border-navy-800">
          <div className="w-9 h-9 bg-gradient-to-br from-navy-600 to-navy-800 rounded-xl flex items-center justify-center shadow-lg">
            <HiOutlineShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-navy-900 dark:text-white tracking-tight">IDVerify</h1>
            <p className="text-[10px] text-navy-500 dark:text-navy-400 uppercase tracking-wider font-medium">Identity System</p>
          </div>
        </div>

        {/* User card */}
        <div className="px-4 py-4">
          <div className="bg-navy-50 dark:bg-navy-800/50 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-navy-500 to-navy-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-900 dark:text-white truncate">{user?.name}</p>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${roleColors[user?.role]}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-navy-600 text-white shadow-md shadow-navy-600/25'
                    : 'text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800 hover:text-navy-900 dark:hover:text-white'
                  }`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-navy-100 dark:border-navy-800 space-y-1">
          <button onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors">
            {darkMode ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <HiOutlineLogout className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

const Topbar = ({ setSidebarOpen }) => {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border-b border-navy-100 dark:border-navy-800">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors">
          <HiOutlineMenu className="w-5 h-5" />
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <span className="text-sm text-navy-500 dark:text-navy-400 hidden sm:block">
            Welcome, <span className="font-semibold text-navy-700 dark:text-navy-200">{user?.name}</span>
          </span>
        </div>
      </div>
    </header>
  );
};

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Topbar setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

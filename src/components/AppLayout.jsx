import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  Shield,
  Settings,
  Search,
  Bell,
  ChevronDown,
  ChevronUp,
  Menu
} from 'lucide-react';

/**
 * App Layout Component
 * Provides the shell layout matching SVL One design:
 * - Top header bar
 * - Left sidebar navigation
 * - Main content area
 */
const AppLayout = ({ children }) => {
  const [adminExpanded, setAdminExpanded] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: false },
    { icon: FileText, label: 'Quote Builder', active: true },
    { icon: BarChart3, label: 'Reports', active: false },
  ];

  const adminItems = [
    { icon: Users, label: 'Users', active: false },
    { icon: Shield, label: 'Roles & Permissions', active: false },
    { icon: Settings, label: 'System', active: false },
  ];

  return (
    <div className="min-h-screen bg-svl-gray-light flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-svl-gray h-14 flex items-center px-4 flex-shrink-0 z-20">
        {/* Left: Logo area */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-svl-gray-light rounded-md text-svl-gray-dark"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-svl-orange rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <span className="font-semibold text-svl-navy text-lg">Quote Builder</span>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-svl-gray-dark" />
            <input
              type="text"
              placeholder="Search for Job/Order Name or Number"
              className="w-full pl-10 pr-4 py-2 bg-svl-gray-light border border-svl-gray rounded-md text-sm focus:outline-none focus:border-svl-blue-bright focus:ring-1 focus:ring-svl-blue-bright"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-svl-gray-light rounded-md text-svl-gray-dark relative">
            <Bell size={20} />
          </button>
          <button className="p-2 hover:bg-svl-gray-light rounded-md text-svl-gray-dark">
            <Settings size={20} />
          </button>
          <div className="w-8 h-8 bg-svl-blue rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`bg-white border-r border-svl-gray flex-shrink-0 flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-56'}`}>
          <nav className="flex-1 py-4">
            {/* Main Nav Items */}
            <div className="px-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    item.active
                      ? 'text-svl-blue-bright bg-svl-blue-light'
                      : 'text-svl-gray-dark hover:bg-svl-gray-light'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon size={20} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              ))}
            </div>

            {/* Admin Section */}
            <div className="mt-6 px-3">
              {!sidebarCollapsed && (
                <button
                  onClick={() => setAdminExpanded(!adminExpanded)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-svl-gray-dark uppercase tracking-wider"
                >
                  <span>Admin</span>
                  {adminExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
              {(adminExpanded || sidebarCollapsed) && (
                <div className="space-y-1 mt-1">
                  {adminItems.map((item) => (
                    <button
                      key={item.label}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        item.active
                          ? 'text-svl-blue-bright bg-svl-blue-light'
                          : 'text-svl-gray-dark hover:bg-svl-gray-light'
                      }`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <item.icon size={20} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Footer in sidebar */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-svl-gray">
              <p className="text-xs text-svl-gray-dark">
                &copy; 2025 SVL, Inc.
              </p>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

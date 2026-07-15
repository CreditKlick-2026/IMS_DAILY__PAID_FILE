"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ButtonGroup, Button } from '@shopify/polaris';
import { LayoutGrid, Users, Phone, UploadCloud, BarChart2, Settings, LineChart, Database, LogOut, Network } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  user: any;
  isMobileOpen?: boolean;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  logout?: () => void;
}


const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, user, isMobileOpen, isCollapsed, toggleCollapse, logout }) => {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Use a small timeout to ensure the state is applied before enabling transitions
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    {
      id: 'dashboard', label: 'Dashboard', section: 'OPERATIONS', link: '/dashboard',
      Icon: LayoutGrid, color: 'text-primary'
    },
    {
      id: 'live-records', label: 'Live Records', section: 'OPERATIONS', hasDot: true, link: '/dashboard/live-records',
      Icon: Users, color: 'text-primary'
    },

    {
      id: 'upload', label: 'Upload Data', section: 'MANAGEMENT', roles: ['admin', 'user'],
      Icon: UploadCloud, color: 'text-primary'
    },
    {
      id: 'duplicate', label: 'Duplicate Records', section: 'MANAGEMENT', link: '/dashboard/duplicate',
      Icon: Users, color: 'text-primary'
    },



    {
      id: 'admin', label: 'Admin Panel', section: 'MANAGEMENT', roles: ['admin'], link: '/dashboard/admin',
      Icon: Settings, color: 'text-primary'
    },
    {
      id: 'rules-engine', label: 'Rules Engine', section: 'MANAGEMENT', roles: ['admin'], link: '/dashboard/rules-engine',
      Icon: Database, color: 'text-primary'
    },

    {
      id: 'incentive-gurugram', label: 'Inc - Gurugram', section: 'MANAGEMENT', link: '/dashboard/incentive/gurugram',
      Icon: Database, color: 'text-primary'
    },
    {
      id: 'incentive-uttam-nagar', label: 'Inc - Uttam N', section: 'MANAGEMENT', link: '/dashboard/incentive/uttam-nagar',
      Icon: Database, color: 'text-primary'
    },
    {
      id: 'incentive-pune', label: 'Inc - Pune', section: 'MANAGEMENT', link: '/dashboard/incentive/pune',
      Icon: Database, color: 'text-primary'
    },
    {
      id: 'incentive-delhi', label: 'Inc - Delhi', section: 'MANAGEMENT', link: '/dashboard/incentive/delhi',
      Icon: Database, color: 'text-primary'
    },
    {
      id: 'incentive-dashboard', label: 'Incentive Dashboard', section: 'MANAGEMENT', link: '/dashboard/incentive-dashboard',
      Icon: BarChart2, color: 'text-primary'
    },
    {
      id: 'audit', label: 'Audit Logs', section: 'MANAGEMENT', roles: ['admin'], link: '/dashboard/audit',
      Icon: LineChart, color: 'text-primary'
    },
    {
      id: 'keka-master', label: 'Employee Master', section: 'MANAGEMENT', roles: ['admin'], link: '/dashboard/keka-master',
      Icon: Database, color: 'text-primary'
    },
    {
      id: 'mapping-list', label: 'Mapping List', section: 'MANAGEMENT', roles: ['admin'], link: '/dashboard/mapping-list',
      Icon: Network, color: 'text-primary'
    }
  ];

  const sections = ['OPERATIONS', 'MANAGEMENT'];

  return (
    <div
      className={`h-[calc(100vh-64px)] bg-background border-r border-border/60 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[72px]' : 'w-48'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:relative z-30 lg:z-10 ${!mounted ? 'transition-none' : ''}`}
    >
      <div className="flex flex-col items-stretch gap-1.5 py-4 overflow-y-auto flex-1 px-3 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navItems.filter(i => (!i.roles || i.roles.includes(user?.role))).map((item, index) => {
          let isActive = activePage === item.id;
          if (item.id.startsWith('incentive-')) {
            const locParam = searchParams ? searchParams.get('location') : null;
            if (locParam) {
              // handled by activePage now
            }
          }
          const Icon = item.Icon;
          return (
            <Button
              key={item.id}
              pressed={isActive}
              fullWidth
              textAlign={isCollapsed ? "center" : "left"}
              size="large"
              onClick={() => {
                if (item.link) {
                  router.push(item.link);
                } else {
                  setActivePage(item.id);
                }
              }}
            >
              {/* @ts-expect-error Polaris Button typings restrict children to strings, but React allows elements */}
              <div className={`flex items-center gap-3 ${!isCollapsed ? 'justify-start' : 'justify-center'}`}>
                <div className="flex-shrink-0 [&_svg]:!fill-transparent">
                  <Icon size={18} color="#2563eb" style={{ fill: 'none' }} />
                </div>
                {!isCollapsed && (
                  <span className={`text-[13px] tracking-tight ${isActive ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                    {item.label}
                  </span>
                )}
              </div>
            </Button>
          );
        })}
      </div>

      {/* Bottom toggle button */}
      <div className={`flex items-center p-3 border-t border-border/50 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && logout && (
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer bg-transparent border-none"
            onClick={() => {
              if (confirm('Are you sure you want to logout?')) {
                logout();
              }
            }}
          >
            <LogOut size={16} strokeWidth={2.5} />
            Sign Out
          </button>
        )}

        {isCollapsed && logout && (
          <button
            className="flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-none mb-2"
            onClick={() => {
              if (confirm('Are you sure you want to logout?')) {
                logout();
              }
            }}
            title="Sign Out"
          >
            <LogOut size={16} strokeWidth={2.5} />
          </button>
        )}

        <button
          className="flex items-center justify-center w-8 h-8 border border-border/80 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer bg-card shadow-sm"
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

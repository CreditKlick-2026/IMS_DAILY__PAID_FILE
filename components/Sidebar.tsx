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
      className={`h-[calc(100vh-48px)] bg-[var(--bg-top)] border-r border-border flex-shrink-0 flex flex-col transition-all duration-200 ease-in-out ${isCollapsed ? 'w-[60px]' : 'w-[160px]'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:relative z-30 lg:z-10 ${!mounted ? 'transition-none' : ''}`}
    >
      <div className="flex flex-col items-stretch gap-2 py-4 overflow-y-auto flex-1 px-2 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
              textAlign="left"
              icon={<span className={item.color}><Icon size={16} strokeWidth={2.5} style={{ fill: 'none' }} /></span>}
              onClick={() => {
                if (item.link) {
                  router.push(item.link);
                } else {
                  setActivePage(item.id);
                }
              }}
            >
              {isCollapsed ? '' : item.label}
            </Button>
          );
        })}
      </div>

      {/* Bottom toggle button */}
      <div className={`flex items-center p-3 border-t border-border/50 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && logout && (
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer bg-transparent border-none"
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
            className="flex items-center justify-center w-7 h-7 rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer bg-transparent border-none mb-2"
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
          className="flex items-center justify-center w-7 h-7 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer bg-transparent"
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

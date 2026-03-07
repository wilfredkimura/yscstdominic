import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FileText,
    Calendar,
    Image as ImageIcon,
    Users,
    Settings,
    LogOut,
    Menu,
    Bell,
    ChevronLeft,
    Home,
    FolderOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
    collapsed: boolean;
}

const SidebarItem = ({ icon, label, active, onClick, collapsed }: SidebarItemProps) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-burgundy text-gold' : 'text-navy/60 hover:bg-burgundy/5 hover:text-burgundy'
            }`}
    >
        <div className="flex-shrink-0">{icon}</div>
        {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
    </button>
);

export function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { label: 'Overview', icon: <LayoutDashboard size={20} />, path: '/admin' },
        { label: 'Blog Posts', icon: <FileText size={20} />, path: '/admin/blogs' },
        { label: 'Events', icon: <Calendar size={20} />, path: '/admin/events' },
        { label: 'Gallery', icon: <ImageIcon size={20} />, path: '/admin/gallery' },
        { label: 'Resources', icon: <FolderOpen size={20} />, path: '/admin/resources' },
        { label: 'YSC Leaders', icon: <Users size={20} />, path: '/admin/leaders' },
        { label: 'User Management', icon: <Users size={20} />, path: '/admin/users' },
        { label: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
    ];

    const isPathActive = (path: string) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    const handleMenuItemClick = (path: string) => {
        navigate(path);
        setMobileMenuOpen(false);
    };

    return (
        <div className="flex h-screen bg-softWhite overflow-hidden">
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 md:relative bg-white border-r border-navy/10 transition-all duration-300 flex flex-col
                    ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
                    ${collapsed ? 'md:w-20' : 'md:w-64'}`}
            >
                <div className="p-6 flex items-center justify-between">
                    {(!collapsed || mobileMenuOpen) && (
                        <span className="font-serif font-bold text-navy text-xl">Admin</span>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1 hover:bg-navy/5 rounded hidden md:block"
                    >
                        <Menu size={20} className="text-navy" />
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-1 hover:bg-navy/5 rounded md:hidden"
                    >
                        <ChevronLeft size={20} className="text-navy" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            active={isPathActive(item.path)}
                            collapsed={collapsed && !mobileMenuOpen}
                            onClick={() => handleMenuItemClick(item.path)}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-navy/10">
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors`}
                    >
                        <LogOut size={20} />
                        {(!collapsed || mobileMenuOpen) && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="bg-white border-b border-navy/10 h-16 flex items-center justify-between px-4 sm:px-8 z-30">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 hover:bg-navy/5 rounded md:hidden text-navy"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-lg font-semibold text-navy truncate">YSC Dashboard</h1>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-6">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center space-x-2 text-navy/60 hover:text-burgundy transition-colors text-sm font-medium p-2"
                            title="Back to Public Site"
                        >
                            <Home size={18} />
                            <span className="hidden lg:inline">Back to Site</span>
                        </button>
                        <button className="hidden sm:block text-navy/40 hover:text-navy transition-colors relative p-2">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-burgundy rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center space-x-3 border-l border-navy/10 pl-2 sm:pl-6 text-sm">
                            <div className="text-right hidden xl:block">
                                <p className="font-medium text-navy truncate max-w-[120px]">{user?.full_name}</p>
                                <p className="text-xs text-navy/40">{user?.role}</p>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-burgundy/10 rounded-full flex items-center justify-center text-burgundy font-serif font-bold text-sm sm:text-base flex-shrink-0">
                                {user?.full_name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Viewport */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

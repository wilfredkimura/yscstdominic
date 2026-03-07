import { useEffect, useState } from 'react';
import { FileText, Users, Calendar, BarChart2, CheckCircle2, Loader2, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';

export function AdminOverviewPage() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('day');

    const periods = [
        { id: 'hour', label: 'Hour' },
        { id: 'day', label: 'Day' },
        { id: 'week', label: 'Week' },
        { id: 'month', label: 'Month' },
        { id: 'year', label: 'Year' }
    ];

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/analytics/overview?period=${period}`);
                setAnalytics(res.data);
            } catch (err) {
                console.error('Failed to fetch analytics', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [period]);

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-navy">Dashboard Overview</h2>
                    <p className="text-sm text-navy/60">Welcome back. Here is your community at a glance.</p>
                </div>
                <div className="flex bg-navy/5 p-1 rounded-xl w-fit">
                    {periods.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${period === p.id ? 'bg-white text-burgundy shadow-sm' : 'text-navy/60 hover:text-navy'}`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatsCard
                    title="Total Page Views"
                    value={loading ? undefined : analytics?.metrics?.total_views?.toString()}
                    icon={<BarChart2 size={20} />}
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                />
                <StatsCard
                    title="Upcoming Events"
                    value={loading ? undefined : analytics?.metrics?.upcoming_events?.toString()}
                    icon={<Calendar size={20} />}
                    color="text-green-600"
                    bg="bg-green-50"
                />
                <StatsCard
                    title="Total Event RSVPs"
                    value={loading ? undefined : analytics?.metrics?.total_rsvps?.toString()}
                    icon={<CheckCircle2 size={20} />}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <StatsCard
                    title="Published Blogs"
                    value={loading ? undefined : analytics?.metrics?.total_blogs?.toString()}
                    icon={<FileText size={20} />}
                    color="text-burgundy"
                    bg="bg-burgundy/5"
                />
                <StatsCard
                    title="Registered Users"
                    value={loading ? undefined : analytics?.metrics?.total_users?.toString()}
                    icon={<Users size={20} />}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
            </div>

            {/* Traffic Trend Chart */}
            <Card className="p-6 overflow-hidden border-navy/5 shadow-sm">
                <h3 className="font-serif font-bold text-navy text-lg mb-6">Traffic Trend</h3>
                {loading ? (
                    <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-burgundy" /></div>
                ) : (
                    <div className="h-64 flex flex-col">
                        <div className="flex-1 relative">
                            {analytics?.time_series?.length > 1 ? (
                                <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="rgba(128, 0, 32, 0.2)" />
                                            <stop offset="100%" stopColor="rgba(128, 0, 32, 0)" />
                                        </linearGradient>
                                    </defs>

                                    {/* Area under the line */}
                                    <path
                                        d={`
                                            M ${((0 / (analytics.time_series.length - 1)) * 1000)} 200
                                            ${analytics.time_series.map((item: any, i: number) => {
                                            const x = (i / (analytics.time_series.length - 1)) * 1000;
                                            const maxViews = Math.max(...analytics.time_series.map((v: any) => parseInt(v.views))) || 1;
                                            const y = 180 - (parseInt(item.views) / maxViews) * 150;
                                            return `L ${x} ${y}`;
                                        }).join(' ')}
                                            L 1000 200
                                            Z
                                        `}
                                        fill="url(#chartGradient)"
                                    />

                                    {/* The Line */}
                                    <path
                                        d={`
                                            M ${(0 / (analytics.time_series.length - 1)) * 1000} ${180 - (parseInt(analytics.time_series[0].views) / (Math.max(...analytics.time_series.map((v: any) => parseInt(v.views))) || 1)) * 150}
                                            ${analytics.time_series.map((item: any, i: number) => {
                                            const x = (i / (analytics.time_series.length - 1)) * 1000;
                                            const maxViews = Math.max(...analytics.time_series.map((v: any) => parseInt(v.views))) || 1;
                                            const y = 180 - (parseInt(item.views) / maxViews) * 150;
                                            return `L ${x} ${y}`;
                                        }).join(' ')}
                                        `}
                                        fill="none"
                                        stroke="#800020"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />

                                    {/* Data Points */}
                                    {analytics.time_series.map((item: any, i: number) => {
                                        const x = (i / (analytics.time_series.length - 1)) * 1000;
                                        const maxViews = Math.max(...analytics.time_series.map((v: any) => parseInt(v.views))) || 1;
                                        const y = 180 - (parseInt(item.views) / maxViews) * 150;
                                        return (
                                            <g key={i} className="group/point">
                                                <circle
                                                    cx={x}
                                                    cy={y}
                                                    r="4"
                                                    fill="#800020"
                                                    className="transition-all duration-300 group-hover/point:r-6"
                                                />
                                                <circle
                                                    cx={x}
                                                    cy={y}
                                                    r="12"
                                                    fill="transparent"
                                                    className="cursor-pointer"
                                                />
                                            </g>
                                        );
                                    })}
                                </svg>
                            ) : (
                                <div className="h-full flex items-center justify-center text-navy/30 italic text-sm">
                                    Not enough data for trend analysis
                                </div>
                            )}
                        </div>

                        {/* X-Axis Labels */}
                        <div className="flex justify-between mt-4 px-2">
                            {analytics?.time_series?.filter((_: any, i: number) => i % Math.max(1, Math.floor(analytics.time_series.length / 6)) === 0).map((item: any, idx: number) => (
                                <span key={idx} className="text-[10px] font-medium text-navy/40 uppercase tracking-wider">
                                    {new Date(item.label).toLocaleDateString([], {
                                        month: period === 'year' ? undefined : 'short',
                                        day: period === 'year' ? undefined : 'numeric',
                                        hour: period === 'hour' ? '2-digit' : undefined,
                                        year: period === 'year' ? 'numeric' : undefined
                                    })}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-0 overflow-hidden border-navy/5 shadow-sm">
                    <div className="p-5 border-b border-navy/5 flex justify-between items-center bg-navy/[0.02]">
                        <h3 className="font-serif font-bold text-navy text-lg">Most Popular Pages</h3>
                        <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-burgundy flex items-center hover:text-gold transition-colors">
                            Vercel Web Analytics <ArrowUpRight size={14} className="ml-1" />
                        </a>
                    </div>
                    {loading ? (
                        <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-burgundy" /></div>
                    ) : (
                        <div className="p-5">
                            <div className="space-y-4">
                                {analytics?.top_pages?.map((page: any, idx: number) => {
                                    // Calculate simple percentage width based on max views
                                    const maxViews = Math.max(...analytics.top_pages.map((p: any) => parseInt(p.views))) || 1;
                                    const percent = Math.round((parseInt(page.views) / maxViews) * 100);

                                    return (
                                        <div key={idx} className="relative pt-1">
                                            <div className="flex mb-2 items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-semibold inline-block text-navy bg-navy/5 px-2 py-1 rounded">
                                                        {page.path === '/' ? '/home' : page.path}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-semibold inline-block text-burgundy">
                                                        {page.views} views
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-burgundy/10">
                                                <div style={{ width: `${percent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-burgundy"></div>
                                            </div>
                                        </div>
                                    )
                                })}
                                {(!analytics?.top_pages || analytics.top_pages.length === 0) && (
                                    <p className="text-center text-navy/40 text-sm py-8">Not enough traffic data yet.</p>
                                )}
                            </div>
                        </div>
                    )}
                </Card>

                <Card className="p-0 overflow-hidden border-navy/5 shadow-sm">
                    <div className="p-5 border-b border-navy/5 bg-navy/[0.02]">
                        <h3 className="font-serif font-bold text-navy text-lg">Recent Visitors</h3>
                    </div>
                    {loading ? (
                        <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-burgundy" /></div>
                    ) : (
                        <div className="divide-y divide-navy/5">
                            {analytics?.recent_activity?.slice(0, 7).map((log: any, idx: number) => (
                                <div key={idx} className="p-4 flex justify-between items-center hover:bg-navy/[0.02] transition-colors">
                                    <span className="text-sm font-medium text-navy/80 truncate max-w-[150px]">
                                        {log.path}
                                    </span>
                                    <span className="text-xs text-navy/40 shrink-0">
                                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                            {(!analytics?.recent_activity || analytics.recent_activity.length === 0) && (
                                <p className="text-center text-navy/40 text-sm py-8">No recent activity.</p>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

interface StatsCardProps {
    title: string;
    value?: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
}

function StatsCard({ title, value, icon, color, bg }: StatsCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl border border-navy/5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-navy/40 font-medium">{title}</p>
                <div className={`${bg} ${color} p-2 rounded-lg`}>
                    {icon}
                </div>
            </div>
            <div className="flex items-end justify-between">
                {value === undefined ? (
                    <Loader2 size={24} className="animate-spin text-navy/10" />
                ) : (
                    <h4 className="text-3xl font-bold text-navy tracking-tight">{value}</h4>
                )}
            </div>
        </div>
    );
}

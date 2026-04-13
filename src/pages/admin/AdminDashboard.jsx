import { useEffect, useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { userAPI } from '../../services/userAPI';
import { orderAPI } from '../../services/orderAPI';
import { reportAPI } from '../../services/reportAPI';
import { activityLogAPI } from '../../services/activityLogAPI';
import {
    HiOutlineShoppingCart,
    HiOutlineCurrencyDollar,
    HiOutlineUsers,
    HiOutlineCheckCircle,
    HiOutlineTrendingUp,
    HiOutlineDocumentText,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';

function AdminDashboard() {
    const [stats, setStats] = useState({ users: null, orders: null, reports: null, activities: null });
    const [timePeriod, setTimePeriod] = useState('today');

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        try {
            const [usersRes, ordersRes, reportsRes, activitiesRes] = await Promise.all([
                userAPI.getUserStats().catch(() => ({ data: null })),
                orderAPI.getOrderStats().catch(() => ({ data: null })),
                reportAPI.getReportStats().catch(() => ({ data: null })),
                activityLogAPI.getActivityStats().catch(() => ({ data: null })),
            ]);
            setStats({ users: usersRes.data, orders: ordersRes.data, reports: reportsRes.data, activities: activitiesRes.data });
        } catch {
            setStats({ users: null, orders: null, reports: null, activities: null });
        }
    };

    const statusColors = [
        { bg: 'rgba(16,185,129,0.08)', text: '#10b981', border: 'rgba(16,185,129,0.2)' },
        { bg: 'rgba(245,158,11,0.08)', text: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
        { bg: 'rgba(59,130,246,0.08)', text: '#3b82f6', border: 'rgba(59,130,246,0.2)' },
        { bg: 'rgba(139,92,246,0.08)', text: '#8b5cf6', border: 'rgba(139,92,246,0.2)' },
    ];

    const reportColors = [
        { bg: 'rgba(59,130,246,0.06)', text: '#3b82f6', border: 'rgba(59,130,246,0.15)' },
        { bg: 'rgba(16,185,129,0.06)', text: '#10b981', border: 'rgba(16,185,129,0.15)' },
        { bg: 'rgba(139,92,246,0.06)', text: '#8b5cf6', border: 'rgba(139,92,246,0.15)' },
    ];

    const periodButtons = [
        { id: 'today', label: 'Today' },
        { id: 'weekly', label: 'Weekly' },
        { id: 'monthly', label: 'Monthly' },
    ];

    return (
        <MainLayout>
            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-heading-2">Executive Dashboard</h1>
                        <p className="text-description mt-1">Real-time overview of your operations</p>
                    </div>

                    {/* Time period filter */}
                    <div className="flex items-center gap-1 rounded-xl p-1 border overflow-x-auto no-scrollbar" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border)' }}>
                        {periodButtons.map((period) => (
                            <button
                                key={period.id}
                                onClick={() => setTimePeriod(period.id)}
                                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 whitespace-nowrap min-h-[36px]"
                                style={timePeriod === period.id
                                    ? { backgroundColor: 'var(--primary)', color: '#fff' }
                                    : { color: 'var(--text-secondary)' }
                                }
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard
                        title="TODAY ORDERS"
                        value={stats.orders?.[0]?.total?.[0]?.count || 441}
                        icon={HiOutlineShoppingCart}
                        iconBgColor="bg-orange-500/10"
                        iconColor="text-orange-500"
                        trend={{ value: 12.8, isPositive: true }}
                    />
                    <StatCard
                        title="TOTAL REVENUE"
                        value={`$${(stats.orders?.[0]?.total?.[0]?.revenue || 28450).toLocaleString()}`}
                        icon={HiOutlineCurrencyDollar}
                        iconBgColor="bg-emerald-500/10"
                        iconColor="text-emerald-500"
                        trend={{ value: 8.2, isPositive: true }}
                    />
                    <StatCard
                        title="ACTIVE CUSTOMERS"
                        value={stats.users?.[0]?.activeUsers?.[0]?.count || 842}
                        icon={HiOutlineUsers}
                        iconBgColor="bg-blue-500/10"
                        iconColor="text-blue-500"
                        trend={{ value: 2.4, isPositive: true }}
                    />
                    <StatCard
                        title="ORDER ACCEPTANCE"
                        value="98.5%"
                        icon={HiOutlineCheckCircle}
                        iconBgColor="bg-cyan-500/10"
                        iconColor="text-cyan-500"
                        trend={{ value: 0.4, isPositive: true }}
                    />
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Revenue Analytics */}
                    <div className="lg:col-span-2">
                        <Card>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                                <div>
                                    <h2 className="text-heading-4">Revenue Analytics</h2>
                                    <p className="text-caption mt-1" style={{ color: 'var(--text-muted)' }}>Today's performance</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Sales</span>
                                </div>
                            </div>
                            <div className="relative h-52 sm:h-60 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
                                <div className="text-center px-4">
                                    <HiOutlineTrendingUp className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Revenue chart visualization</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Integrate charting library for live data</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Live Operations */}
                    <div>
                        <Card>
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-heading-4">Live Operations</h2>
                                    <p className="text-caption mt-1" style={{ color: 'var(--text-muted)' }}>Order status</p>
                                </div>
                                <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--primary)' }}>
                                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary)' }} />
                                    LIVE
                                </span>
                            </div>

                            <div className="space-y-3">
                                {stats.orders?.[0]?.byStatus ? (
                                    <>
                                        {stats.orders[0].byStatus.slice(0, 4).map((item, i) => {
                                            const c = statusColors[i] || statusColors[0];
                                            const pct = ((item.count / stats.orders[0].total[0].count) * 100).toFixed(0);
                                            return (
                                                <div
                                                    key={item._id}
                                                    className="flex items-center justify-between p-3 rounded-lg border transition-all duration-150 hover:shadow-md"
                                                    style={{ backgroundColor: c.bg, borderColor: c.border }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold" style={{ backgroundColor: c.bg, color: c.text }}>
                                                            {item.count}
                                                        </div>
                                                        <span className="capitalize text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item._id}</span>
                                                    </div>
                                                    <span className="text-xs font-bold" style={{ color: c.text }}>{pct}%</span>
                                                </div>
                                            );
                                        })}
                                        <Button variant="outline" className="w-full mt-4 text-xs" onClick={() => window.location.href = '/admin/orders'}>
                                            View All Orders
                                        </Button>
                                    </>
                                ) : (
                                    <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No data available</p>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Reports by Type */}
                <Card>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                        <div>
                            <h2 className="text-heading-4">Reports by Type</h2>
                            <p className="text-caption mt-1" style={{ color: 'var(--text-muted)' }}>Generated reports overview</p>
                        </div>
                        <HiOutlineDocumentText className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    </div>

                    {stats.reports?.[0]?.byType ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats.reports[0].byType.map((item, i) => {
                                const c = reportColors[i] || reportColors[0];
                                return (
                                    <div
                                        key={item._id}
                                        className="p-5 rounded-lg border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-default"
                                        style={{ backgroundColor: c.bg, borderColor: c.border }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="capitalize text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                {item._id?.replace('_', ' ')}
                                            </span>
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.bg }}>
                                                <HiOutlineDocumentText className="w-4 h-4" style={{ color: c.text }} />
                                            </div>
                                        </div>
                                        <div className="text-3xl font-bold mb-1" style={{ color: c.text }}>{item.count}</div>
                                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Generated reports</div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No data available</p>
                    )}
                </Card>

            </div>
        </MainLayout>
    );
}

export default AdminDashboard;

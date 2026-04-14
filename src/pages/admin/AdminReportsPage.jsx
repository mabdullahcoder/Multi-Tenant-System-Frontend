import { useEffect, useState, useCallback } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { reportAPI } from '../../services/reportAPI';
import { useUI } from '../../context/UIContext';
import { useSocket } from '../../context/SocketContext';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
    HiOutlineCurrencyDollar, HiOutlineShoppingCart, HiOutlineTrendingUp,
    HiOutlineChartBar, HiOutlineCollection, HiOutlineFire, HiOutlineCreditCard,
    HiOutlineDownload, HiOutlineRefresh, HiOutlineFilter, HiOutlineCheckCircle,
    HiOutlineXCircle, HiOutlineClock, HiOutlineDocumentReport,
} from 'react-icons/hi';

// ─── Constants ────────────────────────────────────────────────────────────────
const TABS = [
    { id: 'overview', label: 'Overview', icon: HiOutlineChartBar },
    { id: 'orders', label: 'Orders', icon: HiOutlineShoppingCart },
    { id: 'menu', label: 'Menu', icon: HiOutlineCollection },
    { id: 'payments', label: 'Payments', icon: HiOutlineCreditCard },
    { id: 'kitchen', label: 'Kitchen', icon: HiOutlineFire },
    { id: 'export', label: 'Export', icon: HiOutlineDownload },
];

const PERIOD_OPTS = [
    { id: 'daily', label: 'Today' },
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
];

const STATUS_OPTS = ['', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const PAYMENT_OPTS = ['', 'Credit_Card', 'Debit_Card', 'UPI', 'Bank_Transfer', 'Cash_On_Delivery'];

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];

const fmt = (n) => `₨${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtPct = (n) => `${Number(n || 0).toFixed(1)}%`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, onRefresh, loading }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
                {subtitle && <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
            </div>
            {onRefresh && (
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface-2)' }}
                >
                    <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            )}
        </div>
    );
}

function DateRangeFilter({ startDate, endDate, onStartChange, onEndChange, onApply }) {
    return (
        <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl border mb-5" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border)' }}>
            <HiOutlineFilter className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>From</label>
                <input type="date" value={startDate} onChange={e => onStartChange(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>To</label>
                <input type="date" value={endDate} onChange={e => onEndChange(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
            </div>
            <button onClick={onApply}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: 'var(--primary)' }}>
                Apply
            </button>
        </div>
    );
}

function ChartCard({ title, children, className = '' }) {
    return (
        <Card className={className}>
            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>{title}</p>
            {children}
        </Card>
    );
}

function Spinner() {
    return (
        <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
        </div>
    );
}

function EmptyState({ message = 'No data available' }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: 'var(--text-muted)' }}>
            <HiOutlineDocumentReport className="w-12 h-12 opacity-30" />
            <p className="text-sm">{message}</p>
        </div>
    );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────
function OverviewTab() {
    const { addNotification } = useUI();
    const [period, setPeriod] = useState('monthly');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async (p) => {
        setLoading(true);
        try {
            const res = await reportAPI.getKPIOverview(p);
            setData(res.data);
        } catch {
            addNotification({ type: 'error', message: 'Failed to load KPI data' });
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => { load(period); }, [period, load]);

    const kpis = [
        {
            title: 'Total Revenue',
            value: fmt(data?.totalRevenue),
            change: `${data?.revenueChange > 0 ? '+' : ''}${data?.revenueChange}%`,
            changeType: data?.revenueChange >= 0 ? 'increase' : 'decrease',
            icon: HiOutlineCurrencyDollar,
            iconBgColor: 'bg-emerald-500/10',
            iconColor: 'text-emerald-500',
        },
        {
            title: 'Total Orders',
            value: data?.totalOrders ?? '—',
            change: `${data?.ordersChange > 0 ? '+' : ''}${data?.ordersChange}%`,
            changeType: data?.ordersChange >= 0 ? 'increase' : 'decrease',
            icon: HiOutlineShoppingCart,
            iconBgColor: 'bg-blue-500/10',
            iconColor: 'text-blue-500',
        },
        {
            title: 'Avg Order Value',
            value: fmt(data?.avgOrderValue),
            icon: HiOutlineTrendingUp,
            iconBgColor: 'bg-purple-500/10',
            iconColor: 'text-purple-500',
        },
    ];

    return (
        <div className="space-y-6">
            <SectionHeader title="Business Overview" subtitle="Key performance indicators" onRefresh={() => load(period)} loading={loading} />

            {/* Period selector */}
            <div className="flex items-center gap-1 rounded-xl p-1 border w-fit" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border)' }}>
                {PERIOD_OPTS.map(p => (
                    <button key={p.id} onClick={() => setPeriod(p.id)}
                        className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                        style={period === p.id ? { backgroundColor: 'var(--primary)', color: '#fff' } : { color: 'var(--text-secondary)' }}>
                        {p.label}
                    </button>
                ))}
            </div>

            {loading ? <Spinner /> : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {kpis.map(k => <StatCard key={k.title} {...k} />)}
                    </div>

                    {/* Revenue Trend */}
                    {data?.trend?.length > 0 ? (
                        <ChartCard title="Revenue Trend">
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={data.trend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(v) => [fmt(v), 'Revenue']} contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} name="Revenue" />
                                    <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={false} name="Orders" />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    ) : (
                        <Card><EmptyState message="No trend data for this period" /></Card>
                    )}
                </>
            )}
        </div>
    );
}

// ─── Tab: Orders ──────────────────────────────────────────────────────────────
function OrdersTab() {
    const { addNotification } = useUI();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '', paymentMethod: '', page: 1 });
    const [applied, setApplied] = useState({});

    const load = useCallback(async (f) => {
        setLoading(true);
        try {
            const res = await reportAPI.getOrdersAnalytics(f);
            setData(res.data);
        } catch {
            addNotification({ type: 'error', message: 'Failed to load orders analytics' });
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => { load(applied); }, [applied, load]);

    const applyFilters = () => setApplied({ ...filters });

    const statusColors = { pending: 'warning', confirmed: 'info', shipped: 'info', delivered: 'success', cancelled: 'danger' };

    return (
        <div className="space-y-6">
            <SectionHeader title="Orders Analytics" subtitle="Detailed order breakdown with advanced filters" onRefresh={() => load(applied)} loading={loading} />

            {/* Filters */}
            <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border)' }}>
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>From</label>
                        <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
                            className="px-3 py-1.5 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>To</label>
                        <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
                            className="px-3 py-1.5 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Status</label>
                        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                            className="px-3 py-1.5 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                            {STATUS_OPTS.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Payment</label>
                        <select value={filters.paymentMethod} onChange={e => setFilters(f => ({ ...f, paymentMethod: e.target.value }))}
                            className="px-3 py-1.5 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                            {PAYMENT_OPTS.map(p => <option key={p} value={p}>{p ? p.replace(/_/g, ' ') : 'All Methods'}</option>)}
                        </select>
                    </div>
                    <button onClick={applyFilters} className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: 'var(--primary)' }}>
                        Apply Filters
                    </button>
                </div>
            </div>

            {loading ? <Spinner /> : !data ? null : (
                <>
                    {/* Status & Payment breakdown charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ChartCard title="Orders by Status">
                            {data.statusBreakdown?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={data.statusBreakdown} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="_id" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Orders" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <EmptyState />}
                        </ChartCard>

                        <ChartCard title="Revenue by Status">
                            {data.statusBreakdown?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={data.statusBreakdown} dataKey="revenue" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                                            {data.statusBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(v) => fmt(v)} contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <EmptyState />}
                        </ChartCard>
                    </div>

                    {/* Orders Table */}
                    <Card padding="none">
                        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                Orders ({data.pagination?.total ?? 0} total)
                            </p>
                        </div>
                        {data.orders?.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Order Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.orders.map(o => (
                                        <TableRow key={o._id}>
                                            <TableCell className="font-mono text-xs">{o.orderId}</TableCell>
                                            <TableCell>{o.userId ? `${o.userId.firstName} ${o.userId.lastName}` : '—'}</TableCell>
                                            <TableCell>
                                                {o.items && o.items.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {o.items.map((item, idx) => (
                                                            <div key={idx} className="text-xs" style={{ color: 'var(--text-primary)' }}>
                                                                <span className="font-medium">{item.productName}</span>
                                                                <span style={{ color: 'var(--text-muted)' }}>
                                                                    {' '}×{item.quantity} @ ₨{Number(item.price || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                                                        {o.productName || '—'}
                                                        {o.quantity ? <span style={{ color: 'var(--text-muted)' }}> ×{o.quantity}</span> : null}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-semibold">{fmt(o.totalAmount)}</TableCell>
                                            <TableCell><Badge variant={statusColors[o.status] || 'default'}>{o.status}</Badge></TableCell>
                                            <TableCell className="capitalize text-xs">{o.paymentMethod?.replace(/_/g, ' ')}</TableCell>
                                            <TableCell className="text-xs">
                                                {new Date(o.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : <EmptyState message="No orders match the selected filters" />}

                        {/* Pagination */}
                        {data.pagination?.pages > 1 && (
                            <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    Page {data.pagination.page} of {data.pagination.pages}
                                </span>
                                <div className="flex gap-2">
                                    <button disabled={data.pagination.page <= 1}
                                        onClick={() => setApplied(f => ({ ...f, page: f.page - 1 }))}
                                        className="px-3 py-1 rounded text-xs border disabled:opacity-40"
                                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Prev</button>
                                    <button disabled={data.pagination.page >= data.pagination.pages}
                                        onClick={() => setApplied(f => ({ ...f, page: (f.page || 1) + 1 }))}
                                        className="px-3 py-1 rounded text-xs border disabled:opacity-40"
                                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Next</button>
                                </div>
                            </div>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
}

// ─── Tab: Menu ────────────────────────────────────────────────────────────────
function MenuTab() {
    const { addNotification } = useUI();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const load = useCallback(async (f = {}) => {
        setLoading(true);
        try {
            const res = await reportAPI.getMenuAnalytics(f);
            setData(res.data);
        } catch {
            addNotification({ type: 'error', message: 'Failed to load menu analytics' });
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="space-y-6">
            <SectionHeader title="Menu Performance" subtitle="Top & least selling items, category distribution" onRefresh={() => load({ startDate, endDate })} loading={loading} />

            <DateRangeFilter startDate={startDate} endDate={endDate}
                onStartChange={setStartDate} onEndChange={setEndDate}
                onApply={() => load({ startDate, endDate })} />

            {loading ? <Spinner /> : !data ? null : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Top Items Bar Chart */}
                        <ChartCard title="Top 10 Items by Revenue">
                            {data.topItems?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={data.topItems} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                                        <YAxis type="category" dataKey="_id" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={80} />
                                        <Tooltip formatter={(v) => [fmt(v), 'Revenue']} contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                        <Bar dataKey="totalRevenue" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Revenue" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <EmptyState />}
                        </ChartCard>

                        {/* Category Pie */}
                        <ChartCard title="Category-wise Sales Distribution">
                            {data.categoryPerformance?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie data={data.categoryPerformance} dataKey="totalRevenue" nameKey="_id"
                                            cx="50%" cy="50%" outerRadius={100}
                                            label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}>
                                            {data.categoryPerformance.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(v) => fmt(v)} contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <EmptyState />}
                        </ChartCard>
                    </div>

                    {/* Top Items Table */}
                    <Card padding="none">
                        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>All Items Performance</p>
                        </div>
                        {data.allItems?.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Item Name</TableHead>
                                        <TableHead>Qty Sold</TableHead>
                                        <TableHead>Revenue</TableHead>
                                        <TableHead>Orders</TableHead>
                                        <TableHead>Avg Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.allItems.map((item, i) => (
                                        <TableRow key={item._id}>
                                            <TableCell className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{i + 1}</TableCell>
                                            <TableCell className="font-medium">{item._id}</TableCell>
                                            <TableCell>{item.totalQuantity}</TableCell>
                                            <TableCell className="font-semibold">{fmt(item.totalRevenue)}</TableCell>
                                            <TableCell>{item.orderCount}</TableCell>
                                            <TableCell>{fmt(item.avgPrice)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : <EmptyState message="No menu data available" />}
                    </Card>

                    {/* Least Selling */}
                    {data.leastItems?.length > 0 && (
                        <Card>
                            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>Least Selling Items</p>
                            <div className="space-y-2">
                                {data.leastItems.map((item, i) => (
                                    <div key={item._id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                                style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: 'var(--danger)' }}
                                            >{i + 1}</span>
                                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item._id}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt(item.totalRevenue)}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.totalQuantity} sold</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}

// ─── Tab: Payments ────────────────────────────────────────────────────────────
function PaymentsTab() {
    const { addNotification } = useUI();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const load = useCallback(async (f = {}) => {
        setLoading(true);
        try {
            const res = await reportAPI.getPaymentAnalytics(f);
            setData(res.data);
        } catch {
            addNotification({ type: 'error', message: 'Failed to load payment analytics' });
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => { load(); }, [load]);

    const totalRevenue = data?.byMethod?.reduce((s, m) => s + m.revenue, 0) || 0;

    return (
        <div className="space-y-6">
            <SectionHeader title="Payment Analytics" subtitle="Transaction breakdown by method and status" onRefresh={() => load({ startDate, endDate })} loading={loading} />

            <DateRangeFilter startDate={startDate} endDate={endDate}
                onStartChange={setStartDate} onEndChange={setEndDate}
                onApply={() => load({ startDate, endDate })} />

            {loading ? <Spinner /> : !data ? null : (
                <>
                    {/* Method breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ChartCard title="Revenue by Payment Method">
                            {data.byMethod?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={240}>
                                    <PieChart>
                                        <Pie data={data.byMethod} dataKey="revenue" nameKey="_id" cx="50%" cy="50%" outerRadius={90}
                                            label={({ _id, percent }) => `${(_id || 'N/A').replace(/_/g, ' ')} ${(percent * 100).toFixed(0)}%`}>
                                            {data.byMethod.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(v) => fmt(v)} contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <EmptyState />}
                        </ChartCard>

                        <ChartCard title="Payment Status Breakdown">
                            {data.byStatus?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={data.byStatus} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="_id" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Transactions" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <EmptyState />}
                        </ChartCard>
                    </div>

                    {/* Daily trend */}
                    {data.dailyTrend?.length > 0 && (
                        <ChartCard title="Daily Payment Trend">
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={data.dailyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `₨${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(v, n) => [n === 'revenue' ? fmt(v) : v, n]} contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} name="Revenue" />
                                    <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={false} name="Transactions" />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    )}

                    {/* Method summary table */}
                    <Card padding="none">
                        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Payment Method Summary</p>
                        </div>
                        {data.byMethod?.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Transactions</TableHead>
                                        <TableHead>Revenue</TableHead>
                                        <TableHead>Share</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.byMethod.map((m, i) => (
                                        <TableRow key={m._id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                                                    <span className="capitalize">{(m._id || 'N/A').replace(/_/g, ' ')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{m.count}</TableCell>
                                            <TableCell className="font-semibold">{fmt(m.revenue)}</TableCell>
                                            <TableCell>{totalRevenue > 0 ? fmtPct((m.revenue / totalRevenue) * 100) : '—'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : <EmptyState message="No payment data available" />}
                    </Card>
                </>
            )}
        </div>
    );
}

// ─── Tab: Kitchen ─────────────────────────────────────────────────────────────
function KitchenTab() {
    const { addNotification } = useUI();
    const { socket } = useSocket();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [liveCount, setLiveCount] = useState({ pending: 0, confirmed: 0 });

    const load = useCallback(async (f = {}) => {
        setLoading(true);
        try {
            const res = await reportAPI.getKitchenAnalytics(f);
            setData(res.data);
        } catch {
            addNotification({ type: 'error', message: 'Failed to load kitchen analytics' });
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => { load(); }, [load]);

    // Real-time socket updates
    useEffect(() => {
        if (!socket) return;
        const handleOrderCreated = () => setLiveCount(c => ({ ...c, pending: c.pending + 1 }));
        const handleOrderUpdated = (order) => {
            if (order?.status === 'confirmed') setLiveCount(c => ({ ...c, pending: Math.max(0, c.pending - 1), confirmed: c.confirmed + 1 }));
            if (order?.status === 'delivered') setLiveCount(c => ({ ...c, confirmed: Math.max(0, c.confirmed - 1) }));
        };
        socket.on('orderCreated', handleOrderCreated);
        socket.on('orderStatusUpdated', handleOrderUpdated);
        return () => {
            socket.off('orderCreated', handleOrderCreated);
            socket.off('orderStatusUpdated', handleOrderUpdated);
        };
    }, [socket]);

    const kpiCards = data ? [
        { title: 'Total Orders', value: data.total, icon: HiOutlineShoppingCart, iconBgColor: 'bg-blue-500/10', iconColor: 'text-blue-500' },
        { title: 'Completion Rate', value: fmtPct(data.completionRate), icon: HiOutlineCheckCircle, iconBgColor: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
        { title: 'Cancellation Rate', value: fmtPct(data.cancellationRate), icon: HiOutlineXCircle, iconBgColor: 'bg-red-500/10', iconColor: 'text-red-500' },
        { title: 'Avg Prep Time', value: data.avgPrepTime ? `${data.avgPrepTime} min` : 'N/A', icon: HiOutlineClock, iconBgColor: 'bg-amber-500/10', iconColor: 'text-amber-500' },
    ] : [];

    return (
        <div className="space-y-6">
            <SectionHeader title="Kitchen Performance" subtitle="Order preparation metrics with real-time updates" onRefresh={() => load({ startDate, endDate })} loading={loading} />

            {/* Live indicator */}
            {socket && (
                <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ backgroundColor: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                    <span className="text-sm font-medium text-emerald-600">Live KDS Feed Active</span>
                    <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
                        {liveCount.pending} new · {liveCount.confirmed} in progress (since page load)
                    </span>
                </div>
            )}

            <DateRangeFilter startDate={startDate} endDate={endDate}
                onStartChange={setStartDate} onEndChange={setEndDate}
                onApply={() => load({ startDate, endDate })} />

            {loading ? <Spinner /> : !data ? null : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {kpiCards.map(k => <StatCard key={k.title} {...k} />)}
                    </div>

                    {/* Status breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ChartCard title="Orders by Status">
                            {Object.keys(data.statusCounts).length > 0 ? (
                                <ResponsiveContainer width="100%" height={240}>
                                    <PieChart>
                                        <Pie
                                            data={Object.entries(data.statusCounts).map(([k, v]) => ({ name: k, value: v }))}
                                            dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                            {Object.keys(data.statusCounts).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <EmptyState />}
                        </ChartCard>

                        {/* Hourly distribution */}
                        <ChartCard title="Orders by Hour of Day">
                            {data.hourlyDistribution?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={data.hourlyDistribution} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                        <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Orders" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <EmptyState />}
                        </ChartCard>
                    </div>

                    {/* Status summary */}
                    <Card>
                        <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>Status Summary</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {Object.entries(data.statusCounts).map(([status, count], i) => (
                                <div key={status} className="flex flex-col items-center p-3 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface-2)' }}>
                                    <span className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                                    <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{count}</span>
                                    <span className="text-xs capitalize mt-1" style={{ color: 'var(--text-muted)' }}>{status}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}

// ─── Tab: Export ──────────────────────────────────────────────────────────────
function ExportTab() {
    const { addNotification } = useUI();
    const [exporting, setExporting] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const EXPORT_OPTIONS = [
        { type: 'orders', label: 'Orders Report', desc: 'All orders with customer details, status, and payment info', icon: HiOutlineShoppingCart, color: '#3b82f6' },
        { type: 'menu', label: 'Menu Performance', desc: 'Item-level sales, quantities, and revenue breakdown', icon: HiOutlineCollection, color: '#10b981' },
        { type: 'payments', label: 'Payment Report', desc: 'Transaction breakdown by payment method and status', icon: HiOutlineCreditCard, color: '#8b5cf6' },
        { type: 'kitchen', label: 'Kitchen Report', desc: 'Hourly order distribution and preparation metrics', icon: HiOutlineFire, color: '#f59e0b' },
    ];

    const handleExport = async (type, format) => {
        const key = `${type}-${format}`;
        setExporting(key);
        try {
            const response = await reportAPI.exportAnalytics(type, format, { startDate, endDate });
            const blob = new Blob([response.data], {
                type: format === 'pdf' ? 'application/pdf' : 'text/csv',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addNotification({ type: 'success', message: `${type} report exported as ${format.toUpperCase()}` });
        } catch {
            addNotification({ type: 'error', message: 'Export failed. Please try again.' });
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="space-y-6">
            <SectionHeader title="Export Reports" subtitle="Download analytics data as PDF or CSV" />

            {/* Date range */}
            <Card>
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Date Range (optional)</p>
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>From</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border text-sm"
                            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>To</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border text-sm"
                            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-primary)' }} />
                    </div>
                </div>
            </Card>

            {/* Export cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EXPORT_OPTIONS.map(opt => (
                    <Card key={opt.type} className="flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-xl flex-shrink-0" style={{ backgroundColor: `${opt.color}15` }}>
                                <opt.icon className="w-5 h-5" style={{ color: opt.color }} />
                            </div>
                            <div>
                                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{opt.label}</p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{opt.desc}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-auto">
                            <button
                                onClick={() => handleExport(opt.type, 'csv')}
                                disabled={!!exporting}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors disabled:opacity-50"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface-2)' }}>
                                {exporting === `${opt.type}-csv` ? (
                                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : <HiOutlineDownload className="w-4 h-4" />}
                                CSV
                            </button>
                            <button
                                onClick={() => handleExport(opt.type, 'pdf')}
                                disabled={!!exporting}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
                                style={{ backgroundColor: opt.color }}>
                                {exporting === `${opt.type}-pdf` ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : <HiOutlineDownload className="w-4 h-4" />}
                                PDF
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function AdminReportsPage() {
    const [activeTab, setActiveTab] = useState('overview');

    const TAB_CONTENT = {
        overview: <OverviewTab />,
        orders: <OrdersTab />,
        menu: <MenuTab />,
        payments: <PaymentsTab />,
        kitchen: <KitchenTab />,
        export: <ExportTab />,
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-heading-2">Analytics Dashboard</h1>
                    <p className="text-description mt-1">Comprehensive business intelligence and reporting</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-xl p-1 border w-fit max-w-full"
                    style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border)' }}>
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap min-h-[36px]"
                                style={active
                                    ? { backgroundColor: 'var(--primary)', color: '#fff' }
                                    : { color: 'var(--text-secondary)' }
                                }>
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div>
                    {TAB_CONTENT[activeTab]}
                </div>
            </div>
        </MainLayout>
    );
}

export default AdminReportsPage;

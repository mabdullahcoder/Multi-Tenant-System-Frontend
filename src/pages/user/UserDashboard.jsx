import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import { orderAPI } from '../../services/orderAPI';
import {
    HiOutlinePlus,
} from 'react-icons/hi';
import Button from '../../components/ui/Button';

const TIME_PERIODS = ['Yesterday', 'Last 7 days', 'Last 30 days', 'Last 12 months'];

function StatCard({ label, value, trend, trendPositive }) {
    return (
        <div
            className="card-primary shadow-none hover:shadow-none"
            style={{ borderColor: 'var(--border)' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                    <p className="text-heading-3">{value}</p>
                </div>
            </div>
            {trend && (
                <p className={`text-xs font-medium ${trendPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trendPositive ? '+' : ''}{trend}%
                </p>
            )}
        </div>
    );
}

function UserDashboard() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [activePeriod, setActivePeriod] = useState('Last 7 days');

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await orderAPI.getUserOrders(1, 5);
            setOrders(res.data.data || []);
        } catch {
            // ignore fetch error
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header with Time Period Filters */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-heading-2">Dashboard</h1>
                        <p className="text-description mt-1">Overview of your activity and statistics</p>
                    </div>
                    {/* Time Period Filters */}
                    <div className="flex items-center gap-1 sm:gap-2 rounded-xl p-1 border overflow-x-auto no-scrollbar" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border)' }}>
                        {TIME_PERIODS.map((period) => (
                            <button
                                key={period}
                                onClick={() => setActivePeriod(period)}
                                className="px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 min-h-[36px]"
                                style={activePeriod === period
                                    ? { backgroundColor: 'var(--primary)', color: '#fff' }
                                    : { color: 'var(--text-secondary)' }
                                }
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Cards - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard label="Total Orders" value={orders?.length || 1644} trend={8.3} trendPositive={true} />
                    <StatCard label="Approval Rate" value="66.3%" trend={2.4} trendPositive={true} />
                    <StatCard label="Gross Revenue" value="$29,511" trend={3.8} trendPositive={true} />
                    <StatCard label="Net Revenue" value="$19,929" trend={-1.2} trendPositive={false} />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sales Details - Responsive Table */}
                    <div className="lg:col-span-2">
                        <div className="card-primary shadow-none hover:shadow-none" style={{ borderColor: 'var(--border)' }}>
                            <div className="card-header pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                                <h2 className="card-title">Sales Details</h2>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Last updated on 6 June, 2024</p>
                            </div>

                            {/* Responsive Table */}
                            <div className="overflow-x-auto -mx-6 sm:mx-0">
                                <div className="inline-block min-w-full align-middle px-6 pt-4 sm:px-0">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Sales Type</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Sales</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Approval %</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { type: 'Initials', sales: 856, approval: '66%', revenue: '$5,136' },
                                                { type: 'Rebills', sales: 508, approval: '41%', revenue: '$21,483' },
                                                { type: 'Straight Sales', sales: 280, approval: '65%', revenue: '$2,891' },
                                            ].map((row, i, arr) => (
                                                <tr
                                                    key={row.type}
                                                    className="transition-colors"
                                                    style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                                                >
                                                    <td className="px-4 py-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{row.type}</td>
                                                    <td className="px-4 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{row.sales}</td>
                                                    <td className="px-4 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{row.approval}</td>
                                                    <td className="px-4 py-4 text-right text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{row.revenue}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Overview Stats */}
                            <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Overview</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { label: 'Initials', value: '25,568' },
                                        { label: 'Rebills', value: '19,828' },
                                        { label: 'Straight Sales', value: '6,253' },
                                    ].map((item) => (
                                        <div key={item.label} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
                                            <div className="text-xs font-medium uppercase mb-2" style={{ color: 'var(--text-secondary)' }}>{item.label}</div>
                                            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{item.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cashflow Card */}
                    <div>
                        <div className="card-primary shadow-none hover:shadow-none" style={{ borderColor: 'var(--border)' }}>
                            <div className="card-header pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
                                <h2 className="card-title">Cashflow</h2>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Sales</span>
                                </div>
                                <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Initials</span>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>$5,136</span>
                                </div>
                                <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Rebills</span>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>$21,483</span>
                                </div>
                                <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Straight Sales</span>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>$2,891</span>
                                </div>
                                <div className="flex items-center justify-between py-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Gross Revenue</span>
                                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>$29,511</span>
                                </div>
                                <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Refunds</span>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>$3,423</span>
                                </div>
                                <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Chargebacks</span>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>$6,159</span>
                                </div>
                                <div className="flex items-center justify-between py-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Net Revenue</span>
                                    <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>$19,929</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                {/* <div className="flex justify-center sm:justify-end">
                    <Button
                        onClick={() => navigate('/user/place-order')}
                        variant="primary"
                        size="md"
                        icon={HiOutlinePlus}
                        iconPosition="left"
                    >
                        Place New Order
                    </Button>
                </div> */}
            </div>
        </MainLayout>
    );
}

export default UserDashboard;

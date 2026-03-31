import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import { orderAPI } from '../../services/orderAPI';
import {
    HiOutlineShoppingCart,
    HiOutlineCurrencyDollar,
    HiOutlinePlus,
    HiOutlineCheckCircle,
} from 'react-icons/hi';
import Button from '../../components/ui/Button';

const TIME_PERIODS = ['Yesterday', 'Last 7 days', 'Last 30 days', 'Last 12 months'];

function StatCard({ label, value, trend, trendPositive }) {
    return (
        <div className="card-primary shadow-none hover:shadow-none border-gray-200 hover:border-blue-400">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">{label}</p>
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
                    {/* Horizontal Scrollable Time Period Filters */}
                    <div className="flex items-center gap-1 sm:gap-2 bg-gray-100/50 rounded-xl p-1 border border-gray-200 overflow-x-auto no-scrollbar">
                        {TIME_PERIODS.map((period) => (
                            <button
                                key={period}
                                onClick={() => setActivePeriod(period)}
                                className={`px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activePeriod === period
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-200'
                                    }`}
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
                        <div className="card-primary shadow-none hover:shadow-none border-gray-200">
                            <div className="card-header pb-6 border-b border-gray-200">
                                <h2 className="card-title">Sales Details</h2>
                                <p className="text-xs text-gray-600 mt-1">Last updated on 6 June, 2024</p>
                            </div>

                            {/* Responsive Table */}
                            <div className="overflow-x-auto -mx-6 sm:mx-0">
                                <div className="inline-block min-w-full align-middle px-6 pt-4 sm:px-0">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Sales Type</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Sales</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Approval %</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                                                <td className="px-4 py-4 text-sm text-gray-900 font-medium">Initials</td>
                                                <td className="px-4 py-4 text-sm text-gray-700">856</td>
                                                <td className="px-4 py-4 text-sm text-gray-700">66%</td>
                                                <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">$5,136</td>
                                            </tr>
                                            <tr className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                                                <td className="px-4 py-4 text-sm text-gray-900 font-medium">Rebills</td>
                                                <td className="px-4 py-4 text-sm text-gray-700">508</td>
                                                <td className="px-4 py-4 text-sm text-gray-700">41%</td>
                                                <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">$21,483</td>
                                            </tr>
                                            <tr className="hover:bg-blue-50 transition-colors">
                                                <td className="px-4 py-4 text-sm text-gray-900 font-medium">Straight Sales</td>
                                                <td className="px-4 py-4 text-sm text-gray-700">280</td>
                                                <td className="px-4 py-4 text-sm text-gray-700">65%</td>
                                                <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">$2,891</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Overview Stats */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">Overview</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                                        <div className="text-xs font-medium text-gray-600 mb-2 uppercase">Initials</div>
                                        <div className="text-2xl font-bold text-gray-900">25,568</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                                        <div className="text-xs font-medium text-gray-600 mb-2 uppercase">Rebills</div>
                                        <div className="text-2xl font-bold text-gray-900">19,828</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                                        <div className="text-xs font-medium text-gray-600 mb-2 uppercase">Straight Sales</div>
                                        <div className="text-2xl font-bold text-gray-900">6,253</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cashflow Card */}
                    <div>
                        <div className="card-primary shadow-none hover:shadow-none border-gray-200">
                            <div className="card-header pb-5 border-b border-gray-200">
                                <h2 className="card-title">Cashflow</h2>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-xs font-semibold text-gray-600 uppercase">Sales</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                    <span className="text-sm text-gray-700">Initials</span>
                                    <span className="text-sm font-semibold text-gray-900">$5,136</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                    <span className="text-sm text-gray-700">Rebills</span>
                                    <span className="text-sm font-semibold text-gray-900">$21,483</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                    <span className="text-sm text-gray-700">Straight Sales</span>
                                    <span className="text-sm font-semibold text-gray-900">$2,891</span>
                                </div>
                                <div className="flex items-center justify-between py-3 pt-2 border-t border-gray-200">
                                    <span className="text-sm font-semibold text-gray-700">Gross Revenue</span>
                                    <span className="text-sm font-bold text-gray-900">$29,511</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                    <span className="text-sm text-gray-700">Refunds</span>
                                    <span className="text-sm font-semibold text-gray-900">$3,423</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                    <span className="text-sm text-gray-700">Chargebacks</span>
                                    <span className="text-sm font-semibold text-gray-900">$6,159</span>
                                </div>
                                <div className="flex items-center justify-between py-3 pt-2 border-t border-gray-200">
                                    <span className="text-sm font-bold text-gray-900">Net Revenue</span>
                                    <span className="text-lg font-bold text-gray-900">$19,929</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center sm:justify-end">
                    <Button
                        onClick={() => navigate('/user/place-order')}
                        variant="primary"
                        size="md"
                        icon={HiOutlinePlus}
                        iconPos="left"
                    >
                        Place New Order
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
}

export default UserDashboard;

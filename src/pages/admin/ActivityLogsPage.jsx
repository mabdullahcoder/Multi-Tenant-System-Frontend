import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { activityLogAPI } from '../../services/activityLogAPI';
import { useUI } from '../../context/UIContext';
import Badge from '../../components/ui/Badge';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { HiOutlineFilter, HiOutlineChevronDown, HiOutlineClipboardList } from 'react-icons/hi';

const ACTIONS = [
    'login', 'logout', 'register', 'password_change', 'profile_update',
    'order_created', 'order_cancelled', 'order_status_changed',
    'report_generated', 'report_downloaded',
];

/* Reusable styled select */
function FilterSelect({ label, value, onChange, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {label}
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    className="
                        w-full appearance-none
                        pl-3.5 pr-9 py-2.5
                        bg-white border border-gray-200 rounded-lg
                        text-sm font-medium text-gray-800
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        hover:border-gray-300
                        transition-all cursor-pointer
                    "
                >
                    {children}
                </select>
                <HiOutlineChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
        </div>
    );
}

function ActivityLogsPage() {
    const { addNotification } = useUI();
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({ action: '', status: '' });

    useEffect(() => { fetchLogs(); }, [filters]);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const filterObj = {};
            if (filters.action) filterObj.action = filters.action;
            if (filters.status) filterObj.status = filters.status;
            const response = await activityLogAPI.getAllActivityLogs(1, 20, filterObj);
            setLogs(response.data || []);
        } catch (error) {
            if (error.response?.status !== 404) {
                addNotification({ type: 'error', message: error.response?.data?.message || 'Failed to fetch activity logs' });
            }
            setLogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-5">

                {/* Header */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Activity Logs</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Monitor all system activities and user actions</p>
                </div>

                {/* Filter bar */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <HiOutlineFilter className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700">Filters</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FilterSelect
                            label="Action"
                            value={filters.action}
                            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                        >
                            <option value="">All Actions</option>
                            {ACTIONS.map((a) => (
                                <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                            ))}
                        </FilterSelect>

                        <FilterSelect
                            label="Status"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">All Statuses</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                        </FilterSelect>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="spinner" />
                            <p className="text-sm text-gray-500">Loading logs…</p>
                        </div>
                    ) : logs.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead>Device</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log._id}>
                                            <TableCell className="font-medium text-gray-900">
                                                {log.userId?.firstName} {log.userId?.lastName}
                                            </TableCell>
                                            <TableCell className="capitalize text-gray-700">
                                                {log.action.replace(/_/g, ' ')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={log.status === 'success' ? 'success' : 'danger'}>
                                                    {log.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-gray-600">
                                                {log.ipAddress || '—'}
                                            </TableCell>
                                            <TableCell className="text-gray-600 text-sm max-w-[160px] truncate">
                                                {log.device || '—'}
                                            </TableCell>
                                            <TableCell className="text-gray-600 text-sm whitespace-nowrap">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <HiOutlineClipboardList className="w-7 h-7 text-gray-400" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">No activity logs found</p>
                            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

export default ActivityLogsPage;

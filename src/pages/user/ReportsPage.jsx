import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { reportAPI } from '../../services/reportAPI';
import { useUI } from '../../context/UIContext';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../components/ui/Table';

function ReportsPage() {
    const { addNotification } = useUI();
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [filters, setFilters] = useState({
        reportType: 'orders_report',
        format: 'pdf',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const response = await reportAPI.getUserReports(1, 10);
            setReports(response.data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
            // Only show error notification if it's not a 404 (no data)
            if (error.response && error.response.status !== 404) {
                addNotification({
                    type: 'error',
                    message: error.response?.data?.message || 'Failed to fetch reports'
                });
            }
            // Set empty array on error so UI shows empty state
            setReports([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateReport = async () => {
        // Validate date range if provided
        if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
            if (start > end) {
                addNotification({
                    type: 'error',
                    message: 'Start date must be before end date'
                });
                return;
            }
        }

        setIsGenerating(true);
        try {
            const reportData = {
                reportType: filters.reportType,
                format: filters.format,
            };

            // Add date range if both dates are provided
            if (filters.startDate && filters.endDate) {
                reportData.dateRange = {
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                };
            }

            const response = await reportAPI.generateReport(reportData);
            addNotification({ type: 'success', message: 'Report generated successfully' });
            fetchReports();
        } catch (error) {
            console.error('Generate report error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to generate report';
            addNotification({ type: 'error', message: errorMessage });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async (reportId, report) => {
        try {
            // Make API call to download report
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/report/${reportId}/download`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to download report');
            }

            // Get the blob from response
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${report.title.replace(/\s+/g, '_')}_${reportId}.${report.format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            addNotification({ type: 'success', message: 'Report downloaded successfully' });
        } catch (error) {
            console.error('Download error:', error);
            const errorMessage = error.message || 'Failed to download report';
            addNotification({ type: 'error', message: errorMessage });
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-heading-2">Reports</h1>
                    <p className="text-description mt-1">Generate and manage your reports</p>
                </div>

                {/* Generate Report */}
                <Card>
                    <div className="border-b border-gray-200 pb-4 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 transition-colors">
                            Generate New Report
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 transition-colors">
                            Create custom reports with optional date range filtering
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Report Configuration Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Report Type */}
                            <Select
                                label="Report Type"
                                value={filters.reportType}
                                onChange={(e) => setFilters({ ...filters, reportType: e.target.value })}
                                options={[
                                    { value: 'orders_report', label: 'Orders Report' },
                                    { value: 'user_activity_report', label: 'Activity Report' }
                                ]}
                                helperText="Select the type of report you want to generate"
                            />

                            {/* Format */}
                            <Select
                                label="Format"
                                value={filters.format}
                                onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                                options={[
                                    { value: 'pdf', label: 'PDF' },
                                    { value: 'csv', label: 'CSV' }
                                ]}
                                helperText="Choose your preferred export format"
                            />
                        </div>

                        {/* Date Range Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Start Date */}
                            <div>
                                <label className="label-base block mb-1.5">
                                    Start Date <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(Optional)</span>
                                </label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    className="input-base"
                                />
                                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                                    Filter data from this date onwards
                                </p>
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="label-base block mb-1.5">
                                    End Date <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(Optional)</span>
                                </label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    className="input-base"
                                />
                                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                                    Filter data up to this date
                                </p>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-2">
                            <Button
                                onClick={handleGenerateReport}
                                disabled={isGenerating}
                                className="w-full sm:w-auto px-8 py-3 text-base font-semibold"
                            >
                                {isGenerating ? (
                                    <span className="flex items-center gap-2">
                                        <div className="spinner" />
                                        Generating Report...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Generate Report
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Reports List */}
                <Card>
                    <div className="border-b border-gray-200 pb-4 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 transition-colors">
                            Your Reports
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 transition-colors">
                            View and download your generated reports
                        </p>
                    </div>
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="spinner mx-auto" />
                        </div>
                    ) : reports.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Format</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.map((report) => (
                                    <TableRow key={report._id}>
                                        <TableCell>{report.title}</TableCell>
                                        <TableCell className="capitalize">{report.reportType.replace(/_/g, ' ')}</TableCell>
                                        <TableCell className="uppercase">{report.format}</TableCell>
                                        <TableCell>
                                            <Badge variant={report.status === 'completed' ? 'success' : 'warning'}>
                                                {report.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => handleDownload(report._id, report)}
                                                className="text-blue-600 hover:underline flex items-center gap-1 transition-colors"
                                                disabled={report.status !== 'completed'}
                                            >
                                                <ArrowDownTrayIcon className="w-4 h-4" />
                                                Download
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 transition-colors">
                                No reports generated yet
                            </p>
                            <p className="text-sm text-gray-400 mt-1 transition-colors">
                                Generate your first report using the form above
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </MainLayout>
    );
}

export default ReportsPage;

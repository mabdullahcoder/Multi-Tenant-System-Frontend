import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { reportAPI } from '../../services/reportAPI';
import { useUI } from '../../context/UIContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';

function AdminReportsPage() {
    const { addNotification } = useUI();
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const response = await reportAPI.getAllReports(1, 20);
            setReports(response.data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
            if (error.response && error.response.status !== 404) {
                addNotification({
                    type: 'error',
                    message: error.response?.data?.message || 'Failed to fetch reports'
                });
            }
            setReports([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteReport = async (reportId) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;
        try {
            await reportAPI.deleteReport(reportId);
            addNotification({ type: 'success', message: 'Report deleted' });
            fetchReports();
        } catch (error) {
            addNotification({ type: 'error', message: 'Failed to delete report' });
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Reports Management
                    </h1>
                    <p className="text-sm text-gray-600">
                        View and manage all system reports
                    </p>
                </div>

                <Card padding="none">
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
                                        <TableCell className="font-medium text-gray-900">
                                            {report.title}
                                        </TableCell>
                                        <TableCell className="capitalize text-gray-700">
                                            {report.reportType.replace(/_/g, ' ')}
                                        </TableCell>
                                        <TableCell className="uppercase text-gray-700">
                                            {report.format}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={report.status === 'completed' ? 'success' : 'warning'}>
                                                {report.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-700">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => handleDeleteReport(report._id)}
                                                className="text-red-600 font-medium hover:underline text-sm transition-colors"
                                            >
                                                Delete
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
                            <p className="text-gray-600 text-sm">
                                No reports found
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </MainLayout>
    );
}

export default AdminReportsPage;

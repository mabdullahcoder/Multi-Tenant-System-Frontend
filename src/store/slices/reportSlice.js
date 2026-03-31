import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    reports: [],
    selectedReport: null,
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    },
    filters: {
        reportType: null,
        status: null,
    },
    stats: null,
};

const reportSlice = createSlice({
    name: 'report',
    initialState,
    reducers: {
        // Get reports
        getReportsStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        getReportsSuccess: (state, action) => {
            state.isLoading = false;
            state.reports = action.payload.reports;
            state.pagination = action.payload.pagination;
            state.error = null;
        },
        getReportsFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },

        // Get single report
        getReportStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        getReportSuccess: (state, action) => {
            state.isLoading = false;
            state.selectedReport = action.payload;
            state.error = null;
        },
        getReportFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },

        // Generate report
        generateReportStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        generateReportSuccess: (state, action) => {
            state.isLoading = false;
            state.reports.push(action.payload);
            state.error = null;
        },
        generateReportFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },

        // Get stats
        getStatsSuccess: (state, action) => {
            state.stats = action.payload;
        },

        // Set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    getReportsStart,
    getReportsSuccess,
    getReportsFailure,
    getReportStart,
    getReportSuccess,
    getReportFailure,
    generateReportStart,
    generateReportSuccess,
    generateReportFailure,
    getStatsSuccess,
    setFilters,
    clearError,
} = reportSlice.actions;

export default reportSlice.reducer;

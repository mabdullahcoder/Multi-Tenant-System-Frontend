import React from 'react';

/**
 * Enhanced Table Component with Mobile Responsiveness
 */
const Table = React.memo(function Table({
    children,
    className = '',
    responsive = true,
}) {
    return (
        <div
            className={`rounded-xl overflow-hidden ${responsive ? 'overflow-x-auto scrollbar-thin' : 'overflow-x-auto'}`}
            style={{ border: '1px solid var(--border)' }}
        >
            <table className={`w-full border-collapse text-xs sm:text-sm ${className}`.trim()}>
                {children}
            </table>
        </div>
    );
});

/**
 * Table Header Component
 */
export const TableHeader = React.memo(function TableHeader({ children, className = '' }) {
    return (
        <thead
            className={`sticky top-0 z-10 ${className}`.trim()}
            style={{ backgroundColor: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border)' }}
        >
            {children}
        </thead>
    );
});

/**
 * Table Body Component
 */
export const TableBody = React.memo(function TableBody({ children, className = '' }) {
    return (
        <tbody className={className}>
            {children}
        </tbody>
    );
});

/**
 * Table Row Component - Touch optimized
 */
export const TableRow = React.memo(function TableRow({
    children,
    className = '',
    onClick,
    hoverable = true,
}) {
    return (
        <tr
            className={`last:border-0 transition-colors ${hoverable ? 'cursor-default' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`.trim()}
            style={{ borderBottom: '1px solid var(--border-light)' }}
            onMouseEnter={hoverable ? (e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; } : undefined}
            onMouseLeave={hoverable ? (e) => { e.currentTarget.style.backgroundColor = ''; } : undefined}
            onClick={onClick}
        >
            {children}
        </tr>
    );
});

/**
 * Table Header Cell Component - Responsive padding
 */
export const TableHead = React.memo(function TableHead({
    children,
    className = '',
    align = 'left',
}) {
    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

    return (
        <th
            className={`px-3 sm:px-4 py-2.5 sm:py-3 font-semibold text-[10px] sm:text-xs uppercase tracking-wider ${alignClass} ${className}`.trim()}
            style={{ color: 'var(--text-secondary)' }}
        >
            {children}
        </th>
    );
});

/**
 * Table Data Cell Component - Responsive padding and text size
 */
export const TableCell = React.memo(function TableCell({
    children,
    className = '',
    align = 'left',
    mobileHidden = false,
}) {
    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
    const mobileClass = mobileHidden ? 'hidden sm:table-cell' : '';

    return (
        <td
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm ${alignClass} ${mobileClass} ${className}`.trim()}
            style={{ color: 'var(--text-primary)' }}
        >
            {children}
        </td>
    );
});

/**
 * Table Loading Skeleton
 */
export const TableSkeleton = React.memo(function TableSkeleton({ rows = 5, columns = 4 }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <TableCell key={colIndex}>
                            <div className="h-3 sm:h-4 rounded animate-pulse" style={{ backgroundColor: 'var(--bg-surface-3)' }} />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
});

/**
 * Table Empty State
 */
export const TableEmpty = React.memo(function TableEmpty({
    message = 'No data available',
    colSpan = 4,
}) {
    return (
        <TableRow hoverable={false}>
            <TableCell colSpan={colSpan} className="text-center py-8 sm:py-12">
                <div className="flex flex-col items-center justify-center space-y-2">
                    <svg
                        className="w-8 h-8 sm:w-12 sm:h-12"
                        style={{ color: 'var(--text-muted)' }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                    </svg>
                    <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
                </div>
            </TableCell>
        </TableRow>
    );
});

export default Table;

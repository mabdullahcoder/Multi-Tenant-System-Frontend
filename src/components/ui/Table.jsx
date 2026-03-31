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
        <div className={`rounded-lg border border-gray-200 overflow-hidden ${responsive ? 'overflow-x-auto scrollbar-thin' : 'overflow-x-auto'
            }`}>
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
        <thead className={`bg-gray-50 border-b border-gray-200 sticky top-0 z-10 ${className}`.trim()}>
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
    const hoverClass = hoverable ? 'hover:bg-gray-50 active:bg-gray-100 transition-colors' : '';
    const clickableClass = onClick ? 'cursor-pointer' : '';

    return (
        <tr
            className={`border-b border-gray-200 last:border-0 ${hoverClass} ${clickableClass} ${className}`.trim()}
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
        <th className={`px-3 sm:px-4 py-2 sm:py-3 font-medium text-gray-600 text-[10px] sm:text-xs uppercase tracking-wider ${alignClass} ${className}`.trim()}>
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
        <td className={`px-3 sm:px-4 py-2 sm:py-3 text-gray-700 ${alignClass} ${mobileClass} ${className}`.trim()}>
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
                            <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse" />
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
                        className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400"
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
                    <p className="text-xs sm:text-sm text-gray-500">{message}</p>
                </div>
            </TableCell>
        </TableRow>
    );
});

export default Table;

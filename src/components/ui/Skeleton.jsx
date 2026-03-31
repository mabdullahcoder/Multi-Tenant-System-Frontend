import React from 'react';

/**
 * Skeleton Component - Dark Theme
 */
const Skeleton = React.memo(function Skeleton({
    variant = 'rectangular',
    width,
    height,
    className = '',
    count = 1,
}) {
    const baseClass = 'bg-gray-800 animate-pulse';

    const variantClass = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    }[variant] || 'rounded-lg';

    const style = {
        width: width || (variant === 'circular' ? '40px' : '100%'),
        height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '80px'),
    };

    if (count > 1) {
        return (
            <div className="space-y-3">
                {Array.from({ length: count }).map((_, index) => (
                    <div
                        key={index}
                        className={`${baseClass} ${variantClass} ${className}`.trim()}
                        style={style}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={`${baseClass} ${variantClass} ${className}`.trim()}
            style={style}
        />
    );
});

/**
 * Card Skeleton Component
 */
export const CardSkeleton = React.memo(function CardSkeleton({ count = 1 }) {
    if (count > 1) {
        return (
            <>
                {Array.from({ length: count }).map((_, index) => (
                    <div key={index} className="card space-y-4">
                        <Skeleton variant="text" width="60%" height="1.5rem" />
                        <Skeleton variant="rectangular" height="100px" />
                        <div className="flex gap-2">
                            <Skeleton variant="rectangular" width="80px" height="32px" />
                            <Skeleton variant="rectangular" width="80px" height="32px" />
                        </div>
                    </div>
                ))}
            </>
        );
    }

    return (
        <div className="card space-y-4">
            <Skeleton variant="text" width="60%" height="1.5rem" />
            <Skeleton variant="rectangular" height="100px" />
            <div className="flex gap-2">
                <Skeleton variant="rectangular" width="80px" height="32px" />
                <Skeleton variant="rectangular" width="80px" height="32px" />
            </div>
        </div>
    );
});

/**
 * Stat Card Skeleton Component
 */
export const StatCardSkeleton = React.memo(function StatCardSkeleton({ count = 4 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="card">
                    <div className="space-y-3">
                        <Skeleton variant="text" width="70%" height="0.75rem" />
                        <Skeleton variant="text" width="50%" height="2rem" />
                    </div>
                </div>
            ))}
        </>
    );
});

export default Skeleton;

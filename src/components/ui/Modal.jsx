import React, { useEffect } from 'react';

/**
 * Lightweight modal shell (UI-only). Content remains controlled by parent.
 * Mobile-responsive with safe area handling. Theme-aware via CSS variables.
 */
const Modal = React.memo(function Modal({ isOpen, onClose, children, title }) {
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => { if (e.key === 'Escape') onClose?.(); };
        window.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <button
                aria-label="Close modal"
                className="absolute inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className="relative w-full max-w-xs sm:max-w-sm md:max-w-lg rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
                style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-xl)',
                }}
            >
                {/* Header */}
                {title && (
                    <div
                        className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sticky top-0 rounded-t-2xl z-10"
                        style={{
                            borderBottom: '1px solid var(--border)',
                            backgroundColor: 'var(--bg-surface)',
                        }}
                    >
                        <h2
                            className="text-base sm:text-lg font-semibold pr-8"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="absolute top-4 sm:top-5 right-4 sm:right-6 p-1 rounded-lg transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="px-4 sm:px-6 py-4 sm:py-5">
                    {children}
                </div>
            </div>
        </div>
    );
});

export default Modal;

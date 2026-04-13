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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
            {/* Backdrop */}
            <button
                aria-label="Close modal"
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className="relative w-full max-w-xs sm:max-w-sm md:max-w-lg rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-fade-in"
                style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-xl)',
                }}
            >
                {/* Header */}
                {title && (
                    <div
                        className="flex items-center justify-between px-5 sm:px-6 pt-4 sm:pt-5 pb-3.5 flex-shrink-0 rounded-t-2xl"
                        style={{
                            borderBottom: '1px solid var(--border)',
                            backgroundColor: 'var(--bg-surface)',
                        }}
                    >
                        <h2
                            className="text-base sm:text-lg font-semibold leading-snug pr-8"
                            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
                        >
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="absolute top-4 sm:top-5 right-4 sm:right-5 p-1.5 rounded-lg transition-colors flex items-center justify-center"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            aria-label="Close"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="px-5 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1 scrollbar-thin">
                    {children}
                </div>
            </div>
        </div>
    );
});

export default Modal;

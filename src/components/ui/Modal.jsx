import React, { useEffect } from 'react';

/**
 * Lightweight modal shell (UI-only). Content remains controlled by parent.
 * Mobile-responsive with safe area handling.
 */
const Modal = React.memo(function Modal({ isOpen, onClose, children, title }) {
    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };

        window.addEventListener('keydown', onKeyDown);

        // Prevent body scroll when modal is open
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
                className="absolute inset-0 bg-black/40 transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container - Responsive sizing */}
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-lg rounded-2xl bg-white backdrop-blur border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                {title ? (
                    <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 pr-8">
                            {title}
                        </h2>
                        {/* Close button in header */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 sm:top-5 right-4 sm:right-6 p-1 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ) : null}

                {/* Content */}
                <div className="px-4 sm:px-6 py-4 sm:py-5">
                    {children}
                </div>
            </div>
        </div>
    );
});

export default Modal;


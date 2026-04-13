import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-base)' }}>
            <div className="text-center">
                <h1
                    className="text-8xl sm:text-9xl font-bold mb-4 leading-none"
                    style={{ color: 'var(--primary)' }}
                >
                    404
                </h1>
                <p className="text-2xl sm:text-3xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Page Not Found
                </p>
                <p className="text-sm sm:text-base mb-8 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    Sorry, the page you're looking for doesn't exist.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="btn-md btn-primary-solid px-8"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}

export default NotFoundPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-blue-600 mb-4">
                    404
                </h1>
                <p className="text-3xl font-semibold text-gray-900 mb-2">
                    Page Not Found
                </p>
                <p className="text-gray-600 mb-8">
                    Sorry, the page you're looking for doesn't exist.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="btn-primary"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}

export default NotFoundPage;

import React from 'react';

const NotFound = () => {
    return (
        <div className="flex items-center justify-center h-screen text-center">
            <h1 className="text-4xl font-bold text-red-500">404 - Page Not Found</h1>
            <p className="mt-4 text-gray-600">Oops! The page you are looking for does not exist.</p>
        </div>
    );
};

export default NotFound;

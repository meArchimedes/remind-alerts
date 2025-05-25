import React, { useState, useEffect } from 'react'

function ErrorBoundary({ children }) {
    const [hasError, setHasError] = useState(false)
    const handleError = (error, errorInfo) => {
        console.error("Error:", error, errorInfo)
        setHasError(true)
    }

    useEffect(() => {
        const errorHandler = (event) => {
            handleError(event.error);
        };

        window.addEventListener("error", errorHandler);

        return () => {
            window.removeEventListener("error", errorHandler);
        };
    }, [])
    
    if (hasError) {
        return <h1>Something went wrong.</h1>;
    }

    return children;
}

export default ErrorBoundary

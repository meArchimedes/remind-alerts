import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Higher-order component to protect routes that require authentication
const withAuth = (Component) => {
  return (props) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      const checkAuthStatus = async () => {
        try {
          const response = await axios.get('/api/auth/status');
          if (response.data.isAuthenticated) {
            setAuthenticated(true);
          } else {
            navigate('/');
          }
        } catch (error) {
          console.error('Authentication check failed:', error);
          navigate('/');
        } finally {
          setLoading(false);
        }
      };

      checkAuthStatus();
    }, [navigate]);

    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    return authenticated ? <Component {...props} /> : null;
  };
};

export default withAuth;
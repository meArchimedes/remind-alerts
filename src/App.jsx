import { Route, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { createRoutesFromElements } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import MainLayout from './components/MainLayout';
import ErrorBoundary from './components/errorBoundary';
import NotFound from './components/notFound';
import './index.css'

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path='/' index element={<MainLayout />} />
            <Route path='/dashboard' element={<Dashboard />} />
            {/* Catch-all route to handle unmatched URLs */}
            <Route path="*" element={<NotFound />} />
        </>
    )
)

const App = () => {
    return (
        <ErrorBoundary>
            <RouterProvider router={router} />
        </ErrorBoundary>
    )
}

export default App;

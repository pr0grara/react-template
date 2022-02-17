import { Navigate } from 'react-router-dom';

const routes = isLoggedIn => {
    return [
        // { path: '/', element: isLoggedIn ? <Home /> : <Navigate to="/login" />},
        // { path: 'login', element: isLoggedIn ? <Navigate to="/" /> : <Login /> },
    ]
};

export default routes;
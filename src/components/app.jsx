import { useRoutes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import routes from './routes';

const App = () => {
    const state = useSelector((state) => state);
    const isLoggedIn = state.session.isAuthenticated;
    const routing = useRoutes(routes(isLoggedIn));
    return routing;
}

export default App;
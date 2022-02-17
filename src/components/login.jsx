import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { authorizeClient } from '../actions/auth_actions';

const Login = () => {
    const dispatch = useDispatch();
    const { state } = useSelector(state => state);
    const loggedIn =  (state && state.session) ? state.session.isAuthenticated : false;

    const handler = e => {
        switch (e.key) {
            case "Enter":
                authorize();
                break
            default:
                break
        }
    }

    const useEventListener = (eventName, handler, element = window) => {
        // Create a ref that stores handler
        const savedHandler = useRef();
        // Update ref.current value if handler changes.
        // This allows our effect below to always get latest handler ...
        // ... without us needing to pass it in effect deps array ...
        // ... and potentially cause effect to re-run every render.
        useEffect(() => {
            savedHandler.current = handler;
        }, [handler]);
        useEffect(
            () => {
                // Make sure element supports addEventListener
                // On
                const isSupported = element && element.addEventListener;
                if (!isSupported) return;
                // Create event listener that calls handler function stored in ref
                const eventListener = (event) => savedHandler.current(event);
                // Add event listener
                element.addEventListener(eventName, eventListener);
                // Remove event listener on cleanup
                return () => {
                    element.removeEventListener(eventName, eventListener);
                };
            },
            [eventName, element] // Re-run if eventName or element changes
        );
    }

    useEventListener("keydown", handler)

    const authorize = () => {
        let clientSecret = document.querySelector('.password-input').value;
        authorizeClient(clientSecret)
            .then(action => dispatch(action))
            .catch(err => console.log(err));
    }

    return (
        loggedIn ?
        <Navigate to="/" />
        :
        <div className="login-container">
            <input type="text" placeholder="password" defaultValue={!!localStorage.clientsecret ? localStorage.clientsecret : ""} className="password-input" />
            <div className="login-button" onClick={() => authorize()}>Login</div>
        </div>
    )
}

export default Login;
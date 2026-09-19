import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';
import { AWS_CONFIG } from '../config/aws-config';

const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = 'opticloud_token';
const USER_STORAGE_KEY = 'opticloud_user';

const userPool = new CognitoUserPool({
  UserPoolId: AWS_CONFIG.cognito.userPoolId,
  ClientId: AWS_CONFIG.cognito.clientId,
});

const getUserFromSession = (session) => {
  const payload = session.getIdToken().decodePayload();
  return {
    username: payload['cognito:username'] || payload.email,
    email: payload.email,
    name: payload.name || payload.email,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const applySession = (session) => {
    const jwt = session.getIdToken().getJwtToken();
    const sessionUser = getUserFromSession(session);
    setToken(jwt);
    setUser(sessionUser);
    localStorage.setItem(TOKEN_STORAGE_KEY, jwt);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));
    return { jwt, sessionUser };
  };

  useEffect(() => {
    const handleAuthExpired = () => {
      userPool.getCurrentUser()?.signOut();
      clearSession();
    };
    window.addEventListener('auth:expired', handleAuthExpired);

    const currentUser = userPool.getCurrentUser();

    if (!currentUser) {
      setIsLoading(false);
      return () => window.removeEventListener('auth:expired', handleAuthExpired);
    }

    currentUser.getSession((error, session) => {
      if (error || !session?.isValid()) {
        clearSession();
      } else {
        applySession(session);
      }
      setIsLoading(false);
    });

    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const login = (email, password) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session) => {
          applySession(session);
          setIsLoading(false);
          resolve({ success: true });
        },
        onFailure: (error) => {
          setIsLoading(false);
          resolve({ success: false, error: error.message || 'Unable to sign in.' });
        },
        newPasswordRequired: () => {
          setIsLoading(false);
          resolve({
            success: false,
            error: 'A new password is required for this account.',
          });
        },
      });
    });
  };

  const signup = (email, password, name) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      const attributes = [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
      ];
      if (name) attributes.push(new CognitoUserAttribute({ Name: 'name', Value: name }));

      userPool.signUp(email, password, attributes, [], (error, result) => {
        setIsLoading(false);
        if (error) {
          resolve({ success: false, error: error.message || 'Unable to create account.' });
          return;
        }
        resolve({
          success: true,
          userConfirmed: result.userConfirmed,
          message: result.userConfirmed
            ? 'Account created. You can now sign in.'
            : 'A verification code was sent to your email.',
        });
      });
    });
  };

  const confirmSignup = (email, code) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
      cognitoUser.confirmRegistration(code, true, (error) => {
        setIsLoading(false);
        if (error) {
          resolve({ success: false, error: error.message || 'Unable to verify email.' });
          return;
        }
        resolve({ success: true, message: 'Email verified. You can now sign in.' });
      });
    });
  };

  const logout = () => {
    const currentUser = userPool.getCurrentUser();
    currentUser?.signOut();
    clearSession();
  };

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    signup,
    confirmSignup,
    logout,
  }), [user, token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

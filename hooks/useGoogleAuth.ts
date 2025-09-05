import { useState, useEffect, useCallback } from 'react';
import { TokenManager } from '@/lib/utils/tokenManager';

export const useGoogleAuth = () => {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    tokenData: {
      accessToken: string | null;
      refreshToken: string | null;
      expiresAt: number | null;
    };
  }>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    tokenData: {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
    },
  });

  // Load tokens on mount
  useEffect(() => {
    const loadTokens = () => {
      try {
        const tokens = TokenManager.getTokens();
        setAuthState({
          isAuthenticated: !!tokens?.accessToken,
          isLoading: false,
          error: null,
          tokenData: {
            accessToken: tokens?.accessToken || null,
            refreshToken: tokens?.refreshToken || null,
            expiresAt: tokens?.expiresAt || null,
          },
        });
      } catch (error) {
        console.error('Error loading tokens:', error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load authentication state',
        }));
      }
    };

    loadTokens();
  }, []);

  // Function to refresh the access token
  const refreshAccessToken = useCallback(async () => {
    const tokens = TokenManager.getTokens();
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      const data = await response.json();
      
      await TokenManager.saveTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token || tokens.refreshToken,
        expiresIn: data.expires_in,
      });

      const updatedTokens = TokenManager.getTokens();
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        tokenData: {
          accessToken: updatedTokens?.accessToken || null,
          refreshToken: updatedTokens?.refreshToken || null,
          expiresAt: updatedTokens?.expiresAt || null,
        },
      });

      return updatedTokens?.accessToken || null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to refresh access token',
      }));
      throw error;
    }
  }, []);

  // Function to get a valid access token (refreshes if needed)
  const getValidToken = useCallback(async () => {
    const tokens = TokenManager.getTokens();
    if (!tokens) return null;

    // If token is expired or about to expire, refresh it
    if (tokens.expiresAt && TokenManager.isTokenExpired(tokens.expiresAt)) {
      return refreshAccessToken();
    }

    return tokens.accessToken;
  }, [refreshAccessToken]);

  // Function to clear authentication
  const clearAuth = useCallback(() => {
    TokenManager.clearTokens();
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      tokenData: {
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      },
    });
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    const checkAndRefreshToken = async () => {
      const tokens = TokenManager.getTokens();
      if (!tokens?.expiresAt) return;

      // Refresh token if it will expire in the next 5 minutes
      const timeUntilExpiry = tokens.expiresAt - Math.floor(Date.now() / 1000);
      if (timeUntilExpiry < 300) { // 5 minutes in seconds
        try {
          await refreshAccessToken();
        } catch (error) {
          console.error('Failed to refresh token in background:', error);
        }
      }
    };

    // Check token every minute
    const interval = setInterval(checkAndRefreshToken, 60000);
    
    // Initial check
    checkAndRefreshToken();

    return () => clearInterval(interval);
  }, [refreshAccessToken]);

  return {
    ...authState,
    getValidToken,
    refreshAccessToken,
    clearAuth,
  };
};

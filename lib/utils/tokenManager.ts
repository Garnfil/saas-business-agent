import { cookies } from 'next/headers';

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in seconds
}

const TOKEN_KEY = 'google_auth_tokens';
const TOKEN_EXPIRY_BUFFER = 300; // 5 minutes before expiry

export class TokenManager {
  // Get tokens from cookies (client-side)
  static getTokens(): TokenData | null {
    if (typeof window === 'undefined') return null;
    
    const tokenData = localStorage.getItem(TOKEN_KEY);
    if (!tokenData) return null;
    
    try {
      return JSON.parse(tokenData);
    } catch (e) {
      console.error('Failed to parse token data', e);
      return null;
    }
  }

  // Save tokens to both cookies and local storage
  static async saveTokens(tokens: Omit<TokenData, 'expiresAt'> & { expiresIn: number }): Promise<void> {
    const tokenData: TokenData = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + tokens.expiresIn,
    };

    // Save to localStorage (client-side)
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
    }

    // Save to cookies (works on both client and server)
    try {
      document.cookie = `${TOKEN_KEY}=${JSON.stringify(tokenData)}; path=/; samesite=lax; max-age=${tokens.expiresIn}`;
    } catch (e) {
      console.error('Failed to save token to cookies', e);
    }
  }

  // Clear tokens from storage
  static clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }

  // Check if token is expired or about to expire
  static isTokenExpired(expiresAt: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    return expiresAt - now < TOKEN_EXPIRY_BUFFER;
  }

  // Refresh the access token using the refresh token
  static async refreshAccessToken(refreshToken: string): Promise<TokenData | null> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      await this.saveTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken, // Use new refresh token if provided, otherwise keep the old one
        expiresIn: data.expires_in,
      });

      return this.getTokens();
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearTokens();
      return null;
    }
  }

  // Get a valid access token (refreshes if needed)
  static async getValidToken(): Promise<string | null> {
    const tokens = this.getTokens();
    if (!tokens) return null;

    // If token is expired or about to expire, refresh it
    if (this.isTokenExpired(tokens.expiresAt)) {
      const newTokens = await this.refreshAccessToken(tokens.refreshToken);
      return newTokens?.accessToken || null;
    }

    return tokens.accessToken;
  }
}

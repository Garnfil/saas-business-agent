'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, Copy, RefreshCw } from 'lucide-react';
import { GoogleSpreadsheet } from 'google-spreadsheet';

export default function TestOAuthPage() {
  const [token, setToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newAccessToken, setNewAccessToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    sheetTitles?: string[];
    error?: string;
  } | null>(null);

  const callRefreshToken = async () => {
    if (!refreshToken.trim()) {
      setTestResult({
        success: false,
        message: 'Refresh token is required to obtain a new access token',
      });
      return null;
    }

    try {
      setIsRefreshing(true);
      const res = await fetch('/api/google/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to refresh token');
      }
      const newToken = data?.access_token as string | undefined;
      if (newToken) {
        setNewAccessToken(newToken);
        setToken(newToken);
      }
      return newToken ?? null;
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Failed to refresh access token',
        error: err?.message || 'Unknown error occurred',
      });
      return null;
    } finally {
      setIsRefreshing(false);
    }
  };

  const testOAuthToken = async () => {
    if (!token.trim()) {
      setTestResult({
        success: false,
        message: 'Please enter a valid OAuth token',
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      // Use a test spreadsheet ID (you can replace this with your own test spreadsheet)
      const TEST_SPREADSHEET_ID = '1zzNbFSyET6EfvkSvm8jGGIQkBtVTFrotGEU4_bInpoY';

      // Initialize the Google Spreadsheet with the provided OAuth token
      const doc = new GoogleSpreadsheet(TEST_SPREADSHEET_ID, {
        token: token.trim(),
      });

      // Try to load document info to verify the token
      await doc.loadInfo();

      // If successful, get the sheet titles
      const sheetTitles = doc.sheetsByIndex.map(sheet => sheet.title);

      setTestResult({
        success: true,
        message: 'Successfully authenticated with Google Sheets API',
        sheetTitles,
      });
    } catch (error) {
      console.error('OAuth Test Error:', error);
      const message = error instanceof Error ? error.message : String(error);
      const isExpired = /expired|unauthorized|401|invalid_grant|invalid_credentials/i.test(message);

      if (isExpired && refreshToken.trim()) {
        // Attempt to refresh the token and retry once
        const refreshed = await callRefreshToken();
        if (refreshed) {
          try {
            const TEST_SPREADSHEET_ID = '1zzNbFSyET6EfvkSvm8jGGIQkBtVTFrotGEU4_bInpoY';
            const doc = new GoogleSpreadsheet(TEST_SPREADSHEET_ID, {
              token: refreshed,
            });
            await doc.loadInfo();
            const sheetTitles = doc.sheetsByIndex.map(sheet => sheet.title);
            setTestResult({
              success: true,
              message: 'Access token refreshed and authentication succeeded',
              sheetTitles,
            });
            setIsLoading(false);
            return;
          } catch (retryErr: any) {
            setTestResult({
              success: false,
              message: 'Refreshed token failed to authenticate with Google Sheets API',
              error: retryErr?.message || 'Unknown error occurred',
            });
            setIsLoading(false);
            return;
          }
        }
      }

      setTestResult({
        success: false,
        message: 'Failed to authenticate with Google Sheets API',
        error: message || 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test Google OAuth Token</CardTitle>
          <CardDescription>
            Verify your Google OAuth token by testing it against the Google Sheets API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="oauth-token">Google OAuth Token</Label>
              <Input
                id="oauth-token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your Google OAuth token"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This token will be used to authenticate with Google Sheets API.
              </p>
            </div>

            <div>
              <Label htmlFor="refresh-token">Google Refresh Token</Label>
              <Input
                id="refresh-token"
                type="text"
                value={refreshToken}
                onChange={(e) => setRefreshToken(e.target.value)}
                placeholder="Enter your Google OAuth refresh token"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                If the access token is expired, we will use this to request a new access token.
              </p>
            </div>

            <Button
              onClick={testOAuthToken}
              disabled={isLoading || !token.trim()}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test OAuth Token'
              )}
            </Button>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={callRefreshToken}
                disabled={isRefreshing || !refreshToken.trim()}
                className="w-full sm:w-auto"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing token...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Access Token
                  </>
                )}
              </Button>
              {newAccessToken && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(newAccessToken);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    } catch (e) {
                      // no-op
                    }
                  }}
                  className="w-full sm:w-auto"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? 'Copied!' : 'Copy New Access Token'}
                </Button>
              )}
            </div>

            {testResult && (
              <div className={`p-4 rounded-md ${testResult.success ? 'bg-green-50' : 'bg-red-50'} mt-4`}>
                <div className="flex items-start">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {testResult.message}
                    </p>
                    {testResult.error && (
                      <p className="text-sm text-red-700 mt-2">{testResult.error}</p>
                    )}
                    {testResult.sheetTitles && testResult.sheetTitles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-green-800">Available Sheets:</p>
                        <ul className="list-disc list-inside text-sm text-green-700 mt-1">
                          {testResult.sheetTitles.map((title, index) => (
                            <li key={index}>{title}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {newAccessToken && (
              <div className="mt-4 p-4 rounded-md bg-blue-50">
                <p className="text-sm font-medium text-blue-800">New Access Token</p>
                <div className="mt-2 break-all text-xs text-blue-900 bg-white p-2 rounded border">
                  {newAccessToken}
                </div>
                <p className="text-xs text-blue-700 mt-1">Use the copy button above to copy this token.</p>
              </div>
            )}

            <div className="text-sm text-muted-foreground mt-6">
              <p className="font-medium">Note:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>This page tests if your OAuth token has access to Google Sheets API.</li>
                <li>The token must have the <code className="bg-gray-100 px-1 rounded">https://www.googleapis.com/auth/spreadsheets</code> scope.</li>
                <li>We use a test spreadsheet to verify the token. No changes are made to any spreadsheets during this test.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


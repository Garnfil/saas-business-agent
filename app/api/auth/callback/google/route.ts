import {NextResponse} from "next/server";

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
        const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_ERROR',
                error: '${error.replace(/'/g, "\\'")}'
              }, window.opener.origin);
              setTimeout(() => window.close(), 100);
            } else {
              document.body.innerHTML = '<h1>Authentication Error</h1><p>${error.replace(
                  /'/g,
                  "\\'"
              )}</p>';
            }
          </script>
        </head>
        <body>
          <p>Authentication failed. You can close this window and try again.</p>
        </body>
      </html>`;

        return new Response(errorHtml, {
            headers: {"Content-Type": "text/html"},
        });
    }

    // Validate required parameters
    if (!code || !state) {
        const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_ERROR',
                error: 'Missing required parameters'
              }, window.opener.origin);
              setTimeout(() => window.close(), 100);
            } else {
              document.body.innerHTML = '<h1>Error</h1><p>Missing required parameters</p>';
            }
          </script>
        </head>
        <body>
          <p>Invalid request. Please try again.</p>
        </body>
      </html>`;

        return new Response(errorHtml, {
            headers: {"Content-Type": "text/html"},
        });
    }

    // Create HTML response for token exchange
    const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Authenticating...</title>
      <script>
        (async function() {
          try {
            // Exchange authorization code for tokens
            const response = await fetch('/api/auth/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: '${code.replace(
                  /'/g,
                  "\\'"
              )}' }),
            });
            
            if (!response.ok) {
              throw new Error('Failed to exchange code for tokens');
            }
            
            const data = await response.json();
            
            if (data.access_token) {
              // Store tokens in localStorage
              localStorage.setItem('google_access_token', data.access_token);
              if (data.refresh_token) {
                localStorage.setItem('google_refresh_token', data.refresh_token);
              }
              
              // Log token to console
              console.log('Google OAuth Token:', data.access_token);
              
              // Notify parent window
              if (window.opener) {
                window.opener.postMessage({
                  type: 'OAUTH_SUCCESS',
                  access_token: data.access_token,
                  refresh_token: data.refresh_token
                }, window.opener.origin);
              }
            } else {
              throw new Error('No access token received');
            }
          } catch (error) {
            console.error('OAuth error:', error);
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_ERROR',
                error: error.message || 'Authentication failed'
              }, window.opener.origin);
            }
          } finally {
            // Close the popup after a short delay
            setTimeout(() => window.close(), 100);
          }
        })();
      </script>
    </head>
    <body>
      <p>Completing authentication...</p>
    </body>
  </html>`;

    // Return the HTML response with the cookie
    return new Response(html, {
        headers: {
            "Content-Type": "text/html",
            "Set-Cookie": `oauth_code=${code}; Path=/; HttpOnly; ${
                process.env.NODE_ENV === "production"
                    ? "Secure; "
                    : ""
            }SameSite=Lax`,
        },
    });
}

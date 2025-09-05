import {NextResponse} from "next/server";
import {OAuth2Client} from "google-auth-library";

export async function POST(request: Request) {
    try {
        const {refresh_token} = await request.json();

        if (!refresh_token || typeof refresh_token !== "string") {
            return NextResponse.json(
                {error: "Missing or invalid refresh_token"},
                {status: 400}
            );
        }

        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = `http://localhost:3000/api/auth/callback/google`;

        if (!clientId || !clientSecret) {
            return NextResponse.json(
                {
                    error: "Server missing Google OAuth client credentials. Please set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET.",
                },
                {status: 500}
            );
        }

        const oauth2Client = new OAuth2Client({
            clientId,
            clientSecret,
            redirectUri,
        });

        oauth2Client.setCredentials({refresh_token});

        // getAccessToken() will use the refresh token to obtain a fresh token
        const accessTokenResponse =
            await oauth2Client.getAccessToken();

        const token = accessTokenResponse?.token;

        // Also read the current credentials for expiry info if available
        const {expiry_date} = oauth2Client.credentials;

        if (!token) {
            return NextResponse.json(
                {error: "Failed to refresh access token"},
                {status: 400}
            );
        }

        return NextResponse.json({
            access_token: token,
            expiry_date: expiry_date ?? null,
        });
    } catch (err: any) {
        console.error("Refresh token API error:", err);
        return NextResponse.json(
            {
                error:
                    err?.message ||
                    "Unexpected error while refreshing token",
            },
            {status: 500}
        );
    }
}

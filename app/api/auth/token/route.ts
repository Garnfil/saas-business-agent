import {NextResponse} from "next/server";

export async function POST(request: Request) {
    try {
        const {code} = await request.json();

        if (!code) {
            return NextResponse.json(
                {error: "Authorization code is required"},
                {status: 400}
            );
        }

        // Exchange the authorization code for tokens
        const tokenResponse = await fetch(
            "https://oauth2.googleapis.com/token",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    code,
                    client_id: process.env.GOOGLE_CLIENT_ID || "",
                    client_secret:
                        process.env.GOOGLE_CLIENT_SECRET || "",
                    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
                    grant_type: "authorization_code",
                }),
            }
        );

        const tokens = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error("Token exchange error:", tokens);
            return NextResponse.json(
                {
                    error: "Failed to exchange authorization code for tokens",
                },
                {status: 400}
            );
        }

        return NextResponse.json({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_in: tokens.expires_in,
        });
    } catch (error) {
        console.error("Token endpoint error:", error);
        return NextResponse.json(
            {error: "Internal server error"},
            {status: 500}
        );
    }
}

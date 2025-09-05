"use server";

import {cookies} from "next/headers";

export async function logout() {
    try {
        const cookiesStore = await cookies();
        const sessionToken =
            cookiesStore.get("session_token")?.value ?? "";

        if (!sessionToken) {
            throw new Error("Not authenticated");
        }

        const response = await fetch(
            `${process.env.API_URL_ENDPOINT}/auth/logout`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${sessionToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(response.statusText ?? "Logout failed");
        }

        cookiesStore.delete("session_token");

        return {
            status: "success",
            statusCode: 200,
            message: "Logout successful",
            response: null,
        };
    } catch (error) {
        console.error("Logout error:", error);
        return {
            status: "failed",
            statusCode: 500,
            message:
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred",
            response: null,
        };
    }
}

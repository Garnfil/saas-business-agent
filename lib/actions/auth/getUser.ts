"use server";

import {cookies} from "next/headers";

export async function getUser() {
    try {
        const cookieStore = await cookies();
        const sessionToken =
            cookieStore.get("session_token")?.value ?? "";

        const response = await fetch(
            `${process.env.API_URL_ENDPOINT}/auth/session`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${sessionToken}`,
                },
            }
        );

        const responseData = await response.json();

        if (!response.ok) {
            return {
                status: "failed",
                statusCode: response.status,
                response: responseData,
            };
        }

        return {
            status: "success",
            statusCode: response.status,
            response: responseData,
        };
    } catch (error) {
        console.log("error", error);
        const err = error as {statusCode?: number; message?: string};
        return {
            status: "failed",
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "An unknown error occurred",
            response: null,
        };
    }
}

export async function getSessionToken() {
    try {
        const cookieStore = await cookies();
        const sessionToken =
            cookieStore.get("session_token")?.value ?? "";

        return sessionToken;
    } catch (error) {
        const err = error as {statusCode?: number; message?: string};
        return {
            status: "failed",
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "An unknown error occurred",
            response: null,
        };
    }
}

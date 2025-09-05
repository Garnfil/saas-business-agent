"use server";

import {cookies} from "next/headers";

type RegisterPayload = {
    organization_name: string;
    organization_size: string;
    industry: string;
    // User details
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
    role: string;
    // Agreement
    agree_terms: boolean;
};

export async function register(payload: RegisterPayload) {
    try {
        const response = await fetch(
            `${process.env.API_URL_ENDPOINT}/auth/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
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

        const cookieStore = await cookies();
        cookieStore.set("session_token", responseData.token);

        return {
            status: "success",
            statusCode: response.status,
            response: responseData,
        };
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

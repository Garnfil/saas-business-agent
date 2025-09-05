"use server";

import {cookies} from "next/headers";

type LoginPayload = {
    email: string;
    password: string;
};

export async function login(payload: LoginPayload) {
    try {
        const response = await fetch(
            `${process.env.API_URL_ENDPOINT}/auth/login`,
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
        };
    }
}

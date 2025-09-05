"use server";

import {cookies} from "next/headers";

export async function getTenant(tenantId: number, params = null) {
    try {
        const cookieStore = await cookies();
        const sessionToken =
            cookieStore.get("session_token")?.value ?? "";

        const response = await fetch(
            `${process.env.API_URL_ENDPOINT}/tenants/${tenantId}`,
            {
                method: "GET",
                headers: {
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
        const err = error as {statusCode?: number; message?: string};
        return {
            status: "failed",
            statusCode: err.statusCode ?? 500,
            message: err.message ?? "An unknown error occurred",
            response: null,
        };
    }
}

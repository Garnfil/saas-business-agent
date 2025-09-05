"use server";

import {revalidatePath} from "next/cache";
import {ApiResponse} from "@/types";
import {cookies} from "next/headers";

const API_URL = process.env.API_URL_ENDPOINT;

interface DataSourceFormData {
    name: string;
    type: string;
    config_data: Record<string, any>;
}

export async function createDataSource(
    data: DataSourceFormData
): Promise<ApiResponse> {
    try {
        const cookieStore = await cookies();
        const sessionToken =
            cookieStore.get("session_token")?.value ?? "";

        if (!sessionToken) {
            throw new Error("Not authenticated");
        }

        const response = await fetch(
            `http://127.0.0.1:8000/api/v1/data-sources`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${sessionToken}`,
                },
                body: JSON.stringify(data),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to create data source"
            );
        }

        revalidatePath("/dashboard/data-sources");
        return {success: true, data: result};
    } catch (error) {
        console.error("Error creating data source:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to create data source",
        };
    }
}

export async function updateDataSource(
    id: string,
    data: Partial<DataSourceFormData>
): Promise<ApiResponse> {
    try {
        const cookieStore = await cookies();
        const sessionToken =
            cookieStore.get("session_token")?.value ?? "";

        if (!sessionToken) {
            throw new Error("Not authenticated");
        }

        const response = await fetch(
            `${API_URL}/api/data-sources/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionToken}`,
                },
                body: JSON.stringify(data),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Failed to update data source"
            );
        }

        revalidatePath("/dashboard/data-sources");
        revalidatePath(`/dashboard/data-sources/configure/${id}`);
        return {success: true, data: result};
    } catch (error) {
        console.error("Error updating data source:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to update data source",
        };
    }
}

export async function deleteDataSource(
    id: string
): Promise<ApiResponse> {
    try {
        const cookieStore = await cookies();
        const sessionToken =
            cookieStore.get("session_token")?.value ?? "";

        if (!sessionToken) {
            throw new Error("Not authenticated");
        }

        const response = await fetch(
            `${API_URL}/api/data-sources/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${sessionToken}`,
                },
            }
        );

        if (!response.ok) {
            const result = await response.json();
            throw new Error(
                result.message || "Failed to delete data source"
            );
        }

        revalidatePath("/dashboard/data-sources");
        return {success: true};
    } catch (error) {
        console.error("Error deleting data source:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to delete data source",
        };
    }
}

export async function saveDataSourceConfig(configData: {
    name: string;
    type: string;
    authMethod: string;
    spreadsheets: Array<{id: string; url: string; category: string}>;
    oauth?: {
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
    };
    serviceAccount?: string;
}): Promise<ApiResponse> {
    try {
        const cookieStore = await cookies();
        const sessionToken =
            cookieStore.get("session_token")?.value ?? "";

        if (!sessionToken) {
            throw new Error("Not authenticated");
        }

        // Prepare the config data for Google Sheets
        const config_data: Record<string, any> = {
            auth_method: configData.authMethod,
            spreadsheets: configData.spreadsheets.map((sheet) => ({
                id: sheet.id,
                url: sheet.url,
                category: sheet.category,
            })),
        };

        // Add auth-specific data
        if (configData.authMethod === "OAuth2") {
            if (!configData.oauth || !configData.oauth.accessToken) {
                throw new Error(
                    "OAuth access token is required for OAuth2 authentication"
                );
            }
            config_data.oauth = {
                access_token: configData.oauth.accessToken,
                refresh_token: configData.oauth.refreshToken,
                expires_at: configData.oauth.expiresAt,
            };
        } else if (configData.authMethod === "Service Account") {
            if (!configData.serviceAccount) {
                throw new Error(
                    "Service account JSON is required for Service Account authentication"
                );
            }
            config_data.service_account_json =
                configData.serviceAccount;
        }

        console.log("Config Data: ", config_data);

        const response = await fetch(`${API_URL}/data-sources`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
                Authorization: `Bearer ${sessionToken}`,
            },
            body: JSON.stringify({
                name: configData.name,
                type: configData.type,
                config_data: config_data,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                    "Failed to save data source configuration"
            );
        }

        revalidatePath("/dashboard/data-sources");
        return {success: true, data: result};
    } catch (error) {
        console.error(
            "Error saving data source configuration:",
            error
        );
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to save data source configuration",
        };
    }
}

export async function testDataSourceConnection(
    id: string
): Promise<ApiResponse> {
    try {
        const cookieStore = await cookies();
        const sessionToken =
            cookieStore.get("session_token")?.value ?? "";

        if (!sessionToken) {
            throw new Error("Not authenticated");
        }

        const response = await fetch(
            `${API_URL}/api/data-sources/${id}/test-connection`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${sessionToken}`,
                    accept: "application/json",
                },
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Connection test failed"
            );
        }

        return {success: true, data: result};
    } catch (error) {
        console.error("Error testing data source connection:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Connection test failed",
        };
    }
}

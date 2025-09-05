"use server";

import {z} from "zod";
import {revalidatePath} from "next/cache";
import {cookies, headers} from "next/headers";
import {getUser} from "./auth/getUser";

export type ActionResult = {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
};

// Profile update schema
const profileSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, "Last name is required"),
    country_code: z.string().min(1, "Country code is required"),
    phone_number: z.string().min(1, "Phone number is required"),
});

// Organization update schema
const organizationSchema = z.object({
    name: z.string().min(1, "Organization name is required"),
    description: z.string().optional(),
    industry: z.string().optional(),
    organization_size: z.string().optional(),
    website: z
        .string()
        .url("Please enter a valid URL")
        .or(z.literal("")),
    primary_use_case: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type OrganizationFormData = z.infer<typeof organizationSchema>;

export async function updateProfile(
    formData: ProfileFormData
): Promise<ActionResult> {
    try {
        // Validate the form data
        const validatedData = profileSchema.parse(formData);

        // Get the base URL for the API
        const baseUrl = `${process.env.API_URL_ENDPOINT}`;

        const cookieStore = await cookies();
        const sessionToken =
            cookieStore.get("session_token")?.value ?? "";

        const response = await fetch(`${baseUrl}/users/profile`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${sessionToken}`,
            },
            body: JSON.stringify(validatedData),
        });

        const responseData = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message:
                    responseData.message ||
                    "Failed to update profile",
            };
        }

        revalidatePath("/onboarding");
        return {success: true, message: responseData.message};
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                errors: error.errors.reduce((acc, curr) => {
                    const key = curr.path.join(".");
                    acc[key] = [curr.message];
                    return acc;
                }, {} as Record<string, string[]>),
            };
        }
        return {
            success: false,
            message: error.message,
        };
    }
}

export async function updateTenant(
    formData: OrganizationFormData
): Promise<ActionResult> {
    try {
        // Validate the form data
        const validatedData = organizationSchema.parse(formData);

        const userResult = await getUser();

        // Get the base URL for the API
        const baseUrl = `${process.env.API_URL_ENDPOINT}`;
        const cookieStore = await cookies();
        const sessionToken =
            cookieStore.get("session_token")?.value ?? "";

        const response = await fetch(
            `${baseUrl}/tenants/${userResult?.response?.data?.tenant_id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${sessionToken}`,
                },
                body: JSON.stringify(validatedData),
            }
        );

        const responseData = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message:
                    responseData.message ||
                    "Failed to update organization",
            };
        }

        revalidatePath("/onboarding");
        return {success: true, message: responseData.message};
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                errors: error.errors.reduce((acc, curr) => {
                    const key = curr.path.join(".");
                    acc[key] = [curr.message];
                    return acc;
                }, {} as Record<string, string[]>),
            };
        }
        return {
            success: false,
            message: "An unexpected error occurred",
        };
    }
}

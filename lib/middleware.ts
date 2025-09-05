import {NextRequest, NextResponse} from "next/server";
import {getUser} from "./actions/auth/getUser";

export async function updateSession(request: NextRequest) {
    let samResponse = NextResponse.next({
        request,
    });

    const {status} = await getUser();

    if (status === "failed") {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    return samResponse;
}

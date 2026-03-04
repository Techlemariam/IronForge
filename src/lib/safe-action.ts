import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";
import { createClient } from "@/utils/supabase/server";

// Base client for unauthenticated actions
export const actionClient = createSafeActionClient({
    handleServerError(e) {
        console.error("Action error:", e.message);

        // Only expose error details in development or test environments
        if ((process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") && e instanceof Error) {
            return e.message;
        }

        return DEFAULT_SERVER_ERROR_MESSAGE;
    }
});

// Authenticated client that automatically checks user session
export const authActionClient = actionClient.use(async ({ next }) => {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Unauthorized");
    }

    return next({ ctx: { user, userId: user.id } });
});

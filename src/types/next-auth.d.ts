import "next-auth";

declare module "next-auth" {
    interface Session {
        isAdmin: boolean;
        user: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }
}

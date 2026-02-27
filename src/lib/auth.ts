import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            if (!user.email) return false;

            // Check if user is an authorized admin
            const admin = await prisma.adminUser.findUnique({
                where: { email: user.email },
            });

            return !!admin;
        },
        async session({ session }) {
            // Attach admin flag to session
            if (session.user?.email) {
                const admin = await prisma.adminUser.findUnique({
                    where: { email: session.user.email },
                });
                if (admin) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (session as any).isAdmin = true;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: "/admin/login",
        error: "/admin/login",
    },
});

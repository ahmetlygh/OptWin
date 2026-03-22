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

            // Check AdminUser table or ADMIN_EMAILS env
            const admin = await prisma.adminUser.findUnique({
                where: { email: user.email },
            });

            const envAdmins = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
            const isAdmin = !!admin || envAdmins.includes(user.email.toLowerCase());

            // If admin not in DB yet, create the record
            if (isAdmin && !admin) {
                await prisma.adminUser.create({
                    data: {
                        email: user.email,
                        name: user.name || undefined,
                        image: user.image || undefined,
                    },
                });
            }

            return isAdmin;
        },
        async session({ session }) {
            if (session.user?.email) {
                const admin = await prisma.adminUser.findUnique({
                    where: { email: session.user.email },
                });
                session.isAdmin = !!admin;
            }
            return session;
        },
    },
    pages: {
        signIn: "/admin/login",
        error: "/admin/login",
    },
});

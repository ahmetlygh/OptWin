import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user) {
        redirect("/admin/login");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any).isAdmin) {
        redirect("/admin/unauthorized");
    }

    const unreadMessages = await prisma.contactMessage.count({
        where: { read: false, deleted: false },
    });

    return (
        <div className="flex h-screen relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-[#08080d]">
                <div className="absolute top-[-15%] right-[-5%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full bg-[radial-gradient(circle,rgba(107,91,230,0.06)_0%,transparent_70%)]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[radial-gradient(circle,rgba(147,51,234,0.04)_0%,transparent_70%)]" />
            </div>

            <AdminSidebar unreadMessages={unreadMessages} />

            <div className="flex-1 flex flex-col min-w-0 relative z-10">
                <AdminHeader
                    user={{
                        name: session.user.name,
                        email: session.user.email,
                        image: session.user.image,
                    }}
                />
                <main className="flex-1 overflow-y-auto">
                    <div className="p-5 md:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

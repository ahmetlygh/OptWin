import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    // Not authenticated → redirect to login
    if (!session?.user) {
        redirect("/admin/login");
    }

    // Check admin status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any).isAdmin) {
        redirect("/admin/unauthorized");
    }

    return (
        <div className="flex min-h-screen bg-[#0d0d12]">
            <AdminSidebar
                user={{
                    name: session.user.name,
                    email: session.user.email,
                    image: session.user.image,
                }}
            />
            <main className="flex-1 min-h-screen overflow-y-auto">
                {/* Admin Header */}
                <header className="sticky top-0 z-50 bg-[#0d0d12]/80 backdrop-blur-xl border-b border-[#2b2938]/50 px-6 md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href="/"
                                target="_blank"
                                className="text-xs text-[#a19eb7] hover:text-white transition-colors duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                                View Site
                            </a>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

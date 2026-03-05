import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

export default async function AppLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="page">
      <Navbar user={session} />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}

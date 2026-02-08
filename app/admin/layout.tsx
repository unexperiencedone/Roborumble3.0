
import { Metadata } from 'next';
import AdminSidebar from "../components/AdminSidebar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import connectToDB from "@/lib/mongodb";
import Profile from "@/app/models/Profile";

export const metadata: Metadata = {
  title: "Admin Console | Robo Rumble 3.0",
  description: "Restricted Access Area",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  await connectToDB();
  const profile = await Profile.findOne({ clerkId: user.id });

  if (!profile || !["admin", "superadmin"].includes(profile.role)) {
    redirect("/"); 
  }

  return (
    <div className="flex min-h-screen bg-black">
      <AdminSidebar />
      <AdminSidebar />
      <div className="flex-1 w-full relative overflow-x-hidden md:ml-64">
        {children}
      </div>
    </div>
  );
}

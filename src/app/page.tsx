"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to loads page if user is authenticated, otherwise to login
    if (!loading) {
      if (user) {
        router.push("/loads");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  // Show loading screen while determining auth state
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="flex items-center space-x-2 mb-6">
        <Truck className="h-8 w-8 text-blue-600" />
        <span className="text-2xl font-bold text-gray-900">TMS</span>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-56" />
      </div>
      <p className="text-sm text-gray-500 mt-4">Loading...</p>
    </div>
  );
}

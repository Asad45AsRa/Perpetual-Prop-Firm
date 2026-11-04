"use client";

import { useEffect, useState } from "react";
import { AdminAuth, useAdminSession } from "../../components/admin/Adminauth";
import { AdminDashboard } from "../../components/admin/Admindashboard";

export default function AdminPage() {
  const user = useAdminSession((s) => s.user);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // sessionStorage client par hi hydrate hota hai
  return user ? <AdminDashboard /> : <AdminAuth />;
}
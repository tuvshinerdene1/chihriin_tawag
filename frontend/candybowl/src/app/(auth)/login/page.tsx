// src/app/(auth)/login/page.tsx
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
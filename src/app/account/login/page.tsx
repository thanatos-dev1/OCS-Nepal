import { Suspense } from "react";
import AccountLayout from "@/components/shared/AccountLayout";
import LoginForm from "@/components/shared/LoginForm";

export default function LoginPage() {
  return (
    <AccountLayout>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AccountLayout>
  );
}

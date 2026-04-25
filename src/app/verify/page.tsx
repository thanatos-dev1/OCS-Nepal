"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { verifyEmail } from "@/lib/api/auth";
import Button from "@/components/ui/Button";

type State = "loading" | "success" | "error";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setState("error");
      setMessage("No verification token found. Please check your email link.");
      return;
    }
    verifyEmail(token)
      .then(() => setState("success"))
      .catch((err) => {
        setState("error");
        setMessage(
          err?.response?.data?.error ?? "Invalid or expired token. Please register again."
        );
      });
  }, [searchParams]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {state === "loading" && (
          <>
            <Loader className="mx-auto mb-4 h-10 w-10 animate-spin text-accent" />
            <p className="text-text-muted">Verifying your email…</p>
          </>
        )}
        {state === "success" && (
          <>
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-success" />
            <h1 className="text-2xl font-bold text-text">Email verified!</h1>
            <p className="mt-2 text-sm text-text-muted">
              Your account is active. You can now sign in.
            </p>
            <Button
              variant="cta"
              size="lg"
              className="mt-6 w-full"
              onClick={() => router.push("/account/login?registered=1")}
            >
              Sign In
            </Button>
          </>
        )}
        {state === "error" && (
          <>
            <XCircle className="mx-auto mb-4 h-12 w-12 text-error" />
            <h1 className="text-2xl font-bold text-text">Verification failed</h1>
            <p className="mt-2 text-sm text-text-muted">{message}</p>
            <Button
              variant="outline"
              size="lg"
              className="mt-6 w-full"
              onClick={() => router.push("/account/register")}
            >
              Back to Register
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

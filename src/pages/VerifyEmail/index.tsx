import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { api } from "@/lib/api";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    api.post("/auth/verify-email", { token }, { auth: false })
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified successfully!");
      })
      .catch((err: unknown) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Invalid or expired verification link.");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#ff6b35]" />
            <p className="text-white">Verifying your email…</p>
          </>
        )}

        {status === "success" && (
          <>
            <p className="text-4xl mb-4">✅</p>
            <h1 className="text-xl font-semibold text-white mb-2">Email verified!</h1>
            <p className="text-sm text-neutral-400 mb-6">{message}</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5c] px-6 py-2.5 text-sm font-semibold text-white hover:from-[#ff5722] hover:to-[#ff6b35] transition-all"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-4xl mb-4">❌</p>
            <h1 className="text-xl font-semibold text-white mb-2">Verification failed</h1>
            <p className="text-sm text-neutral-400 mb-6">{message}</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-full border border-white/10 px-6 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Back to Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

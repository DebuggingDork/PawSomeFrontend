import * as React from "react";
import { useState } from "react";
import { Link } from "react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, GitBranch, Globe } from "lucide-react";

export default function LoginCardSection() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="fixed inset-0 z-[100] overflow-hidden">

      {/* Background pet photo */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-neutral-950/70" />
        {/* Subtle vignette */}
        <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_30%,rgba(10,10,10,0.6)_100%)]" />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5">
        {/* PawSome wordmark */}
        <span
          className="text-2xl font-bold bg-gradient-to-r from-[#ff6b35] via-[#ff8c5c] to-[#ff6b35] bg-clip-text text-transparent"
          style={{ fontFamily: "Pacifico, cursive" }}
        >
          PawSome
        </span>

        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </header>

      {/* Centered glass card */}
      <div className="relative z-10 h-full w-full flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-2xl">

          {/* Card heading */}
          <div className="mb-7">
            <h1
              className="text-3xl font-semibold text-white mb-1"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Welcome back
            </h1>
            <p className="text-sm text-neutral-400">Sign in to your PawSome account</p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-neutral-300 text-sm">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus-visible:border-[#ff6b35] focus-visible:ring-[#ff6b35]/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-neutral-300 text-sm">
                  Password
                </Label>
                <a href="#" className="text-xs text-[#ff6b35] hover:text-[#ff8c5c] transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus-visible:border-[#ff6b35] focus-visible:ring-[#ff6b35]/20"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                className="border-white/20 data-[state=checked]:bg-[#ff6b35] data-[state=checked]:border-[#ff6b35]"
              />
              <Label htmlFor="remember" className="text-neutral-400 text-sm font-normal">
                Remember me
              </Label>
            </div>

            {/* CTA */}
            <Button className="w-full h-10 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5c] hover:from-[#ff5722] hover:to-[#ff6b35] text-white font-semibold border-0 shadow-lg shadow-[#ff6b35]/25 transition-all">
              Sign In
            </Button>

            {/* Divider */}
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[11px] uppercase tracking-widest text-neutral-500">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">
                <GitBranch className="h-4 w-4" />
                GitHub
              </button>
              <button className="flex items-center justify-center gap-2 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors">
                <Globe className="h-4 w-4" />
                Google
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-neutral-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#ff6b35] hover:text-[#ff8c5c] transition-colors font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

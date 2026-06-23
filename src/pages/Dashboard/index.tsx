import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { User, PawPrint, MessageCircle, LogOut, Heart, MapPin, Menu, X } from "lucide-react";
import logoIcon from "@/assets/icon.png";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

interface UserProfile {
  full_name: string | null;
}

interface OnboardingStep {
  title: string;
  completed: boolean;
  required: boolean;
  action_url: string | null;
}

interface OnboardingStatus {
  should_show_wizard: boolean;
  completion_percentage: number;
  steps: OnboardingStep[];
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [petCount, setPetCount] = useState<number | null>(null);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null);

  useEffect(() => {
    api.get<UserProfile>("/users/me")
      .then((u) => setUserName(u.full_name))
      .catch(() => {});

    api.get<unknown[]>("/pets/me")
      .then((pets) => setPetCount(pets.length))
      .catch(() => setPetCount(0));

    api.get<unknown[]>("/matches/my-matches")
      .then((res) => setMatchCount(res.length))
      .catch(() => setMatchCount(0));

    api.get<OnboardingStatus>("/onboarding/status")
      .then(setOnboarding)
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const navLinks = [
    { label: "Profile", icon: User, href: "/profile" },
    { label: "My Pets", icon: PawPrint, href: "/my-pets" },
    { label: "Messages", icon: MessageCircle, href: "/messages" },
  ];

  const stats = [
    { label: "My Pets", value: petCount, icon: PawPrint, color: "from-[#ff6b35]/20 to-[#ff8c5c]/10", href: "/my-pets" },
    { label: "Matches", value: matchCount, icon: Heart, color: "from-purple-500/20 to-purple-600/10", href: "/matches" },
    { label: "Messages", value: matchCount, icon: MessageCircle, color: "from-blue-500/20 to-blue-600/10", href: "/messages" },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white">

      {/* Dashboard Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link to="/" className="flex items-center gap-2.5">
            <img src={logoIcon} alt="PawSome" className="h-9 w-9 drop-shadow-lg" />
            <span
              className="text-2xl font-bold bg-gradient-to-r from-[#ff6b35] via-[#ff8c5c] to-[#ff6b35] bg-clip-text text-transparent"
              style={{ fontFamily: "Pacifico, cursive" }}
            >
              PawSome
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                to={href}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="ml-2 flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>

          <button
            className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 bg-neutral-950/95 px-6 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map(({ label, icon: Icon, href }) => (
                <Link
                  key={label}
                  to={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="mt-1 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-all hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-6 pt-28 pb-16">

        {/* Welcome hero */}
        <div className="mb-10">
          <p className="text-sm font-medium text-[#ff6b35] uppercase tracking-widest mb-1">
            Welcome back
          </p>
          <h1
            className="text-4xl font-semibold text-white"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {userName ? `Hey, ${userName.split(" ")[0]}!` : "Find your perfect match"}
          </h1>
          <p className="mt-2 text-neutral-400">
            Discover pets near you and connect with their owners.
          </p>
        </div>

        {/* Onboarding checklist banner */}
        {onboarding?.should_show_wizard && (
          <div className="mb-8 rounded-2xl border border-[#ff6b35]/30 bg-[#ff6b35]/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#ff6b35]">Complete your setup</p>
              <span className="text-xs text-neutral-400">{onboarding.completion_percentage}% done</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 mb-4">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5c]"
                style={{ width: `${onboarding.completion_percentage}%` }}
              />
            </div>
            <ul className="space-y-1.5">
              {onboarding.steps.filter((s) => s.required && !s.completed).map((step) => (
                <li key={step.title} className="flex items-center gap-2 text-sm text-neutral-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b35]/60 shrink-0" />
                  {step.title}
                </li>
              ))}
            </ul>
            <Link
              to="/profile"
              className="mt-4 inline-flex items-center rounded-full bg-[#ff6b35] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#ff5722] transition-colors"
            >
              Continue setup →
            </Link>
          </div>
        )}

        {/* Stats row */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map(({ label, value, icon: Icon, color, href }) => (
            <Link
              key={label}
              to={href}
              className={`rounded-2xl border border-white/10 bg-gradient-to-br ${color} p-5 backdrop-blur-sm transition-all hover:border-white/20`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-400">{label}</p>
                <Icon className="h-5 w-5 text-white/30" />
              </div>
              <p className="mt-2 text-3xl font-semibold text-white">
                {value === null ? (
                  <span className="inline-block h-8 w-8 animate-pulse rounded bg-white/10" />
                ) : (
                  value
                )}
              </p>
            </Link>
          ))}
        </div>

        {/* Discover section placeholder */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Discover Nearby Pets</h2>
            <Link
              to="/discover"
              className="text-sm text-[#ff6b35] hover:text-[#ff8c5c] transition-colors"
            >
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-[#ff6b35]/40 hover:bg-white/10"
              >
                <div className="mb-3 h-40 w-full rounded-xl bg-white/5 animate-pulse" />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="h-4 w-24 rounded bg-white/10 mb-1.5 animate-pulse" />
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                      <MapPin className="h-3 w-3" />
                      <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-neutral-500 transition-all group-hover:border-[#ff6b35]/50 group-hover:text-[#ff6b35]">
                    <Heart className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

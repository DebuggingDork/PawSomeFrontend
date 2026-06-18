import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { User, PawPrint, MessageCircle, LogOut, Heart, MapPin, Menu, X } from "lucide-react";
import logoIcon from "@/assets/icon.png";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("pawsome_access_token");
    localStorage.removeItem("pawsome_refresh_token");
    navigate("/auth");
  };

  const navLinks = [
    { label: "Profile", icon: User, href: "/profile" },
    { label: "My Pets", icon: PawPrint, href: "/my-pets" },
    { label: "Messages", icon: MessageCircle, href: "/messages" },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white">

      {/* Dashboard Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logoIcon} alt="PawSome" className="h-9 w-9 drop-shadow-lg" />
            <span
              className="text-2xl font-bold bg-gradient-to-r from-[#ff6b35] via-[#ff8c5c] to-[#ff6b35] bg-clip-text text-transparent"
              style={{ fontFamily: "Pacifico, cursive" }}
            >
              PawSome
            </span>
          </Link>

          {/* Right: Nav buttons (desktop) */}
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

          {/* Mobile hamburger */}
          <button
            className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
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

      {/* Page content */}
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
            Find your perfect match
          </h1>
          <p className="mt-2 text-neutral-400">
            Discover pets near you and connect with their owners.
          </p>
        </div>

        {/* Stats row */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "My Pets", value: "—", icon: PawPrint, color: "from-[#ff6b35]/20 to-[#ff8c5c]/10" },
            { label: "Matches", value: "—", icon: Heart, color: "from-purple-500/20 to-purple-600/10" },
            { label: "Messages", value: "—", icon: MessageCircle, color: "from-blue-500/20 to-blue-600/10" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className={`rounded-2xl border border-white/10 bg-gradient-to-br ${color} p-5 backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-400">{label}</p>
                <Icon className="h-5 w-5 text-white/30" />
              </div>
              <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Discover section placeholder */}
        <div>
          <h2 className="mb-5 text-lg font-semibold text-white">Discover Nearby Pets</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-[#ff6b35]/40 hover:bg-white/10"
              >
                {/* Photo placeholder */}
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

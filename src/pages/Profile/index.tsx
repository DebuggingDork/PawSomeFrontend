import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, MapPin, Briefcase, FileText, LogOut, PawPrint, MessageCircle, Menu, X, Camera, Trash2 } from "lucide-react";
import logoIcon from "@/assets/icon.png";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  occupation: string | null;
  bio: string | null;
  address: string | null;
  profile_photo_url: string | null;
}

interface ProfileCompletion {
  completion_percentage: number;
  suggestions: string[];
}

interface AchievementBadge {
  type: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

interface AchievementSummary {
  total_earned: number;
  total_available: number;
  badges: AchievementBadge[];
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);
  const [achievements, setAchievements] = useState<AchievementSummary | null>(null);
  const [form, setForm] = useState({ full_name: "", occupation: "", bio: "", address: "" });
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<UserProfile>("/users/me"),
      api.get<ProfileCompletion>("/users/me/completion"),
      api.get<AchievementSummary>("/achievements/me"),
    ])
      .then(([data, comp, ach]) => {
        setProfile(data);
        setCompletion(comp);
        setAchievements(ach);
        setForm({
          full_name: data.full_name ?? "",
          occupation: data.occupation ?? "",
          bio: data.bio ?? "",
          address: data.address ?? "",
        });
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setFetching(false));
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Photo must be 10 MB or smaller.");
      e.target.value = "";
      return;
    }
    setPhotoUploading(true);
    setError("");
    try {
      const { upload_url, object_key } = await api.post<{ upload_url: string; object_key: string }>(
        "/users/me/photo/presign",
        { content_type: file.type }
      );
      const r2Res = await api.uploadToR2(upload_url, file);
      if (!r2Res.ok) throw new Error(`Upload failed (${r2Res.status})`);
      const updated = await api.post<UserProfile>("/users/me/photo", { object_key });
      setProfile(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
    }
  };

  const handleDeletePhoto = async () => {
    setPhotoUploading(true);
    setError("");
    try {
      await api.delete("/users/me/photo");
      setProfile((prev) => prev ? { ...prev, profile_photo_url: null } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove photo");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.patch("/users/me", {
        full_name: form.full_name || null,
        occupation: form.occupation || null,
        bio: form.bio || null,
        address: form.address || null,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const navLinks = [
    { label: "My Pets", icon: PawPrint, href: "/my-pets" },
    { label: "Messages", icon: MessageCircle, href: "/messages" },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white">

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2.5">
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

      <main className="mx-auto max-w-2xl px-6 pt-28 pb-16">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-[#ff6b35] mb-1 font-medium">Account</p>
          <h1
            className="text-4xl font-semibold text-white"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Your Profile
          </h1>
          {profile && (
            <p className="mt-1 text-sm text-neutral-400">{profile.email}</p>
          )}
        </div>

        {/* Profile completion bar */}
        {completion && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-white">Profile Completion</p>
              <span className="text-sm font-semibold text-[#ff6b35]">{completion.completion_percentage}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5c] transition-all"
                style={{ width: `${completion.completion_percentage}%` }}
              />
            </div>
            {completion.suggestions[0] && (
              <p className="mt-2.5 text-xs text-neutral-400">{completion.suggestions[0]}</p>
            )}
          </div>
        )}

        {fetching ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Profile photo */}
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center">
                  {profile?.profile_photo_url ? (
                    <img src={profile.profile_photo_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-neutral-500" />
                  )}
                </div>
                <label className={`absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-neutral-900 text-white/70 hover:text-white transition-colors ${photoUploading ? "opacity-50 pointer-events-none" : ""}`}>
                  <Camera className="h-3.5 w-3.5" />
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Profile photo</p>
                <p className="text-xs text-neutral-500 mt-0.5">JPEG, PNG or WebP · max 10 MB</p>
                {profile?.profile_photo_url && (
                  <button type="button" onClick={handleDeletePhoto} disabled={photoUploading}
                    className="mt-1.5 flex items-center gap-1 text-xs text-neutral-500 hover:text-red-400 transition-colors disabled:opacity-50">
                    <Trash2 className="h-3 w-3" />
                    {photoUploading ? "Removing…" : "Remove photo"}
                  </button>
                )}
                {photoUploading && !profile?.profile_photo_url && (
                  <p className="mt-1 text-xs text-[#ff6b35]">Uploading…</p>
                )}
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-neutral-300 text-sm">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="John Doe"
                  value={form.full_name}
                  onChange={handleChange}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus-visible:border-[#ff6b35] focus-visible:ring-[#ff6b35]/20"
                />
              </div>
            </div>

            {/* Occupation */}
            <div className="space-y-1.5">
              <Label htmlFor="occupation" className="text-neutral-300 text-sm">Occupation</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  id="occupation"
                  name="occupation"
                  type="text"
                  placeholder="Veterinarian"
                  value={form.occupation}
                  onChange={handleChange}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus-visible:border-[#ff6b35] focus-visible:ring-[#ff6b35]/20"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-neutral-300 text-sm">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="City, Country"
                  value={form.address}
                  onChange={handleChange}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus-visible:border-[#ff6b35] focus-visible:ring-[#ff6b35]/20"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-neutral-300 text-sm">Bio</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  placeholder="Dog lover and outdoor enthusiast…"
                  value={form.bio}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 rounded-md bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]/20 resize-none"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {success && <p className="text-sm text-emerald-400">Profile saved successfully.</p>}

            <Button
              type="submit"
              disabled={saving}
              className="w-full h-10 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5c] hover:from-[#ff5722] hover:to-[#ff6b35] text-white font-semibold border-0 shadow-lg shadow-[#ff6b35]/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : "Save Profile"}
            </Button>

          </form>
        )}

        {/* Achievements */}
        {achievements && (
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Achievements</h2>
              <span className="text-sm text-neutral-400">
                {achievements.total_earned} / {achievements.total_available}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {achievements.badges.map((badge) => (
                <div
                  key={badge.type}
                  className={`rounded-2xl border p-4 transition-all ${
                    badge.earned
                      ? "border-[#ff6b35]/30 bg-[#ff6b35]/10"
                      : "border-white/5 bg-white/5 opacity-40"
                  }`}
                >
                  <p className="text-2xl mb-1">{badge.icon}</p>
                  <p className={`text-sm font-medium ${badge.earned ? "text-white" : "text-neutral-400"}`}>
                    {badge.name}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

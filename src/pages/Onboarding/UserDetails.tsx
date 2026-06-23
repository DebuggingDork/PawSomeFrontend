import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, MapPin, Briefcase, FileText, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

export default function UserDetailsPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    occupation: "",
    bio: "",
    address: "",
    pets: "1",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.patch("/users/me", {
        full_name: form.full_name,
        occupation: form.occupation,
        bio: form.bio,
        address: form.address,
      });
      sessionStorage.setItem("pawsome_pet_count", form.pets);
      navigate("/onboarding/pets");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="fixed inset-0 z-[100]">

      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-neutral-950/70" />
        <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_30%,rgba(10,10,10,0.6)_100%)]" />
      </div>

      {/* Page navbar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5">
        <span
          className="text-2xl font-bold bg-gradient-to-r from-[#ff6b35] via-[#ff8c5c] to-[#ff6b35] bg-clip-text text-transparent"
          style={{ fontFamily: "Pacifico, cursive" }}
        >
          PawSome
        </span>
        <Link
          to="/register"
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </header>

      {/* Area below navbar — flex-centers the card */}
      <div className="absolute inset-x-0 bottom-0 top-[4.5rem] z-10 flex items-center justify-center px-4 py-3">

        {/* Card — explicit height so flex children can scroll */}
        <div className="w-full max-w-sm flex flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl h-[calc(100vh-7rem)]">

          {/* ── Sticky card header ── */}
          <div className="px-6 pt-5 pb-4 shrink-0 border-b border-white/[0.06]">
            <p className="text-xs uppercase tracking-widest text-[#ff6b35] mb-1 font-medium">
              Step 1 of 2
            </p>
            <h1
              className="text-3xl font-semibold text-white mb-0.5"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              About you
            </h1>
            <p className="text-sm text-neutral-400">Tell us a little about yourself</p>
          </div>

          {/* ── Scrollable form body ── */}
          <div
            className="flex-1 min-h-0 overflow-y-auto px-6 py-4
              [&::-webkit-scrollbar]:w-1
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-white/20
              hover:[&::-webkit-scrollbar-thumb]:bg-[#ff6b35]/60"
          >
            <form id="user-details-form" onSubmit={handleSubmit} className="space-y-4">

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
                    required
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
                    rows={3}
                    placeholder="Dog lover and outdoor enthusiast…"
                    value={form.bio}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 rounded-md bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]/20 resize-none"
                  />
                </div>
              </div>

              {/* How many pets */}
              <div className="space-y-1.5">
                <Label className="text-neutral-300 text-sm">How many pets do you have?</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, pets: String(n) })}
                      className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-all ${
                        form.pets === String(n)
                          ? "border-[#ff6b35] bg-[#ff6b35]/20 text-[#ff6b35]"
                          : "border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

            </form>
          </div>

          {/* ── Sticky footer ── */}
          <div className="px-6 pt-4 pb-5 shrink-0 border-t border-white/[0.06]">
            {error && (
              <p className="text-sm text-red-400 text-center mb-3">{error}</p>
            )}
            <Button
              type="submit"
              form="user-details-form"
              disabled={loading}
              className="w-full h-10 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5c] hover:from-[#ff5722] hover:to-[#ff6b35] text-white font-semibold border-0 shadow-lg shadow-[#ff6b35]/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Saving…" : "Continue"}
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}

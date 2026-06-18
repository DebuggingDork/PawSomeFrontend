import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera } from "lucide-react";
import { api } from "@/lib/api";

type Species = "dog" | "cat";
type Gender = "male" | "female";

interface Pet {
  name: string;
  species: Species;
  breed: string;
  age_years: string;
  gender: Gender;
  bio: string;
  photo: string | null;
  photoFile: File | null;
}

const defaultPet = (): Pet => ({
  name: "",
  species: "dog",
  breed: "",
  age_years: "",
  gender: "male",
  bio: "",
  photo: null,
  photoFile: null,
});

export default function PetDetailsPage() {
  const navigate = useNavigate();
  const petCount = parseInt(sessionStorage.getItem("pawsome_pet_count") || "1");

  const [pets, setPets] = useState<Pet[]>(Array.from({ length: petCount }, defaultPet));
  const [activePet, setActivePet] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const current = pets[activePet];

  const updatePet = (field: keyof Pet, value: string) => {
    setPets((prev) => prev.map((p, i) => (i === activePet ? { ...p, [field]: value } : p)));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPets((prev) =>
      prev.map((p, i) => (i === activePet ? { ...p, photo: url, photoFile: file } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      for (const pet of pets) {
        if (!pet.name) continue;

        // Step 1: Create pet profile
        const created = await api.post<{ id: string }>("/pets", {
          name: pet.name,
          species: pet.species,
          breed: pet.breed || undefined,
          age_years: pet.age_years ? parseInt(pet.age_years) : undefined,
          gender: pet.gender,
          bio: pet.bio || undefined,
        });

        // Step 2: Upload photo (3-step) if provided
        if (pet.photoFile) {
          const { upload_url, object_key } = await api.post<{
            upload_url: string;
            object_key: string;
          }>(`/pets/${created.id}/photos/presign`, {
            content_type: pet.photoFile.type,
          });

          await api.uploadToR2(upload_url, pet.photoFile);

          await api.post(`/pets/${created.id}/photos`, { object_key });
        }
      }

      navigate("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save pet details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="fixed inset-0 z-[100] overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-neutral-950/70" />
        <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_30%,rgba(10,10,10,0.6)_100%)]" />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5">
        <span
          className="text-2xl font-bold bg-gradient-to-r from-[#ff6b35] via-[#ff8c5c] to-[#ff6b35] bg-clip-text text-transparent"
          style={{ fontFamily: "Pacifico, cursive" }}
        >
          PawSome
        </span>
        <Link
          to="/onboarding/profile"
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </header>

      {/* Scrollable card */}
      <div className="relative z-10 h-full w-full flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-2xl overflow-y-auto max-h-full">

          {/* Heading */}
          <div className="mb-4">
            <p className="text-xs uppercase tracking-widest text-[#ff6b35] mb-1 font-medium">
              Step 2 of 2
            </p>
            <h1
              className="text-3xl font-semibold text-white mb-1"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Your pets
            </h1>
            <p className="text-sm text-neutral-400">Add details for each of your pets</p>
          </div>

          {/* Pet tabs */}
          {pets.length > 1 && (
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {pets.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActivePet(i)}
                  className={`shrink-0 px-4 h-8 rounded-full text-xs font-medium transition-all ${
                    activePet === i
                      ? "bg-[#ff6b35] text-white"
                      : "bg-white/5 border border-white/10 text-neutral-400 hover:text-white"
                  }`}
                >
                  Pet {i + 1}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Photo upload */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:border-[#ff6b35]/50 transition-colors">
                {current.photo ? (
                  <img src={current.photo} className="w-full h-full object-cover" alt="Pet" />
                ) : (
                  <Camera className="h-5 w-5 text-neutral-500" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handlePhotoChange}
                />
              </div>
              <div>
                <p className="text-sm text-white font-medium">Pet photo</p>
                <p className="text-xs text-neutral-500">JPEG, PNG or WebP · max 10 MB</p>
              </div>
            </div>

            {/* Pet name */}
            <div className="space-y-1.5">
              <Label htmlFor="petName" className="text-neutral-300 text-sm">Pet Name</Label>
              <Input
                id="petName"
                type="text"
                placeholder="Buddy"
                value={current.name}
                onChange={(e) => updatePet("name", e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus-visible:border-[#ff6b35] focus-visible:ring-[#ff6b35]/20"
              />
            </div>

            {/* Species */}
            <div className="space-y-1.5">
              <Label className="text-neutral-300 text-sm">Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["dog", "cat"] as Species[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updatePet("species", s)}
                    className={`h-10 rounded-lg border text-sm font-medium transition-all ${
                      current.species === s
                        ? "border-[#ff6b35] bg-[#ff6b35]/20 text-[#ff6b35]"
                        : "border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {s === "dog" ? "🐶 Dog" : "🐱 Cat"}
                  </button>
                ))}
              </div>
            </div>

            {/* Breed */}
            <div className="space-y-1.5">
              <Label htmlFor="breed" className="text-neutral-300 text-sm">Breed</Label>
              <Input
                id="breed"
                type="text"
                placeholder="Golden Retriever"
                value={current.breed}
                onChange={(e) => updatePet("breed", e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus-visible:border-[#ff6b35] focus-visible:ring-[#ff6b35]/20"
              />
            </div>

            {/* Age + Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="age" className="text-neutral-300 text-sm">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  max="30"
                  placeholder="3"
                  value={current.age_years}
                  onChange={(e) => updatePet("age_years", e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus-visible:border-[#ff6b35] focus-visible:ring-[#ff6b35]/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-neutral-300 text-sm">Gender</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["male", "female"] as Gender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => updatePet("gender", g)}
                      className={`h-9 rounded-lg border text-xs font-medium capitalize transition-all ${
                        current.gender === g
                          ? "border-[#ff6b35] bg-[#ff6b35]/20 text-[#ff6b35]"
                          : "border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {g === "male" ? "♂ Male" : "♀ Female"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label htmlFor="petBio" className="text-neutral-300 text-sm">Bio</Label>
              <textarea
                id="petBio"
                rows={2}
                placeholder="Energetic and loves to play fetch!"
                value={current.bio}
                onChange={(e) => updatePet("bio", e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35]/20 resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5c] hover:from-[#ff5722] hover:to-[#ff6b35] text-white font-semibold border-0 shadow-lg shadow-[#ff6b35]/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Saving pets…" : "Continue"}
              </Button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full h-10 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Skip for now
              </button>
            </div>

          </form>
        </div>
      </div>
    </section>
  );
}

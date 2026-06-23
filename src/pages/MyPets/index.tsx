import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { LogOut, PawPrint, User, MessageCircle, Menu, X, Plus, Trash2, Pencil, Check, Star } from "lucide-react";
import logoIcon from "@/assets/icon.png";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

interface PetPhoto {
  id: string;
  url: string;
  is_primary: boolean;
}

interface Pet {
  id: string;
  name: string;
  species: "DOG" | "CAT";
  breed: string | null;
  age_months: number;
  gender: string;
  bio: string | null;
  is_active: boolean;
  photos: PetPhoto[];
}

function ageLabel(months: number): string {
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}mo` : `${years}y`;
}

export default function MyPetsPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", breed: "", age_months: "", gender: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [photoActingId, setPhotoActingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Pet[]>("/pets/me")
      .then(setPets)
      .catch(() => setError("Failed to load pets"))
      .finally(() => setFetching(false));
  }, []);

  const startEdit = (pet: Pet) => {
    setEditingId(pet.id);
    setEditForm({
      name: pet.name,
      breed: pet.breed ?? "",
      age_months: String(pet.age_months),
      gender: pet.gender,
      bio: pet.bio ?? "",
    });
  };

  const handleSaveEdit = async (petId: string) => {
    setSaving(true);
    try {
      const ageMonths = parseInt(editForm.age_months);
      const updated = await api.patch<Pet>(`/pets/${petId}`, {
        name: editForm.name || undefined,
        breed: editForm.breed || undefined,
        age_months: isNaN(ageMonths) ? undefined : ageMonths,
        gender: editForm.gender || undefined,
        bio: editForm.bio || undefined,
      });
      setPets((prev) => prev.map((p) => (p.id === petId ? { ...p, ...updated } : p)));
      setEditingId(null);
    } catch {
      setError("Failed to save pet");
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimary = async (petId: string, photoId: string) => {
    setPhotoActingId(photoId);
    try {
      await api.patch(`/pets/${petId}/photos/${photoId}/primary`, {});
      setPets((prev) =>
        prev.map((p) =>
          p.id === petId
            ? { ...p, photos: p.photos.map((ph) => ({ ...ph, is_primary: ph.id === photoId })) }
            : p
        )
      );
    } catch {
      setError("Failed to set primary photo");
    } finally {
      setPhotoActingId(null);
    }
  };

  const handleDeletePhoto = async (petId: string, photoId: string) => {
    setPhotoActingId(photoId);
    try {
      await api.delete(`/pets/${petId}/photos/${photoId}`);
      setPets((prev) =>
        prev.map((p) =>
          p.id === petId ? { ...p, photos: p.photos.filter((ph) => ph.id !== photoId) } : p
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete photo");
    } finally {
      setPhotoActingId(null);
    }
  };

  const handleDelete = async (petId: string) => {
    if (!confirm("Remove this pet? This cannot be undone.")) return;
    setDeletingId(petId);
    try {
      await api.delete(`/pets/${petId}`);
      setPets((prev) => prev.filter((p) => p.id !== petId));
    } catch {
      setError("Failed to remove pet");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const navLinks = [
    { label: "Profile", icon: User, href: "/profile" },
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

      <main className="mx-auto max-w-4xl px-6 pt-28 pb-16">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#ff6b35] mb-1 font-medium">Manage</p>
            <h1
              className="text-4xl font-semibold text-white"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              My Pets
            </h1>
          </div>
          <Link
            to="/onboarding/pets"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5c] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff6b35]/25 transition-all hover:from-[#ff5722] hover:to-[#ff6b35]"
          >
            <Plus className="h-4 w-4" />
            Add Pet
          </Link>
        </div>

        {error && <p className="mb-6 text-sm text-red-400">{error}</p>}

        {/* Skeleton */}
        {fetching && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!fetching && pets.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-20 text-center">
            <PawPrint className="mb-4 h-12 w-12 text-white/20" />
            <p className="text-lg font-medium text-white/60">No pets yet</p>
            <p className="mt-1 text-sm text-neutral-500">Add your first pet to start matching.</p>
            <Link
              to="/onboarding/pets"
              className="mt-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5c] px-6 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Add Pet
            </Link>
          </div>
        )}

        {/* Pet cards */}
        {!fetching && pets.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {pets.map((pet) => {
              const photo = pet.photos.find((p) => p.is_primary) ?? pet.photos[0];
              return (
                <div
                  key={pet.id}
                  className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden transition-all hover:border-white/20"
                >
                  {/* Photo */}
                  <div className="h-44 w-full bg-white/5">
                    {photo ? (
                      <img
                        src={photo.url}
                        alt={pet.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <PawPrint className="h-10 w-10 text-white/10" />
                      </div>
                    )}
                  </div>

                  {/* Photo strip — all photos with set-primary / delete */}
                  {pet.photos.length > 0 && (
                    <div className="flex gap-2 px-3 py-2 border-t border-white/5 overflow-x-auto">
                      {pet.photos.map((photo) => (
                        <div key={photo.id} className="relative shrink-0 group">
                          <img
                            src={photo.url}
                            alt=""
                            className={`h-14 w-14 rounded-lg object-cover border-2 ${
                              photo.is_primary ? "border-[#ff6b35]" : "border-white/10"
                            }`}
                          />
                          <div className="absolute inset-0 flex items-center justify-center gap-0.5 rounded-lg bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!photo.is_primary && (
                              <button
                                onClick={() => handleSetPrimary(pet.id, photo.id)}
                                disabled={photoActingId === photo.id}
                                title="Set as primary"
                                className="rounded p-1 text-yellow-400 hover:bg-white/10 disabled:opacity-50"
                              >
                                <Star className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {pet.photos.length > 1 && (
                              <button
                                onClick={() => handleDeletePhoto(pet.id, photo.id)}
                                disabled={photoActingId === photo.id}
                                title="Delete photo"
                                className="rounded p-1 text-red-400 hover:bg-white/10 disabled:opacity-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-4">
                    {editingId === pet.id ? (
                      <div className="space-y-2.5">
                        <input
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-[#ff6b35] focus:outline-none"
                          placeholder="Name"
                          value={editForm.name}
                          onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        />
                        <input
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-[#ff6b35] focus:outline-none"
                          placeholder="Breed"
                          value={editForm.breed}
                          onChange={(e) => setEditForm((f) => ({ ...f, breed: e.target.value }))}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-[#ff6b35] focus:outline-none"
                            placeholder="Age (months)"
                            value={editForm.age_months}
                            onChange={(e) => setEditForm((f) => ({ ...f, age_months: e.target.value }))}
                          />
                          <select
                            className="rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-[#ff6b35] focus:outline-none"
                            value={editForm.gender}
                            onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value }))}
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                        <textarea
                          rows={2}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-[#ff6b35] focus:outline-none resize-none"
                          placeholder="Bio"
                          value={editForm.bio}
                          onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                        />
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleSaveEdit(pet.id)}
                            disabled={saving}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5c] py-2 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            {saving ? "Saving…" : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex flex-1 items-center justify-center rounded-full border border-white/10 py-2 text-xs text-neutral-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h2 className="text-lg font-semibold text-white">{pet.name}</h2>
                            <p className="text-sm text-neutral-400">
                              {pet.species === "DOG" ? "Dog" : "Cat"}
                              {pet.breed ? ` · ${pet.breed}` : ""}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 shrink-0">
                            <span className="text-xs text-neutral-500 capitalize">{pet.gender}</span>
                            <span className="text-xs text-neutral-500">{ageLabel(pet.age_months)}</span>
                          </div>
                        </div>

                        {pet.bio && (
                          <p className="mt-2 text-sm text-neutral-500 line-clamp-2">{pet.bio}</p>
                        )}

                        <div className="mt-4 flex items-center justify-between">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full border ${
                              pet.is_active
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : "border-white/10 bg-white/5 text-neutral-500"
                            }`}
                          >
                            {pet.is_active ? "Active" : "No photo yet"}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEdit(pet)}
                              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-neutral-500 transition-all hover:bg-white/10 hover:text-white"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(pet.id)}
                              disabled={deletingId === pet.id}
                              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-neutral-500 transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {deletingId === pet.id ? "Removing…" : "Remove"}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

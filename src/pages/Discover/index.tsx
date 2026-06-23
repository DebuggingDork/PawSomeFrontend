import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { LogOut, User, PawPrint, MessageCircle, Menu, X, Heart, ChevronDown } from "lucide-react";
import logoIcon from "@/assets/icon.png";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

interface MyPet {
  id: string;
  name: string;
  species: "DOG" | "CAT";
  is_active: boolean;
}

interface PetOwner {
  full_name: string | null;
  occupation: string | null;
  profile_photo_url: string | null;
}

interface DiscoverPet {
  id: string;
  name: string;
  species: "DOG" | "CAT";
  breed: string | null;
  age_months: number;
  gender: string;
  bio: string | null;
  photos: Array<{ id: string; url: string; is_primary: boolean }>;
  owner: PetOwner | null;
}

interface PetListResponse {
  items: DiscoverPet[];
  total: number;
  limit: number;
  offset: number;
}

function ageLabel(months: number): string {
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}mo` : `${years}y`;
}

const LIMIT = 12;

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // User's own pets (for swiping as)
  const [myPets, setMyPets] = useState<MyPet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");

  // Discover feed
  const [pets, setPets] = useState<DiscoverPet[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Swipe state
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeError, setSwipeError] = useState<Record<string, string>>({});

  const selectedPet = myPets.find((p) => p.id === selectedPetId);
  const myPetIds = new Set(myPets.map((p) => p.id));
  const visiblePets = pets.filter((p) => !myPetIds.has(p.id) && !swipedIds.has(p.id));

  // Fetch user's own active pets on mount
  useEffect(() => {
    api.get<MyPet[]>("/pets/me")
      .then((data) => {
        const active = data.filter((p) => p.is_active);
        setMyPets(active);
        if (active.length > 0) setSelectedPetId(active[0].id);
      })
      .catch(() => {});
  }, []);

  // Fetch discover feed when selected pet changes (species filter)
  const fetchPets = useCallback(async (currentOffset: number, reset = false) => {
    if (!selectedPet) return;
    setFetching(true);
    try {
      const species = selectedPet.species.toLowerCase();
      const res = await api.get<PetListResponse>(
        `/pets?species=${species}&limit=${LIMIT}&offset=${currentOffset}`
      );
      setPets((prev) => reset ? res.items : [...prev, ...res.items]);
      setTotal(res.total);
      setOffset(currentOffset + res.items.length);
    } catch {
      // silently fail — user sees empty state
    } finally {
      setFetching(false);
      setInitialLoad(false);
    }
  }, [selectedPet]);

  useEffect(() => {
    if (!selectedPet) return;
    setInitialLoad(true);
    setPets([]);
    setOffset(0);
    setSwipedIds(new Set());
    fetchPets(0, true);
  }, [selectedPetId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSwipe = async (targetPetId: string, action: "like" | "skip") => {
    if (!selectedPetId || swipingId) return;
    setSwipingId(targetPetId);
    setSwipeError((prev) => ({ ...prev, [targetPetId]: "" }));
    try {
      await api.post("/matches/swipe", {
        pet_id: selectedPetId,
        target_pet_id: targetPetId,
        action,
      });
      setSwipedIds((prev) => new Set(prev).add(targetPetId));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to swipe";
      setSwipeError((prev) => ({ ...prev, [targetPetId]: msg }));
    } finally {
      setSwipingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const navLinks = [
    { label: "Profile", icon: User, href: "/profile" },
    { label: "My Pets", icon: PawPrint, href: "/my-pets" },
    { label: "Messages", icon: MessageCircle, href: "/messages" },
  ];

  const hasMore = pets.filter((p) => !myPetIds.has(p.id)).length < total - myPets.length;

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
              <Link key={label} to={href}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-4 w-4" />{label}
              </Link>
            ))}
            <button onClick={handleLogout}
              className="ml-2 flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />Logout
            </button>
          </nav>

          <button className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 bg-neutral-950/95 px-6 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map(({ label, icon: Icon, href }) => (
                <Link key={label} to={href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" />{label}
                </Link>
              ))}
              <button onClick={handleLogout}
                className="mt-1 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-all hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-28 pb-16">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#ff6b35] mb-1 font-medium">Browse</p>
            <h1 className="text-4xl font-semibold text-white" style={{ fontFamily: "Playfair Display, serif" }}>
              Discover
            </h1>
          </div>

          {/* Swiping-as selector */}
          {myPets.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400 shrink-0">Swiping as</span>
              <div className="relative">
                <select
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="appearance-none rounded-full border border-white/10 bg-white/5 pl-4 pr-9 py-2 text-sm text-white focus:outline-none focus:border-[#ff6b35] cursor-pointer"
                >
                  {myPets.map((p) => (
                    <option key={p.id} value={p.id} className="bg-neutral-900">
                      {p.name} ({p.species === "DOG" ? "Dog" : "Cat"})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              </div>
            </div>
          )}
        </div>

        {/* No active pets */}
        {myPets.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-20 text-center">
            <PawPrint className="mb-4 h-12 w-12 text-white/20" />
            <p className="text-lg font-medium text-white/60">Add a pet first</p>
            <p className="mt-1 text-sm text-neutral-500">You need an active pet to discover matches.</p>
            <Link to="/onboarding/pets"
              className="mt-6 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5c] px-6 py-2.5 text-sm font-semibold text-white"
            >
              Add Pet
            </Link>
          </div>
        )}

        {/* Skeleton */}
        {myPets.length > 0 && initialLoad && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                <div className="h-52 animate-pulse bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-white/10 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-white/10 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pet cards */}
        {myPets.length > 0 && !initialLoad && (
          <>
            {visiblePets.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-20 text-center">
                <Heart className="mb-4 h-12 w-12 text-white/20" />
                <p className="text-lg font-medium text-white/60">You've seen everyone!</p>
                <p className="mt-1 text-sm text-neutral-500">Check back later for new pets.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visiblePets.map((pet) => {
                  const photo = pet.photos.find((p) => p.is_primary) ?? pet.photos[0];
                  const err = swipeError[pet.id];
                  return (
                    <div key={pet.id} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden flex flex-col">

                      {/* Photo */}
                      <div className="relative h-52 bg-white/5 shrink-0">
                        {photo ? (
                          <img src={photo.url} alt={pet.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <PawPrint className="h-10 w-10 text-white/10" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-col flex-1 p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h2 className="text-base font-semibold text-white">{pet.name}</h2>
                          <span className="text-xs text-neutral-500 shrink-0">{ageLabel(pet.age_months)}</span>
                        </div>
                        <p className="text-sm text-neutral-400 mb-1">
                          {pet.species === "DOG" ? "Dog" : "Cat"}
                          {pet.breed ? ` · ${pet.breed}` : ""}
                          {" · "}<span className="capitalize">{pet.gender}</span>
                        </p>
                        {pet.owner?.full_name && (
                          <p className="text-xs text-neutral-500 mb-2">
                            Owner: {pet.owner.full_name}
                            {pet.owner.occupation ? ` · ${pet.owner.occupation}` : ""}
                          </p>
                        )}
                        {pet.bio && (
                          <p className="text-xs text-neutral-500 line-clamp-2 mb-3">{pet.bio}</p>
                        )}

                        {err && <p className="text-xs text-red-400 mb-2">{err}</p>}

                        {/* Action buttons */}
                        <div className="mt-auto flex gap-2">
                          <button
                            onClick={() => handleSwipe(pet.id, "skip")}
                            disabled={!!swipingId}
                            className="flex-1 h-9 rounded-full border border-white/10 bg-white/5 text-sm text-neutral-400 transition-all hover:border-white/20 hover:text-white disabled:opacity-50"
                          >
                            Pass
                          </button>
                          <button
                            onClick={() => handleSwipe(pet.id, "like")}
                            disabled={!!swipingId}
                            className="flex-1 h-9 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5c] text-sm font-semibold text-white transition-all hover:from-[#ff5722] hover:to-[#ff6b35] disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            <Heart className="h-3.5 w-3.5" />
                            Like
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Load more */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => fetchPets(offset)}
                  disabled={fetching}
                  className="rounded-full border border-white/10 px-8 py-2.5 text-sm text-neutral-400 transition-all hover:border-white/20 hover:text-white disabled:opacity-50"
                >
                  {fetching ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}

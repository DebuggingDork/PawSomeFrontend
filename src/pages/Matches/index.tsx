import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { LogOut, User, PawPrint, MessageCircle, Menu, X, Heart, Check, MessageSquare } from "lucide-react";
import logoIcon from "@/assets/icon.png";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

interface PetMini {
  id: string;
  name: string;
  primary_photo_url: string | null;
}

interface Notification {
  id: string;
  notification_type: string;
  message: string;
  is_read: boolean;
  your_pet: PetMini;
  other_pet: PetMini;
  match_id: string | null;
  created_at: string;
}

interface Match {
  id: string;
  pet1_id: string;
  pet2_id: string;
  created_at: string;
}

interface PetDetail {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age_months: number;
  gender: string;
  photos: Array<{ id: string; url: string; is_primary: boolean }>;
  owner: { full_name: string | null; occupation: string | null } | null;
}

function ageLabel(months: number): string {
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}mo` : `${years}y`;
}

export default function MatchesPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [pendingLikes, setPendingLikes] = useState<Notification[]>([]);
  const [matches, setMatches] = useState<Array<Match & { otherPet?: PetDetail }>>([]);
  const [myPetIds, setMyPetIds] = useState<Set<string>>(new Set());
  const [fetching, setFetching] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch user's pet IDs, notifications, and matches in parallel
        const [myPets, notifs, matchList] = await Promise.all([
          api.get<Array<{ id: string }>>("/pets/me"),
          api.get<Notification[]>("/matches/notifications"),
          api.get<Match[]>("/matches/my-matches"),
        ]);

        const petIds = new Set(myPets.map((p) => p.id));
        setMyPetIds(petIds);

        // Pending incoming likes (unread NEW_LIKE notifications)
        const likes = notifs.filter(
          (n) => n.notification_type === "new_like" && !n.is_read
        );
        setPendingLikes(likes);

        // For each match, fetch the other pet's details
        const enriched = await Promise.all(
          matchList.map(async (m) => {
            const otherId = petIds.has(m.pet1_id) ? m.pet2_id : m.pet1_id;
            try {
              const pet = await api.get<PetDetail>(`/pets/${otherId}`);
              return { ...m, otherPet: pet };
            } catch {
              return { ...m };
            }
          })
        );
        setMatches(enriched);
      } catch {
        // show empty state on failure
      } finally {
        setFetching(false);
      }
    }
    load();
  }, []);

  const handleAccept = async (notifId: string) => {
    setActingId(notifId);
    try {
      const res = await api.post<{ match_id: string }>(`/matches/likes/${notifId}/accept`, {});
      // Remove from pending
      setPendingLikes((prev) => prev.filter((n) => n.id !== notifId));
      // Navigate to chat for the new match
      if (res.match_id) navigate(`/chat/${res.match_id}`);
    } catch {
      // stay on page, user can retry
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (notifId: string) => {
    setActingId(notifId);
    try {
      await api.post(`/matches/likes/${notifId}/reject`, {});
      setPendingLikes((prev) => prev.filter((n) => n.id !== notifId));
    } catch {
      // stay on page
    } finally {
      setActingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const navLinks = [
    { label: "Profile", icon: User, href: "/profile" },
    { label: "My Pets", icon: PawPrint, href: "/my-pets" },
  ];

  const isEmpty = !fetching && pendingLikes.length === 0 && matches.length === 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <img src={logoIcon} alt="PawSome" className="h-9 w-9 drop-shadow-lg" />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#ff6b35] via-[#ff8c5c] to-[#ff6b35] bg-clip-text text-transparent"
              style={{ fontFamily: "Pacifico, cursive" }}>
              PawSome
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map(({ label, icon: Icon, href }) => (
              <Link key={label} to={href}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white">
                <Icon className="h-4 w-4" />{label}
              </Link>
            ))}
            <button onClick={handleLogout}
              className="ml-2 flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400">
              <LogOut className="h-4 w-4" />Logout
            </button>
          </nav>

          <button className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 bg-neutral-950/95 px-6 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map(({ label, icon: Icon, href }) => (
                <Link key={label} to={href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white">
                  <Icon className="h-4 w-4" />{label}
                </Link>
              ))}
              <button onClick={handleLogout}
                className="mt-1 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-all hover:bg-red-500/10 hover:text-red-400">
                <LogOut className="h-4 w-4" />Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-4xl px-6 pt-28 pb-16">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-[#ff6b35] mb-1 font-medium">Connections</p>
          <h1 className="text-4xl font-semibold text-white" style={{ fontFamily: "Playfair Display, serif" }}>
            Matches
          </h1>
        </div>

        {/* Skeleton */}
        {fetching && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-20 text-center">
            <Heart className="mb-4 h-12 w-12 text-white/20" />
            <p className="text-lg font-medium text-white/60">No matches yet</p>
            <p className="mt-1 text-sm text-neutral-500">Start discovering pets and send some likes!</p>
            <Link to="/discover"
              className="mt-6 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5c] px-6 py-2.5 text-sm font-semibold text-white">
              Discover Pets
            </Link>
          </div>
        )}

        {!fetching && (
          <div className="space-y-8">

            {/* Pending likes section */}
            {pendingLikes.length > 0 && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-neutral-400">
                  <Heart className="h-4 w-4 text-[#ff6b35]" />
                  Likes received
                  <span className="ml-1 rounded-full bg-[#ff6b35]/20 px-2 py-0.5 text-xs text-[#ff6b35]">
                    {pendingLikes.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {pendingLikes.map((notif) => (
                    <div key={notif.id}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      {/* Other pet photo */}
                      <div className="h-14 w-14 rounded-xl bg-white/10 overflow-hidden shrink-0">
                        {notif.other_pet.primary_photo_url ? (
                          <img src={notif.other_pet.primary_photo_url} alt={notif.other_pet.name}
                            className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <PawPrint className="h-6 w-6 text-white/20" />
                          </div>
                        )}
                      </div>

                      {/* Message */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{notif.message}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          For your pet: <span className="text-neutral-300">{notif.your_pet.name}</span>
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleReject(notif.id)}
                          disabled={actingId === notif.id}
                          className="h-9 w-9 flex items-center justify-center rounded-full border border-white/10 text-neutral-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAccept(notif.id)}
                          disabled={actingId === notif.id}
                          className="h-9 w-9 flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5c] text-white transition-all hover:from-[#ff5722] hover:to-[#ff6b35] disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Confirmed matches section */}
            {matches.length > 0 && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-neutral-400">
                  <MessageCircle className="h-4 w-4 text-purple-400" />
                  Your matches
                  <span className="ml-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400">
                    {matches.length}
                  </span>
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {matches.map((match) => {
                    const pet = match.otherPet;
                    const photo = pet?.photos.find((p) => p.is_primary) ?? pet?.photos[0];
                    return (
                      <div key={match.id}
                        className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20">
                        {/* Pet photo */}
                        <div className="h-14 w-14 rounded-xl bg-white/10 overflow-hidden shrink-0">
                          {photo ? (
                            <img src={photo.url} alt={pet?.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <PawPrint className="h-6 w-6 text-white/20" />
                            </div>
                          )}
                        </div>

                        {/* Pet info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {pet?.name ?? "Unknown pet"}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {pet ? (
                              <>
                                {pet.species === "DOG" ? "Dog" : "Cat"}
                                {pet.breed ? ` · ${pet.breed}` : ""}
                                {" · "}{ageLabel(pet.age_months)}
                              </>
                            ) : "Details unavailable"}
                          </p>
                          {pet?.owner?.full_name && (
                            <p className="text-xs text-neutral-600 mt-0.5">
                              {pet.owner.full_name}
                            </p>
                          )}
                        </div>

                        {/* Chat button */}
                        <Link
                          to={`/chat/${match.id}`}
                          className="shrink-0 flex items-center gap-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-1.5 text-xs font-medium text-purple-300 transition-all hover:bg-purple-500/30"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Chat
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </div>
        )}
      </main>
    </div>
  );
}

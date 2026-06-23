import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { ArrowLeft, User, Briefcase, MapPin, FileText } from "lucide-react";
import logoIcon from "@/assets/icon.png";
import { api } from "@/lib/api";

interface PublicProfile {
  id: string;
  full_name: string | null;
  occupation: string | null;
  bio: string | null;
  profile_photo_url: string | null;
  address?: string | null;
}

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userId) return;
    api.get<PublicProfile>(`/users/${userId}`)
      .then(setProfile)
      .catch(() => setNotFound(true))
      .finally(() => setFetching(false));
  }, [userId]);

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
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 pt-28 pb-16">

        {fetching && (
          <div className="space-y-4">
            <div className="mx-auto h-24 w-24 rounded-full bg-white/5 animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {notFound && (
          <div className="text-center py-20">
            <p className="text-neutral-400">User not found.</p>
            <Link to="/matches" className="mt-4 inline-block text-sm text-[#ff6b35] hover:underline">
              Back to Matches
            </Link>
          </div>
        )}

        {!fetching && profile && (
          <>
            {/* Avatar */}
            <div className="flex flex-col items-center mb-8">
              <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center mb-4">
                {profile.profile_photo_url ? (
                  <img src={profile.profile_photo_url} alt={profile.full_name ?? "User"} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-neutral-500" />
                )}
              </div>
              <h1 className="text-2xl font-semibold text-white" style={{ fontFamily: "Playfair Display, serif" }}>
                {profile.full_name ?? "Anonymous"}
              </h1>
              {profile.occupation && (
                <p className="mt-1 text-sm text-neutral-400">{profile.occupation}</p>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              {profile.bio && (
                <div className="flex gap-3">
                  <FileText className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-neutral-300">{profile.bio}</p>
                </div>
              )}
              {profile.occupation && (
                <div className="flex gap-3">
                  <Briefcase className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-neutral-300">{profile.occupation}</p>
                </div>
              )}
              {profile.address && (
                <div className="flex gap-3">
                  <MapPin className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-neutral-300">{profile.address}</p>
                </div>
              )}
              {!profile.bio && !profile.occupation && !profile.address && (
                <p className="text-sm text-neutral-500 text-center py-4">No details shared yet.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

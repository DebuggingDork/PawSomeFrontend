import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award,
  Heart,
  ShieldCheck,
  ChevronRight,
  Plus,
  X,
  FileText,
  Mail,
  Search,
} from 'lucide-react'

// Import assets
import pawsomeHero from '../../assets/pawsome_hero.png'
import studGolden from '../../assets/stud_golden.png'
import queenPersian from '../../assets/queen_persian.png'

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
)

interface Breed {
  name: string
  traits: string[]
  description: string
}

interface PetCard {
  name: string
  breed: string
  label: string
  stats: { value: string; label: string; desc: string }[]
  intro: string
  color: string
  image: string
}

function LandingPage() {
  const [activeTab, setActiveTab] = useState<'dog' | 'cat'>('dog')
  const [activeOverlay, setActiveOverlay] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const dogBreeds: Breed[] = [
    {
      name: 'Golden Retriever',
      traits: ['Loyal', 'Friendly', 'OFA Hips Excellent'],
      description: 'Champion retriever bloodlines with excellent temperament.',
    },
    {
      name: 'French Bulldog',
      traits: ['Playful', 'Compact', 'DNA Health Clear'],
      description:
        'Healthy, DNA-profiled Frenchies suited for standard-conforming breeding.',
    },
    {
      name: 'German Shepherd',
      traits: ['Confident', 'Guardian', 'High Work Drive'],
      description:
        'Working and show lineages with certified hip and elbow scores.',
    },
  ]

  const catBreeds: Breed[] = [
    {
      name: 'Persian Cat',
      traits: ['Sweet', 'Quiet', 'PKD Negative'],
      description: 'Luxurious coat and calm temperament, champion lines.',
    },
    {
      name: 'Siamese Cat',
      traits: ['Vocal', 'Affectionate', 'PRA Clear'],
      description:
        'Stunning blue eyes and athletic structure from pure lineages.',
    },
    {
      name: 'Bengal Cat',
      traits: ['Energetic', 'Exotic Patterns', 'HCM Normal'],
      description:
        'Glittered marble and spotted coats from low-generation studs.',
    },
  ]

  const featuredPets: PetCard[] = [
    {
      name: 'Maximus VII',
      breed: 'Golden Retriever Stud',
      label: 'Champion Pedigree',
      color: '#7f132a',
      image: studGolden,
      intro:
        'Maximus is a multi-award winning Golden Retriever stud. Champion lineage with full clear DNA panels and excellent hip scores.',
      stats: [
        { value: '5 Gen', label: 'Pedigree', desc: 'Certificates available' },
        { value: 'Clear', label: 'DNA Panel', desc: 'No hereditary diseases' },
        { value: 'OFA Hips', label: 'Hip Grade', desc: 'Scored Excellent' },
      ],
    },
    {
      name: 'Seraphina',
      breed: 'White Persian Queen',
      label: 'Elite Breeding Line',
      color: '#00a0af',
      image: queenPersian,
      intro:
        'Seraphina is a pure white Persian queen known for her gorgeous blue eyes, dense coat, and sweet temperament.',
      stats: [
        { value: 'Champion', label: 'Bloodline', desc: 'Imported lineage' },
        {
          value: 'Negative',
          label: 'PKD Status',
          desc: 'Fully tested negative',
        },
        { value: 'Dense', label: 'Coat Quality', desc: 'Standard conforming' },
      ],
    },
  ]

  const articles = [
    {
      title: 'Pedigree Genetics & Breeding Health',
      category: 'Nutrition & Health',
      tag: 'Article',
      desc: 'Understanding genetic compatibility and DNA health screenings before pairing.',
    },
    {
      title: 'Successful Pet Prenatal Care',
      category: 'Breeder Resources',
      tag: 'Guide',
      desc: 'A comprehensive guide to managing your pet queen or dam during gestation.',
    },
    {
      title: 'Introduction to Ethical Matches',
      category: 'Matchmaking Tips',
      tag: 'Article',
      desc: 'How to verify breed certificates and build trusted relationships with owners.',
    },
  ]

  return (
    <div className="w-full text-neutral-200">
      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full text-center relative">
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute -top-16 right-0 p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={32} />
              </button>
              <h2 className="text-3xl font-bold mb-6 text-white">
                How can we help you?
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search breeds, studs, health registries..."
                  className="w-full bg-neutral-900 border-b-2 border-neutral-700 text-white px-4 py-4 pr-12 text-lg focus:outline-none focus:border-pink-500 transition-colors"
                />
                <Search
                  className="absolute right-4 top-5 text-neutral-400"
                  size={24}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner Section */}
      <section className="relative min-h-[90vh] flex items-center bg-neutral-950 overflow-hidden">
        {/* Parallax Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={pawsomeHero}
            alt="Pawsome background"
            className="w-full h-full object-cover opacity-35 object-center transform scale-105 transition-transform duration-[5s]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
          <div className="max-w-2xl">
            {/* Outline Frame Detail (inspired by Reference Site) */}
            <div className="inline-block border border-pink-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-pink-400 mb-6 bg-pink-500/5">
              Premium Matchmaking
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
              Every Pet Match <br />
              <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                Matters®
              </span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-300 mb-10 leading-relaxed max-w-xl">
              Ethical breeding matching. Discover certified pedigrees, verified
              DNA health lines, and connect with trusted breeders globally.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#pet-toggle"
                onClick={() => setActiveTab('dog')}
                className="px-8 py-4 bg-transparent border border-white hover:bg-white hover:text-black text-white font-medium rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                For Dogs
              </a>
              <a
                href="#pet-toggle"
                onClick={() => setActiveTab('cat')}
                className="px-8 py-4 bg-transparent border border-white hover:bg-white hover:text-black text-white font-medium rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                For Cats
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pet Toggle / Tagger Section */}
      <section
        className="bg-neutral-900 py-24 border-y border-neutral-800"
        id="pet-toggle"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Every breed is unique. <br />
              Find the right match for yours.
            </h2>
            <p className="text-neutral-400">
              Select your pet classification to filter verified studs, queens,
              and pedigree lineages.
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex justify-center space-x-4 mb-16">
            <button
              onClick={() => setActiveTab('dog')}
              className={`px-8 py-3 rounded-full font-medium transition-all duration-200 border cursor-pointer ${
                activeTab === 'dog'
                  ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/20'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'
              }`}
            >
              I own a dog
            </button>
            <button
              onClick={() => setActiveTab('cat')}
              className={`px-8 py-3 rounded-full font-medium transition-all duration-200 border cursor-pointer ${
                activeTab === 'cat'
                  ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/20'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'
              }`}
            >
              I own a cat
            </button>
          </div>

          {/* Breed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {(activeTab === 'dog' ? dogBreeds : catBreeds).map(
              (breed, index) => (
                <motion.div
                  key={breed.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-neutral-800 border border-neutral-700/50 rounded-2xl p-6 hover:border-pink-500/40 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white">
                      {breed.name}
                    </h3>
                    <Award className="text-pink-500" size={20} />
                  </div>
                  <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                    {breed.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {breed.traits.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 bg-neutral-900 border border-neutral-700 rounded-md text-xs font-semibold text-neutral-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <a
                    href={`/discover?breed=${encodeURIComponent(breed.name)}`}
                    className="flex items-center text-sm font-semibold text-pink-400 hover:text-pink-300 transition-colors"
                  >
                    View Matches <ChevronRight size={16} className="ml-1" />
                  </a>
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Proof Points Section */}
      <section className="bg-neutral-950 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Point 1 */}
            <div className="text-center md:text-left flex flex-col items-center md:items-start">
              <div className="w-14 h-14 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-500 mb-6">
                <Award size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Verified Pedigree Records
              </h3>
              <p className="text-neutral-400 leading-relaxed text-sm">
                Every listed pet features verified 3-to-5 generation pedigree
                lines. We inspect certified registry registrations to guarantee
                authenticity.
              </p>
            </div>

            {/* Point 2 */}
            <div className="text-center md:text-left flex flex-col items-center md:items-start">
              <div className="w-14 h-14 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-500 mb-6">
                <Heart size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Genetic Compatibility
              </h3>
              <p className="text-neutral-400 leading-relaxed text-sm">
                Matches are evaluated using standard breed registries and DNA
                health tests to protect the safety, longevity, and health of
                litters.
              </p>
            </div>

            {/* Point 3 */}
            <div className="text-center md:text-left flex flex-col items-center md:items-start">
              <div className="w-14 h-14 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-500 mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Strict Code of Ethics
              </h3>
              <p className="text-neutral-400 leading-relaxed text-sm">
                We advocate for ethical pet breeding. Our members abide by our
                Breeder Oath, focusing on animal welfare above commercial goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products / Showcase Section */}
      <section className="bg-neutral-900 py-24 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Featured Studs & Queens
            </h2>
            <p className="text-neutral-400 mt-2">
              Browse active, premium profiles with certified registry health
              clearances.
            </p>
          </div>

          <div className="space-y-12">
            {featuredPets.map((pet, idx) => (
              <div
                key={pet.name}
                className="relative overflow-hidden bg-neutral-800 border border-neutral-700 rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-12"
              >
                {/* Pet Image */}
                <div className="w-full lg:w-1/2 flex justify-center">
                  <div className="relative group rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-900 w-80 h-80 flex items-center justify-center">
                    <img
                      src={pet.image}
                      alt={pet.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>

                {/* Details Content */}
                <div className="w-full lg:w-1/2 flex flex-col">
                  <div className="mb-6">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">
                      {pet.label}
                    </span>
                    <h3 className="text-3xl font-extrabold text-white mt-3 mb-1">
                      {pet.name}
                    </h3>
                    <p className="text-sm font-semibold text-neutral-400 tracking-wider uppercase">
                      {pet.breed}
                    </p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {pet.stats.map((s) => (
                      <div
                        key={s.label}
                        className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-750"
                      >
                        <p className="text-lg font-bold text-pink-400">
                          {s.value}
                        </p>
                        <p className="text-xs font-semibold text-white mt-1">
                          {s.label}
                        </p>
                        <p className="text-[10px] text-neutral-400 leading-tight mt-0.5">
                          {s.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 items-center">
                    <a
                      href={`/profile?id=${idx}`}
                      className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl shadow-lg transition-colors cursor-pointer"
                    >
                      View Profile
                    </a>
                    <button
                      onClick={() =>
                        setActiveOverlay(activeOverlay === idx ? null : idx)
                      }
                      className="w-12 h-12 flex items-center justify-center border border-neutral-700 rounded-xl hover:border-neutral-600 text-neutral-300 hover:text-white transition-all cursor-pointer"
                    >
                      {activeOverlay === idx ? (
                        <X size={20} />
                      ) : (
                        <Plus size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Info Overlay (inspired by reference overlay slide) */}
                <AnimatePresence>
                  {activeOverlay === idx && (
                    <motion.div
                      initial={{ opacity: 0, x: '100%' }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: '100%' }}
                      transition={{
                        type: 'spring',
                        damping: 25,
                        stiffness: 200,
                      }}
                      className="absolute inset-0 bg-neutral-900 p-8 lg:p-12 flex items-center justify-between z-20 border-l border-neutral-800"
                    >
                      <div className="max-w-xl">
                        <h4 className="text-xl font-bold text-pink-400 mb-2">
                          Breeder Notes
                        </h4>
                        <p className="text-lg text-white leading-relaxed mb-6">
                          {pet.intro}
                        </p>
                        <button
                          onClick={() => setActiveOverlay(null)}
                          className="px-6 py-3 border border-neutral-700 hover:border-neutral-600 rounded-xl text-sm font-semibold text-neutral-300 transition-colors cursor-pointer"
                        >
                          Close Summary
                        </button>
                      </div>
                      <button
                        onClick={() => setActiveOverlay(null)}
                        className="absolute top-8 right-8 p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <X size={24} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-neutral-400 max-w-xl mx-auto mb-6">
              Our matching experts review registry DNA certificates, breed
              conformity, and lineage history to simplify ethical matchmaking.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/discover?type=dog"
                className="px-6 py-3 border border-neutral-700 hover:border-neutral-600 rounded-xl text-sm font-semibold text-neutral-300 transition-all cursor-pointer"
              >
                All Dogs
              </a>
              <a
                href="/discover?type=cat"
                className="px-6 py-3 border border-neutral-700 hover:border-neutral-600 rounded-xl text-sm font-semibold text-neutral-300 transition-all cursor-pointer"
              >
                All Cats
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles Section (Pet Parenting) */}
      <section className="bg-neutral-950 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Pet Parenting & Ethics
            </h2>
            <p className="text-neutral-400 mt-2">
              Learn how to breeding-match safely and keep your pets healthy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div
                key={article.title}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-750 hover:shadow-xl transition-all"
              >
                <div className="flex items-center text-xs font-semibold text-pink-400 gap-2 mb-4">
                  <FileText size={16} />
                  <span>{article.category}</span>
                  <span className="w-1 h-1 bg-neutral-700 rounded-full"></span>
                  <span className="text-neutral-400">{article.tag}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3 hover:text-pink-400 transition-colors">
                  <a href="#">{article.title}</a>
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {article.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Subscription Segment */}
      <footer className="bg-neutral-950 border-t border-neutral-900">
        <section className="bg-neutral-900/40 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto">
              <div className="max-w-md text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-2">
                  Join our Breeder Circle
                </h3>
                <p className="text-neutral-400 text-sm">
                  Subscribe to receive pet parenting guides, matching
                  opportunities, and updates directly.
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (email) {
                    alert(`Thank you for subscribing with: ${email}`)
                    setEmail('')
                  }
                }}
                className="flex w-full md:w-auto max-w-md items-center gap-3"
              >
                <div className="relative flex-grow md:w-64">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-750 px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-pink-500/10 transition-all shrink-0"
                >
                  Subscribe <Mail size={16} />
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Core Footer Linkage */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div>
              <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4">
                Products
              </h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <a
                    href="/discover?type=dog"
                    className="hover:text-white transition-colors"
                  >
                    Verified Studs
                  </a>
                </li>
                <li>
                  <a
                    href="/discover?type=cat"
                    className="hover:text-white transition-colors"
                  >
                    Verified Queens
                  </a>
                </li>
                <li>
                  <a
                    href="/safety"
                    className="hover:text-white transition-colors"
                  >
                    DNA Health Panels
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4">
                About Us
              </h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <a
                    href="/story"
                    className="hover:text-white transition-colors"
                  >
                    Our Story
                  </a>
                </li>
                <li>
                  <a
                    href="/ethics"
                    className="hover:text-white transition-colors"
                  >
                    Breeding Oath
                  </a>
                </li>
                <li>
                  <a
                    href="/help"
                    className="hover:text-white transition-colors"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4">
                Resources
              </h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <a
                    href="/articles"
                    className="hover:text-white transition-colors"
                  >
                    Parenting Articles
                  </a>
                </li>
                <li>
                  <a
                    href="/registries"
                    className="hover:text-white transition-colors"
                  >
                    Official Registries
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4">
                Connect
              </h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <a
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Breeder Support
                  </a>
                </li>
                <li className="flex gap-4 pt-2">
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <InstagramIcon />
                  </a>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <FacebookIcon />
                  </a>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                    aria-label="Twitter"
                  >
                    <TwitterIcon />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
            <p>© {new Date().getFullYear()} PawSome NZ. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-neutral-400">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-neutral-400">
                Terms of Use
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

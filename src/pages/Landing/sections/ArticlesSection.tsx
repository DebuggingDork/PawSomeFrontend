import React from 'react'
import { ScrollReveal } from '../../../components/animations/ScrollReveal'
import { HoverZoomImage } from '../../../components/animations/HoverZoomImage'
import { ArrowRight } from 'lucide-react'

const ARTICLES = [
  {
    title: "Reading Your Pet's Body Language",
    desc: 'How to tell a playdate is going well — and when to step in.',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80',
    direction: 'up' as const,
  },
  {
    title: 'Planning the Perfect First Playdate',
    desc: 'A simple guide to safe, low-stress first meetings between pets.',
    image: 'https://images.unsplash.com/photo-1537151608804-ea6f117398e0?auto=format&fit=crop&q=80',
    direction: 'up' as const,
  },
  {
    title: "Understanding Your Pet's Temperament",
    desc: "What their personality means for the kind of friends they'll click with.",
    image: 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80',
    direction: 'up' as const,
  },
]

export const ArticlesSection: React.FC = () => {
  return (
    <section className="py-28 bg-neutral-950 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16">
          <ScrollReveal direction="left">
            <h2 className="text-4xl font-bold text-white mb-4">Pet Parent Resources</h2>
            <p className="text-neutral-400 max-w-xl">Tips on socializing your pet, staying safe while meeting new friends, and making the most of every playdate.</p>
          </ScrollReveal>
          <ScrollReveal delay={0.3} direction="right" className="hidden md:block">
            <button className="flex items-center gap-2 text-pink-500 font-semibold hover:text-pink-400 transition-colors cursor-pointer group">
              View All Articles <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ARTICLES.map((article, index) => (
            <ScrollReveal key={index} delay={index * 0.12} direction={article.direction} scale>
              <div className="group cursor-pointer">
                <HoverZoomImage src={article.image} alt={article.title} className="mb-6" aspectRatio="aspect-[16/10]" />
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-pink-400 transition-colors">{article.title}</h3>
                <p className="text-neutral-400 leading-relaxed">{article.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

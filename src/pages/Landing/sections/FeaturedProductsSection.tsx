import React from 'react'
import { ScrollPinnedSlider } from '../../../components/animations/ScrollPinnedSlider'
import { ArrowRight } from 'lucide-react'

export const FeaturedProductsSection: React.FC = () => {
  return (
    <section className="bg-neutral-950 border-t border-neutral-900">
      <ScrollPinnedSlider>
        {/* Panel 1 */}
        <div className="w-[85vw] md:w-[60vw] max-w-4xl shrink-0 h-[60vh] min-h-[400px] bg-neutral-900 rounded-3xl p-8 md:p-12 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute inset-0 z-0">
             <img src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80" alt="Featured Dog" className="w-full h-full object-cover opacity-20 transition-opacity duration-700 group-hover:opacity-40" />
             <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-transparent" />
          </div>
          <div className="relative z-10 max-w-xl">
            <span className="text-pink-500 font-bold tracking-widest uppercase text-sm mb-4 block">Featured Pet</span>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Meet Apollo, the friendly Doberman.</h3>
            <p className="text-neutral-300 text-lg mb-8">Loves long walks, dog parks, and making new friends nearby.</p>
            <button className="flex items-center gap-2 text-white font-semibold hover:text-pink-400 transition-colors cursor-pointer">
              View Profile <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Panel 2 */}
        <div className="w-[85vw] md:w-[60vw] max-w-4xl shrink-0 h-[60vh] min-h-[400px] bg-neutral-900 rounded-3xl p-8 md:p-12 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute inset-0 z-0">
             <img src="https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&q=80" alt="Featured Cat" className="w-full h-full object-cover opacity-20 transition-opacity duration-700 group-hover:opacity-40" />
             <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-transparent" />
          </div>
          <div className="relative z-10 max-w-xl">
            <span className="text-violet-500 font-bold tracking-widest uppercase text-sm mb-4 block">Featured Pet</span>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Luna, the elegant Maine Coon.</h3>
            <p className="text-neutral-300 text-lg mb-8">Curious, gentle, and always up for meeting a new furry friend.</p>
            <button className="flex items-center gap-2 text-white font-semibold hover:text-violet-400 transition-colors cursor-pointer">
              View Profile <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Panel 3: CTA */}
        <div className="w-[85vw] md:w-[40vw] max-w-xl shrink-0 h-[60vh] min-h-[400px] bg-gradient-to-br from-pink-500 to-violet-600 rounded-3xl p-8 md:p-12 flex flex-col justify-center items-center text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to find your match?</h3>
          <p className="text-white/80 text-lg mb-8">Join thousands of pet parents finding great companions nearby.</p>
          <button className="px-8 py-4 bg-white text-neutral-950 hover:bg-neutral-100 rounded-full font-bold transition-all transform hover:scale-105 shadow-xl cursor-pointer">
            Create Free Profile
          </button>
        </div>
      </ScrollPinnedSlider>
    </section>
  )
}

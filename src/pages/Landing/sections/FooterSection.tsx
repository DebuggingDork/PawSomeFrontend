import React from 'react'
import { Globe, Share2, Mail } from 'lucide-react'

export const FooterSection: React.FC = () => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4">
              Matches
            </h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Verified Studs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Verified Queens</a></li>
              <li><a href="#" className="hover:text-white transition-colors">DNA Health Panels</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4">
              About Us
            </h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Breeding Oath</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4">
              Resources
            </h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Parenting Articles</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Official Registries</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4">
              Connect
            </h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Breeder Support</a></li>
              <li className="flex gap-4 pt-2">
                <a href="#" aria-label="Website" className="hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
                <a href="#" aria-label="Share" className="hover:text-white transition-colors"><Share2 className="w-5 h-5" /></a>
                <a href="#" aria-label="Email" className="hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} PawSome. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-neutral-400">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-400">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

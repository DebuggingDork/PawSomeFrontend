import React from "react";
import { Mail, Heart, Share2, Globe, Rss, ExternalLink } from "lucide-react";
import {
  FooterBackgroundGradient,
  TextHoverEffect,
} from "@/components/ui/hover-footer";

function PawsomeFooter() {
  // Footer link data
  const footerLinks = [
    {
      title: "Matches",
      links: [
        { label: "Verified Studs", href: "#" },
        { label: "Verified Queens", href: "#" },
        { label: "DNA Health Panels", href: "#" },
      ],
    },
    {
      title: "About Us",
      links: [
        { label: "Our Story", href: "#" },
        { label: "Breeding Oath", href: "#" },
        { label: "FAQ", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Parenting Articles", href: "#" },
        { label: "Official Registries", href: "#" },
        {
          label: "Live Chat",
          href: "#",
          pulse: true,
        },
      ],
    },
  ];

  // Contact info data
  const contactInfo = [
    {
      icon: <Mail size={18} className="text-[#ff6b35]" />,
      text: "Breeder Support",
      href: "mailto:hello@pawsome.com",
    },
  ];

  // Social media icons
  const socialLinks = [
    { icon: <Globe size={20} />, label: "Website", href: "#" },
    { icon: <Share2 size={20} />, label: "Share", href: "#" },
    { icon: <Rss size={20} />, label: "Feed", href: "#" },
    { icon: <ExternalLink size={20} />, label: "Link", href: "#" },
  ];

  return (
    <footer className="bg-neutral-950 relative h-fit overflow-visible border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-40 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
          {/* Brand section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="text-[#ff6b35] fill-[#ff6b35]" size={32} />
              <span
                className="text-3xl font-bold bg-gradient-to-r from-[#ff6b35] via-[#ff8c5c] to-[#ff6b35] bg-clip-text text-transparent"
                style={{ fontFamily: "Pacifico, cursive" }}
              >
                PawSome
              </span>
            </div>
            <p className="text-sm leading-relaxed text-neutral-400">
              Find the perfect breeding match for your beloved pet. Connect with
              verified breeders and pet owners in your area.
            </p>
          </div>

          {/* Footer link sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label} className="relative">
                    <a
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-[#ff6b35] transition-colors"
                    >
                      {link.label}
                    </a>
                    {link.pulse && (
                      <span className="absolute top-0 right-[-10px] w-2 h-2 rounded-full bg-[#ff6b35] animate-pulse"></span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact section */}
          <div>
            <h4 className="text-xs font-bold uppercase text-white tracking-widest mb-4">
              Connect
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((item, i) => (
                <li key={i} className="flex items-center space-x-3">
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm text-neutral-400 hover:text-[#ff6b35] transition-colors"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-sm text-neutral-400 hover:text-[#ff6b35] transition-colors">
                      {item.text}
                    </span>
                  )}
                </li>
              ))}
              <li className="flex gap-4 pt-2">
                {socialLinks.map(({ icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="text-neutral-400 hover:text-[#ff6b35] transition-colors"
                  >
                    {icon}
                  </a>
                ))}
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-t border-neutral-900 my-8" />

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs space-y-4 md:space-y-0">
          {/* Copyright */}
          <p className="text-neutral-500">
            &copy; {new Date().getFullYear()} PawSome. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex gap-6 text-neutral-500">
            <a href="#" className="hover:text-neutral-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-neutral-400 transition-colors">
              Terms of Use
            </a>
          </div>
        </div>
      </div>

      {/* Text hover effect — full width, fills the entire bottom band */}
      <div className="w-full h-48 -mb-2">
        <TextHoverEffect text="PAWSOME" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}

export default PawsomeFooter;

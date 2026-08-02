import { Mail } from "lucide-react";
import { Link } from "react-router";
import { SupportLink } from "@/components/support/SupportLink";
import {
  FooterBackgroundGradient,
  TextHoverEffect,
} from "@/components/ui/hover-footer";
import logoIcon from "@/assets/logo-256.png";

function PawsomeFooter() {
  // Every entry points at a route that exists. These were all href="#" before,
  // which meant a footer full of links that silently did nothing and, worse,
  // jumped you back to the top of the page when clicked.
  const footerLinks = [
    {
      title: "Matches",
      links: [
        { label: "Browse nearby pets", to: "/community" },
        { label: "How matching works", to: "/faq#matching" },
        { label: "Safety and verification", to: "/faq#safety" },
      ],
    },
    {
      title: "About us",
      links: [
        { label: "Our story", to: "/about#our-story" },
        { label: "Community guidelines", to: "/terms#conduct" },
        { label: "FAQ", to: "/faq" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Events near you", to: "/events" },
        { label: "Safety tips", to: "/faq#safety" },
        { label: "Your chats", to: "/chat", pulse: true },
      ],
    },
  ];

  // A real, monitored inbox. This pointed at hello@pawsome.com, a domain the
  // project does not own, so every support request went nowhere.
  const contactInfo = [
    {
      icon: <Mail size={18} className="text-brand" />,
      text: "Email support",
      subject: "PawSome support",
    },
  ];

  return (
    <footer className="bg-neutral-950 relative h-fit overflow-visible border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-40 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
          {/* Brand section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              {/* The actual mark, not a stand-in. This was a Lucide heart,
                  which meant the footer was the one place in the app showing a
                  generic icon where the navbar and the splash both show the
                  paw. Same 256px derivative the navbar imports — the 1254px
                  original is 828 KB to render a 40px logo. */}
              <img
                src={logoIcon}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 drop-shadow-lg"
              />
              {/* One solid brand colour. Gradient-clipped text renders thinner
                  and washes out at the ends of the ramp, and it made the footer
                  wordmark a different colour from the identical wordmark in the
                  navbar and the splash — the splash had already been fixed this
                  way for the same reason. */}
              <span
                className="text-3xl font-bold text-brand"
                style={{ fontFamily: "Pacifico, cursive" }}
              >
                PawSome
              </span>
            </div>
            <p className="text-sm leading-relaxed text-neutral-400">
              Find the perfect companion for your pet. Connect with verified,
              friendly pet parents in your area.
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
                    <Link
                      to={link.to}
                      className="text-sm text-neutral-400 hover:text-brand transition-colors"
                    >
                      {link.label}
                    </Link>
                    {link.pulse && (
                      <span className="absolute top-0 right-[-10px] w-2 h-2 rounded-full bg-brand animate-pulse"></span>
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
                  <SupportLink
                    subject={item.subject}
                    className="text-sm text-neutral-400 hover:text-brand transition-colors"
                  >
                    {item.text}
                  </SupportLink>
                </li>
              ))}
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-neutral-400 hover:text-brand transition-colors"
                >
                  Help and FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-t border-neutral-900 my-8" />

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs space-y-4 md:space-y-0">
          {/* Copyright */}
          <p className="text-neutral-400">
            &copy; {new Date().getFullYear()} PawSome. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex gap-6 text-neutral-400">
            <Link to="/privacy" className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-neutral-300 transition-colors">
              Terms of Use
            </Link>
            <Link to="/faq" className="hover:text-neutral-300 transition-colors">
              FAQ
            </Link>
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

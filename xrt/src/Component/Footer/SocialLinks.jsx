import { Facebook, Instagram, Linkedin, Music2, Twitter, Youtube, Link2 } from "lucide-react";

const ICON_MAP = {
  FacebookIcon: Facebook,
  InstagramIcon: Instagram,
  TwitterIcon: Twitter,
  YouTubeIcon: Youtube,
  YoutubeIcon: Youtube,
  TikTokIcon: Music2,
  LinkedInIcon: Linkedin,
  LinkedinIcon: Linkedin,
};

export default function SocialLinks({ socials, className = "" }) {
  if (!Array.isArray(socials) || socials.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 md:justify-end ${className}`}>
      {socials.map((s, i) => {
        const url = typeof s?.url === "string" ? s.url.trim() : "";
        if (!url) return null;
        const iconKey = typeof s?.icon === "string" ? s.icon : "";
        const Icon = ICON_MAP[iconKey] || Link2;
        const label = iconKey.replace(/Icon$/i, "") || "Social link";
        return (
          <a
            key={`${url}-${i}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white/10 p-2 text-[#E1E1E1] transition-colors hover:bg-white/20 hover:text-[(--color-primary)]"
            aria-label={label}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </a>
        );
      })}
    </div>
  );
}

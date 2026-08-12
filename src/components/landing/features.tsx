const features = [
  {
    title: "No Login Required",
    description: "No registration, no email, no phone number. Create a temporary encrypted room and share the link instantly — zero accounts needed.",
    icon: "→",
  },
  {
    title: "Password Protected",
    description: "Every room is locked with a password used to derive the CipherRoom encryption key. Brute-force protection with automatic lockout.",
    icon: "◆",
  },
  {
    title: "Auto-Delete File Sharing",
    description: "Choose 1h, 6h, or 24h expiry. When time's up, all files and data are permanently destroyed — true auto-delete file sharing.",
    icon: "◇",
  },
  {
    title: "Ephemeral File Sharing",
    description: "Upload images, PDFs, ZIPs, and more. Files are encrypted in your browser before upload using AES-256-GCM. Up to 100MB per file.",
    icon: "□",
  },
  {
    title: "Self-Destructing Chat",
    description: "Instant messaging that vanishes on expiry. Self-destructing chat means no permanent record — see who's typing, then let it all disappear.",
    icon: "○",
  },
  {
    title: "Privacy First",
    description: "Zero-knowledge architecture. No tracking cookies, no user analytics, no server-side logs. Your data exists only for the life of the room.",
    icon: "△",
  },
];

export function Features() {
  return (
    <section className="px-4 py-20 max-w-5xl mx-auto" id="features">
      <div className="text-center mb-16">
        <p className="text-xs font-mono text-accent tracking-widest uppercase mb-3">
          Features
        </p>
        <h2 className="text-3xl font-mono font-bold text-foreground tracking-tight">
          Secure Temporary Rooms. Everything You Need. Nothing You Don&apos;t.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-card p-8 group hover:bg-card-hover transition-colors"
          >
            <span className="inline-block text-accent font-mono text-lg mb-4">
              {feature.icon}
            </span>
            <h3 className="font-mono font-bold text-foreground text-sm tracking-tight mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

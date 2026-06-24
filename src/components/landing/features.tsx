const features = [
  {
    title: "No Login Required",
    description: "No registration, no email, no phone number. Just create a room and share the link.",
    icon: "→",
  },
  {
    title: "Password Protected",
    description: "Every room is locked with a password. Brute-force protection with automatic lockout.",
    icon: "◆",
  },
  {
    title: "Auto-Delete",
    description: "Choose 1h, 6h, or 24h expiry. When time's up, everything is permanently destroyed.",
    icon: "◇",
  },
  {
    title: "File Sharing",
    description: "Upload images, PDFs, ZIPs, and more. Files are encrypted before upload. Up to 100MB.",
    icon: "□",
  },
  {
    title: "Realtime Chat",
    description: "Instant messaging with everyone in the room. See who's typing. Messages vanish on expiry.",
    icon: "○",
  },
  {
    title: "Privacy First",
    description: "No tracking. No analytics. No logs. Your data exists only for the life of the room.",
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
          Everything you need. Nothing you don&apos;t.
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

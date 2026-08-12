export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Create a Temporary Encrypted Room",
      description:
        "Set a room name, choose an expiration (1h, 6h, or 24h), and pick a strong password. No account or signup needed — your temporary encrypted room is ready in seconds.",
    },
    {
      step: "02",
      title: "CipherRoom Encryption Secures Everything",
      description:
        "Files are encrypted in your browser using AES-256-GCM before upload. The encryption key is derived from the room password using PBKDF2 (100,000 iterations). Our servers never see your raw data.",
    },
    {
      step: "03",
      title: "Auto-Delete — Everything Self-Destructs",
      description:
        "When the timer runs out, all messages, files, notes, and room metadata are permanently destroyed. No backups, no archives, no recovery. Your data truly disappears.",
    },
  ];

  return (
    <section className="px-4 py-20 max-w-5xl mx-auto" id="how-it-works">
      <div className="text-center mb-16">
        <p className="text-xs font-mono text-accent tracking-widest uppercase mb-3">
          How It Works
        </p>
        <h2 className="text-3xl font-mono font-bold text-foreground tracking-tight">
          How CipherRoom Encryption Protects Your Data
        </h2>
        <p className="mt-3 text-sm text-muted max-w-xl mx-auto">
          Three steps from room creation to automatic destruction. Zero knowledge throughout.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
        {steps.map((item) => (
          <div
            key={item.step}
            className="bg-card p-8 group hover:bg-card-hover transition-colors relative"
          >
            <span className="text-accent font-mono text-3xl font-bold opacity-20 absolute top-4 right-4">
              {item.step}
            </span>
            <span className="inline-block text-accent font-mono text-sm font-bold mb-4 border border-accent/30 px-2 py-0.5 rounded">
              Step {item.step}
            </span>
            <h3 className="font-mono font-bold text-foreground text-sm tracking-tight mb-3">
              {item.title}
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

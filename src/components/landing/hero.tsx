export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-20">
      <div className="text-center max-w-2xl mx-auto">
        {/* Terminal prompt accent */}
        <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 border border-border text-xs font-mono text-muted">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span>SECURE · TEMPORARY · ZERO-KNOWLEDGE</span>
        </div>

        {/* Main title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-mono font-bold text-foreground tracking-tighter leading-none">
          CIPHER
          <span className="text-accent">ROOM</span>
        </h1>

        {/* Tagline */}
        <p className="mt-6 text-lg text-muted leading-relaxed max-w-lg mx-auto">
          Create a room. Share instantly.
          <br />
          Everything disappears in 24 hours.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-10 justify-center">
          <button
            id="hero-create-room"
            className="px-8 py-3.5 bg-accent text-background font-mono font-bold text-sm hover:bg-accent/90 transition-colors"
          >
            Create Room
          </button>
          <button
            id="hero-join-room"
            className="px-8 py-3.5 border border-border text-foreground font-mono font-bold text-sm hover:border-accent hover:text-accent transition-colors"
          >
            Join Room
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-center gap-8 mt-12 text-xs font-mono text-muted">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
            No Login Required
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
            End-to-End Encrypted
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
            Auto-Delete
          </div>
        </div>
      </div>
    </section>
  );
}

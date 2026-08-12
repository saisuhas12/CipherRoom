export function UseCases() {
  const cases = [
    {
      icon: "◈",
      title: "Sharing Sensitive Documents",
      description:
        "Need to send a contract, tax document, or medical record? CipherRoom's ephemeral file sharing encrypts the file in your browser and auto-deletes it after the room expires. No permanent copies on any server.",
    },
    {
      icon: "◇",
      title: "Private Team Conversations",
      description:
        "Use CipherRoom's self-destructing chat for private team discussions that shouldn't live in Slack or email forever. Create a temporary encrypted room, talk, and let it vanish when you're done.",
    },
    {
      icon: "□",
      title: "One-Time Secure Links",
      description:
        "Share a password, API key, or sensitive credential through a CipherRoom temp chat. Unlike email or messaging apps, the data auto-deletes — no trace left in anyone's inbox or message history.",
    },
    {
      icon: "△",
      title: "Better Than Email for Sensitive Info",
      description:
        "Email stores copies across multiple servers indefinitely. CipherRoom's auto-delete file sharing means your data exists only for the life of the room — then it's gone. No forwarding, no data mining, no subpoena risk.",
    },
  ];

  return (
    <section className="px-4 py-20 max-w-5xl mx-auto" id="use-cases">
      <div className="text-center mb-16">
        <p className="text-xs font-mono text-accent tracking-widest uppercase mb-3">
          Use Cases
        </p>
        <h2 className="text-3xl font-mono font-bold text-foreground tracking-tight">
          When to Use Temporary Encrypted Rooms
        </h2>
        <p className="mt-3 text-sm text-muted max-w-xl mx-auto">
          From ephemeral file sharing to self-destructing chat — here&apos;s why people choose CipherRoom over email, Slack, and cloud drives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
        {cases.map((item) => (
          <div
            key={item.title}
            className="bg-card p-8 group hover:bg-card-hover transition-colors"
          >
            <span className="inline-block text-accent font-mono text-lg mb-4">
              {item.icon}
            </span>
            <h3 className="font-mono font-bold text-foreground text-sm tracking-tight mb-2">
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

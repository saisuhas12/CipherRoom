import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — CipherRoom",
  description:
    "Get in touch with the CipherRoom team. Report bugs, suggest features, or ask questions about temporary encrypted rooms and ephemeral file sharing.",
  alternates: {
    canonical: "https://www.cipheroom.app/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

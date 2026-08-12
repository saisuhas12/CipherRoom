import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().optional().default("Anonymous User"),
  email: z.string().email("Please provide a valid email address."),
  category: z.enum(["Bug Report / Issue", "Feature Suggestion", "Help / Support", "General Inquiry"]),
  subject: z.string().min(2, "Subject must be at least 2 characters.").max(150, "Subject is too long."),
  message: z.string().min(10, "Message must be at least 10 characters.").max(5000, "Message is too long."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    // Dispatch to FormSubmit endpoint
    const response = await fetch("https://formsubmit.co/ajax/saisuhas1212@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        _subject: `[CipherRoom ${validatedData.category}] ${validatedData.subject}`,
        Name: validatedData.name,
        Email: validatedData.email,
        Category: validatedData.category,
        Subject: validatedData.subject,
        Message: validatedData.message,
        _template: "table",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FormSubmit request failed:", errorText);
      return NextResponse.json(
        { success: false, error: "Failed to dispatch email. Please try direct email options below." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ success: false, error: firstIssue }, { status: 400 });
    }
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try sending via Gmail directly." },
      { status: 500 }
    );
  }
}

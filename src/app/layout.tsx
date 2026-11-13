import type { Metadata } from "next";
import {
  Special_Gothic_Expanded_One,
  Stack_Sans_Headline,
  Stack_Sans_Text,
} from "next/font/google";
import "./globals.css";

/**
 * The three Moderna Library faces. next/font downloads each at build time and
 * serves it from our own origin, so there is no runtime request to Google —
 * which the privacy rules require.
 */

/** Display: the "First," line. Single weight. */
const specialGothicExpandedOne = Special_Gothic_Expanded_One({
  variable: "--font-special-gothic-expanded-one",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

/** Headings. Variable 200-700, so one file covers regular (400) and bold (700). */
const stackSansHeadline = Stack_Sans_Headline({
  variable: "--font-stack-sans-headline",
  subsets: ["latin"],
  display: "swap",
});

/** Body and UI. Variable 200-700, covering regular (400) and medium (500). */
const stackSansText = Stack_Sans_Text({
  variable: "--font-stack-sans-text",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SeanKT Dueday",
  description: "Describe your work, get a polished invoice.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={[
        specialGothicExpandedOne.variable,
        stackSansHeadline.variable,
        stackSansText.variable,
        "h-full antialiased",
      ].join(" ")}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

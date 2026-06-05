import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";

import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pacil Resource",
  description:
    "A hub for sharing academic resources among Computer Science students at Universitas Indonesia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-background text-foreground"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster richColors closeButton />
          </QueryProvider>
        </ThemeProvider>
        {process.env.NODE_ENV !== "production" && (
          <Script
            id="strip-extension-hydration-attrs"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (() => {
                  const attribute = "bis_skin_checked";
                  const strip = (root = document) => {
                    if (root instanceof Element && root.hasAttribute(attribute)) {
                      root.removeAttribute(attribute);
                    }
                    root.querySelectorAll?.("[" + attribute + "]").forEach((element) => {
                      element.removeAttribute(attribute);
                    });
                  };

                  strip();

                  const observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                      if (mutation.type === "attributes") {
                        mutation.target.removeAttribute(attribute);
                      }
                      mutation.addedNodes.forEach((node) => strip(node));
                    }
                  });

                  observer.observe(document.documentElement, {
                    attributeFilter: [attribute],
                    attributes: true,
                    childList: true,
                    subtree: true,
                  });

                  window.addEventListener("load", () => {
                    strip();
                    window.setTimeout(() => observer.disconnect(), 1000);
                  }, { once: true });
                })();
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}

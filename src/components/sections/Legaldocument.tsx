// components/legal/LegalDocument.tsx
// One renderer for both the Privacy Policy and the Terms of Use.
// Numbers ("1.", "2." ...) and anchor ids are generated from the section order,
// so staff never have to manage them in the admin editor.

import { cn } from "@/lib/utils";
import type { LegalContent } from "./Legalcontent";

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "section";

// Replaces {email} with the contact email
const fill = (text: string, email: string) => text.split("{email}").join(email);

export function LegalDocument({ title, content }: { title: string; content: LegalContent }) {
  const sections = (content.sections ?? []).map((s, i) => ({
    id: `${i + 1}-${slug(s.title)}`,
    heading: `${i + 1}. ${s.title}`,
    paragraphs: (s.paragraphs ?? []).map((p) => p.trim()).filter(Boolean),
    items: (s.items ?? []).map((x) => x.trim()).filter(Boolean),
  }));

  return (
    <main className="relative w-full px-5 pb-24 pt-[96px] md:px-20 md:pt-[160px]">
      <div className="mx-auto w-full max-w-[860px]">
        <header className="border-b border-line pb-10">
          <h1 className="text-[34px] font-normal leading-[1.05] tracking-[-0.02em] text-white md:text-[60px] md:leading-[1]">
            {title}
          </h1>
          <p className="mt-6 text-[15px] leading-[20px] text-muted/90">
            {content.companyName} &middot; Last updated{" "}
            <span className="text-gold-accent">{content.lastUpdated}</span>
          </p>
        </header>

        {/* Table of contents */}
        <nav aria-label="Table of contents" className="border-b border-line py-8">
          <p className="mb-4 text-[12px] uppercase leading-none tracking-[0.08em] text-muted">
            Contents
          </p>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-[14px] leading-[20px] text-muted transition-colors hover:text-white"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sections */}
        <div>
          {sections.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              className={cn("scroll-mt-24 py-8", i > 0 && "border-t border-line")}
            >
              <h2 className="text-[22px] font-normal leading-[1.2] tracking-[-0.02em] text-white md:text-[26px]">
                {section.heading}
              </h2>

              <div className="mt-4 space-y-4 text-[15px] leading-[24px] text-muted/90">
                {section.paragraphs.map((text, idx) => (
                  <p key={idx}>{fill(text, content.email)}</p>
                ))}

                {section.items.length > 0 && (
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-[10px] h-[5px] w-[5px] shrink-0 bg-gold-accent"
                        />
                        <span>{fill(item, content.email)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
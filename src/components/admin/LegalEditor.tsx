"use client";

import type { LegalContent, LegalSection } from "../../components/sections/Legalcontent";
import { ContentToolbar, useContentEditor } from "./ContentEditor";
import { Btn, Card, StateMessage, Textarea, TextInput } from "./ui";

// Edits the Terms of Use or the Privacy Policy (same editor, different content key).
// Sections can be added, reordered and removed. Section numbers on the public page follow the order here.
// Paragraphs are separated by a blank line. Bullet points are one per line.

const move = <T,>(list: T[], i: number, dir: -1 | 1) => {
  const j = i + dir;
  if (j >= 0 && j < list.length) [list[i], list[j]] = [list[j], list[i]];
};

type Props = {
  contentKey: "terms" | "privacy";
  defaults: LegalContent;
  title: string;
  previewHref: string;
};

export function LegalEditor({ contentKey, defaults, title, previewHref }: Props) {
  const editor = useContentEditor<LegalContent>(contentKey, defaults);
  const { content, editable, change } = editor;

  if (editor.query.isPending) return <StateMessage>Loading…</StateMessage>;
  if (editor.query.error) return <StateMessage error onRetry={() => editor.query.refetch()}>{editor.query.error.message}</StateMessage>;

  const update = (fn: (c: LegalContent) => void) => {
    const next = structuredClone(content);
    fn(next);
    change(next);
  };
  const newSection = (): LegalSection => ({ title: "New section", paragraphs: ["Write here."], items: [] });

  return (
    <Card title={title}>
      <ContentToolbar editor={editor} previewHref={previewHref} />

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-[13px] text-white/40">
          Company legal name
          <TextInput disabled={!editable} value={content.companyName} onChange={(e) => update((x) => { x.companyName = e.target.value; })} />
        </label>
        <label className="grid gap-1 text-[13px] text-white/40">
          Last updated (e.g. November 11, 2026)
          <TextInput disabled={!editable} value={content.lastUpdated} onChange={(e) => update((x) => { x.lastUpdated = e.target.value; })} />
        </label>
        <label className="grid gap-1 text-[13px] text-white/40">
          Contact email (write {"{email}"} in the text to show it)
          <TextInput disabled={!editable} value={content.email} onChange={(e) => update((x) => { x.email = e.target.value; })} />
        </label>
      </div>

      <ul className="grid gap-4">
        {content.sections.map((s, i) => (
          <li key={i} className="border-[0.7px] border-white/[0.08] bg-white/[0.02] p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-[13px] text-white/40">Section {i + 1}</span>
              <TextInput
                aria-label={`Section ${i + 1} title`}
                disabled={!editable}
                value={s.title}
                onChange={(e) => update((x) => { x.sections[i].title = e.target.value; })}
                className="max-w-[360px]"
              />
              {editable && (
                <>
                  <Btn disabled={i === 0} onClick={() => update((x) => move(x.sections, i, -1))} title="Move up">Up</Btn>
                  <Btn disabled={i === content.sections.length - 1} onClick={() => update((x) => move(x.sections, i, 1))} title="Move down">Down</Btn>
                  <Btn
                    tone="danger"
                    disabled={content.sections.length <= 1}
                    onClick={() => window.confirm("Delete this section?") && update((x) => void x.sections.splice(i, 1))}
                  >
                    Remove
                  </Btn>
                </>
              )}
            </div>

            <p className="mb-1 text-[12px] text-white/40">Paragraphs (separate with a blank line)</p>
            <Textarea
              aria-label={`Section ${i + 1} paragraphs`}
              disabled={!editable}
              value={s.paragraphs.join("\n\n")}
              onChange={(e) => update((x) => { x.sections[i].paragraphs = e.target.value.split("\n\n"); })}
              className="mb-3 !min-h-[110px]"
            />

            <p className="mb-1 text-[12px] text-white/40">Bullet points (one per line, optional)</p>
            <Textarea
              aria-label={`Section ${i + 1} bullet points`}
              disabled={!editable}
              value={(s.items ?? []).join("\n")}
              onChange={(e) => update((x) => { x.sections[i].items = e.target.value === "" ? [] : e.target.value.split("\n"); })}
            />
          </li>
        ))}
      </ul>

      {editable && (
        <div className="mt-4">
          <Btn onClick={() => update((x) => void x.sections.push(newSection()))}>Add section</Btn>
        </div>
      )}

      <p className="mt-4 text-[13px] text-white/40">
        Tip: section numbers and the contents list on the public page are created automatically from the order of the sections.
      </p>
    </Card>
  );
}
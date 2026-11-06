"use client";

import { DEFAULT_FAQS } from "@/components/sections/Faq";
import type { FaqContent } from "@/lib/siteContent";
import { ContentToolbar, useContentEditor } from "./ContentEditor";
import { Btn, Card, StateMessage, Textarea, TextInput } from "./ui";

// Edits the FAQ list on the public home page. Questions can be added, reordered and removed.
export function FaqEditor() {
  const editor = useContentEditor<FaqContent>("faq", { items: DEFAULT_FAQS });
  const { content, editable, change } = editor;

  if (editor.query.isPending) return <StateMessage>Loading…</StateMessage>;
  if (editor.query.error) return <StateMessage error onRetry={() => editor.query.refetch()}>{editor.query.error.message}</StateMessage>;

  const update = (fn: (items: FaqContent["items"]) => void) => {
    const next = structuredClone(content);
    fn(next.items);
    change(next);
  };
  const move = (i: number, dir: -1 | 1) =>
    update((items) => {
      const j = i + dir;
      if (j < 0 || j >= items.length) return;
      [items[i], items[j]] = [items[j], items[i]];
    });

  return (
    <Card title="Frequently asked questions">
      <ContentToolbar editor={editor} previewHref="/#faq" />
      <ul className="grid gap-4">
        {content.items.map((item, i) => (
          <li key={i} className="border-[0.7px] border-white/[0.08] bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[13px] text-white/40">Question {i + 1}</span>
              {editable && (
                <div className="flex gap-2">
                  <Btn disabled={i === 0} onClick={() => move(i, -1)} title="Move up">Up</Btn>
                  <Btn disabled={i === content.items.length - 1} onClick={() => move(i, 1)} title="Move down">Down</Btn>
                  <Btn tone="danger" onClick={() => update((items) => void items.splice(i, 1))}>Remove</Btn>
                </div>
              )}
            </div>
            <TextInput aria-label={`Question ${i + 1}`} disabled={!editable} value={item.q} onChange={(e) => update((items) => { items[i].q = e.target.value; })} className="mb-3" />
            <Textarea aria-label={`Answer ${i + 1}`} disabled={!editable} value={item.a} onChange={(e) => update((items) => { items[i].a = e.target.value; })} />
          </li>
        ))}
      </ul>
      {editable && (
        <div className="mt-4">
          <Btn onClick={() => update((items) => void items.push({ q: "New question", a: "Write the answer here." }))}>Add question</Btn>
        </div>
      )}
    </Card>
  );
}

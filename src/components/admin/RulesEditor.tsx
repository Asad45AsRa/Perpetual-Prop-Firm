"use client";

import { useState } from "react";
import { DEFAULT_RULES } from "@/components/sections/RulesBook";
import type { RulesContent, RulesNode } from "@/lib/siteContent";
import { ContentToolbar, useContentEditor } from "./ContentEditor";
import { Btn, Card, SelectInput, StateMessage, Tabs, Textarea, TextInput } from "./ui";

// Edits the public Rulebook page: topics in the sidebar, the rule sections inside each topic,
// the text blocks inside each section, and the quick overview table.
// These two topics are linked from other parts of the page, so they can be renamed but not removed.
const PROTECTED_TOPICS = ["overview", "account-configurations"];

const NODE_TYPES: { value: RulesNode["t"]; label: string }[] = [
  { value: "h3", label: "Heading" },
  { value: "p", label: "Paragraph" },
  { value: "f", label: "Highlighted line" },
  { value: "ul", label: "Bullet list" },
  { value: "ol", label: "Numbered list" },
  { value: "new", label: "New-in-this-version note" },
];

const emptyNode = (t: RulesNode["t"]): RulesNode => (t === "ul" || t === "ol" ? { t, x: ["First point"] } : { t, x: "Write here" });
const move = <T,>(list: T[], i: number, dir: -1 | 1) => {
  const j = i + dir;
  if (j >= 0 && j < list.length) [list[i], list[j]] = [list[j], list[i]];
};

export function RulesEditor() {
  const editor = useContentEditor<RulesContent>("rules", DEFAULT_RULES);
  const { content, editable } = editor;
  const [tab, setTab] = useState("Topics");
  const [selected, setSelected] = useState("overview");

  if (editor.query.isPending) return <StateMessage>Loading…</StateMessage>;
  if (editor.query.error) return <StateMessage error onRetry={() => editor.query.refetch()}>{editor.query.error.message}</StateMessage>;

  // Every edit clones the content, changes the clone, and renumbers the sections so the
  // numbers shown on the public page (01, 02, 03...) always follow the order here.
  const update = (fn: (c: RulesContent) => void) => {
    const next = structuredClone(content);
    fn(next);
    let n = 0;
    next.groups.forEach((g) => g.items.forEach((it) => it.sections.forEach((s) => { s.n = String(++n).padStart(2, "0"); })));
    editor.change(next);
  };

  const allItems = content.groups.flatMap((g, gi) => g.items.map((it, ii) => ({ gi, ii, it })));
  const current = allItems.find((x) => x.it.id === selected) ?? allItems[0];

  return (
    <Card title="Rulebook">
      <ContentToolbar editor={editor} previewHref="/rules" />
      <Tabs tabs={["Topics", "Quick overview table"]} active={tab} onChange={setTab} />

      {tab === "Quick overview table" ? (
        <div className="grid gap-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr>
                  {content.overviewHead.map((h, c) => (
                    <th key={c} className="p-1"><TextInput aria-label={`Column ${c + 1} title`} disabled={!editable} value={h} onChange={(e) => update((x) => { x.overviewHead[c] = e.target.value; })} /></th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {content.overviewRows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c} className="p-1"><TextInput aria-label={`Row ${r + 1} column ${c + 1}`} disabled={!editable} value={cell} onChange={(e) => update((x) => { x.overviewRows[r][c] = e.target.value; })} /></td>
                    ))}
                    <td className="p-1">{editable && <Btn tone="danger" onClick={() => update((x) => void x.overviewRows.splice(r, 1))}>Remove</Btn>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {editable && (
            <div className="flex gap-2">
              <Btn onClick={() => update((x) => void x.overviewRows.push(x.overviewHead.map(() => "")))}>Add row</Btn>
              <Btn onClick={() => update((x) => { x.overviewHead.push("New column"); x.overviewRows.forEach((r) => r.push("")); })}>Add column</Btn>
              <Btn disabled={content.overviewHead.length <= 1} onClick={() => update((x) => { x.overviewHead.pop(); x.overviewRows.forEach((r) => r.pop()); })}>Remove last column</Btn>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          {/* ───── topics list ───── */}
          <div>
            {content.groups.map((g, gi) => (
              <div key={gi} className="mb-4">
                <div className="mb-1 flex items-center gap-2">
                  <TextInput aria-label="Group name" disabled={!editable} value={g.label} onChange={(e) => update((x) => { x.groups[gi].label = e.target.value; })} className="!h-[34px] !text-[13px]" />
                  {editable && g.items.length === 0 && <Btn tone="danger" onClick={() => update((x) => void x.groups.splice(gi, 1))}>×</Btn>}
                </div>
                {g.items.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => setSelected(it.id)}
                    className={`block w-full px-3 py-2 text-left text-[14px] ${current?.it.id === it.id ? "bg-gold/15 text-gold-light" : "text-white/60 hover:bg-white/[0.04]"}`}
                  >
                    {it.label}
                  </button>
                ))}
                {editable && (
                  <Btn onClick={() => {
                    const id = `topic-${Date.now().toString(36)}`;
                    update((x) => void x.groups[gi].items.push({ id, label: "New topic", sections: [{ n: "00", title: "New section", nodes: [emptyNode("p")] }] }));
                    setSelected(id);
                  }}>Add topic</Btn>
                )}
              </div>
            ))}
            {editable && <Btn onClick={() => update((x) => void x.groups.push({ label: "New group", items: [] }))}>Add group</Btn>}
          </div>

          {/* ───── selected topic ───── */}
          {current && (
            <div className="grid content-start gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <TextInput aria-label="Topic name" disabled={!editable} value={current.it.label} onChange={(e) => update((x) => { x.groups[current.gi].items[current.ii].label = e.target.value; })} className="max-w-[360px]" />
                {editable && (
                  <>
                    <Btn disabled={current.ii === 0} onClick={() => update((x) => move(x.groups[current.gi].items, current.ii, -1))}>Up</Btn>
                    <Btn disabled={current.ii === content.groups[current.gi].items.length - 1} onClick={() => update((x) => move(x.groups[current.gi].items, current.ii, 1))}>Down</Btn>
                    {!PROTECTED_TOPICS.includes(current.it.id) && (
                      <Btn tone="danger" onClick={() => window.confirm("Delete this topic and all its sections?") && update((x) => void x.groups[current.gi].items.splice(current.ii, 1))}>Delete topic</Btn>
                    )}
                  </>
                )}
              </div>

              {current.it.sections.map((s, si) => (
                <div key={si} className="border-[0.7px] border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="text-[13px] text-white/40">Rule {s.n}</span>
                    <TextInput aria-label="Section title" disabled={!editable} value={s.title} onChange={(e) => update((x) => { x.groups[current.gi].items[current.ii].sections[si].title = e.target.value; })} className="max-w-[320px]" />
                    {editable && (
                      <>
                        <Btn disabled={si === 0} onClick={() => update((x) => move(x.groups[current.gi].items[current.ii].sections, si, -1))}>Up</Btn>
                        <Btn disabled={si === current.it.sections.length - 1} onClick={() => update((x) => move(x.groups[current.gi].items[current.ii].sections, si, 1))}>Down</Btn>
                        <Btn tone="danger" disabled={current.it.sections.length <= 1} onClick={() => update((x) => void x.groups[current.gi].items[current.ii].sections.splice(si, 1))}>Remove section</Btn>
                      </>
                    )}
                  </div>

                  <ul className="grid gap-3">
                    {s.nodes.map((node, ni) => {
                      const path = (x: RulesContent) => x.groups[current.gi].items[current.ii].sections[si].nodes;
                      return (
                        <li key={ni} className="grid gap-2 border-l-2 border-white/[0.1] pl-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <SelectInput
                              aria-label="Block type"
                              disabled={!editable}
                              options={NODE_TYPES.map((t) => t.label)}
                              value={NODE_TYPES.find((t) => t.value === node.t)?.label}
                              onChange={(e) => {
                                const t = NODE_TYPES.find((x) => x.label === e.target.value)!.value;
                                // Switching between list and text keeps the words
                                update((x) => {
                                  const old = path(x)[ni];
                                  const text = Array.isArray(old.x) ? old.x.join("\n") : old.x;
                                  path(x)[ni] = t === "ul" || t === "ol" ? { t, x: text.split("\n").filter(Boolean) } : ({ t, x: text } as RulesNode);
                                });
                              }}
                              className="!w-[220px]"
                            />
                            {editable && (
                              <>
                                <Btn disabled={ni === 0} onClick={() => update((x) => move(path(x), ni, -1))}>Up</Btn>
                                <Btn disabled={ni === s.nodes.length - 1} onClick={() => update((x) => move(path(x), ni, 1))}>Down</Btn>
                                <Btn tone="danger" disabled={s.nodes.length <= 1} onClick={() => update((x) => void path(x).splice(ni, 1))}>Remove</Btn>
                              </>
                            )}
                          </div>
                          {node.t === "ul" || node.t === "ol" ? (
                            <Textarea
                              aria-label="List items, one per line"
                              disabled={!editable}
                              value={node.x.join("\n")}
                              onChange={(e) => update((x) => { path(x)[ni] = { t: node.t, x: e.target.value.split("\n") } as RulesNode; })}
                            />
                          ) : (
                            <Textarea
                              aria-label="Text"
                              disabled={!editable}
                              value={node.x}
                              onChange={(e) => update((x) => { path(x)[ni] = { t: node.t, x: e.target.value } as RulesNode; })}
                              className={node.t === "h3" ? "!min-h-[44px]" : ""}
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {editable && (
                    <div className="mt-3">
                      <Btn onClick={() => update((x) => void x.groups[current.gi].items[current.ii].sections[si].nodes.push(emptyNode("p")))}>Add block</Btn>
                    </div>
                  )}
                </div>
              ))}
              {editable && <div><Btn onClick={() => update((x) => void x.groups[current.gi].items[current.ii].sections.push({ n: "00", title: "New section", nodes: [emptyNode("p")] }))}>Add section</Btn></div>}
              <p className="text-[13px] text-white/40">Tip: in a paragraph, wrap words in double stars like **this** to show them in white on the public page.</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

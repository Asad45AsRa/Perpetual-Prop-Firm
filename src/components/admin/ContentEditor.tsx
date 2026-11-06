"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAdminMutation, useAdminQuery } from "./adminData";
import { useAdminSession } from "./Adminauth";
import { canManage } from "./permissions";
import { Btn, describeError, formatDate, Pill, StateMessage, useToast } from "./ui";
import type { ContentKey, ContentRecord } from "@/lib/siteContent";

// Shared logic for editing public website content (FAQ, Rules) from the admin console.
// Flow: edit -> "Save draft" (private) -> "Publish" (visible on the public site at once).
// GET /admin/content/:key -> ContentRecord      PUT /admin/content/:key { data, note }
// POST /admin/content/:key/publish | discard | restore { version }
// The public site reads only the published copy: GET /public/content/:key -> { data }.
export function useContentEditor<T>(key: ContentKey, defaults: T) {
  const toast = useToast();
  const user = useAdminSession((s) => s.user);
  const write = useAdminMutation();
  const query = useAdminQuery<ContentRecord<T>>("content", `/admin/content/${key}`);
  const record = query.data;

  const [content, setContent] = useState<T>(defaults);
  const [dirty, setDirty] = useState(false);

  // Follow the server copy unless the person has unsaved edits
  useEffect(() => {
    if (record && !dirty) setContent(structuredClone(record.draft ?? record.published ?? defaults));
    // `defaults` is a module constant on every call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record, dirty]);

  const base = `/admin/content/${key}`;
  const call = (path: string, method: "PUT" | "POST", body: unknown, success: string, after?: () => void) =>
    write.mutate({ path, method, body }, { onSuccess: () => { toast(success); after?.(); }, onError: (e) => toast(describeError(e), true) });

  return {
    query,
    record,
    content,
    dirty,
    busy: write.isPending,
    editable: canManage(user, "cms"),
    change: (next: T) => { setContent(next); setDirty(true); },
    saveDraft: (note = "") => call(base, "PUT", { data: content, note }, "Draft saved.", () => setDirty(false)),
    // Publishing saves the edits first, so what is on screen is exactly what goes live
    publish: (note = "") =>
      write.mutate(
        { path: base, method: "PUT", body: { data: content, note } },
        {
          onSuccess: () => call(`${base}/publish`, "POST", { note }, "Published. The public site is updated.", () => setDirty(false)),
          onError: (e) => toast(describeError(e), true),
        },
      ),
    discard: () => call(`${base}/discard`, "POST", {}, "Draft discarded.", () => setDirty(false)),
    restore: (version: number) => call(`${base}/restore`, "POST", { version }, `Version ${version} loaded as a draft.`, () => setDirty(false)),
  };
}

// The part of the editor state that the toolbar needs (it does not care about the content shape)
export type ToolbarEditor = {
  record: ContentRecord<unknown> | undefined;
  dirty: boolean;
  busy: boolean;
  editable: boolean;
  saveDraft: (note?: string) => void;
  publish: (note?: string) => void;
  discard: () => void;
  restore: (version: number) => void;
};

// Status line, buttons and version history shown above every editor
export function ContentToolbar({ editor, previewHref, children }: { editor: ToolbarEditor; previewHref: string; children?: ReactNode }) {
  const [showHistory, setShowHistory] = useState(false);
  const { record } = editor;
  if (!record) return null;

  const hasDraft = !!record.draft || editor.dirty;
  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-[14px] text-white/60">
          {record.published ? <Pill tone="green">Published v{record.version}</Pill> : <Pill tone="gray">Showing the built-in text</Pill>}
          {hasDraft && <Pill tone="gold">{editor.dirty ? "Unsaved changes" : "Draft saved, not published"}</Pill>}
          {record.publishedAt && <span>Last published {formatDate(record.publishedAt)}</span>}
        </div>
        {editor.editable && (
          <div className="flex flex-wrap gap-2">
            <a href={previewHref} target="_blank" rel="noreferrer" className="border-[0.7px] border-white/[0.13] px-4 py-2 text-[14px] text-white/80 hover:border-gold-accent">View public page</a>
            <Btn onClick={() => setShowHistory((v) => !v)}>History ({record.history.length})</Btn>
            <Btn disabled={!hasDraft || editor.busy} onClick={() => window.confirm("Throw away the draft and go back to the published text?") && editor.discard()}>Discard draft</Btn>
            <Btn disabled={!editor.dirty || editor.busy} onClick={() => editor.saveDraft()}>Save draft</Btn>
            <Btn tone="gold" disabled={(!hasDraft && !!record.published) || editor.busy} onClick={() => window.confirm("Publish now? Visitors will see this immediately.") && editor.publish()}>Publish</Btn>
          </div>
        )}
      </div>
      {!editor.editable && <p className="mt-3 text-[14px] text-white/40">You can view this content but not change it.</p>}
      {showHistory && (
        <div className="mt-4 border-[0.7px] border-white/[0.08] p-4">
          {record.history.length === 0 ? (
            <StateMessage>Nothing has been published yet.</StateMessage>
          ) : (
            <ul>
              {record.history.map((h) => (
                <li key={h.version} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] py-2.5 text-[14px] last:border-0">
                  <span className="text-white/70">Version {h.version} · {formatDate(h.savedAt)} · {h.savedBy}</span>
                  <Btn disabled={editor.busy} onClick={() => editor.restore(h.version)}>Load as draft</Btn>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

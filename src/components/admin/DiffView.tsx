"use client";

// Shows what changed between two versions of a record: audit entries, settings changes, plan edits.
export function DiffView({ before, after }: { before?: Record<string, unknown> | null; after?: Record<string, unknown> | null }) {
  const b = before ?? {};
  const a = after ?? {};
  const keys = [...new Set([...Object.keys(b), ...Object.keys(a)])].filter((k) => JSON.stringify(b[k]) !== JSON.stringify(a[k]));

  if (keys.length === 0) return <p className="text-[14px] text-white/40">No field values changed.</p>;

  const show = (v: unknown) => (v === undefined ? "-" : typeof v === "object" ? JSON.stringify(v) : String(v));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-[14px]">
        <thead>
          <tr className="border-b border-white/[0.08] text-white/40">
            <th className="px-2 py-2 font-normal">Field</th>
            <th className="px-2 py-2 font-normal">Before</th>
            <th className="px-2 py-2 font-normal">After</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((k) => (
            <tr key={k} className="border-b border-white/[0.06] last:border-0">
              <td className="px-2 py-2.5 text-white/60">{k}</td>
              <td className="px-2 py-2.5 text-red-400">{show(b[k])}</td>
              <td className="px-2 py-2.5 text-success">{show(a[k])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

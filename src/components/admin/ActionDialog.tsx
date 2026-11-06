"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Btn, FormField, Modal, SelectInput, Textarea, TextInput } from "./ui";

type Row = Record<string, unknown>;

// One input in a create / edit form or in an action dialog
export type FieldSpec = {
  key: string;
  label: string;
  type?: "text" | "email" | "number" | "date" | "select" | "textarea" | "password";
  options?: string[]; // required for type "select"
  required?: boolean;
  placeholder?: string;
  default?: string | number;
  help?: string; // small hint under the label
  lockedOnEdit?: boolean; // cannot be changed once the record exists
};

// The standard "why are you doing this" input. The answer is stored in the audit log.
export const REASON_FIELD: FieldSpec = {
  key: "reason",
  label: "Reason (saved in the audit log)",
  type: "textarea",
  required: true,
  placeholder: "Explain why this action is needed",
};

function initialValue(f: FieldSpec, row?: Row): string {
  const raw = row ? row[f.key] : f.default;
  if (raw === undefined || raw === null) return f.type === "select" ? (f.options?.[0] ?? "") : "";
  // A date field shows only the yyyy-mm-dd part of the ISO string
  return f.type === "date" ? String(raw).slice(0, 10) : String(raw);
}

// One dialog for everything that needs input: create, edit, row actions with a reason, bulk actions.
// `confirmWord` forces the person to type a word before a dangerous action can be sent.
export function ActionDialog({
  title,
  subtitle,
  fields,
  initial,
  submitLabel,
  busy,
  confirmWord,
  intro,
  onClose,
  onSubmit,
}: {
  title: string;
  subtitle?: string;
  fields: FieldSpec[];
  initial?: Row;
  submitLabel: string;
  busy: boolean;
  confirmWord?: string;
  intro?: ReactNode;
  onClose: () => void;
  onSubmit: (values: Row) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, initialValue(f, initial)])),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [typed, setTyped] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && !values[f.key].trim()) found[f.key] = `${f.label} is required.`;
      else if (f.type === "number" && values[f.key] !== "" && Number.isNaN(Number(values[f.key]))) found[f.key] = "Enter a number.";
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Convert the form strings back into the types the API expects
    const body: Row = {};
    fields.forEach((f) => {
      const v = values[f.key];
      if (f.type === "number") body[f.key] = v === "" ? 0 : Number(v);
      else if (f.type === "date") body[f.key] = v ? new Date(v).toISOString() : "";
      else body[f.key] = f.type === "password" ? v : v.trim();
    });
    onSubmit(body);
  };

  const locked = !!confirmWord && typed.trim() !== confirmWord;

  return (
    <Modal title={title} subtitle={subtitle} onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-4">
        {intro}
        {fields.map((f) => {
          const id = `field-${f.key}`;
          const set = (v: string) => setValues((s) => ({ ...s, [f.key]: v }));
          const disabled = !!initial && !!f.lockedOnEdit;
          return (
            <FormField key={f.key} label={f.label} htmlFor={id} error={errors[f.key]}>
              {f.type === "select" ? (
                <SelectInput id={id} disabled={disabled} options={f.options ?? []} value={values[f.key]} onChange={(e) => set(e.target.value)} />
              ) : f.type === "textarea" ? (
                <Textarea id={id} disabled={disabled} placeholder={f.placeholder} value={values[f.key]} onChange={(e) => set(e.target.value)} />
              ) : (
                <TextInput
                  id={id}
                  disabled={disabled}
                  type={f.type === "number" ? "number" : f.type ?? "text"}
                  step={f.type === "number" ? "any" : undefined}
                  placeholder={f.placeholder}
                  value={values[f.key]}
                  onChange={(e) => set(e.target.value)}
                />
              )}
              {f.help && <p className="mt-1.5 text-[12px] text-white/30">{f.help}</p>}
            </FormField>
          );
        })}
        {confirmWord && (
          <FormField label={`Type ${confirmWord} to confirm`} htmlFor="confirm-word">
            <TextInput id="confirm-word" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </FormField>
        )}
        <Btn type="submit" tone="gold" disabled={busy || locked}>{busy ? "Saving…" : submitLabel}</Btn>
      </form>
    </Modal>
  );
}

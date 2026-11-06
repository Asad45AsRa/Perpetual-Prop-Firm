"use client";

import { useState, type FormEvent } from "react";
import { Btn, Card, describeError, FormField, formatDate, Pill, SelectInput, StateMessage, statusTone, Table, TextInput, useToast } from "../ui";
import { useAdminMutation, useAdminNavigate, useAdminQuery } from "../adminData";
import { STAGE, STAGES } from "../constants";
import type { AdminPage, ListResponse } from "../types";

type Row = Record<string, unknown>;

// Issue a challenge or funded account with an audit reason.
// Plans: GET /admin/plans, traders: GET /admin/traders, history: GET /admin/issuance,
// submit: POST /admin/issuance { traderName, planId, stage, reason }
function AccountIssuance() {
  const toast = useToast();
  const go = useAdminNavigate();
  const issue = useAdminMutation();
  const traders = useAdminQuery<ListResponse<Row>>("traders", "/admin/traders");
  const plans = useAdminQuery<ListResponse<Row>>("plans", "/admin/plans");
  const history = useAdminQuery<ListResponse<Row>>("issuance", "/admin/issuance");

  const [traderName, setTraderName] = useState("");
  const [planId, setPlanId] = useState("");
  const [stage, setStage] = useState<string>(STAGE.challenge);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const traderOptions = (traders.data?.items ?? []).map((t) => String(t.name));
  const planItems = plans.data?.items ?? [];
  const planLabel = (p: Row) => `${p.name} ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(p.capital))}`;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return setError("Enter a reason so the action is logged.");
    setError("");
    issue.mutate(
      { path: "/admin/issuance", body: { traderName: traderName || traderOptions[0], planId: planId || String(planItems[0]?.id), stage, reason: reason.trim() } },
      {
        onSuccess: () => {
          toast("Account issued.");
          setReason("");
          go("accounts");
        },
        onError: (err) => toast(describeError(err), true),
      },
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,520px)_1fr]">
      <Card title="Issue an account">
        {traders.isPending || plans.isPending ? (
          <StateMessage>Loading…</StateMessage>
        ) : (
          <form onSubmit={submit} noValidate className="grid gap-4">
            <FormField label="Trader" htmlFor="is-trader">
              <SelectInput id="is-trader" options={traderOptions} value={traderName || traderOptions[0] || ""} onChange={(e) => setTraderName(e.target.value)} />
            </FormField>
            <FormField label="Plan" htmlFor="is-plan">
              <select
                id="is-plan"
                value={planId || String(planItems[0]?.id ?? "")}
                onChange={(e) => setPlanId(e.target.value)}
                className="h-[40px] w-full border-[0.7px] border-white/[0.13] bg-white/[0.06] px-[14px] text-[14px] text-white outline-none focus:border-gold-accent"
              >
                {planItems.map((p) => <option key={String(p.id)} value={String(p.id)}>{planLabel(p)}</option>)}
              </select>
            </FormField>
            <FormField label="Stage" htmlFor="is-stage">
              <SelectInput id="is-stage" options={STAGES} value={stage} onChange={(e) => setStage(e.target.value)} />
            </FormField>
            <FormField label="Reason (saved to audit log)" htmlFor="is-reason" error={error}>
              <TextInput id="is-reason" placeholder="Support compensation" value={reason} onChange={(e) => setReason(e.target.value)} />
            </FormField>
            <Btn type="submit" tone="gold" disabled={issue.isPending}>{issue.isPending ? "Issuing…" : "Issue account"}</Btn>
          </form>
        )}
      </Card>

      <Card title="Recent issuance">
        {history.isPending ? (
          <StateMessage>Loading…</StateMessage>
        ) : history.error ? (
          <StateMessage error onRetry={() => history.refetch()}>{history.error.message}</StateMessage>
        ) : history.data.items.length === 0 ? (
          <StateMessage>No accounts issued by hand yet.</StateMessage>
        ) : (
          <div className="overflow-x-auto">
            <Table
              heads={["ID", "Trader", "Plan", "Stage", "Reason", "Status", "Issued"]}
              rows={history.data.items.map((r) => [
                String(r.id), String(r.traderName), String(r.plan), String(r.stage), String(r.reason ?? "-"),
                <Pill key="s" tone={statusTone(String(r.status))}>{String(r.status)}</Pill>,
                formatDate(String(r.issuedAt)),
              ])}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

export const page: AdminPage = { key: "issuance", label: "Account Issuance", group: "Traders & trading", component: AccountIssuance };

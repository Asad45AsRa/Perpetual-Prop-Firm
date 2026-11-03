"use client";

import { useState } from "react";
import { Monitor } from "lucide-react";
import { activeDevices } from "../data";
import { ConfirmActions, Modal } from "../Modal";
import { StatusChip } from "../Panel";

type Dialog = "all" | "this" | null;

export function ActiveDevices() {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [notice, setNotice] = useState("");
  const close = () => setDialog(null);

  // TODO(backend): call the sign-out endpoints, then clear the session and redirect to login.
  const confirm = () => {
    setNotice(dialog === "all" ? "Signed out of all devices." : "Signed out of this device.");
    close();
  };

  return (
    <div className="border-t-[0.7px] border-white/[0.13] px-[16px] pb-[20px] pt-[18px]">
      <h3 className="text-[14px] font-normal leading-normal text-white">Active Devices</h3>

      <div className="mt-[16px] flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div className="min-w-0 max-w-[420px]">
          <p className="text-[13px] leading-[1.3] text-white">Manage logged-in devices</p>
          <p className="mt-[4px] text-[12px] leading-[1.4] text-white/50">
            Review the devices currently connected to your account and keep your account secure.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialog("all")}
          className="text-[12px] leading-normal text-[#E5484D] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:underline"
        >
          Sign out of all
        </button>
      </div>

      <ul className="mt-[16px] flex flex-col gap-[10px]">
        {activeDevices.map((d) => (
          <li key={d.id} className="flex items-center gap-[12px]">
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center border-[0.57px] border-white/[0.06] bg-white/[0.06]">
              <Monitor aria-hidden className="h-[16px] w-[16px] text-white/70" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] leading-[1.3] text-white">{d.label}</p>
              <StatusChip className="mt-[4px] py-[2px] text-[11px] leading-normal">{d.lastActive}</StatusChip>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setDialog("this")}
        className="mt-[22px] h-[41px] w-full bg-[#C71919]/20 text-[14px] text-[#E5484D] transition-colors hover:bg-[#C71919]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
      >
        Sign out of this device
      </button>
      <p role="status" className="mt-[8px] min-h-[16px] text-center text-[12px] text-white/50">
        {notice}
      </p>

      <Modal
        open={dialog === "all"}
        onClose={close}
        title="Sign Out Of All Devices?"
        description="You’ll be signed out everywhere, including this device. You’ll need to sign in again on each device."
      >
        <ConfirmActions onCancel={close} onConfirm={confirm} confirmLabel="Sign out all devices" />
      </Modal>
      <Modal
        open={dialog === "this"}
        onClose={close}
        title="Sign Out Of This Device?"
        description="You’ll be signed out on this device only. Your other sessions stay active."
      >
        <ConfirmActions onCancel={close} onConfirm={confirm} confirmLabel="Sign out" />
      </Modal>
    </div>
  );
}

import type { Metadata } from "next";
import { Panel, PanelTitle } from "@/components/affiliate-dashboard/Panel";
import { ProfileForm } from "@/components/affiliate-dashboard/profile/ProfileForm";
import { ProfileVisibility } from "@/components/affiliate-dashboard/profile/ProfileVisibility";
import { ActiveDevices } from "@/components/affiliate-dashboard/profile/ActiveDevices";

export const metadata: Metadata = { title: "My Profile" };

export default function AffiliateProfilePage() {
  return (
    // Figma: one ~650px card, left-aligned under the header.
    <Panel className="mt-[37px] max-w-[650px]">
      <div className="border-b-[0.7px] border-white/[0.13] px-[16px] py-[14px]">
        <PanelTitle>Account</PanelTitle>
      </div>
      <ProfileForm />
      <ProfileVisibility />
      <ActiveDevices />
    </Panel>
  );
}

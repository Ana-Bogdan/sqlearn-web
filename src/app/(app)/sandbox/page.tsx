import type { Metadata } from "next";
import { SandboxWorkspace } from "@/components/sandbox/sandbox-workspace";

export const metadata: Metadata = {
  title: "Sandbox · SQLearn",
};

export default function SandboxPage() {
  return <SandboxWorkspace />;
}

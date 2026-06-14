"use client";
import dynamic from "next/dynamic";

const CapabilitySpheres = dynamic(
  () => import("@/components/CapabilitySpheres"),
  { ssr: false }
);

export default function CapabilitySpheresClient() {
  return <CapabilitySpheres />;
}
import DigitalAgencyLoader from "@/app/_components/DigitalAgencyLoader";

export default function Loading() {
  return (
    // Full screen center wrapper
    <div className="flex items-center justify-center h-screen w-full bg-slate-50 z-[9999]">
      <DigitalAgencyLoader />
    </div>
  );
}
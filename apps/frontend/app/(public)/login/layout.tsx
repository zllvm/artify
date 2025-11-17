import GuestShell from "@/components/GuestShell/GuestShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <GuestShell>{children}</GuestShell>;
}

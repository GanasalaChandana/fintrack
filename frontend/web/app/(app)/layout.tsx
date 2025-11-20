import Navigation from "../../components/Navigation";
import AuthGate from "../../components/AuthGate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <Navigation />
      <main>{children}</main>
    </AuthGate>
  );
}

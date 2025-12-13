import { OnlineUserProvider } from "@/constants/OnlineUserProvider";

import { Toaster } from "sonner";
import EmergencyHubProvider from "@/app/providers/EmergencyHubProvider";
import "./globals.css";

import { AuthProvider } from "@/contexts/auth-context";
import { PermissionProvider } from "@/contexts/permission-context";

export const metadata = {
  title: "Garage Pro",
  description: "Garage Pro Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <PermissionProvider>
            <OnlineUserProvider>
              <EmergencyHubProvider>{children}</EmergencyHubProvider>
            </OnlineUserProvider>
            <Toaster />
          </PermissionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

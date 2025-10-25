import { redirect } from "next/navigation";

export default function Page() {
  // Redirect to login page as the startup page
  redirect("/login");
}
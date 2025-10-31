// import ChatBotUI from "@/components/chatbot/ChatBot";

// export default function Page() {
//   return <ChatBotUI />; // Render the ChatBotUI
// }
import { redirect } from "next/navigation";

export default function Page() {
  // Redirect to login page as the startup page
  redirect("/login");
}

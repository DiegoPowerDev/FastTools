"use client";
import { useState } from "react";
import { resetPassword } from "@/firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePageStore } from "@/store/PageStore";
import BackgroundImage from "@/components/background/backgroundImage";
import toast from "react-hot-toast";
import UserToasterClient from "@/components/toast/UserToasterClient";
import { IconDoor } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  const [email, setEmail] = useState("");
  const { theme } = usePageStore();
  const router = useRouter();
  const handleSubmit = (e) => {
    e.preventDefault();

    resetPassword(email, (res) => {
      if (res.success) {
        toast.success(
          "RESET PASSWORD EMAIL SENT, CHECK YOUR INBOX OR SPAM FOLDER."
        );
        return;
      }
      toast.error("ERROR SENDING PASSWORD RESET EMAIL");
      console.error(res);
    });
    console.log(email);
  };

  return (
    <div className="flex flex-col gap-4 flex-1 w-full  justify-center items-center mx-auto">
      <BackgroundImage />
      <form
        style={{ border: `1px solid ${theme}`, color: theme }}
        onSubmit={handleSubmit}
        className="sm:w-2/6 w-full bg-black/80 p-4 gap-2 rounded-xl justify-center items-center flex flex-col"
      >
        <div className="w-full flex justify-start items-center gap-2">
          <div
            onClick={() => router.replace("/")}
            className="flex items-center p-2 justify-center text-sm rounded-xl hover:bg-white duration-300 cursor-pointer   "
          >
            <ArrowLeft color={theme} size={20} /> Back
          </div>
        </div>
        <div className="w-full h-full flex flex-col gap-8 ">
          <label className="font-bold text-center">
            PLEASE ENTER YOUR EMAIL ADDRESS
          </label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button className="w-full">SEND RESET PASSWORD EMAIL</Button>
        </div>
      </form>
      <UserToasterClient />
    </div>
  );
}

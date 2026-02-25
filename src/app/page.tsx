import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();
  return (
    <div className="flex h-full items-start justify-center bg-zinc-50 font-sans dark:bg-black pt-10">
      {
        user
        &&
        <div className="bg-white text-black p-4 rounded-xl">
          <h1>{user?.firstName} {user?.lastName}</h1>
          <p>{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      }
      
    </div>
  );
}

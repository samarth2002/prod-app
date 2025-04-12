"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, Home, Gift, Share2 } from "lucide-react";

type Props = {};

function NavBar({}: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: "Home", icon: <Home size={20} />, path: "/" },
    { name: "Rewards", icon: <Gift size={20} />, path: "/rewards" },
    { name: "Shared", icon: <Share2 size={20} />, path: "/shared" },
  ];

  return (
    <div>
      <div
        className={`fixed top-0 left-0 h-full bg-[#374518] text-white z-50 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 shadow-lg`}
      >
        <div className="flex flex-col h-full py-4 px-6">
          <div className="mb-8 flex items-center gap-3">
            <Menu
              size={30}
              onClick={() => setIsSidebarOpen(false)}
              className="cursor-pointer"
            />
            <p className="text-2xl font-bold font-parisienne">TaskMaster</p>
          </div>

          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                router.push(item.path);
                setIsSidebarOpen(false);
              }}
              className="flex items-center gap-3 py-2 px-4 rounded-md hover:bg-[#8bab3f] transition text-left"
            >
              {item.icon}
              <span className="text-lg">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="fixed top-0 left-0 right-0 flex bg-[#8bab3f] w-full font-parisienne font-medium text-xl sm:text-3xl h-16 sm:h-20 shadow-md shadow-[#374518]/10 justify-center items-center text-white z-40 px-4 sm:px-0">
        <div
          className="absolute left-2 sm:left-6 cursor-pointer z-50"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu size={28} />
        </div>

        <div className="absolute left-12 sm:left-20 hidden sm:flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>

        <p className="text-center text-white">TaskMaster 5000</p>

        {session && status === "authenticated" && (
          <div className="absolute font-poppins text-sm sm:text-lg right-2 sm:right-20 flex flex-row gap-3 items-center max-w-[50%] sm:max-w-none">
            <p className="max-w-[80px] sm:block hidden text-white">
              {session?.user?.name}
            </p>
            <div className="hidden sm:block">
              <Image
                src={session?.user?.image || "/default-avatar.png"}
                className="rounded-full border border-black/50"
                alt="User Image"
                width={36}
                height={36}
              />
            </div>

            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white cursor-pointer px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NavBar;

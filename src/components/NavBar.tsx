import React from "react";
import Image from "next/image";

type Props = {

};

function NavBar({ }: Props) {
  return (
    <div className="absolute top-0 flex bg-[#8bab3f] w-full font-parisienne font-medium text-3xl h-20 shadow-md shadow-[#374518]/10 justify-center items-center text-white">
      <Image
        src="/logo.png" 
        className="absolute left-2 sm:left-20"
        alt="Logo"
        width={50}
        height={50}
      />
      <p>TaskMaster 5000</p>
    </div>
  );
}

export default NavBar;

"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import {useEffect} from "react"
import { useRouter, redirect } from "next/navigation";


export default function AuthButtons() {
  const { data: session, status } = useSession();
  const router = useRouter()

  useEffect(() => {
    if(session){
      router.push('/')
    }
  
  }, [session]);
  
  if(status==="loading"){
    return <></>
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="bg-white text-black border border-gray-300 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition"
    >
      Sign in with Google
    </button>
  );
}

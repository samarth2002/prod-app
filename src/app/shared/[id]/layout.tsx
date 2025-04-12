import NavBar from "@/components/NavBar";

export default function SharedLayout({
    children
}: {
    children: React.ReactNode
}){
    return (
      <div className="bg-[#c2d19f] h-dvh overflow-y-auto">
        <main>
          <NavBar />

          {children}
        </main>
      </div>
    );

}
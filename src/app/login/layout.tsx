export default function RewardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white h-dvh overflow-y-auto">
      <main>{children}</main>
    </div>
  );
}

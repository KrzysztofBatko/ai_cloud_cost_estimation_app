export default function PageContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-6">{children}</main>
  );
}

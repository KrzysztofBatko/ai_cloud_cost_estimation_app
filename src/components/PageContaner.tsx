type Props = {
  pageTitle?: string;
  pageDescription?: string;
  children: React.ReactNode;
};

export default function PageContainer({
  pageTitle,
  pageDescription,
  children,
}: Props) {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-6">
      {pageTitle && <h1>{pageTitle}</h1>}
      {pageDescription && <h3>{pageDescription}</h3>}
      <div>{children}</div>
    </main>
  );
}

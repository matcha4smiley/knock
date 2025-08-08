// src/app/knocks/[slug]/page.tsx
export default async function Knock({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main>
      <h1>{slug}</h1>
      <p>Hello from {slug}</p>
    </main>
  );
}

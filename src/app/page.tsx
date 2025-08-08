import Link from "next/link";

const apps = [
  {slug: "sample", title: "Sample", description: "最初の一本"}
];

export default function Page(){
  return (
    <main>
      <h1>Knock List</h1>
      <ul>
        {apps.map(a =>
          <li key={a.slug}>
            <Link href={`/knocks/${a.slug}`}>{a.title}</Link> - {a.description}
          </li>
        )}
      </ul>
    </main>
  );
}
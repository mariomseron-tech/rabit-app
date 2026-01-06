import Link from "next/link";

const features = [
  {
    title: "Modern Stack",
    description: "App Router, TypeScript, ESLint, Prettier, and Vitest configured from day one."
  },
  {
    title: "Developer Experience",
    description: "Pre-commit hooks keep quality high with linting and formatting checks."
  },
  {
    title: "Testing Ready",
    description: "React Testing Library and Vitest provide fast, reliable feedback loops."
  }
];

export default function HomePage() {
  return (
    <main className="hero">
      <h1>Welcome to Rabit Digital</h1>
      <p>
        Start building with the Next.js App Router foundation. Strict TypeScript settings and a
        curated toolchain keep the codebase clean, consistent, and easy to maintain.
      </p>
      <Link className="cta" href="https://nextjs.org/docs/app">
        Explore the App Router docs →
      </Link>
      <section className="grid" aria-label="Feature highlights">
        {features.map((feature) => (
          <article className="card" key={feature.title}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

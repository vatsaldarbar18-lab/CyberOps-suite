export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{description}</p>
      </div>
      {action}
    </header>
  );
}

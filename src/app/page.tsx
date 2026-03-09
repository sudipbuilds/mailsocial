export default function Home() {
  return (
    <main className="min-h-dvh">
      <section className="max-w-lg space-y-6 py-12 px-6 mx-auto">
        <div className="space-y-4 *:tracking-tight">
          <h1 className="text-3xl font-bold">The Anti-Social Social Network</h1>
          <p className="text-neutral-600 font-medium">
            Anti-Social lets you post and share notes, links or images by email subject only. From
            any email account.
          </p>
        </div>
        <button className="px-4 py-2 rounded-full bg-neutral-200/75 text-sm font-medium outline-none inline-flex items-center justify-center">
          Create account / $14.99
        </button>
      </section>
    </main>
  );
}

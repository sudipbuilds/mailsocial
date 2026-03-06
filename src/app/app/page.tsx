import { UsernameForm } from './components/username-form';

export default function Page() {
  return (
    <main className="min-h-dvh bg-neutral-50">
      <section className="px-6 py-32 md:py-36 xl:py-40 max-w-md mx-auto *:leading-tight *:tracking-tight">
        <UsernameForm />
      </section>
    </main>
  );
}

import { AuthForm } from "@/features/auth/components/auth-form";

function safeRedirect(value?: string | string[]): string {
  const redirect = Array.isArray(value) ? value[0] : value;
  return redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : "/practice";
}

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ redirect?: string | string[] }> }) {
  const params = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <AuthForm mode="signup" redirectTo={safeRedirect(params.redirect)} />
    </main>
  );
}

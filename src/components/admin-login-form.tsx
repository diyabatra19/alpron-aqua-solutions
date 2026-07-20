"use client";

import { useActionState } from "react";
import { LockKeyhole, LoaderCircle } from "lucide-react";
import { loginAction, type LoginState } from "@/app/admin/login/actions";
import { Button } from "@/components/ui";

const initialState: LoginState = { message: "" };

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return (
    <form action={action} className="grid gap-5">
      <div className="field">
        <label htmlFor="admin-email">Administrator email</label>
        <input id="admin-email" name="email" type="email" required autoComplete="username" />
      </div>
      <div className="field">
        <label htmlFor="admin-password">Password</label>
        <input id="admin-password" name="password" type="password" required minLength={12} autoComplete="current-password" />
      </div>
      {state.message ? <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{state.message}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <LockKeyhole className="size-4" aria-hidden="true" />}
        {pending ? "Signing in…" : "Sign in securely"}
      </Button>
    </form>
  );
}

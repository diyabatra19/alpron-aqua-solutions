import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/database.types";

loadEnvConfig(process.cwd());

function ask(question: string) {
  return new Promise<string>((resolve) => {
    process.stdout.write(question);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.once("data", (value) => resolve(String(value).trim()));
  });
}

function askHidden(question: string) {
  return new Promise<string>((resolve, reject) => {
    if (!process.stdin.isTTY) {
      reject(new Error("A secure interactive terminal is required."));
      return;
    }
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    let value = "";
    const onData = (chunk: string) => {
      if (chunk === "\u0003") process.exit(130);
      if (chunk === "\r" || chunk === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.off("data", onData);
        process.stdout.write("\n");
        resolve(value);
      } else if (chunk === "\u007f" || chunk === "\b") {
        value = value.slice(0, -1);
      } else {
        value += chunk;
      }
    };
    process.stdin.on("data", onData);
  });
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.",
    );
  }
  const email = (process.argv[2] || (await ask("Administrator email: "))).toLowerCase();
  const displayName = await ask("Display name (optional): ");
  const password = await askHidden("Password (hidden): ");
  const confirmPassword = await askHidden("Confirm password (hidden): ");
  if (password !== confirmPassword) throw new Error("Passwords do not match.");
  if (
    password.length < 12 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    throw new Error(
      "Use at least 12 characters including uppercase, lowercase, number and symbol.",
    );
  }

  const client = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(error?.message || "User creation failed.");
  const { error: profileError } = await client.from("admin_profiles").insert({
    user_id: data.user.id,
    role: "super_admin",
    display_name: displayName || null,
    is_active: true,
  });
  if (profileError) {
    await client.auth.admin.deleteUser(data.user.id);
    throw new Error(`Profile creation failed: ${profileError.message}`);
  }
  process.stdout.write(`Super administrator created for ${email}.\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Administrator creation failed."}\n`,
  );
  process.exitCode = 1;
});

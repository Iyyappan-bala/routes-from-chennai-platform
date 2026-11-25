"use server";

export async function smokeServerAction(formData: FormData): Promise<void> {
  const name = formData.get("name");
  console.log("[smoke-action] received:", name, "at", new Date().toISOString());
}

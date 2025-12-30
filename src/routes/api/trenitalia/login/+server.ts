import { json } from "@sveltejs/kit";

export async function POST({ request, fetch }) {
  const { username, password } = await request.json();

  const res = await fetch("https://www.lefrecce.it/PicoAuth/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName: username, password }),
  });

  const data = await res.json();
  return json(data);
}

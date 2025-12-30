import { json } from "@sveltejs/kit";

export async function POST({ request }) {
  const { token, resourceUrl } = await request.json();

  const res = await fetch(resourceUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const arrayBuffer = await res.arrayBuffer();
  const base64String = Buffer.from(arrayBuffer).toString("base64");

  return json({ data: `data:application/pdf;base64,${base64String}` });
}

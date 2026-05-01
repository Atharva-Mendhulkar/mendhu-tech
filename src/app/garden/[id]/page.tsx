import { redirect } from "next/navigation";

export default async function GardenRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Redirect to home with the garden parameter so the client-side logic can pick it up
  redirect(`/?garden=${id}`);
}

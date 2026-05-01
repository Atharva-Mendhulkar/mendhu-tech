import { redirect } from "next/navigation";

export default function GardenRedirect({ params }: { params: { id: string } }) {
  // Redirect to home with the garden parameter so the client-side logic can pick it up
  redirect(`/?garden=${params.id}`);
}

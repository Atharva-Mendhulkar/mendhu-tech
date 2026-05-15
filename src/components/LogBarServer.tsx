import React from "react";
import { getMediumPosts, MediumPost } from "@/lib/medium";
import LogBar from "./LogBar";

export default async function LogBarServer() {
  let blogPosts: MediumPost[] = [];
  try {
    const { posts } = await getMediumPosts();
    blogPosts = posts.slice(0, 3);
  } catch (err) {
    console.error("Failed to fetch Medium posts for LogBar:", err);
  }

  return <LogBar initialBlogPosts={blogPosts} />;
}

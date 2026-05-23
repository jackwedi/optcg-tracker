"use client";

import { useState } from "react";

export function LeaderForm() {
  const [name, setName] = useState("");
  const [colorA, setColorA] = useState("");
  const [colorB, setColorB] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [altImageUrl, setAltImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const colors = [colorA].concat(colorB ? [colorB] : []).filter(Boolean);
      const res = await fetch("/api/leaders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, colors, imageUrl, altImageUrl }),
      });

      if (!res.ok) throw new Error("Failed to create leader");
      setName("");
      setColorA("");
      setColorB("");
      setImageUrl("");
      setAltImageUrl("");
      // notify listeners (client-side) that leaders changed
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("leaders:changed"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-gray-50 p-4 rounded-md"
    >
      <h3 className="text-lg font-semibold">Add Leader</h3>

      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          className="mt-1 block w-full"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium">Color A</label>
          <input
            className="mt-1 block w-full"
            required
            value={colorA}
            onChange={(e) => setColorA(e.target.value)}
            placeholder="e.g., Red"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Color B (optional)
          </label>
          <input
            className="mt-1 block w-full"
            value={colorB}
            onChange={(e) => setColorB(e.target.value)}
            placeholder="e.g., Blue"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Image URL</label>
        <input
          className="mt-1 block w-full"
          required
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Alt Image URL (optional)
        </label>
        <input
          className="mt-1 block w-full"
          value={altImageUrl}
          onChange={(e) => setAltImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded-md"
      >
        {loading ? "Adding..." : "Add Leader"}
      </button>
    </form>
  );
}

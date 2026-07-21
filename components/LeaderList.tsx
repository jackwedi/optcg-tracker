"use client";

import { useEffect, useState } from "react";

interface Leader {
  id: string;
  name: string;
  colors: string[];
  imageUrl: string;
  altImageUrl?: string;
}

export function LeaderList() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaders = async () => {
    try {
      const res = await fetch("/api/leaders");
      const data = await res.json();
      setLeaders(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    fetch("/api/leaders")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setLeaders(data || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handler = () => fetchLeaders();
    window.addEventListener("leaders:changed", handler);
    return () => window.removeEventListener("leaders:changed", handler);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this leader?")) return;
    try {
      const res = await fetch(`/api/leaders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setLeaders((l) => l.filter((x) => x.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    }
  };

  if (loading) return <p>Loading leaders...</p>;

  return (
    <div className="space-y-3">
      {leaders.map((l) => (
        <div
          key={l.id}
          className="flex items-center gap-4 p-3 border rounded-md"
        >
          <img
            src={l.imageUrl}
            alt={l.name}
            className="w-20 h-28 object-cover rounded-sm"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{l.name}</h4>
              <div className="text-sm text-gray-600">
                {l.colors.join(" / ")}
              </div>
            </div>
            {l.altImageUrl && (
              <p className="text-sm text-gray-500 mt-1">
                Alt:{" "}
                <a
                  href={l.altImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600"
                >
                  view
                </a>
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <button onClick={() => handleDelete(l.id)} className="text-red-600">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface Suggestion {
  display_name: string;
  place_id: number;
}

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export default function AddressAutocomplete({
  label = "Delivery Address",
  value,
  onChange,
  error,
  placeholder = "Search for your address…",
}: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value changes (e.g. clearing the field)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleInput(text: string) {
    setQuery(text);
    onChange(text);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: `${text}, Nepal`,
          format: "json",
          countrycodes: "np",
          limit: "6",
          addressdetails: "0",
        });
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          { headers: { "Accept-Language": "en" } }
        );
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 600); // 600ms debounce — well within 1 req/sec limit
  }

  function select(suggestion: Suggestion) {
    const address = suggestion.display_name;
    setQuery(address);
    onChange(address);
    setSuggestions([]);
    setOpen(false);
  }

  const showDropdown = open && (loading || suggestions.length > 0);

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-text">{label}</label>
      )}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-md border bg-bg pl-3.5 pr-10 py-2.5 text-sm text-text placeholder:text-text-disabled",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1",
            error
              ? "border-error focus:ring-error"
              : "border-border hover:border-border-strong"
          )}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading
            ? <Loader size={15} className="animate-spin text-text-disabled" />
            : <MapPin size={15} className="text-text-disabled" />}
        </div>

        {showDropdown && (
          <ul className="absolute z-50 mt-1 w-full bg-bg border border-border rounded-lg shadow-lg overflow-hidden">
            {loading && suggestions.length === 0 && (
              <li className="px-3.5 py-2.5 text-sm text-text-muted">Searching…</li>
            )}
            {suggestions.map((s) => (
              <li
                key={s.place_id}
                onMouseDown={() => select(s)}
                className="px-3.5 py-2.5 text-sm text-text cursor-pointer hover:bg-bg-subtle transition-colors flex items-start gap-2"
              >
                <MapPin size={13} className="text-text-disabled shrink-0 mt-0.5" />
                <span className="line-clamp-2">{s.display_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      <p className="text-xs text-text-disabled">
        Powered by{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-text-muted"
        >
          OpenStreetMap
        </a>
      </p>
    </div>
  );
}

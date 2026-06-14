"use client";

import { useRef, useState } from "react";

const MAX = 8 * 1024 * 1024; // 8MB total

export function FileDrop({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const total = files.reduce((s, f) => s + f.size, 0);

  const add = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push(f);
    }
    onChange(next);
  };
  const remove = (i: number) => onChange(files.filter((_, idx) => idx !== i));

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          add(e.dataTransfer.files);
        }}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          over ? "border-[#0D7A7A] bg-[#0D7A7A]/[0.04]" : "border-black/15 hover:border-black/30"
        }`}
      >
        <p className="text-sm text-black/60">
          Drop logo, brand assets or inspiration here, or{" "}
          <span className="text-[#0D7A7A] underline">browse</span>
        </p>
        <p className="mt-1 text-xs text-black/35">PNG, SVG, PDF, JPG… up to 8MB total</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => add(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between rounded-lg border border-black/10 px-3 py-2 text-sm"
            >
              <span className="truncate text-black/70">
                {f.name}{" "}
                <span className="text-black/35">({(f.size / 1024).toFixed(0)} KB)</span>
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove ${f.name}`}
                className="ml-3 text-black/40 hover:text-black"
              >
                ✕
              </button>
            </li>
          ))}
          <li className={`text-xs ${total > MAX ? "text-red-600" : "text-black/40"}`}>
            Total: {(total / 1024 / 1024).toFixed(1)}MB
            {total > MAX && " — over 8MB. Remove some, or paste a link in the notes instead."}
          </li>
        </ul>
      )}
    </div>
  );
}

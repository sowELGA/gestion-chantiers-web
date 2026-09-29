import { useState, useEffect, useRef } from "react";

export default function PosteAutocomplete({
  options,
  value,
  onChange,
  placeholder = "Rechercher un poste...",
  disabled = false,
  emptyMessage = "Aucun poste trouvé",
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selected = options.find((o) => String(o.id) === String(value));

  useEffect(() => {
    setQuery(selected ? selected.libelle : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery(selected ? selected.libelle : "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selected]);

  const filtered = options.filter((o) =>
    o.libelle.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (option) => {
    onChange(String(option.id));
    setQuery(option.libelle);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (value) onChange("");
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50 disabled:text-slate-400"
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            &times;
          </button>
        )}
      </div>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-400">{emptyMessage}</p>
          ) : (
            filtered.map((o) => (
              <button
                type="button"
                key={o.id}
                onClick={() => handleSelect(o)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
              >
                {o.libelle}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

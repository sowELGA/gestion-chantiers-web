import { useState, useRef, useEffect } from "react";

export default function Dropdown({ trigger, children, align = "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {trigger(() => setOpen(!open), open)}
      {open && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 overflow-hidden`}
        >
          {typeof children === "function"
            ? children(() => setOpen(false))
            : children}
        </div>
      )}
    </div>
  );
}

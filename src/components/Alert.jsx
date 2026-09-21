import { useEffect, useState } from "react";

const VARIANTS = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-700",
  error: "bg-red-50 border-red-200 text-red-600",
};

const ICONS = {
  success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
};

export default function Alert({
  type = "success",
  children,
  autoDismiss = true,
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!autoDismiss) return;
    const timer = setTimeout(() => setShow(false), 4000);
    return () => clearTimeout(timer);
  }, [autoDismiss]);

  if (!show) return null;

  return (
    <div
      className={`flex items-center gap-3 border rounded-xl px-4 py-3 text-sm ${VARIANTS[type]}`}
    >
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={ICONS[type]}
        />
      </svg>
      {children}
    </div>
  );
}

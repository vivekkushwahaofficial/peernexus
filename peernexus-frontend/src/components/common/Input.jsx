import React from "react";

export function Input({
  label,
  name,
  type = "text",
  error,
  placeholder,
  value,
  onChange,
  className = "",
  rows = 3,
  options = [], // for select type
  ...props
}) {
  const inputClass = `w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/30 outline-none transition-all duration-200 focus:ring-4 ${
    error
      ? "border-error focus:border-error focus:ring-error/10"
      : "border-ink/10 focus:border-accent focus:ring-accent/10"
  }`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="text-[11px] font-bold text-ink/50 uppercase tracking-wider pl-1">
          {label}
        </label>
      )}

      <div className="relative w-full">
        {type === "textarea" ? (
          <textarea
            id={name}
            name={name}
            rows={rows}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`${inputClass} resize-none`}
            {...props}
          />
        ) : type === "select" ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%252310151A%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1rem_1rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={inputClass}
            {...props}
          />
        )}
      </div>

      {error && (
        <span className="text-xs font-semibold text-error pl-1 animate-slide-up">
          {error}
        </span>
      )}
    </div>
  );
}
export default Input;

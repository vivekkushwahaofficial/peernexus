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
  const inputClass = `w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 outline-none transition focus:ring-2 ${
    error
      ? "border-ember focus:border-ember focus:ring-ember/20"
      : "border-ink/15 focus:border-accent focus:ring-accent/20"
  }`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-semibold text-ink/75 uppercase tracking-wider">
          {label}
        </label>
      )}

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
          className={inputClass}
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

      {error && <span className="text-xs font-medium text-ember">{error}</span>}
    </div>
  );
}
export default Input;

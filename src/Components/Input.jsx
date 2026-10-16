import { useId } from "react";
export default function Input({ label, id, ...props }) {
  const generated = useId();
  const inputId = id || generated;
  return (
    <div className="input-group">
      {label && <label htmlFor={inputId}>{label}</label>}
      <input id={inputId} {...props} />
    </div>
  );
}

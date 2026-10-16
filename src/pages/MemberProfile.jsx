import { useState } from "react";
import useAuth from "../Components/useAuth";
import Input from "../Components/Input";
export default function MemberProfile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ ...user }),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await updateProfile(form);
      setMessage("Profile updated successfully.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="form-card">
      <h2>Member profile</h2>
      <form onSubmit={save}>
        <Input label="Member ID" value={user.id} readOnly />
        {["name", "email", "phone"].map((key) => (
          <Input
            key={key}
            label={key}
            type={key === "email" ? "email" : "text"}
            pattern={key === "phone" ? "[0-9]{10}" : undefined}
            required
            value={form[key] || ""}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        ))}
        <button disabled={busy}>Save profile</button>
      </form>
      {message && <p role="status">{message}</p>}
    </section>
  );
}

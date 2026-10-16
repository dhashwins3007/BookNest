import { api } from "../services/client";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../Components/useAuth";
import Input from "../Components/Input";
export default function Login() {
  const { login } = useAuth(),
    navigate = useNavigate(),
    location = useLocation();
  const [signup, setSignup] = useState(false),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [phone, setPhone] = useState(""),
    [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (
      !signup &&
      (!/^(LIB\d+|[^\s@]+@[^\s@]+\.[^\s@]+)$/i.test(username.trim()) ||
        password.length < 6)
    ) {
      setError(
        "Enter a valid member ID/email and a password of at least 6 characters.",
      );
      return;
    }
    if (signup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      if (signup) {
        await api.post("/auth/signup", {
          name: name.trim(),
          email: email.trim(),
          phone,
          password,
        });
      }
      await login(signup ? email.trim() : username.trim(), password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <section className="form-card">
      <h2>Book Nest</h2>
      <h1>{signup ? "Register" : "Login"}</h1>
      <div className="auth-tabs">
        <button
          type="button"
          className={!signup ? "" : "secondary"}
          disabled={loading}
          onClick={() => {
            setPassword("");
            setConfirmPassword("");
            setSignup(false);
            setError("");
          }}
        >
          Login
        </button>
        <button
          type="button"
          className={signup ? "" : "secondary"}
          disabled={loading}
          onClick={() => {
            setPassword("");
            setConfirmPassword("");
            setSignup(true);
            setError("");
          }}
        >
          Register
        </button>
      </div>
      <form onSubmit={submit}>
        {signup ? (
          <>
            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Phone"
              value={phone}
              type="tel"
              maxLength={10}
              autoComplete="tel"
              pattern="[0-9]{10}"
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </>
        ) : (
          <Input
            label="Member ID or email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        )}
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={signup ? 8 : 6}
          pattern={
            signup ? "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}" : undefined
          }
          title={
            signup
              ? "Use 8+ characters with uppercase, lowercase and a number."
              : undefined
          }
          autoComplete={signup ? "new-password" : "current-password"}
          required
        />
        {signup && (
          <Input
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button disabled={loading}>
          {loading ? "Please wait…" : signup ? "Register" : "Login"}
        </button>
      </form>
    </section>
  );
}

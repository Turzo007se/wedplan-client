"use client";

import { useEffect, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

export function ChangePassword() {
  const [eligible, setEligible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    authClient.listAccounts().then(({ data }) => {
      if (active) setEligible(data?.some((account) => account.providerId === "credential") ?? false);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setSuccess(false);
    setError("");
    if (newPassword !== confirmation) {
      setError("The new passwords must match.");
      return;
    }

    setBusy(true);
    try {
      const result = await authClient.changePassword({ currentPassword, newPassword });
      if (result.error) throw new Error(result.error.message || "Password change failed.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
      setSuccess(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Password change failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!eligible) return null;

  return (
    <section className="space-y-3 border-t border-line pt-6">
      <h3 className="font-serif text-lg font-bold text-ink">Change password</h3>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="current-password" className="block text-sm font-medium text-ink">Current password</label>
          <PasswordInput id="current-password" autoComplete="current-password" value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)} disabled={busy} required />
        </div>
        <div className="space-y-1">
          <label htmlFor="new-password" className="block text-sm font-medium text-ink">New password</label>
          <PasswordInput id="new-password" autoComplete="new-password" aria-describedby="new-password-rules"
            value={newPassword} onChange={(event) => setNewPassword(event.target.value)} disabled={busy} required />
          <p id="new-password-rules" className="text-xs text-muted">Use at least six characters, including an uppercase and a lowercase letter.</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="confirm-password" className="block text-sm font-medium text-ink">Confirm new password</label>
          <PasswordInput id="confirm-password" autoComplete="new-password" value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)} disabled={busy} required />
        </div>
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        {success && <p className="text-sm text-success" role="status">Password updated.</p>}
        <Button type="submit" disabled={busy}>{busy ? "Changing password?" : "Change password"}</Button>
      </form>
    </section>
  );
}

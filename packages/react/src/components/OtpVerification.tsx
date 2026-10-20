import { useEffect, useState } from "react";
import { PinInput } from "./PinInput.tsx";
import { Button } from "./Button.tsx";
import { Icons } from "../internal/icons.tsx";

export type OtpVerificationProps = {
  length?: 4 | 6 | 8;
  deliveryTarget?: string;
  onVerify: (code: string) => boolean | Promise<boolean>;
  onResend?: () => void | Promise<void>;
  resendCooldown?: number;
  label?: string;
  autoSubmit?: boolean;
};

/**
 * Complete OTP / verification flow assembly with PIN input, live resend cooldown timer,
 * delivery destination, stale error clearance, and accessible status announcements.
 */
export function OtpVerification({
  length = 6,
  deliveryTarget,
  onVerify,
  onResend,
  resendCooldown = 30,
  label = "Verification code",
  autoSubmit = true,
}: OtpVerificationProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(resendCooldown);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleComplete = async (enteredCode: string) => {
    setError(null);
    if (!autoSubmit) return;
    setVerifying(true);
    try {
      const ok = await onVerify(enteredCode);
      setVerifying(false);
      if (ok === false) {
        setError("Invalid code. Please check and try again.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setVerifying(false);
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
    }
  };

  const handleManualSubmit = () => {
    if (code.length === length) {
      handleComplete(code);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !onResend) return;
    setResending(true);
    setError(null);
    try {
      await onResend();
      setResending(false);
      setCooldown(resendCooldown);
      setCode("");
    } catch (err) {
      setResending(false);
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    }
  };

  const handleCodeChange = (val: string) => {
    setCode(val);
    if (error) setError(null);
  };

  return (
    <div className="orlo-otp-flow" role="region" aria-label={label}>
      <div className="orlo-otp-flow__header">
        <h3 className="orlo-otp-flow__title">{label}</h3>
        {deliveryTarget && (
          <p className="orlo-hint orlo-otp-flow__desc">
            We sent a {length}-digit code to <strong>{deliveryTarget}</strong>
          </p>
        )}
      </div>

      <div className="orlo-otp-flow__input-row">
        <PinInput
          label={label}
          length={length}
          value={code}
          onValueChange={handleCodeChange}
          onComplete={handleComplete}
          disabled={verifying || success}
          error={error}
        />
      </div>

      {error && (
        <div className="orlo-otp-flow__error" role="alert">
          <Icons.AlertCircle size={14} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="orlo-otp-flow__success" role="status">
          <Icons.CheckCircle size={14} aria-hidden="true" />
          <span>Code verified successfully.</span>
        </div>
      )}

      <div className="orlo-otp-flow__footer">
        {!autoSubmit && (
          <Button
            variant="accent"
            fullWidth
            onClick={handleManualSubmit}
            loading={verifying}
            disabled={code.length !== length || success}
          >
            Verify code
          </Button>
        )}

        {onResend && (
          <div className="orlo-otp-flow__resend">
            <span className="orlo-hint">Didn’t receive a code?</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={cooldown > 0 || resending || verifying || success}
              loading={resending}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOrloMotion } from "@orlo/motion";
import { Button } from "./Button.tsx";
import { Icons } from "../internal/icons.tsx";

export type WizardStep<T = Record<string, unknown>> = {
  id: string;
  title: string;
  description?: string;
  content: (props: {
    data: T;
    updateData: (partial: Partial<T>) => void;
    errors: Record<string, string>;
  }) => ReactNode;
  validate?: (data: T) => boolean | Record<string, string> | Promise<boolean | Record<string, string>>;
};

export type WizardProps<T = Record<string, unknown>> = {
  steps: WizardStep<T>[];
  initialData?: T;
  onComplete: (data: T) => void | Promise<void>;
  onCancel?: () => void;
  title?: string;
};

/**
 * Multistep form wizard with typed step schema, progress indicator, per-step validation,
 * back/next navigation, draft state, async submit/retry, and an accessible error summary.
 */
export function Wizard<T extends Record<string, unknown>>({
  steps,
  initialData = {} as T,
  onComplete,
  onCancel,
  title,
}: WizardProps<T>) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { transition, distance } = useOrloMotion();
  const id = useId();

  const step = steps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  const updateData = (partial: Partial<T>) => {
    setData((prev) => ({ ...prev, ...partial }));
    setErrors({});
    setSubmitError(null);
  };

  const handleNext = async () => {
    if (!step) return;
    setSubmitError(null);

    if (step.validate) {
      setLoading(true);
      try {
        const result = await step.validate(data);
        setLoading(false);
        if (typeof result === "object" && Object.keys(result).length > 0) {
          setErrors(result);
          return;
        }
        if (result === false) {
          setErrors({ _form: "Please complete the required fields correctly." });
          return;
        }
      } catch (err) {
        setLoading(false);
        setErrors({ _form: err instanceof Error ? err.message : "Validation failed." });
        return;
      }
    }

    if (isLast) {
      setLoading(true);
      try {
        await onComplete(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setSubmitError(err instanceof Error ? err.message : "Failed to complete step. Please try again.");
      }
    } else {
      setErrors({});
      setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
    }
  };

  const handleBack = () => {
    setErrors({});
    setSubmitError(null);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="orlo-wizard" role="region" aria-label={title ?? "Form wizard"}>
      {title && <h2 className="orlo-wizard__heading">{title}</h2>}

      {/* Progress track */}
      <nav aria-label="Wizard steps" className="orlo-wizard__nav">
        <ol className="orlo-wizard__steplist">
          {steps.map((s, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <li
                key={s.id}
                className="orlo-wizard__step"
                data-state={isCurrent ? "current" : isCompleted ? "completed" : "upcoming"}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span className="orlo-wizard__badge">
                  {isCompleted ? <Icons.Check size={14} aria-hidden="true" /> : index + 1}
                </span>
                <span className="orlo-wizard__steptext">
                  <span className="orlo-wizard__steptitle">{s.title}</span>
                  {s.description && <span className="orlo-hint">{s.description}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Error summary */}
      {(errors._form || submitError) && (
        <div className="orlo-wizard__error" role="alert">
          <Icons.AlertCircle size={16} aria-hidden="true" />
          <span>{errors._form || submitError}</span>
        </div>
      )}

      {/* Step Content */}
      <div className="orlo-wizard__body">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: distance(12) }}
            animate={{ opacity: 1, x: 0, transition: transition("fade") }}
            exit={{ opacity: 0, x: -distance(12), transition: transition("dismiss") }}
            className="orlo-wizard__content"
          >
            {step.content({ data, updateData, errors })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="orlo-wizard__footer">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <div style={{ flex: 1 }} />
        {!isFirst && (
          <Button variant="subtle" onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        <Button variant="accent" onClick={handleNext} loading={loading}>
          {isLast ? "Complete" : "Next"}
        </Button>
      </div>
    </div>
  );
}

import { useId, useState } from "react";
import { useControllable } from "../internal/hooks.ts";
import { Button } from "./Button.tsx";
import { Icons } from "../internal/icons.tsx";

export type FilterFieldType = "text" | "number" | "select";

export type FilterField = {
  id: string;
  label: string;
  type?: FilterFieldType;
  options?: { label: string; value: string }[];
};

export type FilterOperator = "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan";

export type FilterRule = {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string;
};

export type FilterGroup = {
  conjunction: "and" | "or";
  rules: FilterRule[];
};

export type FilterBuilderProps = {
  fields: FilterField[];
  value?: FilterGroup;
  defaultValue?: FilterGroup;
  onValueChange?: (group: FilterGroup) => void;
  label?: string;
};

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: "is",
  notEquals: "is not",
  contains: "contains",
  greaterThan: "is greater than",
  lessThan: "is less than",
};

/**
 * Multi-condition filter builder with typed field/operator rules, AND/OR conjunction toggles,
 * summary chip preview, and full keyboard accessibility.
 */
export function FilterBuilder({
  fields,
  value: v,
  defaultValue = { conjunction: "and", rules: [] },
  onValueChange,
  label = "Filter rules",
}: FilterBuilderProps) {
  const [filter, setFilter] = useControllable<FilterGroup>(v, defaultValue, onValueChange);
  const id = useId();

  const addRule = () => {
    const firstField = fields[0]?.id ?? "status";
    const newRule: FilterRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      field: firstField,
      operator: "equals",
      value: "",
    };
    setFilter({
      ...filter,
      rules: [...filter.rules, newRule],
    });
  };

  const removeRule = (ruleId: string) => {
    setFilter({
      ...filter,
      rules: filter.rules.filter((r) => r.id !== ruleId),
    });
  };

  const updateRule = (ruleId: string, updates: Partial<FilterRule>) => {
    setFilter({
      ...filter,
      rules: filter.rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)),
    });
  };

  const toggleConjunction = () => {
    setFilter({
      ...filter,
      conjunction: filter.conjunction === "and" ? "or" : "and",
    });
  };

  const clearAll = () => {
    setFilter({
      ...filter,
      rules: [],
    });
  };

  return (
    <div className="orlo-filter-builder" role="region" aria-label={label}>
      <div className="orlo-filter-builder__head">
        <span className="orlo-field__label">{label}</span>
        {filter.rules.length > 0 && (
          <div className="orlo-filter-builder__actions">
            <button
              type="button"
              className="orlo-button orlo-filter-builder__conj"
              data-variant="subtle"
              data-size="sm"
              onClick={toggleConjunction}
              aria-label={`Match ${filter.conjunction === "and" ? "ALL (AND)" : "ANY (OR)"}. Click to toggle.`}
            >
              Match: <strong>{filter.conjunction.toUpperCase()}</strong>
            </button>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {filter.rules.length === 0 ? (
        <div className="orlo-filter-builder__empty">
          <p className="orlo-hint" style={{ margin: 0 }}>
            No active filters. Add a condition to refine results.
          </p>
          <Button variant="accent" size="sm" start={<Icons.Plus size={14} />} onClick={addRule}>
            Add condition
          </Button>
        </div>
      ) : (
        <div className="orlo-filter-builder__list">
          {filter.rules.map((rule, idx) => {
            const fieldDef = fields.find((f) => f.id === rule.field) ?? fields[0];
            return (
              <div key={rule.id} className="orlo-filter-builder__row">
                <span className="orlo-filter-builder__badge" aria-hidden="true">
                  {idx === 0 ? "Where" : filter.conjunction}
                </span>

                {/* Field select */}
                <select
                  aria-label="Filter field"
                  className="orlo-field__input orlo-filter-builder__select"
                  value={rule.field}
                  onChange={(e) => updateRule(rule.id, { field: e.target.value, value: "" })}
                >
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>

                {/* Operator select */}
                <select
                  aria-label="Filter operator"
                  className="orlo-field__input orlo-filter-builder__select"
                  value={rule.operator}
                  onChange={(e) => updateRule(rule.id, { operator: e.target.value as FilterOperator })}
                >
                  {Object.entries(OPERATOR_LABELS).map(([op, text]) => (
                    <option key={op} value={op}>
                      {text}
                    </option>
                  ))}
                </select>

                {/* Value input or select */}
                {fieldDef?.options ? (
                  <select
                    aria-label="Filter value"
                    className="orlo-field__input orlo-filter-builder__val"
                    value={rule.value}
                    onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                  >
                    <option value="">Select an option…</option>
                    {fieldDef.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    aria-label="Filter value"
                    type={fieldDef?.type === "number" ? "number" : "text"}
                    className="orlo-field__input orlo-filter-builder__val"
                    placeholder="Enter value…"
                    value={rule.value}
                    onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                  />
                )}

                <button
                  type="button"
                  className="orlo-icon-button"
                  data-variant="ghost"
                  data-size="sm"
                  aria-label="Remove condition"
                  onClick={() => removeRule(rule.id)}
                >
                  <Icons.X size={16} />
                </button>
              </div>
            );
          })}

          <div className="orlo-filter-builder__foot">
            <Button variant="subtle" size="sm" start={<Icons.Plus size={14} />} onClick={addRule}>
              Add condition
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

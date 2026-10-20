import { Fragment, useId, type ReactNode } from "react";
import { Button } from "./Button.tsx";
import { Badge } from "./Badge.tsx";
import { Icons } from "../internal/icons.tsx";

export type FeatureMatrixTier = {
  id: string;
  title: string;
  price?: string;
  period?: string;
  description?: string;
  highlighted?: boolean;
  badge?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "solid" | "accent" | "subtle";
  };
};

export type FeatureMatrixRow = {
  id?: string;
  title: string;
  description?: string;
  category?: string;
  values: Record<string, boolean | string | ReactNode>;
};

export type FeatureMatrixProps = {
  tiers: FeatureMatrixTier[];
  rows: FeatureMatrixRow[];
  caption?: string;
};

/**
 * Feature comparison matrix and pricing table with semantic landmarks,
 * highlighted tiers, category grouping, and accessible check/dash indications.
 */
export function FeatureMatrix({ tiers, rows, caption = "Feature comparison" }: FeatureMatrixProps) {
  const id = useId();

  // Group rows by category
  const categories: { category: string; items: FeatureMatrixRow[] }[] = [];
  rows.forEach((row) => {
    const catName = row.category ?? "";
    let cat = categories.find((c) => c.category === catName);
    if (!cat) {
      cat = { category: catName, items: [] };
      categories.push(cat);
    }
    cat.items.push(row);
  });

  return (
    <div className="orlo-fmatrix-wrap">
      <table className="orlo-fmatrix" aria-labelledby={id}>
        <caption id={id} className="orlo-visually-hidden">
          {caption}
        </caption>
        <thead>
          <tr>
            <th scope="col" className="orlo-fmatrix__lead-th">
              <span className="orlo-visually-hidden">Features</span>
            </th>
            {tiers.map((t) => (
              <th
                key={t.id}
                scope="col"
                className="orlo-fmatrix__th"
                data-highlighted={t.highlighted || undefined}
              >
                <div className="orlo-fmatrix__tier-head">
                  <div className="orlo-fmatrix__tier-title-row">
                    <strong className="orlo-fmatrix__tier-title">{t.title}</strong>
                    {t.badge && <Badge tone={t.highlighted ? "accent" : "neutral"}>{t.badge}</Badge>}
                  </div>
                  {t.description && <p className="orlo-hint orlo-fmatrix__tier-desc">{t.description}</p>}
                  {t.price && (
                    <div className="orlo-fmatrix__price-row">
                      <span className="orlo-fmatrix__price">{t.price}</span>
                      {t.period && <span className="orlo-hint">{t.period}</span>}
                    </div>
                  )}
                  {t.action && (
                    <Button
                      variant={t.action.variant ?? (t.highlighted ? "accent" : "subtle")}
                      fullWidth
                      size="sm"
                      onClick={t.action.onClick}
                    >
                      {t.action.label}
                    </Button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, catIdx) => (
            <Fragment key={`cat-grp-${catIdx}`}>
              {cat.category && (
                <tr key={`cat-${catIdx}`} className="orlo-fmatrix__cat-row">
                  <th
                    colSpan={tiers.length + 1}
                    scope="colgroup"
                    className="orlo-fmatrix__cat-th"
                  >
                    {cat.category}
                  </th>
                </tr>
              )}
              {cat.items.map((row, rIdx) => (
                <tr key={row.id ?? `r-${catIdx}-${rIdx}`} className="orlo-fmatrix__row">
                  <th scope="row" className="orlo-fmatrix__feature-th">
                    <span className="orlo-fmatrix__feature-title">{row.title}</span>
                    {row.description && <span className="orlo-hint">{row.description}</span>}
                  </th>
                  {tiers.map((t) => {
                    const val = row.values[t.id];
                    return (
                      <td
                        key={t.id}
                        className="orlo-fmatrix__td"
                        data-highlighted={t.highlighted || undefined}
                      >
                        {typeof val === "boolean" ? (
                          val ? (
                            <span className="orlo-fmatrix__check" aria-label={`Included in ${t.title}`}>
                              <Icons.Check size={16} aria-hidden="true" />
                            </span>
                          ) : (
                            <span className="orlo-fmatrix__dash" aria-label={`Not included in ${t.title}`}>
                              –
                            </span>
                          )
                        ) : (
                          <span className="orlo-fmatrix__text-val">{val ?? "–"}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

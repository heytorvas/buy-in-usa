interface DonutChartProps {
  productPct: number; // 0-1
}

/** Simple conic-gradient donut for the product vs taxes split. */
export function DonutChart({ productPct }: DonutChartProps) {
  const pct = Math.max(0, Math.min(1, productPct)) * 100;
  return (
    <div className="w-24 h-24 relative">
      <div
        className="w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: `conic-gradient(hsl(var(--primary)) 0% ${pct}%, hsl(var(--secondary-light)) ${pct}% 100%)`,
        }}
        role="img"
        aria-label={`Produto representa ${pct.toFixed(0)}% do custo total`}
      >
        <div className="w-[70%] h-[70%] rounded-full bg-background" />
      </div>
    </div>
  );
}

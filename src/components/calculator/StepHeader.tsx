interface StepHeaderProps {
  number: number;
  title: string;
  variant?: "primary" | "sage";
}

export function StepHeader({ number, title, variant = "primary" }: StepHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`step-number ${variant === "sage" ? "step-number-sage" : ""}`}>
        {number}
      </div>
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
    </div>
  );
}

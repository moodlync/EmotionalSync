import { cn } from "@/lib/utils";

interface PageHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface PageHeaderHeadingProps {
  className?: string;
  children: React.ReactNode;
}

interface PageHeaderDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function PageHeader({
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {children}
    </div>
  );
}

export function PageHeaderHeading({
  className,
  children,
  ...props
}: PageHeaderHeadingProps) {
  return (
    <h1
      className={cn(
        "text-3xl font-bold tracking-tight md:text-4xl",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function PageHeaderDescription({
  className,
  children,
  ...props
}: PageHeaderDescriptionProps) {
  return (
    <p
      className={cn("text-lg text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}
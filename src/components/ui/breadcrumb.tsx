import type { HTMLAttributes, LiHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Breadcrumb({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <nav aria-label="breadcrumb" className={cn("text-sm font-medium", className)} {...props} />;
}

export function BreadcrumbList({ className, ...props }: HTMLAttributes<HTMLOListElement>) {
  return <ol className={cn("flex flex-wrap items-center gap-2 text-muted-foreground", className)} {...props} />;
}

export function BreadcrumbItem({ className, ...props }: LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn("inline-flex items-center gap-1", className)} {...props} />;
}

export function BreadcrumbSeparator({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("text-muted-foreground/80", className)} {...props} />;
}

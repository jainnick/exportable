import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";

export function HeaderNav() {
  const linkBase =
    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent";
  return (
    <nav className="flex items-center gap-1">
      <Link
        to="/workspace"
        className={linkBase}
        activeProps={{ className: `${linkBase} bg-accent text-foreground` }}
        inactiveProps={{ className: `${linkBase} text-muted-foreground` }}
      >
        Workspace
      </Link>
      <Link
        to="/proof-of-work"
        className={linkBase}
        activeProps={{ className: `${linkBase} bg-accent text-foreground` }}
        inactiveProps={{ className: `${linkBase} text-muted-foreground` }}
      >
        <span className="inline-flex items-center gap-2">
          Proof of Work
          <Badge className="bg-success/15 text-success border-success/30 border text-[10px] px-1.5 py-0">
            79 PDFs
          </Badge>
        </span>
      </Link>
    </nav>
  );
}

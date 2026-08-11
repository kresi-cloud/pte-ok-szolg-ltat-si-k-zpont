import { Link, useRouterState } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  Bell,
  Building2,
  ClipboardList,
  GaugeCircle,
  Grid2x2,
  Home,
  LayoutList,
  LifeBuoy,
  LogOut,
  Laptop,
  Plus,
  Rocket,
  Search,
  Settings2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { lookup, useStore, USERS } from "@/lib/store";
import { ROLE_LABELS, type RoleKey } from "@/lib/types";
import { LoginScreen } from "@/components/login-screen";
import { GlobalSearch } from "@/components/global-search";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  roles: RoleKey[];
}

const NAV: NavItem[] = [
  { to: "/", label: "Kezdőlap", icon: Home, roles: ["igenylo", "jovahagyo", "ugyintezo", "szolgaltatasgazda", "vezeto", "admin"] },
  { to: "/uj-igeny", label: "Új igény", icon: Plus, roles: ["igenylo", "jovahagyo", "ugyintezo", "szolgaltatasgazda", "vezeto", "admin"] },
  { to: "/igenyeim", label: "Igényeim", icon: ClipboardList, roles: ["igenylo", "jovahagyo", "ugyintezo", "szolgaltatasgazda", "vezeto", "admin"] },
  { to: "/leltar", label: "Személyi leltár", icon: Laptop, roles: ["igenylo", "jovahagyo", "ugyintezo", "szolgaltatasgazda", "vezeto", "admin"] },
  { to: "/szolgaltatasok", label: "Szolgáltatások", icon: LayoutList, roles: ["igenylo", "jovahagyo", "ugyintezo", "szolgaltatasgazda", "vezeto", "admin"] },
  { to: "/fejlesztesek", label: "Fejlesztések", icon: Rocket, roles: ["igenylo", "jovahagyo", "ugyintezo", "szolgaltatasgazda", "vezeto", "admin"] },
  { to: "/munkater", label: "Szolgáltatási munkatér", icon: Grid2x2, roles: ["ugyintezo", "szolgaltatasgazda", "admin"] },
  { to: "/portfolio", label: "Fejlesztési portfólió", icon: Building2, roles: ["ugyintezo", "szolgaltatasgazda", "vezeto", "admin"] },
  { to: "/vezetoi-attekintes", label: "Vezetői áttekintés", icon: GaugeCircle, roles: ["vezeto", "szolgaltatasgazda", "admin"] },
  { to: "/felelossegek", label: "Szolgáltatások és felelősségek", icon: ShieldCheck, roles: ["szolgaltatasgazda", "admin"] },
  { to: "/adminisztracio", label: "Adminisztráció", icon: Settings2, roles: ["admin"] },
  { to: "/segitseg", label: "Segítség", icon: LifeBuoy, roles: ["igenylo", "jovahagyo", "ugyintezo", "szolgaltatasgazda", "vezeto", "admin"] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const store = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [searchOpen, setSearchOpen] = useState(false);

  const items = useMemo(
    () => NAV.filter((n) => n.roles.includes(store.activeRole)),
    [store.activeRole],
  );

  if (!store.loggedIn) return <LoginScreen />;

  const unread = store.notifications.filter((n) => !n.read).length;
  const user = store.currentUser;

  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#fotartalom"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Ugrás a tartalomhoz
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md bg-primary font-display text-sm font-bold text-primary-foreground">
              ÁOK
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block font-display text-sm font-semibold">
                ÁOK Digitális Szolgáltatási Portál
              </span>
              <span className="block text-xs text-muted-foreground">
                Digitális és informatikai igények egy helyen
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden w-72 items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary lg:flex"
            >
              <Search className="size-4" aria-hidden="true" />
              <span className="truncate">Keresés szolgáltatások, igények és projektek között…</span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Keresés"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-5" />
            </Button>

            <Popover onOpenChange={(o) => o && store.markNotificationsRead()}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label={`Értesítések (${unread} olvasatlan)`}>
                  <Bell className="size-5" />
                  {unread > 0 && (
                    <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                      {unread}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-96 p-0">
                <p className="border-b border-border px-4 py-3 text-sm font-semibold">Értesítések</p>
                <ul className="max-h-80 divide-y divide-border overflow-auto">
                  {store.notifications.map((n) => (
                    <li key={n.id}>
                      <Link
                        to="/igeny/$id"
                        params={{ id: n.requestId ?? "" }}
                        className="block px-4 py-3 text-sm hover:bg-secondary"
                      >
                        <span className="block">{n.text}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{n.at}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-left hover:bg-secondary">
                  <span className="grid size-7 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                    {user.initials}
                  </span>
                  <span className="hidden leading-tight md:block">
                    <span className="block text-xs font-medium">{user.name}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {ROLE_LABELS[store.activeRole]}
                    </span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>
                  <span className="block">{user.name}</span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    {user.title} · {lookup.unit(user.orgUnitId)}
                  </span>
                  <span className="block text-xs font-normal text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profil">
                    <UserRound className="size-4" /> Saját profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/igenyeim">Saját igényeim</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Demó: szerepkör váltása
                </DropdownMenuLabel>
                {user.roles.map((r) => (
                  <DropdownMenuItem
                    key={r}
                    onSelect={() => store.setActiveRole(r)}
                    className={cn(store.activeRole === r && "font-semibold")}
                  >
                    {ROLE_LABELS[r]}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Demó: felhasználóváltás
                </DropdownMenuLabel>
                {USERS.filter((u) =>
                  ["u-kovacs", "u-szabo", "u-horvath", "u-nemeth", "u-feher", "u-molnar"].includes(u.id),
                ).map((u) => (
                  <DropdownMenuItem key={u.id} onSelect={() => store.switchUser(u.id)}>
                    {u.name} – {ROLE_LABELS[u.roles[0]!]}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => store.logout()}>
                  <LogOut className="size-4" /> Kijelentkezés
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <nav aria-label="Fő navigáció" className="border-t border-border bg-card">
          <div className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-2 lg:px-6">
            {items.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to as "/"}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-3 py-3 text-sm whitespace-nowrap transition-colors",
                    active
                      ? "border-primary font-semibold text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main id="fotartalom" className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8">
        {children}
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-[1400px] px-4 py-6 text-xs text-muted-foreground lg:px-8">
          PTE ÁOK · Digitális Szolgáltatási Portál – belső prototípus. Egy belépési pont a digitális
          igényeknek. Átlátható folyamatok, világos felelősségek, mérhető szolgáltatásminőség.
        </div>
      </footer>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
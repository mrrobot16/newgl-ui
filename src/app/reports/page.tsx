import Link from "next/link";
import { BarChart2, Scale } from "lucide-react";

const REPORT_TYPES = [
  {
    href: "/reports/profit-loss",
    icon: BarChart2,
    title: "Profit and Loss",
    description: "Income, expenses, and net income over a period.",
  },
  {
    href: "/reports/balance-sheet",
    icon: Scale,
    title: "Balance Sheet",
    description: "Assets, liabilities, and equity as of a date.",
  },
];

export default function ReportsIndexPage() {
  return (
    <main className="tw-override main bg-[var(--color-container-background-primary)] text-sm text-[var(--color-text-primary)]">
      <header className="header mb-4">
        <div className="w-full">
          <h1 className="page-title"> Standard Reports</h1>
        </div>
      </header>

      <section className="page-content">
        <div className="mx-auto mt-8 w-full max-w-[840px]">
          <ul className="grid gap-3 sm:grid-cols-2">
            {REPORT_TYPES.map(({ href, icon: Icon, title, description }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-start gap-4 rounded border border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-primary)] p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-icon-secondary)]" />
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">{title}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-icon-secondary)]">{description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

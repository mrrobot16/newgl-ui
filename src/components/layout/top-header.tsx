import { ThemeToggle } from "@/components/theme/theme-toggle";
import { DEFAULT_TOP_HEADER_USER_NAME } from "@/constants/ui";

type TopHeaderProps = {
  userName?: string;
};

export function TopHeader({ userName = DEFAULT_TOP_HEADER_USER_NAME }: TopHeaderProps) {
  const avatarLetter = userName.trim().charAt(0).toUpperCase() || "U";

  return (
    <header className="flex h-[57px] items-center justify-end gap-3 rounded-t-[var(--radius-x-large)] bg-[var(--color-container-background-primary)] px-5">
      <ThemeToggle />
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[var(--color-text-global)]">{userName}</span>
        <div
          aria-label={`${userName} avatar`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-avatar-background)] text-xs font-semibold text-white"
        >
          {avatarLetter}
        </div>
      </div>
    </header>
  );
}

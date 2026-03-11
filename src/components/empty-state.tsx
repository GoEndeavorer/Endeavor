import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: { label: string; href: string };
  icon?: string;
};

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="border border-medium-gray/20 p-12 text-center">
      {icon && (
        <span className="mb-4 block text-4xl font-bold text-medium-gray/20">
          {icon}
        </span>
      )}
      <h3 className="mb-2 text-lg font-semibold text-light-gray">{title}</h3>
      <p className="mb-6 text-sm text-medium-gray">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-block border border-code-green px-6 py-2 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

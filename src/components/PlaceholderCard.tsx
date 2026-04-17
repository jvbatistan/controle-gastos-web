import { Hammer } from "lucide-react";

type Props = {
  title: string;
  description?: string;
  badge?: string;
};

export function PlaceholderCard({ title, description, badge = "Em construção" }: Props) {
  return (
    <div className="flex h-[320px] flex-col items-center justify-center self-start rounded-xl border border-dashed border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Hammer className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-neutral-900">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-neutral-600">{description}</p>}
      <span className="mt-4 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
        {badge}
      </span>
    </div>
  );
}

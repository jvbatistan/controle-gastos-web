type Props = {
  title: string;
  description?: string;
};

export function PlaceholderCard({ title, description }: Props) {
  return (
    <div className="bg-white border border-border rounded-xl p-6 shadow-sm h-[320px] flex flex-col justify-center items-center text-center self-start">
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-500 mt-2">{description}</p>
      )}
      <p className="text-xs text-neutral-400 mt-4">
        (placeholder)
      </p>
    </div>
  );
}

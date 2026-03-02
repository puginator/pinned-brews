import Image from 'next/image';
import { getBrewMethodMeta } from '@/lib/domain/constants';

export function BrewMethodIcon({
  method,
  size = 18,
  className = '',
}: {
  method: string;
  size?: number;
  className?: string;
}) {
  const meta = getBrewMethodMeta(method);

  if (meta.assetPath) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full bg-white/80 ring-1 ring-black/5 ${className}`.trim()}
        style={{ width: size + 8, height: size + 8 }}
        aria-hidden="true"
      >
        <Image src={meta.assetPath} alt="" width={size} height={size} className="object-contain" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-white/80 text-center font-black text-stone-700 ring-1 ring-black/5 ${className}`.trim()}
      style={{ width: size + 8, height: size + 8, fontSize: Math.max(11, Math.round(size * 0.72)) }}
      aria-hidden="true"
    >
      {meta.icon}
    </span>
  );
}

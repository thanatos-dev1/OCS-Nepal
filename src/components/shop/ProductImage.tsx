import Image from "next/image";
import { cn } from "@/lib/utils";

type Category = "RAM" | "SSD" | "HDD" | "Keyboard" | "Mouse" | "Accessories";

const categoryConfig: Record<string, { bg: string; icon: string }> = {
  RAM: { bg: "from-blue-50 to-blue-100", icon: "🧠" },
  SSD: { bg: "from-violet-50 to-violet-100", icon: "💾" },
  HDD: { bg: "from-slate-100 to-slate-200", icon: "🖴" },
  Keyboard: { bg: "from-teal-50 to-teal-100", icon: "⌨️" },
  Mouse: { bg: "from-indigo-50 to-indigo-100", icon: "🖱️" },
  Accessories: { bg: "from-amber-50 to-amber-100", icon: "🔌" },
};

const fallback = { bg: "from-slate-50 to-slate-100", icon: "📦" };

interface ProductImageProps {
  src?: string;
  alt: string;
  category?: string;
  className?: string;
  priority?: boolean;
}

export default function ProductImage({
  src,
  alt,
  category,
  className,
  priority = false,
}: ProductImageProps) {
  const config = (category ? categoryConfig[category] : undefined) ?? fallback;

  if (src) {
    return (
      <div className={cn("relative w-full h-full", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col items-center justify-center gap-2 bg-linear-to-br",
        config.bg,
        className,
      )}
    >
      <span className="text-4xl select-none">{config.icon}</span>
      <span className="text-xs font-medium text-text-disabled tracking-wide">
        {category ?? "Product"}
      </span>
    </div>
  );
}

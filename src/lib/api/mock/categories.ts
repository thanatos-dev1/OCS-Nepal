import type { Category } from "../types";

export const MOCK_CATEGORIES: Category[] = [
  { id: "ram",         name: "RAM",         slug: "ram",         icon: "🧠", productCount: 3  },
  { id: "ssd",         name: "SSD",         slug: "ssd",         icon: "💾", productCount: 3  },
  { id: "hdd",         name: "HDD",         slug: "hdd",         icon: "🖴", productCount: 2  },
  { id: "keyboards",   name: "Keyboards",   slug: "keyboards",   icon: "⌨️", productCount: 2  },
  { id: "mice",        name: "Mice",        slug: "mice",        icon: "🖱️", productCount: 2  },
  { id: "accessories", name: "Accessories", slug: "accessories", icon: "🔌", productCount: 2  },
];

import type { CategoryBrandGroup } from "../types";

// TODO(backend): remove this file once GET /categories/:slug/brand-series is live.
// See BACKEND-SPEC.md at repo root.
export const MOCK_CATEGORY_BRAND_SERIES: Record<string, CategoryBrandGroup[]> = {
  laptops: [
    {
      brandId: "asus",
      brandName: "Asus",
      brandSlug: "asus",
      series: [
        { id: "asus-rog", name: "ROG", slug: "rog" },
        { id: "asus-tuf", name: "TUF Gaming", slug: "tuf" },
        { id: "asus-zenbook", name: "Zenbook", slug: "zenbook" },
        { id: "asus-vivobook", name: "Vivobook", slug: "vivobook" },
        { id: "asus-proart", name: "ProArt Studiobook", slug: "proart" },
      ],
    },
    {
      brandId: "lenovo",
      brandName: "Lenovo",
      brandSlug: "lenovo",
      series: [
        { id: "lenovo-legion", name: "Legion", slug: "legion" },
        { id: "lenovo-loq", name: "LOQ", slug: "loq" },
        { id: "lenovo-thinkpad", name: "ThinkPad", slug: "thinkpad" },
        { id: "lenovo-ideapad", name: "IdeaPad", slug: "ideapad" },
        { id: "lenovo-yoga", name: "Yoga", slug: "yoga" },
      ],
    },
    {
      brandId: "hp",
      brandName: "HP",
      brandSlug: "hp",
      series: [
        { id: "hp-omen", name: "Omen", slug: "omen" },
        { id: "hp-victus", name: "Victus", slug: "victus" },
        { id: "hp-pavilion", name: "Pavilion", slug: "pavilion" },
        { id: "hp-elitebook", name: "EliteBook", slug: "elitebook" },
        { id: "hp-probook", name: "ProBook", slug: "probook" },
      ],
    },
    {
      brandId: "dell",
      brandName: "Dell",
      brandSlug: "dell",
      series: [
        { id: "dell-alienware", name: "Alienware", slug: "alienware" },
        { id: "dell-g-series", name: "G Series", slug: "g-series" },
        { id: "dell-xps", name: "XPS", slug: "xps" },
        { id: "dell-inspiron", name: "Inspiron", slug: "inspiron" },
        { id: "dell-latitude", name: "Latitude", slug: "latitude" },
      ],
    },
    {
      brandId: "acer",
      brandName: "Acer",
      brandSlug: "acer",
      series: [
        { id: "acer-predator", name: "Predator", slug: "predator" },
        { id: "acer-nitro", name: "Nitro", slug: "nitro" },
        { id: "acer-swift", name: "Swift", slug: "swift" },
        { id: "acer-aspire", name: "Aspire", slug: "aspire" },
      ],
    },
    {
      brandId: "msi",
      brandName: "MSI",
      brandSlug: "msi",
      series: [
        { id: "msi-titan", name: "Titan", slug: "titan" },
        { id: "msi-raider", name: "Raider", slug: "raider" },
        { id: "msi-katana", name: "Katana", slug: "katana" },
        { id: "msi-modern", name: "Modern", slug: "modern" },
      ],
    },
  ],
  desktops: [
    {
      brandId: "hp",
      brandName: "HP",
      brandSlug: "hp",
      series: [
        { id: "hp-omen-desktop", name: "Omen", slug: "omen" },
        { id: "hp-pavilion-desktop", name: "Pavilion", slug: "pavilion" },
        { id: "hp-elitedesk", name: "EliteDesk", slug: "elitedesk" },
      ],
    },
    {
      brandId: "dell-desktop",
      brandName: "Dell",
      brandSlug: "dell",
      series: [
        { id: "dell-alienware-desktop", name: "Alienware", slug: "alienware" },
        { id: "dell-xps-desktop", name: "XPS Tower", slug: "xps" },
        { id: "dell-optiplex", name: "OptiPlex", slug: "optiplex" },
      ],
    },
    {
      brandId: "lenovo-desktop",
      brandName: "Lenovo",
      brandSlug: "lenovo",
      series: [
        { id: "lenovo-legion-tower", name: "Legion Tower", slug: "legion-tower" },
        { id: "lenovo-thinkcentre", name: "ThinkCentre", slug: "thinkcentre" },
      ],
    },
    {
      brandId: "asus-desktop",
      brandName: "Asus",
      brandSlug: "asus",
      series: [
        { id: "asus-rog-desktop", name: "ROG Strix", slug: "rog-strix" },
        { id: "asus-tuf-desktop", name: "TUF Gaming", slug: "tuf-gaming" },
      ],
    },
  ],
  components: [
    {
      brandId: "intel-comp",
      brandName: "Intel",
      brandSlug: "intel",
      series: [
        { id: "intel-core-i9", name: "Core i9", slug: "core-i9" },
        { id: "intel-core-i7", name: "Core i7", slug: "core-i7" },
        { id: "intel-core-i5", name: "Core i5", slug: "core-i5" },
        { id: "intel-core-i3", name: "Core i3", slug: "core-i3" },
      ],
    },
    {
      brandId: "amd-comp",
      brandName: "AMD",
      brandSlug: "amd",
      series: [
        { id: "amd-ryzen-9", name: "Ryzen 9", slug: "ryzen-9" },
        { id: "amd-ryzen-7", name: "Ryzen 7", slug: "ryzen-7" },
        { id: "amd-ryzen-5", name: "Ryzen 5", slug: "ryzen-5" },
        { id: "amd-radeon", name: "Radeon GPU", slug: "radeon" },
      ],
    },
    {
      brandId: "kingston-comp",
      brandName: "Kingston",
      brandSlug: "kingston",
      series: [
        { id: "kingston-fury", name: "Fury", slug: "fury" },
        { id: "kingston-nv", name: "NV SSD", slug: "nv-ssd" },
        { id: "kingston-kc3000", name: "KC3000", slug: "kc3000" },
      ],
    },
    {
      brandId: "samsung-comp",
      brandName: "Samsung",
      brandSlug: "samsung",
      series: [
        { id: "samsung-990pro", name: "990 Pro NVMe", slug: "990-pro" },
        { id: "samsung-980", name: "980 NVMe", slug: "980" },
        { id: "samsung-870evo", name: "870 EVO SATA", slug: "870-evo" },
      ],
    },
    {
      brandId: "sandisk-comp",
      brandName: "SanDisk",
      brandSlug: "sandisk",
      series: [
        { id: "sandisk-extreme", name: "Extreme", slug: "extreme" },
        { id: "sandisk-ultra", name: "Ultra", slug: "ultra" },
      ],
    },
    {
      brandId: "wd-comp",
      brandName: "WD",
      brandSlug: "wd",
      series: [
        { id: "wd-black", name: "WD Black", slug: "black" },
        { id: "wd-blue", name: "WD Blue", slug: "blue" },
        { id: "wd-red", name: "WD Red NAS", slug: "red" },
      ],
    },
  ],
  peripherals: [
    {
      brandId: "logitech",
      brandName: "Logitech",
      brandSlug: "logitech",
      series: [
        { id: "logi-mx", name: "MX Master", slug: "mx-master" },
        { id: "logi-g", name: "G Gaming", slug: "g-gaming" },
        { id: "logi-mk", name: "MK Combo", slug: "mk-combo" },
      ],
    },
    {
      brandId: "razer",
      brandName: "Razer",
      brandSlug: "razer",
      series: [
        { id: "razer-deathadder", name: "DeathAdder", slug: "deathadder" },
        { id: "razer-blackwidow", name: "BlackWidow", slug: "blackwidow" },
        { id: "razer-huntsman", name: "Huntsman", slug: "huntsman" },
      ],
    },
    {
      brandId: "corsair",
      brandName: "Corsair",
      brandSlug: "corsair",
      series: [
        { id: "corsair-k", name: "K Series", slug: "k-series" },
        { id: "corsair-hs", name: "HS Headsets", slug: "hs-headsets" },
      ],
    },
    {
      brandId: "rapoo",
      brandName: "Rapoo",
      brandSlug: "rapoo",
      series: [
        { id: "rapoo-v500", name: "V500", slug: "v500" },
        { id: "rapoo-vpro", name: "VPro", slug: "vpro" },
      ],
    },
    {
      brandId: "benq-peri",
      brandName: "BenQ",
      brandSlug: "benq",
      series: [
        { id: "benq-mobiuz", name: "Mobiuz Gaming", slug: "mobiuz" },
        { id: "benq-eyecare", name: "EyeCare", slug: "eyecare" },
      ],
    },
  ],
  networking: [
    {
      brandId: "tplink",
      brandName: "TP-Link",
      brandSlug: "tplink",
      series: [
        { id: "tplink-archer", name: "Archer", slug: "archer" },
        { id: "tplink-deco", name: "Deco Mesh", slug: "deco" },
        { id: "tplink-tlsg", name: "TL-SG Switches", slug: "tl-sg" },
      ],
    },
    {
      brandId: "dlink",
      brandName: "D-Link",
      brandSlug: "dlink",
      series: [
        { id: "dlink-dir", name: "DIR Routers", slug: "dir" },
        { id: "dlink-dgs", name: "DGS Switches", slug: "dgs" },
      ],
    },
    {
      brandId: "asus-net",
      brandName: "Asus",
      brandSlug: "asus",
      series: [
        { id: "asus-rog-router", name: "ROG Rapture", slug: "rog-rapture" },
        { id: "asus-zenwifi", name: "ZenWiFi", slug: "zenwifi" },
      ],
    },
    {
      brandId: "ugreen-net",
      brandName: "UGREEN",
      brandSlug: "ugreen",
      series: [
        { id: "ugreen-cat6", name: "Cat6 Cables", slug: "cat6" },
        { id: "ugreen-cat8", name: "Cat8 Cables", slug: "cat8" },
      ],
    },
  ],
  accessories: [
    {
      brandId: "ugreen-acc",
      brandName: "UGREEN",
      brandSlug: "ugreen",
      series: [
        { id: "ugreen-hub", name: "USB-C Hubs", slug: "usb-c-hubs" },
        { id: "ugreen-charger", name: "Chargers", slug: "chargers" },
        { id: "ugreen-cable", name: "Cables", slug: "cables" },
      ],
    },
    {
      brandId: "belkin",
      brandName: "Belkin",
      brandSlug: "belkin",
      series: [
        { id: "belkin-boostcharge", name: "BoostCharge", slug: "boostcharge" },
        { id: "belkin-screenforce", name: "ScreenForce", slug: "screenforce" },
      ],
    },
    {
      brandId: "targus",
      brandName: "Targus",
      brandSlug: "targus",
      series: [
        { id: "targus-laptop-bags", name: "Laptop Bags", slug: "laptop-bags" },
        { id: "targus-backpacks", name: "Backpacks", slug: "backpacks" },
      ],
    },
    {
      brandId: "anker",
      brandName: "Anker",
      brandSlug: "anker",
      series: [
        { id: "anker-powerbank", name: "PowerCore", slug: "powercore" },
        { id: "anker-nano", name: "Nano Chargers", slug: "nano" },
      ],
    },
  ],
};

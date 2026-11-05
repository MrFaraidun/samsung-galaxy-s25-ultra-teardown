/**
 * Galaxy S25 Ultra — Engineering Model & Coordinate System
 * All physical dimensions in true millimeters (1 unit = 1 mm)
 */
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";

export const DEG = Math.PI / 180;

// Device True Dimensions (Samsung Verified)
export const PHONE = {
  w: 77.6,          // Width (X axis: -38.8 to +38.8)
  d: 162.8,         // Length (Y axis: -81.4 to +81.4)
  h: 8.2,           // Thickness (Z axis: 0 to 8.2)
  r: 3.6,           // Ergonomic corner radius (new on S25 Ultra)
  screenBezel: 1.2, // Symmetrical display border
  weightG: 218,
};

// Center reference
export const PLAN = {
  x: -PHONE.w / 2,
  y: -PHONE.d / 2,
  w: PHONE.w,
  d: PHONE.d,
  r: PHONE.r,
};

// Exhibition Base Pedestal Plate
// Exhibition Workbench / Table (Matching Anatomy Sorting Desk Architecture)
export const BASE_PLATE = {
  x: -PHONE.w / 2 - 16,
  y: -PHONE.d / 2 - 18,
  w: PHONE.w + 32,
  d: PHONE.d + 36,
  r: 6,
};
export const BASE_H = 5.0;
export const LEG_H = 24.0;
export const FOOT_H = LEG_H;

// Camera Settings: 42° Azimuth for optimal long-edge and port visibility, 32° Elevation
export const VIEW_WIDTH = 1100;
export const VIEW_HEIGHT = 880;
export const AZIMUTH = 42;
export const ELEVATION = 32;

// Bounding box for fitProjection (architectural legs to z = -29 and exploded travel to z = +104)
export const BOUNDING_POINTS = [
  ...k.boxCorners(BASE_PLATE, -BASE_H - LEG_H, 0),
  ...k.boxCorners(PLAN, -55, 104),
  [PLAN.x + PLAN.w + 18, PLAN.y + PLAN.d + 45, 15], // S Pen travel
  [PLAN.x - 16, PLAN.y - 16, 75],                   // Camera cluster travel
];

export const P = k.fitProjection(BOUNDING_POINTS, VIEW_WIDTH, VIEW_HEIGHT, {
  pad: 22,
  azimuth: AZIMUTH,
  elevation: ELEVATION,
});

export const V = G.viewOf(P);
export const at = (point) => k.iso(point, P);
export const S = (paths, style) => k.solidSvg(paths, style);
export const Ln = (d, style) => k.lineSvg(d, style);
export const Dots = (points, style) => k.dotsSvg(points, style);

// Major Functional Assemblies in Disassembly Order (staggered physical separation)
export const ASSEMBLIES = {
  rear: {
    id: "rear",
    num: "01",
    name: "Rear Enclosure & Titanium Rings",
    short: "Rear Glass & Rings",
    move: [0, 0, 95],
    tone: "mid",
    say: "satin gorilla glass · 4× titanium lens bezels · ip68 gasket",
  },
  wireless: {
    id: "wireless",
    num: "02",
    name: "Wireless Charging & NFC Flex",
    short: "Wireless Coil",
    move: [0, 0, 75],
    tone: "mid",
    say: "15w qi2 induction coil · nfc loop · graphite heat sink",
  },
  cameras: {
    id: "cameras",
    num: "03",
    name: "Quad Optical Camera Cluster",
    short: "Camera Array",
    move: [16, -12, 58],
    tone: "hi",
    say: "200mp isocell hp2 · 50mp 5× periscope prism · 50mp ultra-wide",
  },
  motherboard: {
    id: "motherboard",
    num: "04",
    name: "Snapdragon 8 Elite Logic Board",
    short: "Logic Board",
    move: [0, 0, 44],
    tone: "hi",
    say: "snapdragon 8 elite · 3nm oryon cpu · 16gb lpddr5x · shield cans",
  },
  battery: {
    id: "battery",
    num: "05",
    name: "5,000 mAh Power Cell",
    short: "Battery",
    move: [-8, 10, 28],
    tone: "mid",
    say: "5,000 mah · 19.4 wh · 45w fast charge · quick-release pull tab",
  },
  cooling: {
    id: "cooling",
    num: "06",
    name: "Vapor Chamber (+40% Area)",
    short: "Vapor Chamber",
    move: [0, 0, 14],
    tone: "mid",
    say: "4,200 mm² vapor chamber · sintered copper capillary wick",
  },
  spen: {
    id: "spen",
    num: "07",
    name: "S Pen & EMR Mechanism",
    short: "S Pen",
    move: [22, 56, 0],
    tone: "hi",
    say: "passive emr stylus · 4,096 pressure levels · push-push clicker",
  },
  midframe: {
    id: "midframe",
    num: "08",
    name: "Titanium Perimeter & CNC Chassis",
    short: "Chassis Frame",
    move: [0, 0, 0],
    tone: "mid",
    say: "grade 5 titanium rails · cnc aluminum midplate · speaker chamber",
  },
  display: {
    id: "display",
    num: "09",
    name: "Dynamic AMOLED 2X & Armor 2",
    short: "Display",
    move: [0, 0, -48],
    tone: "hi",
    say: "6.9-inch 120hz dynamic amoled 2x · gorilla armor 2 · 1.2mm bezels",
  },
};

export const ASSEMBLY_ORDER = [
  "display",
  "midframe",
  "spen",
  "cooling",
  "battery",
  "motherboard",
  "cameras",
  "wireless",
  "rear",
];

export const STAGGER_SEQUENCE = [
  "rear",
  "wireless",
  "cameras",
  "motherboard",
  "battery",
  "cooling",
  "spen",
  "midframe",
  "display",
];

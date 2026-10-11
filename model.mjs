/**
 * Samsung Galaxy S25 Ultra — Engineering Physical Model & Telemetry Specs
 * Hero scale interactive teardown model adhering to Anatomy specifications.
 */

export const PHONE_SPECS = {
  name: "Samsung Galaxy S25 Ultra",
  modelNumber: "SM-S938B / SM-S938U",
  dimensions: { width: 77.6, depth: 162.8, thickness: 8.2 }, // mm
  mass: 218, // grams
  materials: {
    frame: "Grade 5 Titanium (Ti-6Al-4V) exterior with laser-welded 6013 Aluminum inner sub-chassis",
    frontGlass: "Corning Gorilla Armor (Anti-reflective 75% reflection reduction, DX coating)",
    rearGlass: "Corning Gorilla Glass Victus 2 (Satin frosted matte finish)",
    cooling: "Stainless steel & sintered copper vapor chamber (4,100 mm² dissipation area)",
  },
  soc: {
    name: "Qualcomm Snapdragon 8 Elite for Galaxy",
    processNode: "TSMC 3nm (N3E)",
    architecture: "Qualcomm Oryon 64-bit CPU (2x Prime @ 4.47 GHz + 6x Performance @ 3.53 GHz)",
    gpu: "Qualcomm Adreno 830 @ 1.1 GHz",
    npu: "Qualcomm Hexagon NPU (45 TOPS int8 AI compute)",
    memory: "16 GB LPDDR5X-9600 MHz (Package-on-Package / PoP stacked)",
    storage: "512 GB UFS 4.0 Dual-channel Flash",
    modem: "Snapdragon X80 5G RF System (10 Gbps peak downlink, Wi-Fi 7 802.11be, BT 5.4)",
  },
  battery: {
    type: "Lithium-Ion Polymer Dual-Tab Pouch Cell",
    capacity: 5000, // mAh
    energy: 19.35, // Wh
    nominalVoltage: 3.88, // V
    chargeVoltage: 4.45, // V
    chargingProtocol: "USB Power Delivery 3.0 PPS (45W Super Fast Charging 2.0)",
    wirelessCharging: "15W Qi2 / Fast Wireless Charging 2.0 & 4.5W Reverse Wireless PowerShare",
  },
  cameras: [
    {
      id: "wide",
      name: "200 MP Wide Primary Sensor",
      sensor: "Samsung ISOCELL HP2 (1/1.3\" optical format, 0.6 µm pixel size)",
      aperture: "f/1.7, 24 mm equivalent focal length",
      lens: "8-element aspheric glass-plastic hybrid barrel",
      stabilization: "Dual-axis voice coil motor (VCM) sensor-shift OIS (±1.5° angular correction)",
    },
    {
      id: "periscope",
      name: "50 MP 5x Optical Periscope Telephoto",
      sensor: "Sony IMX854 / ISOCELL (1/2.51\" format, 0.7 µm)",
      aperture: "f/3.4, 111 mm equivalent focal length",
      prism: "90° precision folded optical reflection prism on ball-bearing magnetic rails",
      stabilization: "Magnetic levitation OIS with 4-spring centering suspension",
    },
    {
      id: "tele",
      name: "10 MP 3x Optical Telephoto",
      sensor: "ISOCELL 3K1 (1/3.52\" format, 1.12 µm)",
      aperture: "f/2.4, 67 mm equivalent focal length",
      stabilization: "Voice coil motor OIS with Dual Pixel PDAF",
    },
    {
      id: "ultrawide",
      name: "50 MP Ultra-Wide",
      sensor: "Samsung ISOCELL JN3 (1/2.55\" format, 0.7 µm)",
      aperture: "f/2.0, 13 mm equivalent, 120° field of view",
      autofocus: "Close-focus macro VCM actuator down to 2.5 cm",
    },
    {
      id: "laser_af",
      name: "Laser Auto-Focus & Dual Flash",
      features: "Time-of-Flight (ToF) Class 1 IR laser rangefinder + Dual-tone high-CRI LED matrix",
    },
  ],
  spen: {
    name: "S Pen Stylus with Inductive Resonance & BLE",
    dimensions: { length: 104.6, width: 5.8, thickness: 4.3 }, // mm
    tip: "0.7 mm high-friction elastomer interchangeable nib",
    pressureLevels: 4096,
    hoverDistance: 12, // mm
    technology: "Wacom Active Electro-Magnetic Resonance (EMR) digitizer + 2.4 GHz BLE Air Actions",
    capacitor: "Titanium dioxide super-capacitor (40 hours standby on 40-second inductive charge)",
  },
  cooling: {
    type: "Enlarged Stainless Steel Vapor Chamber",
    area: 4100, // mm²
    wick: "Sintered copper powder capillary micro-wick structure",
    workingFluid: "Deionized ultra-pure water with anti-corrosion passivating layer",
    thermalConductivity: "Effective > 5000 W/m·K (vs 400 W/m·K solid copper)",
  },
};

/**
 * Assemblies in exploded view order from bottom (front display) to top (rear cover),
 * plus lateral slide for S-Pen.
 */
export const ASSEMBLIES = [
  {
    id: "fixture",
    number: "00",
    name: "Cleanroom Inspection Bench & Fixture",
    short: "Bench",
    say: "heavy cast base plate · precision alignment clamps · micrometer vernier rail",
    explodeVector: [0, 0, 0], // stays fixed
    restZ: -14,
    color: "#6b7280",
    description: "Anti-static anodized aluminum test bench with micrometer vernier scale, 4 corner locking chucks, and calibration ruler.",
  },
  {
    id: "display",
    number: "01",
    name: "Display & EMR Digitizer Stack",
    short: "Display",
    say: "6.86″ Dynamic AMOLED 2X · 3120×1440 · Gorilla Armor anti-reflective glass",
    explodeVector: [0, 0, -48],
    restZ: -1.2,
    color: "#e2e8f0",
    description: "6.86-inch flat Dynamic AMOLED 2X panel (1–120Hz LTPO, 2600 nits peak), Corning Gorilla Armor glass, ultrasonic fingerprint module, and Wacom EMR digitizer layer.",
  },
  {
    id: "chassis",
    number: "02",
    name: "Titanium Frame & Midframe Chassis",
    short: "Frame",
    say: "Grade 5 Titanium outer band · CNC milled 6013 aluminum sub-chassis · S Pen silo",
    explodeVector: [0, 0, 0], // Anchor body at z=0
    restZ: 0,
    color: "#94a3b8",
    description: "Grade 5 Titanium outer band with laser-welded aluminum internal structure, dielectric antenna joints, S Pen internal docking sleeve, and acoustic speaker baffle.",
  },
  {
    id: "vapor_chamber",
    number: "03",
    name: "4,100 mm² Liquid Vapor Chamber",
    short: "Cooling",
    say: "4,100 mm² stainless steel & copper · dual-phase capillary wick · ΔT -4.2°C",
    explodeVector: [0, 0, 36],
    restZ: 1.0,
    color: "#f59e0b",
    description: "Enlarged 4,100 mm² dual-phase vapor chamber spanning from the Snapdragon 8 Elite SoC across the battery flank. Sintered copper wick transports condensed fluid.",
  },
  {
    id: "battery",
    number: "04",
    name: "5,000 mAh Dual-Tab Power Cell",
    short: "Battery",
    say: "5,000 mAh · 19.35 Wh · 3.88V · dual-tab low-impedance Li-ion pouch",
    explodeVector: [0, 0, 70],
    restZ: 1.8,
    color: "#10b981",
    description: "5,000 mAh / 19.35 Wh Lithium-Ion pouch cell with dual-tab electrodes for lower internal resistance, safety PCM/BMS board, and pull-tab removal tape.",
  },
  {
    id: "spen",
    number: "05",
    name: "S Pen Stylus & Ejection Spring",
    short: "S Pen",
    say: "4,096 pressure levels · 0.7mm tip · inductive EMR coil · clicker plunger",
    explodeVector: [-70, 0, 0], // Slides completely out along -X axis
    restZ: 1.5,
    color: "#a855f7",
    description: "Internal S Pen stylus featuring 4,096 levels of pressure sensitivity, 0.7mm elastomer tip, inductive resonance antenna, BLE capacitor, and click-ejection spring mechanism.",
  },
  {
    id: "motherboard",
    number: "06",
    name: "Motherboard & Snapdragon 8 Elite",
    short: "Logic Board",
    say: "Snapdragon 8 Elite 3nm · 16GB LPDDR5X · 512GB UFS 4.0 · RF shield cans",
    explodeVector: [0, 0, 106],
    restZ: 2.6,
    color: "#eab308",
    description: "High-density Substrate-Like PCB (SLP) hosting the Qualcomm Snapdragon 8 Elite for Galaxy (3nm TSMC N3E), 16GB LPDDR5X RAM, 512GB UFS 4.0 storage, and nickel-silver EMI shields.",
  },
  {
    id: "sub_board",
    number: "07",
    name: "Sub-Board, USB-C 3.2 & Haptics",
    short: "I/O & Haptic",
    say: "USB-C 3.2 moisture-sealed port · dual MEMS mics · linear X-axis vibration motor",
    explodeVector: [0, 0, 128],
    restZ: 2.4,
    color: "#ec4899",
    description: "Lower daughterboard with USB 3.2 Gen 1 Type-C receptacle, dual primary beamforming microphones, SIM card reader, and X-axis linear resonant haptic actuator.",
  },
  {
    id: "cameras",
    number: "08",
    name: "Quad Camera System & Periscope Zoom",
    short: "Cameras",
    say: "200MP Wide OIS · 50MP 5x Folded Periscope · 50MP Ultra-Wide · 10MP 3x Tele",
    explodeVector: [0, 0, 160],
    restZ: 3.2,
    color: "#06b6d4",
    description: "Quad camera array featuring 200MP ISOCELL HP2 main sensor with dual-axis VCM OIS, 50MP 5x optical periscope telephoto with folded glass prism and magnetic rails, 50MP ultrawide, and laser AF.",
  },
  {
    id: "wireless_coil",
    number: "09",
    name: "Qi2 Wireless Coil, NFC & UWB",
    short: "Wireless & NFC",
    say: "15W Qi2 copper induction coil · ferrite shield · NFC loop · UWB spatial antenna",
    explodeVector: [0, 0, 194],
    restZ: 4.8,
    color: "#f97316",
    description: "Concentric copper spiral induction coil for 15W Qi2 wireless charging & reverse PowerShare, surrounded by NFC loop, Ultra-Wideband (UWB) patch antenna, and graphite cooling sheet.",
  },
  {
    id: "back_glass",
    number: "10",
    name: "Gorilla Glass Victus 2 Rear & Rings",
    short: "Back Glass",
    say: "Frosted satin matte Gorilla Glass · 4 Titanium camera rings · sapphire crystal",
    explodeVector: [0, 0, 230],
    restZ: 5.6,
    color: "#e2e8f0",
    description: "Satin frosted Gorilla Glass Victus 2 rear panel with 4 individual Grade 5 Titanium protective lens rings, sapphire crystal caps, flash window, and perimeter waterproof gasket.",
  },
];

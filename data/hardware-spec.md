# Samsung Galaxy S25 Ultra — Engineering Hardware Specification
**Reference Verification: Official Samsung Specifications & Hardware Teardown Analysis**

## 1. Verified Physical Dimensions & Architecture
- **Overall Dimensions**: 162.8 mm (Length) × 77.6 mm (Width) × 8.2 mm (Thickness)
- **Weight**: 218 g (7.69 oz)
- **Chassis Structure**: Grade 5 Titanium exterior frame with satin bead-blasted finish, bonded to an internal high-strength aluminum-alloy CNC midframe.
- **Corner Curvature**: Ergonomically revised contour radius of ~3.5 mm (moving away from the sharp 90° corners of the S24 Ultra to softer, comfortable rounded edges).
- **Water & Dust Ingress Protection**: IP68 (perimeter liquid silicone / pressure-sensitive acrylic adhesive gasket).

---

## 2. Core Functional Assemblies & Component Breakdown

### Assembly 01: Display & Front Enclosure (`display`)
- **Cover Material**: Corning® Gorilla® Armor 2 with proprietary anti-reflective micro-nanostructure (reduces surface reflections by >75%).
- **Panel**: 6.9-inch Dynamic AMOLED 2X flat display panel.
- **Resolution**: 3120 × 1440 pixels (QHD+), 498 ppi, 1–120 Hz adaptive LTPO refresh rate, peak brightness up to 2,600 nits.
- **Digitizer**: Embedded Wacom EMR (Electro-Magnetic Resonance) sensor layer laminated beneath the OLED substrate for sub-millisecond S Pen tracking.
- **Bezels**: Symmetrical ultra-narrow 1.2 mm borders on all four sides.
- **Front Camera Cutout**: Centered Infinity-O punch-hole (12 MP dual-pixel sensor, f/2.2, 26 mm equivalent).
- **Ear Speaker Port**: Micro-machined 0.4 mm acoustic slit at top bezel junction.

### Assembly 02: Structural Midframe & Titanium Perimeter (`midframe`)
- **Titanium Outer Ring**: Grade 5 Ti perimeter band with integrated PVD antenna isolation bands (4 on sides, 2 on top/bottom).
- **Internal CNC Chassis**: Multi-pocket machined aluminum alloy midplate providing torsional rigidity and grounding:
  - Deep-milled battery compartment with laser-etched alignment markings.
  - S Pen silo channel on device lower-left corner (viewed from rear).
  - Motherboard standoff bosses with precision M1.2 threaded screw taps.
  - Lower sub-board and acoustic resonance chamber cavity.
- **Side Keys**: Titanium power/side key and volume rocker with silicone water-seal boots and tactile microswitch domes.

### Assembly 03: Advanced Thermal Dissipation System (`cooling`)
- **Vapor Chamber**: Extra-large titanium-copper composite Vapor Chamber (VC) — **~40% surface area increase** over Galaxy S24 Ultra (covering >4,200 mm²).
- **Internal Structure**: Dual-sided sintered copper wick capillary mesh structure with evacuated working fluid (deionized water) cycle:
  - Evaporator zone directly under Snapdragon 8 Elite SoC package.
  - Condenser zone spreading heat downwards across the midframe toward the chassis perimeter.
- **Thermal Interface Material (TIM)**: Phase-change thermal grease between SoC package and vapor chamber, plus graphite heat-spreading sheets on both sides.

### Assembly 04: Mainboard & Silicon Package (`motherboard`)
- **Board Architecture**: Multi-layer high-density interconnect (HDI) stacked motherboard (Logic Board + RF Sub-board sandwich).
- **Primary Processor**: **Qualcomm Snapdragon® 8 Elite for Galaxy** (SM8750-AC):
  - Architecture: TSMC 3nm (N3E) process node.
  - CPU: Qualcomm Oryon™ 64-bit CPU (2× Prime Cores @ 4.47 GHz + 6× Performance Cores @ 3.53 GHz).
  - GPU: Qualcomm Adreno™ 830 GPU with sliced architecture and hardware-accelerated ray tracing.
  - NPU: Qualcomm Hexagon™ NPU (45% NPU throughput uplift for multimodal Galaxy AI).
- **Memory & Storage**: 12 GB / 16 GB LPDDR5X RAM package-on-package (PoP) stacked above SoC, 256 GB / 512 GB / 1 TB UFS 4.0 storage NAND flash.
- **Shielding**: Laser-soldered nickel-silver EMI shield cans with graphite thermal dissipation top layer.
- **Connectors**: High-retention board-to-board (B2B) micro-coaxial and FPC mezzanine connectors.

### Assembly 05: Quad Rear Optical Camera Array (`cameras`)
- **Camera 1 — Primary Wide-Angle (200 MP)**:
  - Sensor: Samsung ISOCELL HP2 (1/1.3" optical format, 0.6 µm pixel pitch, 16-in-1 Tetra²pixel binning).
  - Optics: 7-element f/1.7 24 mm equivalent lens with advanced multi-axis Voice Coil Motor (VCM) Optical Image Stabilization (OIS).
- **Camera 2 — Ultra-Wide Angle (50 MP)**:
  - Sensor: Samsung ISOCELL JN3 (1/2.76" format, f/1.9 aperture, 120° field of view, Dual Pixel PDAF macro capability).
- **Camera 3 — 3× Telephoto (10 MP / 50 MP)**:
  - Sensor: 1/3.52" format, f/2.4 aperture, 67 mm equivalent, dedicated OIS suspension springs.
- **Camera 4 — 5× Periscope Telephoto (50 MP)**:
  - Sensor: 1/2.52" format, f/3.4 aperture, 111 mm equivalent focal length.
  - Structure: 90° dual-folded periscope glass prism reflecting optical path through internal motorized lens guide rails with low-friction ball bearings.
- **Auxiliary Sensors**: Laser Autofocus (ToF) transmitter/receiver diode array and high-CRI dual-tone LED flash unit.
- **Camera Rings**: Four individual elevated titanium bezel rings with anti-scratch sapphire crystal outer windows.

### Assembly 06: Energy & Power Subsystem (`battery`)
- **Cell Chemistry**: High-energy-density Lithium-ion pouch cell with silicon-carbon anode additive.
- **Capacity**: 5,000 mAh typical (4,855 mAh rated), 3.88 V nominal, 19.4 Wh.
- **Fast Charging**: 45W Super Fast Charging 2.0 (USB-PD 3.0 PPS).
- **Safety & Serviceability**: Factory pull-tab adhesive release mechanism for clean extraction without chemical solvent.
- **Protection**: Battery Management System (BMS) PCM with dual thermal cutoff fuses and gold-plated power connector pins.

### Assembly 07: Wireless Charging, NFC & Lower Sub-Assembly (`subboard`)
- **Inductive Coil**: Concentric planar copper Litz-wire wireless charging coil (15W Qi / Qi2 fast wireless charging + 4.5W Wireless PowerShare reverse charging).
- **NFC / MST**: Outer perimeter multi-turn flexible antenna loop.
- **Lower Daughterboard**: Contains USB 3.2 Gen 1 Type-C receptacle with reinforced steel anchoring tabs, dual nano-SIM tray slot, and primary microphone array.
- **Haptic Engine**: High-bandwidth X-axis linear resonant actuator (LRA) providing crisp tactile vibration feedback.
- **Bottom Speaker**: Enclosed acoustic loudspeaker box with synthetic acoustic damping beads.

### Assembly 08: S Pen Stylus & Channel (`spen`)
- **Stylus Architecture**: Passive Electro-Magnetic Resonance (EMR) stylus requiring no internal battery charging (streamlined inductive design for S25 Ultra).
- **Dimensions**: 104.6 mm × 5.8 mm × 4.35 mm, weight ~3.0 g.
- **Tip**: 0.7 mm elastomer-coated fine tip with 4,096 levels of pressure sensitivity.
- **Mechanism**: Spring-loaded mechanical push-push ejection clicker cap with water-resistant internal silicone ring in midframe silo.

### Assembly 09: Rear Enclosure & Exterior Finish (`rear`)
- **Back Plate**: Satin-matte Corning Gorilla Armor with oleophobic anti-fingerprint coating.
- **Colorway**: Titanium Silver / Titanium Gray neutral architectural tones.
- **Apertures**: Precision-routed perimeter cutouts with elastomeric sealing gaskets around titanium camera rings.

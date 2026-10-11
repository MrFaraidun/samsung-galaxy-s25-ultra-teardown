# Graph Report - t-25  (2026-10-11)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 789 nodes · 1989 edges · 38 communities
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- audit.mjs
- iso-kit.mjs
- turn-build.mjs
- lathe.mjs
- turn.mjs
- turn-fixed.mjs
- turn-audit.mjs
- draw.tsx
- iso-kit.ts
- t3EmitRound
- t3EmitRound
- iso
- turn-bench.mjs
- t3EmitBall
- pathOf
- t3Mount
- t3EmitTube
- canvas-painter.mjs
- drive.mjs
- t3Emit
- turn-check.mjs
- pathOf
- t3EmitBall
- lines.mjs
- gl.mjs
- gl-shared.mjs
- iso
- t3EmitTube
- t3Emit
- onTop
- t3Poses
- t3Poses
- turn-fidelity.mjs
- inline-kit.mjs
- axesAt
- escape
- ringOf
- segment

## God Nodes (most connected - your core abstractions)
1. `dot3()` - 38 edges
2. `iso()` - 34 edges
3. `pathOf()` - 30 edges
4. `add3()` - 29 edges
5. `mul3()` - 29 edges
6. `sub3()` - 28 edges
7. `build()` - 23 edges
8. `audit()` - 19 edges
9. `t3EmitRound()` - 19 edges
10. `lathe()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `tubes()` --calls--> `tubePieces()`  [EXTRACTED]
  scripts/turn-fidelity.mjs → kit/tube.mjs
- `orientedBox()` --indirect_call--> `unit3()`  [INFERRED]
  kit/audit.mjs → kit/lathe.mjs
- `cameraBasis()` --calls--> `cameraOf()`  [EXTRACTED]
  kit/audit.mjs → kit/iso-kit.mjs
- `continuity()` --calls--> `measure()`  [EXTRACTED]
  kit/turn-audit.mjs → kit/audit.mjs
- `traced()` --calls--> `curveRuns()`  [EXTRACTED]
  kit/audit.mjs → kit/lathe.mjs

## Import Cycles
- None detected.

## Communities (38 total, 0 thin omitted)

### Community 0 - "audit.mjs"
Cohesion: 0.05
Nodes (111): areaOf(), audit(), auditOrExit(), baseSdf(), belongs(), body(), bodyDepth(), boundsOf() (+103 more)

### Community 1 - "iso-kit.mjs"
Cohesion: 0.07
Nodes (52): attrs(), axesAt(), axisVector(), AZIMUTH, circleRing(), convexHull(), cylinder(), dotsSvg() (+44 more)

### Community 2 - "turn-build.mjs"
Cohesion: 0.07
Nodes (42): surfacePoints(), attrs(), build(), out, closest(), convexOrThrow(), dotsMarkup(), esc() (+34 more)

### Community 3 - "lathe.mjs"
Cohesion: 0.11
Nodes (53): angleToward(), arcOf(), arcPoints(), bandOf(), bandOfProfile(), BANDS, bandsOf(), chains() (+45 more)

### Community 4 - "turn.mjs"
Cohesion: 0.07
Nodes (43): T3_EB, T3_EYE, T3_LB, T3_MAT_KEYS, T3_MAT_TUBE, T3_MATERIALS, T3_ROOT, T3_SHINE (+35 more)

### Community 5 - "turn-fixed.mjs"
Cohesion: 0.08
Nodes (35): T3_EB, T3_EYE, T3_LB, T3_MAT_KEYS, T3_MAT_TUBE, T3_MATERIALS, T3_ROOT, T3_SHINE (+27 more)

### Community 6 - "turn-audit.mjs"
Cohesion: 0.12
Nodes (34): frameOf(), apply(), areaOfPath(), back(), clipArea(), continuity(), convexHull(), EYE (+26 more)

### Community 7 - "draw.tsx"
Cohesion: 0.10
Nodes (26): Flat, KeyMark, LegendKey, LineTone, SolidPaths, Tone, Dots(), IsoFigure() (+18 more)

### Community 8 - "iso-kit.ts"
Cohesion: 0.07
Nodes (25): Camera, ExtrudeOptions, Faded, FadeLineStyle, FigureOptions, FitOptions, LineStyle, PageOptions (+17 more)

### Community 9 - "t3EmitRound"
Cohesion: 0.24
Nodes (21): t3Arcs(), t3At(), t3BoxOf(), t3Broken(), t3EmitLathe(), t3EmitPrism(), t3EmitRibs(), t3EmitRound() (+13 more)

### Community 10 - "t3EmitRound"
Cohesion: 0.27
Nodes (18): t3Arcs(), t3At(), t3BoxOf(), t3Broken(), t3Dome(), t3EmitLathe(), t3EmitRibs(), t3EmitRound() (+10 more)

### Community 11 - "iso"
Cohesion: 0.18
Nodes (17): cameraOf(), coil(), convexHull(), depthOf(), dotGrid(), extrude(), fitProjection(), iso() (+9 more)

### Community 12 - "turn-bench.mjs"
Cohesion: 0.12
Nodes (15): angles, argv, cams, cpuFrames, frames, frameTimes, kinds, median() (+7 more)

### Community 13 - "t3EmitBall"
Cohesion: 0.16
Nodes (15): t3ArcPoints(), t3ClipConvex(), t3Dome(), t3EmitBall(), t3Enclose(), t3Grown(), t3Hull(), t3HullOut() (+7 more)

### Community 14 - "pathOf"
Cohesion: 0.26
Nodes (12): pathOf(), area(), capOf(), LIGHT, poly(), ringsOf(), ringsSvg(), sideOf() (+4 more)

### Community 15 - "t3Mount"
Cohesion: 0.16
Nodes (14): t3Anchor(), t3Apart(), t3Camera(), t3Cams(), t3Cover(), t3Disjoint(), t3Frame(), t3Gjk() (+6 more)

### Community 16 - "t3EmitTube"
Cohesion: 0.20
Nodes (14): t3Basis(), t3Cloud(), t3Cut(), t3EmitTube(), t3PointAlong(), t3PrepareBall(), t3PrepareTube(), t3Pts() (+6 more)

### Community 17 - "canvas-painter.mjs"
Cohesion: 0.31
Nodes (12): CANVAS2D, cpCompilePart(), cpCss(), cpGeometry(), cpMatrixOf(), cpMount(), cpMul(), cpRgba() (+4 more)

### Community 18 - "drive.mjs"
Cohesion: 0.26
Nodes (7): chromePath(), main(), parse(), usage(), chromePath(), main(), usage()

### Community 19 - "t3Emit"
Cohesion: 0.29
Nodes (12): t3Box(), t3Emit(), t3EmitDots(), t3EmitFixed(), t3EmitPlanes(), t3EmitPrism(), t3Fix(), t3Grow() (+4 more)

### Community 20 - "turn-check.mjs"
Cohesion: 0.23
Nodes (9): LINE_ENDS, browser(), chromePath(), HELPERS, main(), PERF, POPS, usage() (+1 more)

### Community 21 - "pathOf"
Cohesion: 0.25
Nodes (11): attrs(), dotsSvg(), fadedSvg(), fadeLineSvg(), figureSvg(), groupSvg(), lineSvg(), pathOf() (+3 more)

### Community 22 - "t3EmitBall"
Cohesion: 0.20
Nodes (11): t3ArcPoints(), t3ClipConvex(), t3EmitBall(), t3Grown(), t3Hull(), t3HullOut(), t3LatheMid(), t3LatheOutline() (+3 more)

### Community 23 - "lines.mjs"
Cohesion: 0.20
Nodes (7): actions, argv, child, out, select, tolerance, wait

### Community 24 - "gl.mjs"
Cohesion: 0.25
Nodes (4): burst(), GLSL_ISO, GLSL_TURN, smooth()

### Community 25 - "gl-shared.mjs"
Cohesion: 0.25
Nodes (4): burst(), GLSL_ISO, GLSL_TURN, smooth()

### Community 26 - "iso"
Cohesion: 0.25
Nodes (9): cameraOf(), coil(), depthOf(), dotGrid(), fitProjection(), iso(), pointsAt(), screenRise() (+1 more)

### Community 27 - "t3EmitTube"
Cohesion: 0.31
Nodes (9): t3Basis(), t3Cloud(), t3EmitTube(), t3PrepareBall(), t3Pts(), t3Sides(), t3StripeEnd(), t3TubeCap() (+1 more)

### Community 28 - "t3Emit"
Cohesion: 0.36
Nodes (9): t3Emit(), t3EmitDots(), t3EmitFixed(), t3EmitPlanes(), t3Fix(), t3Grow(), t3Matrix(), t3Num() (+1 more)

### Community 29 - "onTop"
Cohesion: 0.25
Nodes (8): circleRing(), cylinder(), lineOnTop(), onTop(), planOutline(), radialTicks(), ring(), topTicks()

### Community 30 - "t3Poses"
Cohesion: 0.29
Nodes (8): t3Apply(), t3Compose(), t3FreeRot(), t3Mul(), t3Poses(), t3PosesMap(), t3Quat(), t3Rot()

### Community 31 - "t3Poses"
Cohesion: 0.29
Nodes (8): t3Apply(), t3Compose(), t3FreeRot(), t3Mul(), t3Poses(), t3PosesMap(), t3Quat(), t3Rot()

### Community 32 - "turn-fidelity.mjs"
Cohesion: 0.46
Nodes (6): TURN, identity(), restValues(), rootOf(), rounds(), tubes()

### Community 33 - "inline-kit.mjs"
Cohesion: 0.43
Nodes (7): fixedScript(), glScript(), glSharedScript(), KIT, kitScript(), strip(), turnScript()

### Community 34 - "axesAt"
Cohesion: 0.50
Nodes (5): axesAt(), matrixOf(), sideMatrix(), thousandth(), topMatrix()

### Community 35 - "escape"
Cohesion: 0.40
Nodes (5): escape(), faceTextSvg(), pageHtml(), plateHtml(), swatchSvg()

### Community 36 - "ringOf"
Cohesion: 0.40
Nodes (5): haloOf(), ringOf(), roundedPlan(), sideSeam(), slabOf()

### Community 37 - "segment"
Cohesion: 0.50
Nodes (4): knurl(), rise(), segment(), sideTicks()

## Knowledge Gaps
- **97 isolated node(s):** `IsoFigureProps`, `Spring`, `Camera`, `ExtrudeOptions`, `Faded` (+92 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 139 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TURN` connect `turn-fidelity.mjs` to `turn-build.mjs`, `turn.mjs`, `turn-bench.mjs`, `turn-audit.mjs`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `IsoFigureProps`, `Spring`, `Camera` to the rest of the system?**
  _97 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `audit.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.052100840336134456 - nodes in this community are weakly interconnected._
- **Why does `dot3()` connect `audit.mjs` to `turn-build.mjs`, `lathe.mjs`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Should `iso-kit.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.06533575317604355 - nodes in this community are weakly interconnected._
- **Why does `T` connect `turn-build.mjs` to `audit.mjs`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Should `turn-build.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.07268170426065163 - nodes in this community are weakly interconnected._
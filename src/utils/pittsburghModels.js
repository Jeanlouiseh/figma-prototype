import { createRobertoClementeBridgeModel } from './robertoClementeBridgeModel.js';

/**
 * 3D Procedural Generator for the Liberty Bridge
 * Spans the Monongahela River connecting Downtown Pittsburgh to the South Hills & Liberty Tunnels.
 *
 * Authentic Architectural Characteristics (matching photographic reference):
 * - Cantilever DECK TRUSS design: traffic drives entirely ON TOP of the trusses (open deck)
 * - Signature PennDOT warm tan / desert sand painted structural steel (#cca785 / #c5a17e)
 * - Two massive parallel steel deck trusses underneath the roadway with variable-depth arched lower chords
 * - Lower chord dips down to deep cantilever haunches over the two monumental river piers
 * - Cantilever outrigger deck brackets extending outward along both sides to support roadway overhang
 * - Monumental stone masonry river piers with sharp V-cutwaters, rusticated ashlar coursing, and flanking stone pylons
 * - 4-lane roadway deck with asphalt surface, double yellow centerlines, white lane dashes, and concrete barriers
 * - Overhead highway sign gantries spanning the deck ("LIBERTY TUNNELS / SOUTH HILLS" and "DOWNTOWN")
 * - Streetlight poles with curved luminaire heads along outer barriers
 * - South Hills hillside approach slope leading toward the arched stone Liberty Tunnels portal
 * - Monongahela River reflective water plane below
 * - Set B: Hydronic de-icing loop & dry standpipe fire header clashing through deck truss diagonal (CL-001)
 */
export function createLibertyBridgeModel(THREE, options = {}) {
  const { showWater = true } = options;

  const modelGroup = new THREE.Group();
  const setAGroup = new THREE.Group(); // Structural Bridge Elements (Set A)
  const setBGroup = new THREE.Group(); // Mechanical & Fire Protection Penetrations (Set B)

  // -------------------------------------------------------------
  // Materials
  // -------------------------------------------------------------
  // PennDOT Warm Tan / Desert Sand painted structural steel
  const steelTanMat = new THREE.MeshStandardMaterial({
    color: 0xcca785,
    roughness: 0.42,
    metalness: 0.5,
  });

  const steelTanDarkMat = new THREE.MeshStandardMaterial({
    color: 0xaa8769,
    roughness: 0.48,
    metalness: 0.45,
  });

  const steelTanLightMat = new THREE.MeshStandardMaterial({
    color: 0xdebfa2,
    roughness: 0.35,
    metalness: 0.55,
  });

  // Monongahela River masonry stone piers (rusticated ashlar stone)
  const pierStoneMat = new THREE.MeshStandardMaterial({
    color: 0x8a837c,
    roughness: 0.86,
    metalness: 0.12,
  });

  const pierPylonMat = new THREE.MeshStandardMaterial({
    color: 0x9a938c,
    roughness: 0.82,
    metalness: 0.14,
  });

  const pierFootMat = new THREE.MeshStandardMaterial({
    color: 0x58524d,
    roughness: 0.9,
    metalness: 0.1,
  });

  const bearingMat = new THREE.MeshStandardMaterial({
    color: 0x33373b,
    roughness: 0.4,
    metalness: 0.8,
  });

  // Roadway Deck Materials
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x24282c,
    roughness: 0.82,
    metalness: 0.2,
  });

  const barrierMat = new THREE.MeshStandardMaterial({
    color: 0xa8a39d,
    roughness: 0.78,
    metalness: 0.15,
  });

  const railingMat = new THREE.MeshStandardMaterial({
    color: 0xd0c4b8,
    roughness: 0.38,
    metalness: 0.65,
  });

  const stripeYellowMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
  const stripeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Monongahela River Water
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x183646,
    roughness: 0.22,
    metalness: 0.65,
    transparent: true,
    opacity: 0.92,
  });

  // Setting: South Hills hillside & Liberty Tunnels rock portal
  const hillsideMat = new THREE.MeshStandardMaterial({
    color: 0x2e5632,
    roughness: 0.88,
    metalness: 0.1,
  });

  const tunnelStoneMat = new THREE.MeshStandardMaterial({
    color: 0x635b54,
    roughness: 0.85,
    metalness: 0.12,
  });

  const tunnelBoreMat = new THREE.MeshBasicMaterial({ color: 0x0a0c0e });

  // Highway Sign Gantries & Streetlights
  const gantryMat = new THREE.MeshStandardMaterial({
    color: 0x8a959d,
    roughness: 0.45,
    metalness: 0.65,
  });

  const signGreenMat = new THREE.MeshStandardMaterial({
    color: 0x146338,
    roughness: 0.4,
    metalness: 0.2,
  });

  const signTextMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const poleMat = new THREE.MeshStandardMaterial({
    color: 0xb4bec6,
    roughness: 0.35,
    metalness: 0.7,
  });

  // Set B Utilities: Hydronic de-icing loop (cyan) & Fire standpipe header (red)
  const deicingPipeMat = new THREE.MeshStandardMaterial({
    color: 0x00bcd4,
    roughness: 0.28,
    metalness: 0.8,
  });

  const fireStandpipeMat = new THREE.MeshStandardMaterial({
    color: 0xd32f2f,
    roughness: 0.3,
    metalness: 0.75,
  });

  // -------------------------------------------------------------
  // 1. Monongahela River Water Surface
  // -------------------------------------------------------------
  if (showWater) {
    const water = new THREE.Mesh(new THREE.PlaneGeometry(84, 52), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.6, 0);
    modelGroup.add(water);
  }

  // -------------------------------------------------------------
  // 2. Monumental Stone River Piers (At X = -12 and X = +12)
  // -------------------------------------------------------------
  const pierPositions = [-12, 12];
  pierPositions.forEach((px) => {
    const pierGroup = new THREE.Group();
    pierGroup.position.set(px, 0, 0);

    // Submerged foundation with pointed upstream/downstream cutwaters
    const footShaft = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.2, 13.0), pierFootMat);
    footShaft.position.set(0, 0.4, 0);
    pierGroup.add(footShaft);

    // V-shaped pointed cutwaters (upstream Z = +6.5, downstream Z = -6.5)
    [-1, 1].forEach((dir) => {
      const cutwater = new THREE.Mesh(new THREE.ConeGeometry(2.8, 2.2, 4), pierFootMat);
      cutwater.position.set(0, 0.4, dir * 7.6);
      cutwater.rotation.y = Math.PI / 4;
      cutwater.scale.set(1.0, 1.0, 1.4);
      pierGroup.add(cutwater);
    });

    // Main rusticated ashlar pier body
    const mainPier = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.6, 11.6), pierStoneMat);
    mainPier.position.set(0, 2.5, 0);
    pierGroup.add(mainPier);

    // Horizontal ashlar coursing accent bands
    [-0.8, 0, 0.8].forEach((by) => {
      const band = new THREE.Mesh(new THREE.BoxGeometry(4.95, 0.16, 11.8), pierFootMat);
      band.position.set(0, 2.5 + by, 0);
      pierGroup.add(band);
    });

    // Pier Cap Pedestal
    const pierCap = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.5, 12.2), pierPylonMat);
    pierCap.position.set(0, 3.9, 0);
    pierGroup.add(pierCap);

    // Steel Rocker Shoe Bearings supporting the deck truss haunches at Z = -3.8 and Z = +3.8
    [-3.8, 3.8].forEach((bz) => {
      const bearingBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.4), bearingMat);
      bearingBase.position.set(0, 4.3, bz);
      pierGroup.add(bearingBase);

      const rockerPin = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.2, 12), bearingMat);
      rockerPin.rotation.x = Math.PI / 2;
      rockerPin.position.set(0, 4.65, bz);
      pierGroup.add(rockerPin);
    });

    // Architectural Stone Pylons flanking the outside of the deck up to deck level
    [-6.2, 6.2].forEach((pz) => {
      const pylonShaft = new THREE.Mesh(new THREE.BoxGeometry(2.4, 6.4, 1.8), pierPylonMat);
      pylonShaft.position.set(0, 6.4, pz);
      pierGroup.add(pylonShaft);

      // Pylon decorative cap
      const pylonCap = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.45, 2.1), pierStoneMat);
      pylonCap.position.set(0, 9.75, pz);
      pierGroup.add(pylonCap);
    });

    setAGroup.add(pierGroup);
  });

  // Shoreline Abutments (North at X = +28, South at X = -28)
  [-28, 28].forEach((ax) => {
    const abutment = new THREE.Mesh(new THREE.BoxGeometry(5.8, 7.5, 13.0), pierStoneMat);
    abutment.position.set(ax, 4.0, 0);
    setAGroup.add(abutment);
  });

  // -------------------------------------------------------------
  // 3. Cantilever DECK TRUSS Superstructure (Underneath Roadway)
  // -------------------------------------------------------------
  const trussZs = [-3.8, 3.8];
  const roadY = 8.6; // Deck top level
  const topChordY = 8.35; // Top chord centerline just under deck

  // Bottom chord profile calculation:
  // Dips to haunches over piers at X = ±12 (Y = 4.8), arches to Y = 6.8 at midspan X = 0,
  // and rises to Y = 7.0 at abutments X = ±27.
  const getBottomChordY = (x) => {
    const absX = Math.abs(x);
    if (absX <= 12) {
      // Center span: arch between X = -12 (Y = 4.8) and X = +12 (Y = 4.8), peaking at X = 0 (Y = 6.8)
      const u = x / 12.0; // -1 to +1
      return 6.8 - (1 - u * u) * (6.8 - 4.8);
    } else {
      // Anchor spans: from X = ±12 (Y = 4.8) up to X = ±27 (Y = 7.0)
      const u = (absX - 12) / 15.0; // 0 to 1
      return 4.8 + u * (7.0 - 4.8);
    }
  };

  trussZs.forEach((tz) => {
    // A) Continuous Straight Top Chord
    const topChord = new THREE.Mesh(new THREE.BoxGeometry(55, 0.45, 0.45), steelTanMat);
    topChord.position.set(0, topChordY, tz);
    topChord.castShadow = true;
    setAGroup.add(topChord);

    // B) Arched Variable-Depth Bottom Chord
    const botPoints = [];
    for (let x = -27; x <= 27; x += 1.5) {
      botPoints.push(new THREE.Vector3(x, getBottomChordY(x), tz));
    }
    const botCurve = new THREE.CatmullRomCurve3(botPoints);
    const botTube = new THREE.Mesh(
      new THREE.TubeGeometry(botCurve, 48, 0.32, 10, false),
      steelTanDarkMat
    );
    botTube.castShadow = true;
    setAGroup.add(botTube);

    // C) Vertical Posts and Warren/Pratt Diagonal Struts
    const panelW = 2.4;
    const minX = -26.4;
    const maxX = 26.4;

    for (let x = minX; x <= maxX + 0.01; x += panelW) {
      const curX = Math.round(x * 10) / 10;
      const botY = getBottomChordY(curX);
      const postH = topChordY - botY;

      if (postH > 0.4) {
        // Vertical Truss Post
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, postH, 0.3), steelTanMat);
        post.position.set(curX, botY + postH / 2, tz);
        post.castShadow = true;
        setAGroup.add(post);

        // Gusset plate reinforcement at bottom chord node
        const gusset = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.36), steelTanDarkMat);
        gusset.position.set(curX, botY, tz);
        setAGroup.add(gusset);

        // Diagonal Strut to next panel
        if (curX + panelW <= maxX + 0.01) {
          const nextX = curX + panelW;
          const nextBotY = getBottomChordY(nextX);
          const panelIndex = Math.round((curX - minX) / panelW);
          const isForward = panelIndex % 2 === 0;

          const p1 = new THREE.Vector3(curX, isForward ? botY : topChordY, tz);
          const p2 = new THREE.Vector3(nextX, isForward ? topChordY : nextBotY, tz);
          const mid = p1.clone().add(p2).multiplyScalar(0.5);
          const len = p1.distanceTo(p2);

          const diag = new THREE.Mesh(new THREE.BoxGeometry(0.24, len, 0.24), steelTanLightMat);
          diag.position.copy(mid);
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          diag.rotation.z = angle - Math.PI / 2;
          diag.castShadow = true;
          setAGroup.add(diag);
        }
      }
    }
  });

  // D) Cantilever Outrigger Deck Brackets (Supporting roadway overhang on both sides)
  const panelW = 2.4;
  for (let x = -26.4; x <= 26.4; x += panelW) {
    const curX = Math.round(x * 10) / 10;
    [-1, 1].forEach((dir) => {
      // Bracket extends from truss at Z = dir*3.8 out to deck edge Z = dir*5.3
      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.9, 1.5), steelTanLightMat);
      bracket.position.set(curX, topChordY - 0.45, dir * 4.55);
      bracket.rotation.x = dir * 0.35;
      setAGroup.add(bracket);
    });

    // Transverse floor beam connecting the two trusses
    const floorBeam = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 7.6), steelTanDarkMat);
    floorBeam.position.set(curX, topChordY - 0.25, 0);
    setAGroup.add(floorBeam);

    // Bottom lateral transverse strut between the two bottom chords
    const botY = getBottomChordY(curX);
    const botStrut = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 7.6), steelTanDarkMat);
    botStrut.position.set(curX, botY, 0);
    setAGroup.add(botStrut);
  }

  // Bottom Lateral X-Bracing
  for (let x = -24; x <= 21.6; x += panelW * 2) {
    const x1 = x;
    const x2 = x + panelW * 2;
    const y1 = getBottomChordY(x1);
    const y2 = getBottomChordY(x2);
    const midY = (y1 + y2) / 2;

    const crossArm1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 9.2), steelTanDarkMat);
    crossArm1.position.set((x1 + x2) / 2, midY, 0);
    crossArm1.rotation.y = 0.55;
    setAGroup.add(crossArm1);

    const crossArm2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 9.2), steelTanDarkMat);
    crossArm2.position.set((x1 + x2) / 2, midY, 0);
    crossArm2.rotation.y = -0.55;
    setAGroup.add(crossArm2);
  }

  // -------------------------------------------------------------
  // 4. Roadway Deck, Lanes, Barriers, Streetlights & Sign Gantries
  // -------------------------------------------------------------
  // Roadway Deck Slab (Width = 10.8m, Length = 58m)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(58, 0.45, 10.8), roadMat);
  deck.position.set(0, roadY, 0);
  deck.receiveShadow = true;
  setAGroup.add(deck);

  // Concrete Jersey Barriers along both outside curbs
  [-5.25, 5.25].forEach((bz) => {
    const barrier = new THREE.Mesh(new THREE.BoxGeometry(57.6, 0.75, 0.3), barrierMat);
    barrier.position.set(0, roadY + 0.45, bz);
    setAGroup.add(barrier);

    const handrail = new THREE.Mesh(new THREE.BoxGeometry(57.6, 0.12, 0.12), railingMat);
    handrail.position.set(0, roadY + 0.95, bz);
    setAGroup.add(handrail);
  });

  // Roadway Markings: Double Solid Yellow Centerlines & White Dashed Lanes (4 Lanes)
  for (let x = -27; x <= 27; x += 3.2) {
    // Center double yellow lines
    [-0.1, 0.1].forEach((yz) => {
      const yellowLine = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.1), stripeYellowMat);
      yellowLine.rotation.x = -Math.PI / 2;
      yellowLine.position.set(x, roadY + 0.23, yz);
      setAGroup.add(yellowLine);
    });

    // White dashed lane dividers at Z = -2.5 and Z = +2.5
    [-2.5, 2.5].forEach((wz) => {
      const whiteLine = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.12), stripeWhiteMat);
      whiteLine.rotation.x = -Math.PI / 2;
      whiteLine.position.set(x, roadY + 0.23, wz);
      setAGroup.add(whiteLine);
    });
  }

  // Streetlights along the barriers
  for (let x = -24; x <= 24; x += 8.0) {
    [-5.25, 5.25].forEach((lz) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.4, 8), poleMat);
      pole.position.set(x, roadY + 1.8, lz);
      setAGroup.add(pole);

      // Curved cobra-head luminaire arm extending over roadway
      const armDir = lz > 0 ? -1 : 1;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.8), poleMat);
      arm.position.set(x, roadY + 3.4, lz + armDir * 0.4);
      setAGroup.add(arm);

      const lampHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.08, 0.35),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2b2, emissiveIntensity: 0.6 })
      );
      lampHead.position.set(x, roadY + 3.36, lz + armDir * 0.75);
      setAGroup.add(lampHead);
    });
  }

  // Overhead Highway Sign Gantries (At X = -8 toward South Hills, X = +12 toward Downtown)
  const gantryConfigs = [
    { x: -8, signText: 'LIBERTY TUNNELS / SOUTH HILLS', signZ: -1.8 },
    { x: 14, signText: 'DOWNTOWN PITTSBURGH / I-376', signZ: 1.8 },
  ];

  gantryConfigs.forEach(({ x, signZ }) => {
    // Two vertical support posts
    [-5.25, 5.25].forEach((gz) => {
      const gPost = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.4, 0.3), gantryMat);
      gPost.position.set(x, roadY + 2.2, gz);
      setAGroup.add(gPost);
    });

    // Horizontal truss overhead beam
    const gBeam = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 10.8), gantryMat);
    gBeam.position.set(x, roadY + 4.3, 0);
    setAGroup.add(gBeam);

    // Green PennDOT highway sign
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 4.4), signGreenMat);
    signBoard.position.set(x, roadY + 3.9, signZ);
    setAGroup.add(signBoard);

    const signBorder = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.3, 4.3), signTextMat);
    signBorder.position.set(x, roadY + 3.9, signZ);
    setAGroup.add(signBorder);
  });

  // -------------------------------------------------------------
  // 5. South Hills Approach & Liberty Tunnels Portal
  // -------------------------------------------------------------
  // Sloping green hillside on South Hills shore (X = -28 to -40)
  const hill = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 24), hillsideMat);
  hill.position.set(-35, 3.5, 0);
  hill.rotation.z = -0.15;
  setAGroup.add(hill);

  // Arched stone Liberty Tunnels portal structure
  const portalStone = new THREE.Mesh(new THREE.BoxGeometry(4.0, 7.0, 14.0), tunnelStoneMat);
  portalStone.position.set(-34, 7.5, 0);
  setAGroup.add(portalStone);

  // Twin tunnel portal entrance bores
  [-3.2, 3.2].forEach((tz) => {
    const bore = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 1.0, 16, 1, false, 0, Math.PI), tunnelBoreMat);
    bore.rotation.y = Math.PI / 2;
    bore.position.set(-32.0, 8.2, tz);
    setAGroup.add(bore);
  });

  // -------------------------------------------------------------
  // 6. Set B: Hydronic De-icing Loop & Fire Standpipe Clash (CL-001)
  // -------------------------------------------------------------
  // Continuous cyan hydronic de-icing supply line running along floor stringers
  const deicingMain = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 48, 12), deicingPipeMat);
  deicingMain.rotation.z = Math.PI / 2;
  deicingMain.position.set(0, 6.4, -3.8);
  setBGroup.add(deicingMain);

  // De-icing supply manifold branch penetrating diagonally through the deck truss gusset at X = 2.4
  const deicingBranch = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 1.6), deicingPipeMat);
  deicingBranch.position.set(2.4, 6.4, -3.8);
  deicingBranch.rotation.z = 0.42;
  setBGroup.add(deicingBranch);

  // Vivid red dry standpipe fire protection header crossing through the node
  const fireHeader = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 12, 12), fireStandpipeMat);
  fireHeader.position.set(2.4, 6.4, -3.8);
  fireHeader.rotation.x = Math.PI / 2;
  setBGroup.add(fireHeader);

  // -------------------------------------------------------------
  // 7. Pulsing 3D Clash Collision Beacon at Intersection
  // -------------------------------------------------------------
  const clashPosition = new THREE.Vector3(2.4, 6.4, -3.8);
  const clashBeaconGroup = new THREE.Group();
  clashBeaconGroup.position.copy(clashPosition);

  const diamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.65),
    new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0xff1744, emissiveIntensity: 0.95 })
  );
  clashBeaconGroup.add(diamond);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.85, 1.25, 20),
    new THREE.MeshBasicMaterial({ color: 0xff5252, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
  );
  ring.rotation.x = Math.PI / 2;
  clashBeaconGroup.add(ring);

  modelGroup.add(setAGroup);
  modelGroup.add(setBGroup);
  modelGroup.add(clashBeaconGroup);

  return {
    modelGroup,
    setAGroup,
    setBGroup,
    clashBeaconGroup,
    beacon: diamond,
    ring,
    clashPosition,
    defaultCameraPos: new THREE.Vector3(26, 17, 28),
    defaultTarget: new THREE.Vector3(0, 6.8, 0),
  };
}

/**
 * 3D Procedural Generator for PPG Place (One PPG Place)
 * Located in Downtown Pittsburgh, Pennsylvania.
 *
 * Authentic Architectural Characteristics (matching photographic reference):
 * - Philip Johnson & John Burgee masterwork 44-story neo-Gothic glass skyscraper
 * - Slender, soaring tower proportions with cruciform / stepped corner pavilions
 * - Signature faceted/pleated curtain wall: alternating angular glass facets creating Philip Johnson's
 *   famous reflective prism ribs that mirror sky and light
 * - Deep continuous extruded aluminum mullions running from ground to crown
 * - Four monumental 82-foot corner spires: Gothic base turrets with steep 4-sided pyramidal pinnacles & corner ribs
 * - Serrated parapet with 16 intermediate pyramidal Gothic spires along all four rooflines
 * - Stepped pyramidal crown base leading to a soaring central pinnacle reaching Y = 51.5 (towering above corner spires)
 * - Companion 14-story PPG 2 & 3 buildings with matching faceted glass, Gothic spires, and ground-floor arcade
 * - Wintergarden soaring glass atrium with vaulted space-frame roof
 * - Dark polished charcoal granite plaza with central interactive fountain
 * - Foreground city street with curbs, sidewalks, and row of green summer trees
 * - Set B: High-voltage electrical busway & fire standpipe riser clashing through spire outrigger beam (CL-001)
 */
export function createPPGPlaceModel(THREE, options = {}) {
  const modelGroup = new THREE.Group();
  const setAGroup = new THREE.Group(); // Architectural & Structural Glass Tower (Set A)
  const setBGroup = new THREE.Group(); // High-Rise MEP Riser Penetrations (Set B)

  // -------------------------------------------------------------
  // Materials
  // -------------------------------------------------------------
  // Reflective silver-blue curtain wall glass (PPG Solarban 550)
  const glassReflectMat = new THREE.MeshStandardMaterial({
    color: 0x7aa0b6,
    emissive: 0x162c3a,
    roughness: 0.25,
    metalness: 0.45,
  });

  // Darker faceted glass panel (alternating pleat facet for authentic reflection)
  const glassFacetDarkMat = new THREE.MeshStandardMaterial({
    color: 0x557b91,
    emissive: 0x0f1e28,
    roughness: 0.3,
    metalness: 0.4,
  });

  // Dark metallic floor spandrel glass band
  const spandrelMat = new THREE.MeshStandardMaterial({
    color: 0x284352,
    roughness: 0.22,
    metalness: 0.8,
  });

  // Polished extruded aluminum mullions & spire trims
  const mullionMat = new THREE.MeshStandardMaterial({
    color: 0xe6edf3,
    roughness: 0.28,
    metalness: 0.55,
  });

  const spireMat = new THREE.MeshStandardMaterial({
    color: 0xf0f5fa,
    roughness: 0.25,
    metalness: 0.6,
  });

  // Polished charcoal granite plaza paving
  const plazaGraniteMat = new THREE.MeshStandardMaterial({
    color: 0x222629,
    roughness: 0.45,
    metalness: 0.35,
  });

  const plazaBorderMat = new THREE.MeshStandardMaterial({
    color: 0x3d4449,
    roughness: 0.6,
    metalness: 0.2,
  });

  // City Street, Curbs & Landscaping
  const streetMat = new THREE.MeshStandardMaterial({
    color: 0x26292b,
    roughness: 0.85,
    metalness: 0.15,
  });

  const curbMat = new THREE.MeshStandardMaterial({
    color: 0x8a9299,
    roughness: 0.75,
    metalness: 0.15,
  });

  const treeFoliageMat = new THREE.MeshStandardMaterial({
    color: 0x2d6a38,
    roughness: 0.78,
    metalness: 0.08,
  });

  const treeTrunkMat = new THREE.MeshStandardMaterial({
    color: 0x4e3b2e,
    roughness: 0.9,
    metalness: 0.05,
  });

  // Plaza Fountain Pool
  const fountainWaterMat = new THREE.MeshStandardMaterial({
    color: 0x1c445c,
    roughness: 0.15,
    metalness: 0.75,
  });

  // Set B Utilities: High-voltage electrical busway & Fire standpipe
  const buswayMat = new THREE.MeshStandardMaterial({
    color: 0xff9800,
    roughness: 0.35,
    metalness: 0.8,
  });

  const standpipeMat = new THREE.MeshStandardMaterial({
    color: 0xe53935,
    roughness: 0.3,
    metalness: 0.72,
  });

  // -------------------------------------------------------------
  // 1. Plaza Base, Fountain, Street & Green Trees
  // -------------------------------------------------------------
  // Polished Charcoal Granite Plaza Slab
  const plaza = new THREE.Mesh(new THREE.BoxGeometry(44, 0.6, 44), plazaGraniteMat);
  plaza.position.set(0, -0.3, 0);
  plaza.receiveShadow = true;
  setAGroup.add(plaza);

  // Decorative granite paving bands
  [-12, 0, 12].forEach((offset) => {
    const bandX = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 42), plazaBorderMat);
    bandX.rotation.x = -Math.PI / 2;
    bandX.position.set(offset, 0.02, 0);
    setAGroup.add(bandX);

    const bandZ = new THREE.Mesh(new THREE.PlaneGeometry(42, 0.5), plazaBorderMat);
    bandZ.rotation.x = -Math.PI / 2;
    bandZ.position.set(0, 0.02, offset);
    setAGroup.add(bandZ);
  });

  // Central Interactive Plaza Water Fountain
  const fountainCurb = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.4, 0.25, 32), plazaBorderMat);
  fountainCurb.position.set(0, 0.12, 0);
  setAGroup.add(fountainCurb);

  const fountainPool = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 3.8, 0.1, 32), fountainWaterMat);
  fountainPool.position.set(0, 0.2, 0);
  setAGroup.add(fountainPool);

  const fountainJet = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 1.6, 12),
    new THREE.MeshBasicMaterial({ color: 0x90caf9, transparent: true, opacity: 0.7 })
  );
  fountainJet.position.set(0, 1.0, 0);
  setAGroup.add(fountainJet);

  // Foreground Street & Sidewalk (Z = 18 to 26)
  const street = new THREE.Mesh(new THREE.BoxGeometry(44, 0.4, 8.0), streetMat);
  street.position.set(0, -0.4, 22);
  setAGroup.add(street);

  const curb = new THREE.Mesh(new THREE.BoxGeometry(44, 0.3, 0.4), curbMat);
  curb.position.set(0, -0.15, 17.8);
  setAGroup.add(curb);

  // Street Trees (Lush green summer trees matching the photograph)
  const treeXs = [-16, -8, 0, 8, 16];
  treeXs.forEach((tx) => {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(tx, 0, 19.5);

    // Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 2.2, 8), treeTrunkMat);
    trunk.position.set(0, 1.1, 0);
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Dense summer foliage canopies (layered clusters)
    const foliage1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 1), treeFoliageMat);
    foliage1.position.set(0, 2.8, 0);
    foliage1.castShadow = true;
    treeGroup.add(foliage1);

    const foliage2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 1), treeFoliageMat);
    foliage2.position.set(0.4, 3.6, -0.2);
    foliage2.castShadow = true;
    treeGroup.add(foliage2);

    const foliage3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95, 1), treeFoliageMat);
    foliage3.position.set(-0.35, 3.4, 0.3);
    foliage3.castShadow = true;
    treeGroup.add(foliage3);

    setAGroup.add(treeGroup);
  });

  // -------------------------------------------------------------
  // 2. Main Tower (One PPG Place) - 44 Stories
  // -------------------------------------------------------------
  const towerH = 34.0; // Tower height to roof level
  const coreW = 10.6;
  const coreD = 10.6;

  // Central Tower Glass Body
  const towerCore = new THREE.Mesh(new THREE.BoxGeometry(coreW, towerH, coreD), glassReflectMat);
  towerCore.position.set(0, towerH / 2, 0);
  towerCore.castShadow = true;
  setAGroup.add(towerCore);

  // Stepped Corner Pavilions (Giving One PPG Place its cruciform footprint)
  const cornerPavilionOffsets = [
    [-4.2, -4.2],
    [4.2, -4.2],
    [-4.2, 4.2],
    [4.2, 4.2],
  ];

  cornerPavilionOffsets.forEach(([cx, cz]) => {
    const pavilion = new THREE.Mesh(new THREE.BoxGeometry(coreW / 2 + 0.4, towerH, coreD / 2 + 0.4), glassFacetDarkMat);
    pavilion.position.set(cx, towerH / 2, cz);
    setAGroup.add(pavilion);
  });

  // Horizontal Floor Spandrel Bands every 1.5 units from Level 1 to Level 44
  for (let y = 1.5; y < towerH; y += 1.5) {
    const spandrel = new THREE.Mesh(new THREE.BoxGeometry(coreW + 0.5, 0.28, coreD + 0.5), spandrelMat);
    spandrel.position.set(0, y, 0);
    setAGroup.add(spandrel);
  }

  // Philip Johnson's Faceted / Pleated Curtain Wall (Alternating vertical triangular glass ribs)
  // Replicating the accordion-like reflective vertical pleats on all 4 faces
  const pleatCount = 6;
  const pleatStep = coreW / pleatCount;

  [-1, 1].forEach((dir) => {
    // North and South pleated facades
    for (let i = 0; i < pleatCount; i++) {
      const px = -coreW / 2 + (i + 0.5) * pleatStep;
      const isAlt = i % 2 === 0;

      // Triangular projecting facet prism
      const prism = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.32, towerH, 3),
        isAlt ? glassReflectMat : glassFacetDarkMat
      );
      prism.position.set(px, towerH / 2, dir * (coreD / 2 + 0.16));
      prism.rotation.y = (dir * Math.PI) / 2 + (isAlt ? 0.2 : -0.2);
      setAGroup.add(prism);

      // Deep continuous vertical aluminum mullion fin along the facet peak
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.14, towerH, 0.32), mullionMat);
      fin.position.set(px, towerH / 2, dir * (coreD / 2 + 0.32));
      setAGroup.add(fin);
    }

    // East and West pleated facades
    for (let i = 0; i < pleatCount; i++) {
      const pz = -coreD / 2 + (i + 0.5) * pleatStep;
      const isAlt = i % 2 === 0;

      const prism = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.32, towerH, 3),
        isAlt ? glassReflectMat : glassFacetDarkMat
      );
      prism.position.set(dir * (coreW / 2 + 0.16), towerH / 2, pz);
      prism.rotation.y = isAlt ? 0.2 : -0.2;
      setAGroup.add(prism);

      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.32, towerH, 0.14), mullionMat);
      fin.position.set(dir * (coreW / 2 + 0.32), towerH / 2, pz);
      setAGroup.add(fin);
    }
  });

  // Grand Corner Mullion Columns from Ground to Spire Bases
  const cornerCoords = [
    [-coreW / 2 - 0.2, -coreD / 2 - 0.2],
    [coreW / 2 + 0.2, -coreD / 2 - 0.2],
    [-coreW / 2 - 0.2, coreD / 2 + 0.2],
    [coreW / 2 + 0.2, coreD / 2 + 0.2],
  ];

  cornerCoords.forEach(([cx, cz]) => {
    const cornerCol = new THREE.Mesh(new THREE.BoxGeometry(0.45, towerH, 0.45), mullionMat);
    cornerCol.position.set(cx, towerH / 2, cz);
    setAGroup.add(cornerCol);
  });

  // -------------------------------------------------------------
  // 3. Signature Neo-Gothic Spires & Parapet Crown
  // -------------------------------------------------------------
  // A) Four 82-Foot Corner Spires (Towering above parapet)
  cornerCoords.forEach(([cx, cz]) => {
    const spireGroup = new THREE.Group();
    spireGroup.position.set(cx, towerH, cz);

    // Gothic base turret with spandrel panels
    const turret = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.2, 2.2), glassReflectMat);
    turret.position.set(0, 1.6, 0);
    spireGroup.add(turret);

    const turretBand = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.35, 2.35), mullionMat);
    turretBand.position.set(0, 3.2, 0);
    spireGroup.add(turretBand);

    // Steep 4-sided pyramidal Gothic pinnacle (Rising from Y = 3.2 to 12.5 -> reaches Y = 46.5)
    const pinnacle = new THREE.Mesh(new THREE.ConeGeometry(1.4, 9.4, 4), spireMat);
    pinnacle.position.set(0, 3.2 + 4.7, 0);
    pinnacle.rotation.y = Math.PI / 4;
    pinnacle.castShadow = true;
    spireGroup.add(pinnacle);

    // Corner ribs running up the 4 edges of the pinnacle
    const ribAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    ribAngles.forEach((ang) => {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.12, 9.2, 0.12), mullionMat);
      rib.position.set(Math.cos(ang) * 0.5, 3.2 + 4.6, Math.sin(ang) * 0.5);
      spireGroup.add(rib);
    });

    // Needle-sharp crowning finial
    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.6, 8), mullionMat);
    finial.position.set(0, 3.2 + 9.4 + 0.8, 0);
    spireGroup.add(finial);

    setAGroup.add(spireGroup);
  });

  // B) Serrated Parapet with Intermediate Gothic Spires (Cathedral Skyline)
  // Rows of smaller pyramidal spires along all 4 roof edges between the corner spires
  const intermediateOffsets = [-3.2, -1.1, 1.1, 3.2];
  [-1, 1].forEach((dir) => {
    // North and South parapets
    intermediateOffsets.forEach((ox) => {
      const subTurret = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.9), mullionMat);
      subTurret.position.set(ox, towerH + 0.6, dir * (coreD / 2 + 0.15));
      setAGroup.add(subTurret);

      const subSpire = new THREE.Mesh(new THREE.ConeGeometry(0.65, 3.4, 4), spireMat);
      subSpire.position.set(ox, towerH + 1.2 + 1.7, dir * (coreD / 2 + 0.15));
      subSpire.rotation.y = Math.PI / 4;
      setAGroup.add(subSpire);
    });

    // East and West parapets
    intermediateOffsets.forEach((oz) => {
      const subTurret = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.9), mullionMat);
      subTurret.position.set(dir * (coreW / 2 + 0.15), towerH + 0.6, oz);
      setAGroup.add(subTurret);

      const subSpire = new THREE.Mesh(new THREE.ConeGeometry(0.65, 3.4, 4), spireMat);
      subSpire.position.set(dir * (coreW / 2 + 0.15), towerH + 1.2 + 1.7, oz);
      subSpire.rotation.y = Math.PI / 4;
      setAGroup.add(subSpire);
    });
  });

  // C) Stepped Central Crown Pyramid & Soaring Central Pinnacle
  // Roof pyramid base stepping inward
  const crownBase = new THREE.Mesh(new THREE.ConeGeometry(6.4, 4.5, 4), glassReflectMat);
  crownBase.position.set(0, towerH + 2.25, 0);
  crownBase.rotation.y = Math.PI / 4;
  setAGroup.add(crownBase);

  // Soaring Central Pinnacle (Reaching Y = 51.5, significantly taller than corner spires)
  const centralSpireGroup = new THREE.Group();
  centralSpireGroup.position.set(0, towerH + 4.5, 0);

  const crownTurret = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 2.4), mullionMat);
  crownTurret.position.set(0, 0.9, 0);
  centralSpireGroup.add(crownTurret);

  const mainPinnacle = new THREE.Mesh(new THREE.ConeGeometry(1.6, 11.2, 4), spireMat);
  mainPinnacle.position.set(0, 1.8 + 5.6, 0);
  mainPinnacle.rotation.y = Math.PI / 4;
  mainPinnacle.castShadow = true;
  centralSpireGroup.add(mainPinnacle);

  const centralNeedle = new THREE.Mesh(new THREE.ConeGeometry(0.24, 2.2, 8), mullionMat);
  centralNeedle.position.set(0, 1.8 + 11.2 + 1.1, 0);
  centralSpireGroup.add(centralNeedle);

  setAGroup.add(centralSpireGroup);

  // -------------------------------------------------------------
  // 4. PPG Place Complex Companion Buildings & Wintergarden
  // -------------------------------------------------------------
  // PPG Two & Three (14-story companion building on plaza perimeter)
  const compW = 8.4;
  const compH = 13.5;
  const compD = 14.0;
  const compX = -14.5;
  const compZ = 5.5;

  const companion = new THREE.Mesh(new THREE.BoxGeometry(compW, compH, compD), glassReflectMat);
  companion.position.set(compX, compH / 2, compZ);
  companion.castShadow = true;
  setAGroup.add(companion);

  // Companion building spandrels
  for (let y = 1.5; y < compH; y += 1.5) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(compW + 0.2, 0.22, compD + 0.2), spandrelMat);
    sp.position.set(compX, y, compZ);
    setAGroup.add(sp);
  }

  // Ground-floor pedestrian colonnade with pointed Gothic arches facing the plaza
  for (let z = compZ - compD / 2 + 1.8; z <= compZ + compD / 2 - 1.8; z += 2.6) {
    const archCol = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.2, 0.4), mullionMat);
    archCol.position.set(compX + compW / 2 + 0.1, 1.6, z);
    setAGroup.add(archCol);
  }

  // Perimeter Gothic Spires crowning the companion building roof
  for (let z = compZ - compD / 2 + 1.2; z <= compZ + compD / 2 - 0.2; z += 2.4) {
    [-1, 1].forEach((dir) => {
      const cspire = new THREE.Mesh(new THREE.ConeGeometry(0.55, 2.6, 4), spireMat);
      cspire.position.set(compX + (dir * compW) / 2, compH + 1.3, z);
      cspire.rotation.y = Math.PI / 4;
      setAGroup.add(cspire);
    });
  }

  // Wintergarden Soaring Glass Atrium (South edge of plaza)
  const wgW = 9.2;
  const wgH = 5.4;
  const wgD = 6.4;
  const wgZ = 14.5;

  const wgGlass = new THREE.Mesh(new THREE.BoxGeometry(wgW, wgH, wgD), glassReflectMat);
  wgGlass.position.set(0, wgH / 2, wgZ);
  setAGroup.add(wgGlass);

  // Vaulted space-frame glass roof
  const wgRoof = new THREE.Mesh(new THREE.ConeGeometry(5.8, 2.8, 4), spireMat);
  wgRoof.position.set(0, wgH + 1.4, wgZ);
  wgRoof.rotation.y = Math.PI / 4;
  setAGroup.add(wgRoof);

  // -------------------------------------------------------------
  // 5. Set B: High-Voltage Electrical Busway & Fire Standpipe Clash
  // -------------------------------------------------------------
  // Structural outrigger diagonal frame beam at Level 44 (X = 4.2, Y = 28.5, Z = 4.2)
  const outriggerBeam = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 4.0), mullionMat);
  outriggerBeam.position.set(4.2, 28.5, 4.2);
  outriggerBeam.rotation.y = 0.45;
  setAGroup.add(outriggerBeam);

  // High-voltage electrical bus duct rising vertically from substation
  const busway = new THREE.Mesh(new THREE.BoxGeometry(0.65, 30.0, 0.65), buswayMat);
  busway.position.set(4.2, 15.0, 4.2);
  setBGroup.add(busway);

  // Vivid red fire protection standpipe cross-feed penetrating through the structural frame
  const standpipe = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 6.0, 12), standpipeMat);
  standpipe.position.set(4.2, 28.5, 4.2);
  standpipe.rotation.x = Math.PI / 2;
  setBGroup.add(standpipe);

  // -------------------------------------------------------------
  // 6. Pulsing 3D Clash Collision Beacon at Intersection
  // -------------------------------------------------------------
  const clashPosition = new THREE.Vector3(4.2, 28.5, 4.2);
  const clashBeaconGroup = new THREE.Group();
  clashBeaconGroup.position.copy(clashPosition);

  const diamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.7),
    new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0xff1744, emissiveIntensity: 0.95 })
  );
  clashBeaconGroup.add(diamond);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.9, 1.35, 20),
    new THREE.MeshBasicMaterial({ color: 0xff5252, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
  );
  ring.rotation.x = Math.PI / 2;
  clashBeaconGroup.add(ring);

  modelGroup.add(setAGroup);
  modelGroup.add(setBGroup);
  modelGroup.add(clashBeaconGroup);

  return {
    modelGroup,
    setAGroup,
    setBGroup,
    clashBeaconGroup,
    beacon: diamond,
    ring,
    clashPosition,
    defaultCameraPos: new THREE.Vector3(52, 32, 58),
    defaultTarget: new THREE.Vector3(0, 24.5, 0),
  };
}

/**
 * Universal model dispatcher matching the requested Pittsburgh landmarks:
 * 1. Roberto Clemente Bridge (Pittsburgh, PA)
 * 2. Liberty Bridge (Pittsburgh, PA)
 * 3. PPG Place (Pittsburgh, PA)
 */
export function getModelForIModel(iModelName = '', THREE, options = {}) {
  const norm = (iModelName || '').toLowerCase();
  if (norm.includes('liberty') || norm.includes('data')) {
    return {
      type: 'Liberty Bridge',
      displayName: 'Liberty Bridge (Pittsburgh, PA)',
      ...createLibertyBridgeModel(THREE, options),
    };
  }
  if (norm.includes('ppg') || norm.includes('tied') || norm.includes('arch')) {
    return {
      type: 'PPG Place',
      displayName: 'PPG Place (Pittsburgh, PA)',
      ...createPPGPlaceModel(THREE, options),
    };
  }
  return {
    type: 'Roberto Clemente Bridge',
    displayName: 'Roberto Clemente Bridge (Pittsburgh, PA)',
    ...createRobertoClementeBridgeModel(THREE, options),
  };
}

/**
 * 3D Procedural Generator for the Roberto Clemente Bridge (Sixth Street Bridge)
 * Located in Pittsburgh, Pennsylvania across the Allegheny River.
 *
 * Distinctive Architectural Characteristics:
 * - Signature "Pittsburgh / Aztec Gold" painted structural steel (#f2a900)
 * - Self-anchored eyebar suspension bridge design (one of the iconic "Three Sisters")
 * - Twin architectural steel suspension towers with arched roadway portals and diagonal lattice bracing
 * - Graceful catenary eyebar chains with vertical suspender rods
 * - Stiffening Warren through-trusses along the roadway deck
 * - Rusticated stone masonry river piers with pointed cutwaters
 * - Allegheny River water surface plane
 * - Set B utility pipe with interactive pulsing clash collision beacon
 */

export function createRobertoClementeBridgeModel(THREE, options = {}) {
  const { showWater = true } = options;

  const modelGroup = new THREE.Group();
  const setAGroup = new THREE.Group(); // Structural Bridge Elements (Set A)
  const setBGroup = new THREE.Group(); // Utility & Mechanical Penetrations (Set B)

  // -------------------------------------------------------------
  // Materials
  // -------------------------------------------------------------
  // Signature Pittsburgh Aztec Gold for steel superstructure
  const goldSteelMat = new THREE.MeshStandardMaterial({
    color: 0xf2a900,
    roughness: 0.38,
    metalness: 0.55,
  });

  // Slightly darker gold for truss chords and shadow contrast
  const goldShadowMat = new THREE.MeshStandardMaterial({
    color: 0xd99500,
    roughness: 0.45,
    metalness: 0.5,
  });

  // Lighter gold for slender suspenders and railings
  const goldHighlightMat = new THREE.MeshStandardMaterial({
    color: 0xfdb813,
    roughness: 0.3,
    metalness: 0.6,
  });

  // Allegheny River masonry stone piers
  const pierStoneMat = new THREE.MeshStandardMaterial({
    color: 0x6e7a78,
    roughness: 0.85,
    metalness: 0.12,
  });

  // Wet waterline stone base
  const pierBaseMat = new THREE.MeshStandardMaterial({
    color: 0x475153,
    roughness: 0.9,
    metalness: 0.1,
  });

  // 6th Street Bridge asphalt roadway surface
  const roadwayMat = new THREE.MeshStandardMaterial({
    color: 0x24282c,
    roughness: 0.8,
    metalness: 0.2,
  });

  // Yellow center roadway stripe
  const stripeMat = new THREE.MeshBasicMaterial({
    color: 0xffd54f,
  });

  // Pedestrian walkway concrete
  const sidewalkMat = new THREE.MeshStandardMaterial({
    color: 0x8a979c,
    roughness: 0.7,
    metalness: 0.15,
  });

  // Allegheny River reflective water surface
  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x142f3d,
    roughness: 0.2,
    metalness: 0.65,
    transparent: true,
    opacity: 0.9,
  });

  // Set B: Penetrating utility pipe (Metallic Blue/Cyan)
  const utilityPipeMat = new THREE.MeshStandardMaterial({
    color: 0x00acc1,
    roughness: 0.28,
    metalness: 0.8,
  });

  // Utility pipe mounting brackets & fittings
  const fittingMat = new THREE.MeshStandardMaterial({
    color: 0x00838f,
    roughness: 0.4,
    metalness: 0.7,
  });

  // Helper to create structural meshes with subtle edge outlines for CAD clarity
  const edgeLineMat = new THREE.LineBasicMaterial({ color: 0x1a1a1a, linewidth: 1.2 });
  const createSteelMesh = (geo, mat = goldSteelMat, withEdges = true) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (withEdges) {
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(edges, edgeLineMat);
      mesh.add(line);
    }
    return mesh;
  };

  // -------------------------------------------------------------
  // 1. Allegheny River Surface
  // -------------------------------------------------------------
  if (showWater) {
    const riverGeo = new THREE.PlaneGeometry(80, 48);
    const riverMesh = new THREE.Mesh(riverGeo, riverMat);
    riverMesh.rotation.x = -Math.PI / 2;
    riverMesh.position.set(0, -0.6, 0);
    riverMesh.receiveShadow = true;
    modelGroup.add(riverMesh);
  }

  // -------------------------------------------------------------
  // 2. Stone River Piers & Shoreline Abutments
  // -------------------------------------------------------------
  const pierPositions = [-11, 11];
  pierPositions.forEach((px) => {
    // Waterline base footing
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.8, 14.0), pierBaseMat);
    baseMesh.position.set(px, 0.2, 0);
    baseMesh.receiveShadow = true;
    setAGroup.add(baseMesh);

    // Main rusticated sandstone pier shaft
    const shaftMesh = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.8, 13.0), pierStoneMat);
    shaftMesh.position.set(px, 2.4, 0);
    shaftMesh.castShadow = true;
    shaftMesh.receiveShadow = true;
    setAGroup.add(shaftMesh);

    // Upstream & Downstream pointed cutwaters (triangular icebreakers)
    [-6.5, 6.5].forEach((pz, idx) => {
      const noseGeo = new THREE.CylinderGeometry(0.1, 2.1, 4.2, 3);
      const nose = new THREE.Mesh(noseGeo, pierStoneMat);
      nose.position.set(px, 2.2, pz);
      nose.rotation.y = idx === 0 ? -Math.PI / 2 : Math.PI / 2;
      setAGroup.add(nose);
    });

    // Pier cornice / top stone molding cap
    const capMesh = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.5, 13.4), pierStoneMat);
    capMesh.position.set(px, 4.25, 0);
    setAGroup.add(capMesh);
  });

  // Shoreline concrete & stone abutments
  [-27, 27].forEach((ax) => {
    const abutment = new THREE.Mesh(new THREE.BoxGeometry(5.0, 6.0, 14.0), pierStoneMat);
    abutment.position.set(ax, 1.8, 0);
    abutment.receiveShadow = true;
    setAGroup.add(abutment);
  });

  // -------------------------------------------------------------
  // 3. Roadway Deck, Walkways, and Railings
  // -------------------------------------------------------------
  // Roadway slab spanning across
  const deckSlab = new THREE.Mesh(new THREE.BoxGeometry(54, 0.45, 8.4), roadwayMat);
  deckSlab.position.set(0, 4.0, 0);
  deckSlab.receiveShadow = true;
  setAGroup.add(deckSlab);

  // Dashed yellow center traffic lines
  for (let x = -25; x <= 25; x += 3.2) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.15), stripeMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(x, 4.24, 0);
    setAGroup.add(stripe);
  }

  // Cantilevered pedestrian sidewalks on North and South sides
  [-4.9, 4.9].forEach((sz) => {
    const walk = new THREE.Mesh(new THREE.BoxGeometry(54, 0.35, 1.8), sidewalkMat);
    walk.position.set(0, 4.15, sz);
    setAGroup.add(walk);

    // Decorative pedestrian safety railings
    const topRail = createSteelMesh(new THREE.BoxGeometry(54, 0.12, 0.12), goldHighlightMat, false);
    topRail.position.set(0, 5.05, sz + (sz > 0 ? 0.8 : -0.8));
    setAGroup.add(topRail);

    // Vertical railing pickets
    for (let x = -26; x <= 26; x += 1.8) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.08), goldHighlightMat);
      post.position.set(x, 4.6, sz + (sz > 0 ? 0.8 : -0.8));
      setAGroup.add(post);
    }
  });

  // -------------------------------------------------------------
  // 4. Stiffening Warren Through-Trusses along the Deck
  // -------------------------------------------------------------
  const trussZs = [-4.0, 4.0];
  trussZs.forEach((tz) => {
    // Top chord of stiffening truss
    const topChord = createSteelMesh(new THREE.BoxGeometry(53, 0.35, 0.4), goldShadowMat);
    topChord.position.set(0, 5.5, tz);
    setAGroup.add(topChord);

    // Bottom chord of stiffening truss
    const bottomChord = createSteelMesh(new THREE.BoxGeometry(53, 0.35, 0.4), goldShadowMat);
    bottomChord.position.set(0, 3.8, tz);
    setAGroup.add(bottomChord);

    // Vertical posts & Warren diagonal web members (/ \ / \ / \)
    for (let x = -25; x <= 25; x += 2.0) {
      // Vertical post
      const vert = createSteelMesh(new THREE.BoxGeometry(0.25, 1.7, 0.25), goldSteelMat);
      vert.position.set(x, 4.65, tz);
      setAGroup.add(vert);

      // Diagonal brace to next panel point
      if (x < 25) {
        const diagLen = Math.sqrt(2.0 * 2.0 + 1.7 * 1.7);
        const diagAngle = Math.atan2(1.7, 2.0);
        const isUp = ((x + 25) / 2.0) % 2 === 0;

        const diag = createSteelMesh(new THREE.BoxGeometry(0.22, diagLen, 0.22), goldSteelMat);
        diag.position.set(x + 1.0, 4.65, tz);
        diag.rotation.z = isUp ? -diagAngle : diagAngle;
        setAGroup.add(diag);
      }
    }
  });

  // -------------------------------------------------------------
  // 5. Twin Steel Suspension Towers (Pylons at X = -11 and X = +11)
  // -------------------------------------------------------------
  pierPositions.forEach((tx) => {
    trussZs.forEach((tz) => {
      // Main vertical steel pylon leg
      const legGeo = new THREE.BoxGeometry(1.35, 12.2, 1.35);
      const leg = createSteelMesh(legGeo, goldSteelMat);
      leg.position.set(tx, 10.3, tz);
      setAGroup.add(leg);

      // Pylon base pedestal on pier
      const ped = createSteelMesh(new THREE.BoxGeometry(1.9, 0.8, 1.9), goldShadowMat);
      ped.position.set(tx, 4.6, tz);
      setAGroup.add(ped);

      // Tower summit saddle cap
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 1.45, 12), goldShadowMat);
      cap.rotation.x = Math.PI / 2;
      cap.position.set(tx, 16.5, tz);
      setAGroup.add(cap);
    });

    // Lower roadway portal arch transom (connecting the twin legs above traffic)
    const portalBeam = createSteelMesh(new THREE.BoxGeometry(1.2, 0.9, 8.4), goldShadowMat);
    portalBeam.position.set(tx, 9.4, 0);
    setAGroup.add(portalBeam);

    // Decorative gothic/curved portal knee braces
    [-3.2, 3.2].forEach((bz) => {
      const knee = createSteelMesh(new THREE.BoxGeometry(0.8, 1.4, 0.8), goldSteelMat);
      knee.position.set(tx, 8.7, bz);
      knee.rotation.x = bz > 0 ? 0.45 : -0.45;
      setAGroup.add(knee);
    });

    // Upper transom beam near tower summit
    const upperBeam = createSteelMesh(new THREE.BoxGeometry(1.0, 0.75, 8.4), goldShadowMat);
    upperBeam.position.set(tx, 15.2, 0);
    setAGroup.add(upperBeam);

    // X-Lattice cross-bracing in upper tower portal
    const xLen = Math.sqrt(8.0 * 8.0 + 4.8 * 4.8);
    const xAngle = Math.atan2(4.8, 8.0);
    [1, -1].forEach((dir) => {
      const xBrace = createSteelMesh(new THREE.CylinderGeometry(0.18, 0.18, xLen, 8), goldSteelMat);
      xBrace.position.set(tx, 12.3, 0);
      xBrace.rotation.x = dir * xAngle;
      setAGroup.add(xBrace);
    });
  });

  // -------------------------------------------------------------
  // 6. Signature Eyebar Suspension Chains (Three Sisters Catenary)
  // -------------------------------------------------------------
  trussZs.forEach((cz) => {
    // A) Center Span Catenary Eyebar Chain (between towers: X from -11 to +11)
    const centerPoints = [];
    for (let i = 0; i <= 32; i++) {
      const t = (i / 32) * 2 - 1; // -1 to +1
      const x = t * 11.0;
      // Parabolic catenary sag: Y=16.3 at towers, Y=6.4 at center midspan
      const y = 6.4 + t * t * (16.3 - 6.4);
      centerPoints.push(new THREE.Vector3(x, y, cz));
    }
    const centerCurve = new THREE.CatmullRomCurve3(centerPoints);
    const centerChainGeo = new THREE.TubeGeometry(centerCurve, 40, 0.32, 10, false);
    const centerChain = new THREE.Mesh(centerChainGeo, goldSteelMat);
    centerChain.castShadow = true;
    setAGroup.add(centerChain);

    // B) West Side Span (from X = -11 down to anchorage X = -26)
    const westPoints = [];
    for (let i = 0; i <= 20; i++) {
      const frac = i / 20;
      const x = -11.0 - frac * 15.0;
      const y = 16.3 - frac * frac * (16.3 - 5.5);
      westPoints.push(new THREE.Vector3(x, y, cz));
    }
    const westCurve = new THREE.CatmullRomCurve3(westPoints);
    const westChainGeo = new THREE.TubeGeometry(westCurve, 24, 0.32, 10, false);
    const westChain = new THREE.Mesh(westChainGeo, goldSteelMat);
    westChain.castShadow = true;
    setAGroup.add(westChain);

    // C) East Side Span (from X = +11 down to anchorage X = +26)
    const eastPoints = [];
    for (let i = 0; i <= 20; i++) {
      const frac = i / 20;
      const x = 11.0 + frac * 15.0;
      const y = 16.3 - frac * frac * (16.3 - 5.5);
      eastPoints.push(new THREE.Vector3(x, y, cz));
    }
    const eastCurve = new THREE.CatmullRomCurve3(eastPoints);
    const eastChainGeo = new THREE.TubeGeometry(eastCurve, 24, 0.32, 10, false);
    const eastChain = new THREE.Mesh(eastChainGeo, goldSteelMat);
    eastChain.castShadow = true;
    setAGroup.add(eastChain);

    // D) Vertical Hanger Suspender Rods (connecting eyebar chain down to truss)
    for (let x = -24; x <= 24; x += 2.0) {
      if (Math.abs(x - 11) < 0.8 || Math.abs(x + 11) < 0.8) continue; // skip at tower columns

      let chainY = 0;
      if (Math.abs(x) <= 11) {
        const t = x / 11.0;
        chainY = 6.4 + t * t * (16.3 - 6.4);
      } else {
        const frac = (Math.abs(x) - 11.0) / 15.0;
        chainY = 16.3 - frac * frac * (16.3 - 5.5);
      }

      const hangerHeight = chainY - 5.5;
      if (hangerHeight > 0.4) {
        const hangerGeo = new THREE.CylinderGeometry(0.09, 0.09, hangerHeight, 8);
        const hanger = new THREE.Mesh(hangerGeo, goldHighlightMat);
        hanger.position.set(x, 5.5 + hangerHeight / 2, cz);
        setAGroup.add(hanger);

        // Eyebar pin joint connection head
        const pinHead = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.38, 12), goldShadowMat);
        pinHead.rotation.x = Math.PI / 2;
        pinHead.position.set(x, chainY, cz);
        setAGroup.add(pinHead);
      }
    }
  });

  // -------------------------------------------------------------
  // 7. Set B: Penetrating Utility Pipe (Causing the Clash with Set A)
  // -------------------------------------------------------------
  // Blue utility pipe running under deck and penetrating diagonal truss at X = 2.0, Y = 4.6, Z = -4.0
  const pipePoints = [
    new THREE.Vector3(-8.0, 3.2, -3.2),
    new THREE.Vector3(-2.0, 3.9, -3.6),
    new THREE.Vector3(2.0, 4.6, -4.0), // Collision point through the Warren diagonal!
    new THREE.Vector3(6.5, 5.2, -4.4),
    new THREE.Vector3(12.0, 4.8, -4.6),
  ];
  const pipeCurve = new THREE.CatmullRomCurve3(pipePoints);
  const pipeGeo = new THREE.TubeGeometry(pipeCurve, 32, 0.28, 12, false);
  const pipeMesh = new THREE.Mesh(pipeGeo, utilityPipeMat);
  pipeMesh.castShadow = true;
  setBGroup.add(pipeMesh);

  // Pipe mounting brackets & joints
  [-5.0, -1.0, 5.0, 9.0].forEach((bx) => {
    const pt = pipeCurve.getPointAt((bx + 8.0) / 20.0);
    const bracket = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.2, 12), fittingMat);
    bracket.position.copy(pt);
    setBGroup.add(bracket);
  });

  // -------------------------------------------------------------
  // 8. Pulsing 3D Clash Collision Beacon at Intersection
  // -------------------------------------------------------------
  const clashPosition = new THREE.Vector3(2.0, 4.6, -4.0);
  const clashBeaconGroup = new THREE.Group();
  clashBeaconGroup.position.copy(clashPosition);

  const diamondMat = new THREE.MeshStandardMaterial({
    color: 0xff1744,
    emissive: 0xff1744,
    emissiveIntensity: 0.95,
  });
  const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.65), diamondMat);
  clashBeaconGroup.add(beacon);

  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xff5252,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.25, 20), ringMat);
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
    beacon,
    ring,
    clashPosition,
    defaultCameraPos: new THREE.Vector3(22, 16, 26),
    defaultTarget: new THREE.Vector3(0, 6.0, 0),
  };
}

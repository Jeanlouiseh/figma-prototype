import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Paper,
  Tooltip,
  TextField,
  InputAdornment,
  Divider,
  Collapse,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import { MODELS_REGISTRY } from '../data/imodelData';

// -------------------------------------------------------------
// Procedural 3D Generator: Tied Arch Bridge
// -------------------------------------------------------------
function buildTiedArchBridge(scene, elementGroups) {
  // Concrete Abutments & Piers
  const pierGroup = new THREE.Group();
  const pierMat = new THREE.MeshStandardMaterial({ color: 0x607274, roughness: 0.8, metalness: 0.1 });
  const pierGeo = new THREE.BoxGeometry(6, 12, 16);
  [-28, 28].forEach((x) => {
    const pier = new THREE.Mesh(pierGeo, pierMat);
    pier.position.set(x, 2, 0);
    pier.castShadow = true;
    pier.receiveShadow = true;
    pierGroup.add(pier);
  });
  // Center stream piers
  [-10, 10].forEach((x) => {
    const pier = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.0, 7, 16), pierMat);
    pier.position.set(x, 0.5, 0);
    pierGroup.add(pier);
  });
  scene.add(pierGroup);
  elementGroups['concrete-piers'] = pierGroup;

  // Deck Girders & Floor
  const deckGroup = new THREE.Group();
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x2e383f, roughness: 0.7, metalness: 0.5 });
  const deckPlate = new THREE.Mesh(new THREE.BoxGeometry(56, 1.2, 12), deckMat);
  deckPlate.position.set(0, 7.5, 0);
  deckPlate.castShadow = true;
  deckPlate.receiveShadow = true;
  deckGroup.add(deckPlate);

  // Longitudinal box girders (Set A blue)
  const girderMat = new THREE.MeshStandardMaterial({ color: 0x1976d2, roughness: 0.4, metalness: 0.75 });
  [-5.2, 5.2].forEach((z) => {
    const girder = new THREE.Mesh(new THREE.BoxGeometry(56, 2.2, 1.1), girderMat);
    girder.position.set(0, 6.2, z);
    girder.castShadow = true;
    deckGroup.add(girder);
  });

  // Cross beams under deck
  for (let x = -26; x <= 26; x += 4) {
    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.4, 11.5), girderMat);
    crossBeam.position.set(x, 6.4, 0);
    deckGroup.add(crossBeam);
  }
  scene.add(deckGroup);
  elementGroups['deck-girders'] = deckGroup;

  // Arch Ribs (Set A signature)
  const archGroup = new THREE.Group();
  const archMat = new THREE.MeshStandardMaterial({ color: 0x1e88e5, roughness: 0.35, metalness: 0.8 });
  [-5.2, 5.2].forEach((z) => {
    const points = [];
    const span = 28;
    const height = 18;
    for (let i = 0; i <= 36; i++) {
      const t = (i / 36) * 2 - 1;
      const x = t * span;
      const y = 7.5 + (1 - t * t) * height;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.85, 12, false);
    const archMesh = new THREE.Mesh(tubeGeo, archMat);
    archMesh.castShadow = true;
    archGroup.add(archMesh);
  });
  scene.add(archGroup);
  elementGroups['arch-ribs'] = archGroup;

  // Overhead K-Bracing & Portals
  const braceGroup = new THREE.Group();
  const braceMat = new THREE.MeshStandardMaterial({ color: 0x00acc1, roughness: 0.4, metalness: 0.8 });
  for (let t = -0.7; t <= 0.7; t += 0.28) {
    const x = t * 28;
    const y = 7.5 + (1 - t * t) * 18;
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 10.4, 8), braceMat);
    strut.rotation.x = Math.PI / 2;
    strut.position.set(x, y, 0);
    braceGroup.add(strut);

    const diag = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 12, 8), braceMat);
    diag.position.set(x + 1.8, y - 0.2, 0);
    diag.rotation.z = 0.32;
    diag.rotation.x = 0.6;
    braceGroup.add(diag);
  }
  scene.add(braceGroup);
  elementGroups['wind-bracing'] = braceGroup;

  // Vertical Hanger Cables
  const hangerGroup = new THREE.Group();
  const cableMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.2, metalness: 0.95 });
  for (let x = -24; x <= 24; x += 3.4) {
    const t = x / 28;
    const archY = 7.5 + (1 - t * t) * 18;
    [-5.2, 5.2].forEach((z) => {
      const len = archY - 7.5;
      if (len > 0.5) {
        const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, len, 8), cableMat);
        cable.position.set(x, 7.5 + len / 2, z);
        hangerGroup.add(cable);
      }
    });
  }
  scene.add(hangerGroup);
  elementGroups['hangers'] = hangerGroup;

  // Set B (MEP/Utilities): HVAC Ducts
  const hvacGroup = new THREE.Group();
  const ductMat = new THREE.MeshStandardMaterial({ color: 0xff7043, roughness: 0.3, metalness: 0.85 });
  const duct1 = new THREE.Mesh(new THREE.BoxGeometry(54, 1.4, 2.2), ductMat);
  duct1.position.set(0, 9.2, 1.8);
  duct1.castShadow = true;
  hvacGroup.add(duct1);

  // Branch penetrating K-brace portal
  const branch = new THREE.Mesh(new THREE.BoxGeometry(3.5, 5.2, 2.2), ductMat);
  branch.position.set(-10, 10.8, 1.8);
  branch.rotation.z = 0.35;
  hvacGroup.add(branch);
  scene.add(hvacGroup);
  elementGroups['hvac-ducts'] = hvacGroup;

  // Storm Drainage Piping
  const drainGroup = new THREE.Group();
  const drainMat = new THREE.MeshStandardMaterial({ color: 0xffa726, roughness: 0.35, metalness: 0.7 });
  const drainPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 54, 16), drainMat);
  drainPipe.rotation.z = Math.PI / 2;
  drainPipe.position.set(0, 5.2, -3.1);
  drainGroup.add(drainPipe);

  // Downspouts
  [-20, -6, 8, 22].forEach((x) => {
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 6, 12), drainMat);
    sp.position.set(x, 2.8, -3.1);
    drainGroup.add(sp);
  });
  scene.add(drainGroup);
  elementGroups['drainage-pipes'] = drainGroup;

  // Cable Trays & Feeders
  const trayGroup = new THREE.Group();
  const trayMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, roughness: 0.4, metalness: 0.65 });
  const tray = new THREE.Mesh(new THREE.BoxGeometry(54, 0.4, 1.4), trayMat);
  tray.position.set(0, 5.2, -4.8);
  trayGroup.add(tray);
  scene.add(trayGroup);
  elementGroups['cable-trays'] = trayGroup;

  // Deck Lighting & Conduits
  const lightGroup = new THREE.Group();
  const lightMat = new THREE.MeshStandardMaterial({ color: 0xffeb3b, emissive: 0xfff59d, emissiveIntensity: 0.7 });
  for (let x = -24; x <= 24; x += 8) {
    [-5.6, 5.6].forEach((z) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.4, 8), pierMat);
      pole.position.set(x, 9.2, z);
      lightGroup.add(pole);

      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), lightMat);
      lamp.position.set(x, 10.9, z);
      lightGroup.add(lamp);
    });
  }
  scene.add(lightGroup);
  elementGroups['deck-lighting'] = lightGroup;
}

// -------------------------------------------------------------
// Procedural 3D Generator: Parkway Station / Facility
// -------------------------------------------------------------
function buildParkwayStation(scene, elementGroups) {
  // Ground Mat / Foundation Slab
  const slabMat = new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.85, metalness: 0.1 });
  const foundation = new THREE.Mesh(new THREE.BoxGeometry(48, 1.2, 36), slabMat);
  foundation.position.set(0, -0.6, 0);
  foundation.receiveShadow = true;
  scene.add(foundation);

  // Set A: Structural Steel Columns (W14x90) in 4x3 Grid
  const colGroup = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x1976d2, roughness: 0.35, metalness: 0.8 });
  const colHeight = 14;

  const colXs = [-18, -6, 6, 18];
  const colZs = [-12, 0, 12];

  colXs.forEach((x) => {
    colZs.forEach((z) => {
      // W-shape representation: web plate + two flanges
      const colSub = new THREE.Group();
      // Flange 1
      const fl1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, colHeight, 1.2), steelMat);
      fl1.position.set(-0.5, colHeight / 2, 0);
      fl1.castShadow = true;
      colSub.add(fl1);
      // Flange 2
      const fl2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, colHeight, 1.2), steelMat);
      fl2.position.set(0.5, colHeight / 2, 0);
      fl2.castShadow = true;
      colSub.add(fl2);
      // Web
      const web = new THREE.Mesh(new THREE.BoxGeometry(1.0, colHeight, 0.18), steelMat);
      web.position.set(0, colHeight / 2, 0);
      web.castShadow = true;
      colSub.add(web);

      colSub.position.set(x, 0, z);
      colGroup.add(colSub);
    });
  });
  scene.add(colGroup);
  elementGroups['steel-columns'] = colGroup;

  // Set A: Floor Girders & Composite Beams (Mezzanine at Y=6)
  const girderGroup = new THREE.Group();
  const beamMat = new THREE.MeshStandardMaterial({ color: 0x42a5f5, roughness: 0.4, metalness: 0.75 });
  // Longitudinal girders
  colZs.forEach((z) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(44, 0.8, 0.45), beamMat);
    beam.position.set(0, 6.2, z);
    beam.castShadow = true;
    girderGroup.add(beam);
  });
  // Transverse beams
  colXs.forEach((x) => {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.8, 28), beamMat);
    beam.position.set(x, 6.2, 0);
    beam.castShadow = true;
    girderGroup.add(beam);
  });
  scene.add(girderGroup);
  elementGroups['floor-beams'] = girderGroup;

  // Set A: Elevated Concrete Floor Slabs (Mezzanine Floor)
  const slabGroup = new THREE.Group();
  const floorPlate = new THREE.Mesh(new THREE.BoxGeometry(42, 0.45, 26), slabMat);
  floorPlate.position.set(0, 6.6, 0);
  floorPlate.receiveShadow = true;
  slabGroup.add(floorPlate);
  scene.add(slabGroup);
  elementGroups['floor-slabs'] = slabGroup;

  // Set A: Concrete Elevator & Stairwell Core
  const coreGroup = new THREE.Group();
  const coreMat = new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: 0.8, metalness: 0.15 });
  const elevatorCore = new THREE.Mesh(new THREE.BoxGeometry(7, 18, 7), coreMat);
  elevatorCore.position.set(0, 9, -8);
  elevatorCore.castShadow = true;
  elevatorCore.receiveShadow = true;
  coreGroup.add(elevatorCore);
  scene.add(coreGroup);
  elementGroups['concrete-cores'] = coreGroup;

  // Set A: Roof Long-Span Warren Trusses (At Y=14)
  const trussGroup = new THREE.Group();
  const trussMat = new THREE.MeshStandardMaterial({ color: 0x2196f3, roughness: 0.35, metalness: 0.8 });
  colXs.forEach((x) => {
    // Top chord
    const topChord = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 30), trussMat);
    topChord.position.set(x, 15.6, 0);
    trussGroup.add(topChord);
    // Bottom chord
    const botChord = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 30), trussMat);
    botChord.position.set(x, 13.8, 0);
    trussGroup.add(botChord);
    // Diagonals
    for (let z = -13; z <= 13; z += 3.6) {
      const diag = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.5, 6), trussMat);
      diag.position.set(x, 14.7, z);
      diag.rotation.x = 0.55;
      trussGroup.add(diag);

      const diag2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.5, 6), trussMat);
      diag2.position.set(x, 14.7, z + 1.8);
      diag2.rotation.x = -0.55;
      trussGroup.add(diag2);
    }
  });
  scene.add(trussGroup);
  elementGroups['roof-trusses'] = trussGroup;

  // Set B (MEP Systems - Orange): Primary HVAC Supply & Return Ducts
  const ductGroup = new THREE.Group();
  const ductMat = new THREE.MeshStandardMaterial({ color: 0xff7043, roughness: 0.3, metalness: 0.85 });
  // Longitudinal main duct intersecting Column B4 at (-6, 6.2, 4)
  const mainDuct = new THREE.Mesh(new THREE.BoxGeometry(42, 1.8, 2.6), ductMat);
  mainDuct.position.set(0, 6.2, 4);
  mainDuct.castShadow = true;
  ductGroup.add(mainDuct);

  // Return duct at upper level
  const returnDuct = new THREE.Mesh(new THREE.BoxGeometry(42, 1.4, 2.0), ductMat);
  returnDuct.position.set(0, 12.4, -4);
  ductGroup.add(returnDuct);
  scene.add(ductGroup);
  elementGroups['hvac-supply'] = ductGroup;

  // Set B: Chilled Water & Hydronic Piping
  const pipeGroup = new THREE.Group();
  const chwMat = new THREE.MeshStandardMaterial({ color: 0xffa726, roughness: 0.35, metalness: 0.7 });
  // Supply & return pipe loop running through truss area
  [-0.6, 0.6].forEach((yOffset) => {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 44, 16), chwMat);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, 11.4 + yOffset, -4);
    pipeGroup.add(pipe);
  });
  scene.add(pipeGroup);
  elementGroups['chilled-piping'] = pipeGroup;

  // Set B: Fire Protection Sprinkler Mains
  const fireGroup = new THREE.Group();
  const fireMat = new THREE.MeshStandardMaterial({ color: 0xff5722, roughness: 0.35, metalness: 0.7 });
  const fireMain = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 44, 12), fireMat);
  fireMain.rotation.z = Math.PI / 2;
  fireMain.position.set(0, 5.0, 8);
  fireGroup.add(fireMain);

  // Branch lines
  colXs.forEach((x) => {
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 18, 10), fireMat);
    branch.rotation.x = Math.PI / 2;
    branch.position.set(x, 5.0, 4);
    fireGroup.add(branch);
  });
  scene.add(fireGroup);
  elementGroups['fire-sprinklers'] = fireGroup;

  // Set B: Overhead Cable Trays & Feeders
  const trayGroup = new THREE.Group();
  const trayMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, roughness: 0.4, metalness: 0.65 });
  // Tray penetrating elevator core at (0, 4.8, -8)
  const tray = new THREE.Mesh(new THREE.BoxGeometry(40, 0.35, 1.8), trayMat);
  tray.position.set(0, 4.8, -8);
  trayGroup.add(tray);
  scene.add(trayGroup);
  elementGroups['electrical-trays'] = trayGroup;
}

// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------
const IModelViewerModal = ({
  open,
  onClose,
  modelName = 'Tied Arch Bridge',
  selectedSetA = [],
  selectedSetB = [],
  onSelectElement,
}) => {
  const mountRef = useRef(null);
  const [activeModelKey, setActiveModelKey] = useState(
    modelName.includes('Parkway') || modelName.includes('Data') ? 'Parkway' : 'Tied Arch Bridge'
  );
  const [selectedClash, setSelectedClash] = useState(null);
  const [treeSearch, setTreeSearch] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('all'); // 'all', 'A', 'B'
  const [expandedCategories, setExpandedCategories] = useState({ structural: true, 'mep-systems': true });
  const [visibility, setVisibility] = useState({});

  const controlsRef = useRef(null);

  // Get current active model configuration
  const activeModel = useMemo(() => {
    return MODELS_REGISTRY[activeModelKey] || MODELS_REGISTRY['Tied Arch Bridge'];
  }, [activeModelKey]);

  // Sync activeModelKey when prop changes
  useEffect(() => {
    if (modelName) {
      if (modelName.includes('Parkway') || modelName.includes('Data')) {
        setActiveModelKey('Parkway');
      } else {
        setActiveModelKey('Tied Arch Bridge');
      }
    }
  }, [modelName]);

  // Reset visibility when model changes
  useEffect(() => {
    const defaultVis = {};
    activeModel.components.forEach((group) => {
      group.children.forEach((c) => {
        defaultVis[c.id] = true;
      });
    });
    setVisibility(defaultVis);
    setSelectedClash(null);
  }, [activeModel]);

  const toggleCategory = (catId) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const toggleVisibility = (elemId) => {
    setVisibility((prev) => ({ ...prev, [elemId]: !prev[elemId] }));
  };

  // Filter tree elements
  const filteredTree = useMemo(() => {
    let groups = activeModel.components;
    if (disciplineFilter === 'A') {
      groups = groups.filter((g) => g.badge === 'A');
    } else if (disciplineFilter === 'B') {
      groups = groups.filter((g) => g.badge === 'B');
    }

    if (!treeSearch.trim()) return groups;
    const q = treeSearch.toLowerCase();
    return groups
      .map((group) => {
        const matches = group.children.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q) ||
            c.guid.toLowerCase().includes(q)
        );
        return { ...group, children: matches };
      })
      .filter((g) => g.children.length > 0);
  }, [activeModel, treeSearch, disciplineFilter]);

  // Discipline isolation actions
  const handleIsolateDiscipline = (mode) => {
    setDisciplineFilter(mode);
    const newVis = {};
    activeModel.components.forEach((group) => {
      const isVisibleGroup = mode === 'all' || group.badge === mode;
      group.children.forEach((c) => {
        newVis[c.id] = isVisibleGroup;
      });
    });
    setVisibility(newVis);
  };

  // Three.js Scene Setup
  useEffect(() => {
    if (!open || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x13191d);
    scene.fog = new THREE.FogExp2(0x13191d, 0.007);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 500);
    const [cx, cy, cz] = activeModel.cameraInitial || [38, 22, 42];
    camera.position.set(cx, cy, cz);

    // Target
    const [tx, ty, tz] = activeModel.targetInitial || [0, 8, 0];
    const target = new THREE.Vector3(tx, ty, tz);
    camera.lookAt(target);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(50, 70, 40);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Accent blue light (Set A) & orange light (Set B)
    const blueRim = new THREE.DirectionalLight(0x42a5f5, 0.9);
    blueRim.position.set(-40, 25, -30);
    scene.add(blueRim);

    const orangeRim = new THREE.DirectionalLight(0xff7043, 0.9);
    orangeRim.position.set(30, -10, 40);
    scene.add(orangeRim);

    // Ground Grid Floor
    const gridHelper = new THREE.GridHelper(100, 50, 0x087f6c, 0x223038);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Build model geometry based on activeModelKey
    const elementGroups = {};
    if (activeModelKey === 'Tied Arch Bridge') {
      buildTiedArchBridge(scene, elementGroups);
    } else {
      buildParkwayStation(scene, elementGroups);
    }

    // Clash Markers (Pulsing 3D collision beacons)
    const clashMarkersGroup = new THREE.Group();
    const clashPins = [];

    activeModel.clashes.forEach((clash) => {
      const pinGroup = new THREE.Group();
      pinGroup.position.set(...clash.position);

      // Diamond collision beacon
      const beaconMat = new THREE.MeshStandardMaterial({
        color: clash.severity === 'Critical' ? 0xd32f2f : clash.severity === 'High' ? 0xff5722 : 0xff9800,
        emissive: clash.severity === 'Critical' ? 0xff1744 : 0xff9100,
        emissiveIntensity: 0.95,
        roughness: 0.15,
      });
      const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.85), beaconMat);
      pinGroup.add(diamond);

      // Pulsing halo ring
      const ringMat = new THREE.MeshBasicMaterial({
        color: clash.severity === 'Critical' ? 0xff5252 : 0xffab40,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.45, 18), ringMat);
      ring.rotation.x = Math.PI / 2;
      pinGroup.add(ring);

      pinGroup.userData = { clashData: clash, diamond, ring };
      clashMarkersGroup.add(pinGroup);
      clashPins.push(pinGroup);
    });
    scene.add(clashMarkersGroup);

    // Orbit & Camera Controls (smooth damping)
    let isDragging = false;
    let isPanning = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      if (e.button === 0) isDragging = true;
      if (e.button === 2) isPanning = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;

      if (isDragging) {
        // Orbit
        const offset = camera.position.clone().sub(target);
        const radius = offset.length();
        let theta = Math.atan2(offset.x, offset.z);
        let phi = Math.acos(Math.max(0.01, Math.min(0.99, offset.y / radius)));

        theta -= deltaX * 0.007;
        phi -= deltaY * 0.007;
        phi = Math.max(0.08, Math.min(Math.PI / 2 - 0.02, phi));

        offset.x = radius * Math.sin(phi) * Math.sin(theta);
        offset.y = radius * Math.cos(phi);
        offset.z = radius * Math.sin(phi) * Math.cos(theta);

        camera.position.copy(target).add(offset);
        camera.lookAt(target);
      } else if (isPanning) {
        // Pan
        const panSpeed = 0.04;
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
        const up = camera.up.clone().normalize();

        const panOffset = right.multiplyScalar(-deltaX * panSpeed).add(up.multiplyScalar(deltaY * panSpeed));
        camera.position.add(panOffset);
        target.add(panOffset);
      }

      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
      isPanning = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.035;
      const dir = camera.position.clone().sub(target);
      const newLen = Math.max(8, Math.min(140, dir.length() + zoomFactor));
      dir.setLength(newLen);
      camera.position.copy(target).add(dir);
      camera.lookAt(target);
    };

    // Raycaster for clicking clash markers in 3D
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clashMarkersGroup.children, true);

      if (intersects.length > 0) {
        let parent = intersects[0].object;
        while (parent && !parent.userData?.clashData) {
          parent = parent.parent;
        }
        if (parent?.userData?.clashData) {
          const clash = parent.userData.clashData;
          setSelectedClash(clash);
          // Zoom into clash
          const pos = new THREE.Vector3(...clash.position);
          target.copy(pos);
          camera.position.set(pos.x + 10, pos.y + 6, pos.z + 10);
          camera.lookAt(pos);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });
    domElement.addEventListener('click', onClick);
    domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    // Camera Navigation Shortcuts
    controlsRef.current = {
      zoomIn: () => {
        const dir = camera.position.clone().sub(target);
        dir.setLength(Math.max(8, dir.length() - 8));
        camera.position.copy(target).add(dir);
      },
      zoomOut: () => {
        const dir = camera.position.clone().sub(target);
        dir.setLength(Math.min(140, dir.length() + 8));
        camera.position.copy(target).add(dir);
      },
      resetView: () => {
        target.set(tx, ty, tz);
        camera.position.set(cx, cy, cz);
        camera.lookAt(target);
        setSelectedClash(null);
      },
      setIsoView: () => {
        target.set(tx, ty, tz);
        camera.position.set(32, 24, 32);
        camera.lookAt(target);
      },
      setTopView: () => {
        target.set(tx, ty, tz);
        camera.position.set(0.1, 55, 0.1);
        camera.lookAt(target);
      },
      setFrontView: () => {
        target.set(tx, ty, tz);
        camera.position.set(0, ty, 50);
        camera.lookAt(target);
      },
      focusClash: (clash) => {
        const pos = new THREE.Vector3(...clash.position);
        target.copy(pos);
        camera.position.set(pos.x + 10, pos.y + 6, pos.z + 10);
        camera.lookAt(pos);
        setSelectedClash(clash);
      },
    };

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Pulse clash markers
      clashPins.forEach((pin, index) => {
        const s = 1 + Math.sin(elapsed * 4 + index) * 0.18;
        if (pin.userData.diamond) pin.userData.diamond.scale.set(s, s, s);
        if (pin.userData.ring) {
          pin.userData.ring.scale.set(s * 1.25, s * 1.25, s * 1.25);
          pin.userData.ring.rotation.z = elapsed * 0.9;
        }
      });

      // Synchronize element visibility from React state
      Object.keys(elementGroups).forEach((elemId) => {
        if (elementGroups[elemId]) {
          elementGroups[elemId].visible = visibility[elemId] !== false;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('click', onClick);
      renderer.dispose();
    };
  }, [open, activeModelKey, visibility, activeModel]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1b2226',
          color: '#fff',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        },
      }}
    >
      {/* Header Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.25,
          borderBottom: '1px solid #2d373d',
          backgroundColor: '#141a1d',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ViewInArIcon sx={{ color: '#087f6c', fontSize: 24 }} />
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>3D Interactive BIM Viewer</Typography>

          {/* Model Switcher Dropdown */}
          <TextField
            select
            size="small"
            value={activeModelKey}
            onChange={(e) => setActiveModelKey(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 30,
                fontSize: 12,
                fontWeight: 600,
                color: '#fff',
                backgroundColor: '#202930',
                borderRadius: 1,
                '& fieldset': { borderColor: '#3b4b55' },
              },
            }}
          >
            <MenuItem value="Tied Arch Bridge">Tied Arch Bridge</MenuItem>
            <MenuItem value="Parkway">Parkway Station / Facility</MenuItem>
          </TextField>

          <Chip label="WebGL 3D Live" size="small" sx={{ backgroundColor: '#087f6c', color: '#fff', fontWeight: 600, fontSize: 11 }} />
          <Chip label={`${activeModel.clashes.length} Active Clashes`} size="small" sx={{ backgroundColor: '#d32f2f', color: '#fff', fontWeight: 600, fontSize: 11 }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={() => controlsRef.current?.resetView()}
            sx={{ textTransform: 'none', color: '#b2bcc2', borderColor: '#3a474e', '&:hover': { color: '#fff' } }}
            variant="outlined"
          >
            Reset Camera
          </Button>
          <IconButton onClick={onClose} sx={{ color: '#b2bcc2', '&:hover': { color: '#fff' } }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Main View Area */}
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        {/* Left Side: Component Tree & Discipline Isolation */}
        <Paper
          elevation={0}
          sx={{
            width: 320,
            flexShrink: 0,
            backgroundColor: '#161c20',
            borderRight: '1px solid #2a353c',
            display: 'flex',
            flexDirection: 'column',
            color: '#e0e6ea',
          }}
        >
          {/* Header & Discipline Isolator Tabs */}
          <Box sx={{ p: 1.5, borderBottom: '1px solid #263137' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LayersOutlinedIcon sx={{ fontSize: 18, color: '#087f6c' }} />
                <Typography sx={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Model Components
                </Typography>
              </Box>
              <Tooltip title="Filter by discipline">
                <FilterAltOutlinedIcon sx={{ fontSize: 16, color: '#8c9ea7' }} />
              </Tooltip>
            </Box>

            {/* Discipline Quick Isolate Buttons */}
            <Box sx={{ display: 'flex', gap: 0.75, mb: 1.25 }}>
              <Button
                size="small"
                variant={disciplineFilter === 'all' ? 'contained' : 'outlined'}
                onClick={() => handleIsolateDiscipline('all')}
                sx={{
                  flex: 1,
                  fontSize: 10,
                  py: 0.3,
                  textTransform: 'none',
                  backgroundColor: disciplineFilter === 'all' ? '#087f6c' : 'transparent',
                  borderColor: '#344550',
                  color: '#fff',
                }}
              >
                All
              </Button>
              <Button
                size="small"
                variant={disciplineFilter === 'A' ? 'contained' : 'outlined'}
                onClick={() => handleIsolateDiscipline('A')}
                sx={{
                  flex: 1,
                  fontSize: 10,
                  py: 0.3,
                  textTransform: 'none',
                  backgroundColor: disciplineFilter === 'A' ? '#1976d2' : 'transparent',
                  borderColor: '#1976d2',
                  color: '#fff',
                }}
              >
                Set A (Struct)
              </Button>
              <Button
                size="small"
                variant={disciplineFilter === 'B' ? 'contained' : 'outlined'}
                onClick={() => handleIsolateDiscipline('B')}
                sx={{
                  flex: 1,
                  fontSize: 10,
                  py: 0.3,
                  textTransform: 'none',
                  backgroundColor: disciplineFilter === 'B' ? '#d04a02' : 'transparent',
                  borderColor: '#d04a02',
                  color: '#fff',
                }}
              >
                Set B (MEP)
              </Button>
            </Box>

            <TextField
              placeholder="Search components, GUIDs..."
              size="small"
              fullWidth
              value={treeSearch}
              onChange={(e) => setTreeSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 15, color: '#687882' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: 12,
                  color: '#fff',
                  backgroundColor: '#0f1416',
                  borderRadius: 1,
                  height: 30,
                  '& fieldset': { borderColor: '#2f3b42' },
                },
              }}
            />
          </Box>

          {/* Tree hierarchy */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
            {filteredTree.map((group) => {
              const isExpanded = expandedCategories[group.id] !== false;
              return (
                <Box key={group.id} sx={{ mb: 1.5 }}>
                  {/* Category Header */}
                  <Box
                    onClick={() => toggleCategory(group.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1,
                      py: 0.7,
                      borderRadius: 1,
                      cursor: 'pointer',
                      backgroundColor: '#1f282e',
                      '&:hover': { backgroundColor: '#26323a' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isExpanded ? <ExpandMoreIcon sx={{ fontSize: 16, color: '#8c9ea7' }} /> : <ChevronRightIcon sx={{ fontSize: 16, color: '#8c9ea7' }} />}
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          backgroundColor: group.badgeColor,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      >
                        {group.badge}
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 12.5 }}>{group.name}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 10.5, color: '#7a8c96' }}>{group.children.length}</Typography>
                  </Box>

                  {/* Children elements */}
                  <Collapse in={isExpanded}>
                    <Box sx={{ pl: 1.5, pt: 0.5 }}>
                      {group.children.map((item) => {
                        const isVisible = visibility[item.id] !== false;
                        const isSelectedInA = selectedSetA.includes(item.name);
                        const isSelectedInB = selectedSetB.includes(item.name);

                        return (
                          <Box
                            key={item.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              my: 0.25,
                              backgroundColor: isSelectedInA ? 'rgba(25, 118, 210, 0.15)' : isSelectedInB ? 'rgba(208, 74, 2, 0.15)' : 'transparent',
                              '&:hover': { backgroundColor: '#212c33' },
                            }}
                          >
                            <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
                              <Typography noWrap sx={{ fontSize: 12, fontWeight: 500, color: '#dbe3e8' }}>
                                {item.name}
                              </Typography>
                              <Typography sx={{ fontSize: 10, color: '#758892' }}>
                                {item.guid} • {item.elementCount} elements
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {onSelectElement && (
                                <Tooltip title={`Add to Set ${group.badge}`}>
                                  <Button
                                    size="small"
                                    onClick={() => onSelectElement(item.name, group.badge)}
                                    sx={{
                                      minWidth: 'auto',
                                      px: 0.8,
                                      py: 0.2,
                                      fontSize: 10,
                                      textTransform: 'none',
                                      color: group.badgeColor,
                                      border: `1px solid ${group.badgeColor}40`,
                                    }}
                                  >
                                    +Set {group.badge}
                                  </Button>
                                </Tooltip>
                              )}
                              <IconButton
                                size="small"
                                onClick={() => toggleVisibility(item.id)}
                                sx={{ color: isVisible ? '#087f6c' : '#57666f', p: 0.4 }}
                              >
                                {isVisible ? <VisibilityIcon sx={{ fontSize: 15 }} /> : <VisibilityOffIcon sx={{ fontSize: 15 }} />}
                              </IconButton>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        </Paper>

        {/* 3D WebGL Canvas */}
        <Box sx={{ flex: 1, position: 'relative', height: '100%', minWidth: 0 }}>
          <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

          {/* Floating On-Canvas Camera Nav Controls */}
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              bottom: 16,
              right: selectedClash ? 320 : 16,
              backgroundColor: 'rgba(20, 26, 30, 0.9)',
              backdropFilter: 'blur(6px)',
              border: '1px solid #2f3c44',
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              p: 0.5,
              transition: 'right 0.2s',
            }}
          >
            <Tooltip title="Isometric 3D View">
              <IconButton size="small" onClick={() => controlsRef.current?.setIsoView()} sx={{ color: '#fff' }}>
                <CameraAltOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Top View">
              <Button size="small" onClick={() => controlsRef.current?.setTopView()} sx={{ minWidth: 32, px: 0.6, fontSize: 11, color: '#fff' }}>
                Top
              </Button>
            </Tooltip>
            <Tooltip title="Front View">
              <Button size="small" onClick={() => controlsRef.current?.setFrontView()} sx={{ minWidth: 32, px: 0.6, fontSize: 11, color: '#fff' }}>
                Front
              </Button>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ borderColor: '#38464f', my: 0.5 }} />
            <Tooltip title="Zoom In">
              <IconButton size="small" onClick={() => controlsRef.current?.zoomIn()} sx={{ color: '#fff' }}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton size="small" onClick={() => controlsRef.current?.zoomOut()} sx={{ color: '#fff' }}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Fit Model">
              <IconButton size="small" onClick={() => controlsRef.current?.resetView()} sx={{ color: '#fff' }}>
                <CenterFocusStrongIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Paper>

          {/* Canvas Controls Legend & Clash Quick-Jumps */}
          <Box
            sx={{
              position: 'absolute',
              top: 14,
              left: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: '6px 12px',
                backgroundColor: 'rgba(15, 20, 24, 0.85)',
                backdropFilter: 'blur(4px)',
                border: '1px solid #2a353c',
                borderRadius: 1,
              }}
            >
              <Typography sx={{ fontSize: 11, color: '#8a9ca7', display: 'flex', gap: 1.5 }}>
                <span>Left Click: <b>Orbit</b></span>
                <span>Right Click: <b>Pan</b></span>
                <span>Scroll: <b>Zoom</b></span>
              </Typography>
            </Paper>

            {/* Quick jump clash buttons */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {activeModel.clashes.map((clash, idx) => (
                <Chip
                  key={clash.id}
                  icon={<WarningAmberIcon sx={{ fontSize: 14, color: '#ff7043 !important' }} />}
                  label={`Clash #${idx + 1}`}
                  onClick={() => controlsRef.current?.focusClash(clash)}
                  size="small"
                  sx={{
                    backgroundColor: selectedClash?.id === clash.id ? '#087f6c' : 'rgba(20, 26, 30, 0.88)',
                    color: '#fff',
                    border: '1px solid #3a474e',
                    fontSize: 11,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#066657' },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Right Side: Clash Inspector Panel (when a marker is clicked) */}
        {selectedClash && (
          <Paper
            elevation={0}
            sx={{
              width: 310,
              flexShrink: 0,
              backgroundColor: '#161c20',
              borderLeft: '1px solid #2a353c',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              color: '#e0e6ea',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmberIcon sx={{ color: '#ff5252', fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Clash Inspector</Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedClash(null)} sx={{ color: '#8a9ca7' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#fff', mb: 1.5 }}>
              {selectedClash.name}
            </Typography>

            <Box sx={{ p: 1.5, backgroundColor: '#101416', borderRadius: 1, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography sx={{ fontSize: 11, color: '#7a8c96' }}>Severity:</Typography>
                <Chip
                  label={selectedClash.severity}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    backgroundColor: selectedClash.severity === 'Critical' ? '#d32f2f' : '#ff9800',
                    color: '#fff',
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography sx={{ fontSize: 11, color: '#7a8c96' }}>Penetration:</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{selectedClash.penetration}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 11, color: '#7a8c96' }}>Status:</Typography>
                <Typography sx={{ fontSize: 12, color: '#087f6c', fontWeight: 600 }}>{selectedClash.status}</Typography>
              </Box>
            </Box>

            {/* Set A Element Info */}
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#1976d2', textTransform: 'uppercase', mb: 0.5 }}>
              Set A Interference
            </Typography>
            <Paper sx={{ p: 1.25, backgroundColor: '#141c22', border: '1px solid #1976d240', borderRadius: 1, mb: 1.5 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>
                {selectedClash.setAElement}
              </Typography>
              <Typography sx={{ fontSize: 10, color: '#688496', mt: 0.5 }}>
                {selectedClash.disciplineA || 'Structural Engineering (Set A)'}
              </Typography>
            </Paper>

            {/* Set B Element Info */}
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#d04a02', textTransform: 'uppercase', mb: 0.5 }}>
              Set B Interference
            </Typography>
            <Paper sx={{ p: 1.25, backgroundColor: '#211612', border: '1px solid #d04a0240', borderRadius: 1, mb: 2 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>
                {selectedClash.setBElement}
              </Typography>
              <Typography sx={{ fontSize: 10, color: '#a07868', mt: 0.5 }}>
                {selectedClash.disciplineB || 'MEP Facility Services (Set B)'}
              </Typography>
            </Paper>

            <Typography variant="caption" sx={{ color: '#90a4ae', mb: 2, fontSize: 11 }}>
              {selectedClash.description}
            </Typography>

            <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  if (onSelectElement) {
                    onSelectElement(selectedClash.setAElement, 'A');
                    onSelectElement(selectedClash.setBElement, 'B');
                  }
                  setSelectedClash(null);
                }}
                sx={{
                  backgroundColor: '#087f6c',
                  textTransform: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#066657' },
                }}
              >
                Apply Both to Sets A & B
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Dialog>
  );
};

export default IModelViewerModal;

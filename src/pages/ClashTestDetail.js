import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as THREE from 'three';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LaunchIcon from '@mui/icons-material/Launch';
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ClashIcon } from '../components/Sidebar';
import SuppressionRulesDrawer from '../components/SuppressionRulesDrawer';
import { getStoredTests, updateTestInStore, AR_VS_EL_DEFAULT_RULES } from '../data/clashTestsStore';

// Default clash instances matching the table in the screenshot
const INITIAL_CLASH_ROWS = [
  { id: 'CL-001', idNum: 'CL2F-00001', status: 'Suppressed', elementA: 'TC_Asph Conc Base Cse Shld_L [3-8PO]', elementB: 'Node: SA1-81 [3-2K0]', modelA: 'Ref-11, I-95_Geometry', modelB: 'Ref, DrainageRegion01', categoryA: 'Util_Storm_Pipes', penetration: '-0.42"', tags: [] },
  { id: 'CL-002', idNum: 'CL2F-00002', status: '', elementA: 'TC_Asph Conc Base Cse Shld_L [3-8PO]', elementB: 'Node: SA1-82 [3-2K0]', modelA: 'Ref-11, I-95_Geometry', modelB: 'Ref, DrainageRegion01', categoryA: 'Util_Storm_Pipes', penetration: '-0.28"', tags: [] },
  { id: 'CL-003', idNum: 'CL2F-00003', status: 'Suppressed', elementA: 'TC_Asph Conc Base Cse Shld_L [3-8PO]', elementB: 'Node: SA1-83 [3-2K0]', modelA: 'Ref-11, I-95_Geometry', modelB: 'Ref, DrainageRegion01', categoryA: 'Util_Storm_Pipes', penetration: '-0.51"', tags: [] },
  { id: 'CL-004', idNum: 'CL2F-00004', status: 'Suppressed', elementA: 'TC_Asph Conc Base Cse Shld_L [3-8PO]', elementB: 'Node: SA1-84 [3-2K0]', modelA: 'Ref-11, I-95_Geometry', modelB: 'Ref, DrainageRegion01', categoryA: 'Util_Storm_Pipes', penetration: '-0.19"', tags: [] },
  { id: 'CL-005', idNum: 'CL2F-00005', status: '', elementA: 'TC_Asph Conc Base Cse Shld_L [3-8PO]', elementB: 'Node: SA1-85 [3-2K0]', modelA: 'Ref-11, I-95_Geometry', modelB: 'Ref, DrainageRegion01', categoryA: 'Util_Storm_Pipes', penetration: '-0.33"', tags: [] },
  { id: 'CL-006', idNum: 'CL2F-00006', status: 'Suppressed', elementA: 'TC_Asph Conc Base Cse Shld_L [3-8PO]', elementB: 'Node: SA1-86 [3-2K0]', modelA: 'Ref-11, I-95_Geometry', modelB: 'Ref, DrainageRegion01', categoryA: 'Util_Storm_Pipes', penetration: '-0.65"', tags: [] },
  { id: 'CL-007', idNum: 'CL2F-00007', status: 'Suppressed', elementA: 'TC_Asph Conc Base Cse Shld_L [3-8PO]', elementB: 'Node: SA1-87 [3-2K0]', modelA: 'Ref-11, I-95_Geometry', modelB: 'Ref, DrainageRegion01', categoryA: 'Util_Storm_Pipes', penetration: '-0.22"', tags: [] },
  { id: 'CL-008', idNum: 'CL2F-00008', status: 'Suppressed', elementA: 'TC_Asph Conc Base Cse Shld_L [3-8PO]', elementB: 'Node: SA1-88 [3-2K0]', modelA: 'Ref-11, I-95_Geometry', modelB: 'Ref, DrainageRegion01', categoryA: 'Util_Storm_Pipes', penetration: '-0.47"', tags: [] },
  { id: 'CL-009', idNum: 'CL2F-00009', status: 'Suppressed', elementA: 'TC_Asph Conc Base Cse Shld_L [3-8PO]', elementB: 'Node: SA1-89 [3-2K0]', modelA: 'Ref-11, I-95_Geometry', modelB: 'Ref, DrainageRegion01', categoryA: 'Util_Storm_Pipes', penetration: '-0.38"', tags: [] },
  { id: 'CL-010', idNum: 'CL2F-00010', status: '', elementA: 'TC_Asph Conc Base Cse Shld_L [3-8PO]', elementB: 'Node: SA1-90 [3-2K0]', modelA: 'Ref-11, I-95_Geometry', modelB: 'Ref, DrainageRegion01', categoryA: 'Util_Storm_Pipes', penetration: '-0.15"', tags: [] },
  { id: 'CL-011', idNum: 'CL2F-00011', status: '', elementA: 'TC_Asph Conc Base Cse Shld_L [3-8PO]', elementB: 'Node: SA1-91 [3-2K0]', modelA: 'Ref-11, I-95_Geometry', modelB: 'Ref, DrainageRegion01', categoryA: 'Util_Storm_Pipes', penetration: '-0.29"', tags: [] },
  { id: 'CL-012', idNum: 'CL2F-00012', status: '', elementA: 'TC_Asph Conc Base Cse Shld_L [3-8PO]', elementB: 'Node: SA1-92 [3-2K0]', modelA: 'Ref-11, I-95_Geometry', modelB: 'Ref, DrainageRegion01', categoryA: 'Util_Storm_Pipes', penetration: '-0.54"', tags: [] },
  { id: 'CL-013', idNum: 'CL2F-00013', status: '', elementA: 'TC_Asph Conc Base Cse Shld_L [3-8PO]', elementB: 'Node: SA1-81 [3-2K0]', modelA: 'Ref-11, I-95_Geometry', modelB: 'Ref, DrainageRegion01', categoryA: 'Util_Storm_Pipes', penetration: '-0.35"', tags: [] },
];

const AVAILABLE_TAGS = [
  'Architectural',
  'Plumbing',
  'Electrical',
  'Structural',
  'Concrete',
  'Foundation',
  'Doors',
];

const ClashTestDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const testData = useMemo(
    () =>
      location.state || {
        name: 'AR vs EL',
        iModel: 'Parkway',
        lastRun: '07 August 2026 09:00AM EST',
        description: 'This is where the test description will go.',
        tag: 'WP03',
        createdBy: 'Jeanlouise Hornberger',
        lastRunDate: '02 April 2026',
      },
    [location.state]
  );

  const [clashes, setClashes] = useState(INITIAL_CLASH_ROWS);
  const [selectedClashId, setSelectedClashId] = useState(null);
  const [checkedIds, setCheckedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Accordion states when a clash IS selected
  const [clashDetailsOpen, setClashDetailsOpen] = useState(true);
  const [clashFormsOpen, setClashFormsOpen] = useState(false);
  const [clashImagesOpen, setClashImagesOpen] = useState(false);

  // Accordion states when ZERO clashes are selected (Attachment 1 & 2)
  const [testDetailsOpen, setTestDetailsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [testFormsOpen, setTestFormsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Suppression rules state (matching rules applied while test was built)
  const initialRules = useMemo(() => {
    if (testData.suppressionRules && Array.isArray(testData.suppressionRules) && testData.suppressionRules.length > 0) {
      return testData.suppressionRules;
    }
    const stored = getStoredTests();
    const found = stored.find((t) => t.id === testData.id || t.name === testData.name);
    if (found && found.suppressionRules && Array.isArray(found.suppressionRules) && found.suppressionRules.length > 0) {
      return found.suppressionRules;
    }
    if (testData.name === 'AR vs EL' || !testData.name) {
      return AR_VS_EL_DEFAULT_RULES;
    }
    return [];
  }, [testData]);

  const [suppressionRules, setSuppressionRules] = useState(initialRules);
  const [suppressionDrawerOpen, setSuppressionDrawerOpen] = useState(false);
  const [initialCreateRuleData, setInitialCreateRuleData] = useState(null);

  // Suppress dropdown menu state
  const [suppressMenuAnchorEl, setSuppressMenuAnchorEl] = useState(null);

  const handleOpenSuppressMenu = (e) => {
    // Determine active target clashes
    const targetRows = checkedIds.length > 0 ? checkedIds : selectedClashId ? [selectedClashId] : [];
    if (targetRows.length === 0) return;
    if (checkedIds.length === 0 && selectedClashId) {
      setCheckedIds([selectedClashId]);
    }
    setSuppressMenuAnchorEl(e.currentTarget);
  };

  const handleCloseSuppressMenu = () => {
    setSuppressMenuAnchorEl(null);
  };

  const handleQuickSuppressClash = () => {
    const targetRows = checkedIds.length > 0 ? checkedIds : selectedClashId ? [selectedClashId] : [];
    if (targetRows.length === 0) return;

    setClashes((prev) =>
      prev.map((c) => (targetRows.includes(c.id) ? { ...c, status: 'Suppressed' } : c))
    );
    handleCloseSuppressMenu();
  };

  const handleCreateRuleFromClash = () => {
    const targetRows = checkedIds.length > 0 ? checkedIds : selectedClashId ? [selectedClashId] : [];
    const targetClash = clashes.find((c) => targetRows.includes(c.id)) || clashes[0];

    // Prepopulate based on the clash data as in Screenshot 1 & 2
    // Model A: Ref-11, I-95_Geometry -> attribute1: 'Ref-11, I-95_CL_Corridor_Pavt.dgn, Default-3D'
    const prepopulated = {
      id: Date.now(),
      name: '',
      description: '',
      suppressBasedOn: 'Model',
      targetScope: 'one element',
      attribute1: targetClash.id === 'CL-001'
        ? 'Ref-11, I-95_CL_Corridor_Pavt.dgn, Default-3D'
        : targetClash.modelA || 'Ref-11, I-95_Geometry',
      isDualCondition: false,
      isImported: false,
      importedFrom: '',
    };

    setInitialCreateRuleData(prepopulated);
    handleCloseSuppressMenu();
    setSuppressionDrawerOpen(true);
  };

  const handleSaveAndApplyFromDrawer = () => {
    // Suppress the currently selected clashes
    const targetRows = checkedIds.length > 0 ? checkedIds : selectedClashId ? [selectedClashId] : [];
    if (targetRows.length > 0) {
      setClashes((prev) =>
        prev.map((c) => (targetRows.includes(c.id) ? { ...c, status: 'Suppressed' } : c))
      );
    }
    setSuppressionDrawerOpen(false);
    setInitialCreateRuleData(null);
  };

  const handleSaveSuppressionRule = (newRule) => {
    setSuppressionRules((prev) => {
      const exists = prev.some((r) => r.id === newRule.id);
      const updated = exists ? prev.map((r) => (r.id === newRule.id ? newRule : r)) : [newRule, ...prev];
      if (testData.id) {
        updateTestInStore(testData.id, { suppressionRules: updated });
      }
      return updated;
    });
  };

  const handleDeleteSuppressionRule = (ruleId) => {
    setSuppressionRules((prev) => {
      const updated = prev.filter((r) => r.id !== ruleId);
      if (testData.id) {
        updateTestInStore(testData.id, { suppressionRules: updated });
      }
      return updated;
    });
  };

  // Tagging Popover & Toast State
  const [tagAnchorEl, setTagAnchorEl] = useState(null);
  const [tagFilterQuery, setTagFilterQuery] = useState('');
  const [pendingSelectedTags, setPendingSelectedTags] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [undoBackup, setUndoBackup] = useState(null);

  const mountRef = useRef(null);
  const controlsRef = useRef(null);

  const currentClash = selectedClashId ? clashes.find((c) => c.id === selectedClashId) || null : null;
  const hasClashSelected = Boolean(selectedClashId && currentClash);
  const hasSelection = checkedIds.length > 0 || Boolean(selectedClashId);

  const handleOpenTagPopover = (e) => {
    // If no row is explicitly checked, apply tag to the currently selected clash
    const targetRows = checkedIds.length > 0 ? checkedIds : selectedClashId ? [selectedClashId] : [];
    if (targetRows.length === 0) return;
    if (checkedIds.length === 0 && selectedClashId) {
      setCheckedIds([selectedClashId]);
    }
    const targetClash = clashes.find((c) => c.id === targetRows[0]);
    setPendingSelectedTags(targetClash ? [...targetClash.tags] : []);
    setTagFilterQuery('');
    setTagAnchorEl(e.currentTarget);
  };

  const handleCloseTagPopover = () => {
    setTagAnchorEl(null);
  };

  const handleTogglePendingTag = (tagName) => {
    setPendingSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  const handleApplyTags = () => {
    const targetRowIds = checkedIds.length > 0 ? checkedIds : selectedClashId ? [selectedClashId] : [];
    if (targetRowIds.length === 0 || pendingSelectedTags.length === 0) {
      handleCloseTagPopover();
      return;
    }

    // Backup for undo
    setUndoBackup({
      clashesState: clashes.map((c) => ({ ...c, tags: [...c.tags] })),
      targetIds: [...targetRowIds],
    });

    setClashes((prev) =>
      prev.map((c) => {
        if (!targetRowIds.includes(c.id)) return c;
        const merged = Array.from(new Set([...c.tags, ...pendingSelectedTags]));
        return { ...c, tags: merged };
      })
    );

    const count = pendingSelectedTags.length;
    const targetLabel = targetRowIds.length === 1 ? targetRowIds[0] : `${targetRowIds.length} clashes`;
    setToastMessage(`${count} tag${count > 1 ? 's' : ''} added to ${targetLabel}`);
    handleCloseTagPopover();
  };

  const handleUndoTagging = () => {
    if (undoBackup) {
      setClashes(undoBackup.clashesState);
      setUndoBackup(null);
      setToastMessage('');
    }
  };

  const handleToggleCheck = (rowId, e) => {
    e.stopPropagation();
    setCheckedIds((prev) => {
      const next = prev.includes(rowId) ? prev.filter((i) => i !== rowId) : [...prev, rowId];
      if (next.length === 0) {
        setSelectedClashId(null);
      } else {
        setSelectedClashId(next[next.length - 1]);
      }
      return next;
    });
  };

  const handleRowClick = (clashId) => {
    if (selectedClashId === clashId) {
      // Clicking the selected clash again toggles/deselects it
      setSelectedClashId(null);
      setCheckedIds((prev) => prev.filter((i) => i !== clashId));
    } else {
      setSelectedClashId(clashId);
      setCheckedIds([clashId]);
    }
  };

  const allChecked = clashes.length > 0 && clashes.every((c) => checkedIds.includes(c.id));
  const toggleAll = () => {
    if (allChecked) {
      setCheckedIds([]);
      setSelectedClashId(null);
    } else {
      const allIds = clashes.map((c) => c.id);
      setCheckedIds(allIds);
      setSelectedClashId(allIds[0]);
    }
  };

  const filteredClashes = clashes.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.elementA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.elementB.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // -------------------------------------------------------------
  // Embedded Interactive 3D Model Viewport (Replaces green block)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a2428); // Clean dark engineering viewport background

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 500);
    camera.position.set(16, 12, 18);
    const target = new THREE.Vector3(0, 1.2, 0);
    camera.lookAt(target);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(20, 30, 20);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x42a5f5, 0.6);
    fillLight.position.set(-20, 10, -20);
    scene.add(fillLight);

    // Subtle grid
    const grid = new THREE.GridHelper(30, 20, 0x087f6c, 0x27363d);
    grid.position.y = -0.5;
    scene.add(grid);

    // 3D Model: Realistic Structural Steel Beams (Set A) with Pipe Penetration (Set B)
    const modelGroup = new THREE.Group();

    // Red beams material
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xd32f2f,
      roughness: 0.35,
      metalness: 0.45,
    });

    // Dark blue penetrating utility pipe material
    const blueMat = new THREE.MeshStandardMaterial({
      color: 0x1565c0,
      roughness: 0.25,
      metalness: 0.75,
    });

    const createBeam = (geo, mat) => {
      const mesh = new THREE.Mesh(geo, mat);
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x111111, linewidth: 1.5 })
      );
      mesh.add(line);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // Diagonal main beam
    const beam1 = createBeam(new THREE.BoxGeometry(0.8, 0.9, 11), redMat);
    beam1.position.set(-4, 0, 4);
    beam1.rotation.y = -Math.PI / 4;
    modelGroup.add(beam1);

    // Lateral cross beam
    const beam2 = createBeam(new THREE.BoxGeometry(0.8, 0.9, 8), redMat);
    beam2.position.set(0.6, 1.0, 0);
    beam2.rotation.y = Math.PI / 4;
    modelGroup.add(beam2);

    // Transverse beam
    const beam3 = createBeam(new THREE.BoxGeometry(10, 0.9, 0.8), redMat);
    beam3.position.set(1.8, 2.2, -2.2);
    beam3.rotation.y = -Math.PI / 4;
    modelGroup.add(beam3);

    // Top elevated cantilever beam
    const rearBeam = createBeam(new THREE.BoxGeometry(0.9, 1.1, 6.5), redMat);
    rearBeam.position.set(5.8, 3.8, -5.8);
    rearBeam.rotation.y = -Math.PI / 4;
    modelGroup.add(rearBeam);

    // Column stub support
    const colPost = createBeam(new THREE.CylinderGeometry(0.18, 0.18, 2.0, 12), redMat);
    colPost.position.set(5.0, 2.8, -5.0);
    modelGroup.add(colPost);

    // Blue penetrating utility pipe
    const pipePoints = [
      new THREE.Vector3(-1.5, 2.0, 1.0),
      new THREE.Vector3(5.0, 3.7, -5.0),
    ];
    const pipeCurve = new THREE.CatmullRomCurve3(pipePoints);
    const pipeGeo = new THREE.TubeGeometry(pipeCurve, 20, 0.16, 12, false);
    const pipeMesh = new THREE.Mesh(pipeGeo, blueMat);
    pipeMesh.castShadow = true;
    modelGroup.add(pipeMesh);

    // Pulsing 3D Clash Collision Beacon at penetration point
    const clashBeaconGroup = new THREE.Group();
    clashBeaconGroup.position.set(1.8, 2.2, -2.2);

    const diamondMat = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      emissive: 0xff1744,
      emissiveIntensity: 0.9,
    });
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.55), diamondMat);
    clashBeaconGroup.add(beacon);

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff5252,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.75, 1.05, 16), ringMat);
    ring.rotation.x = Math.PI / 2;
    clashBeaconGroup.add(ring);

    modelGroup.add(clashBeaconGroup);
    scene.add(modelGroup);

    // Orbit Controls
    let isMouseDown = false;
    let isPanning = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      if (e.button === 0) isMouseDown = true;
      if (e.button === 2 || e.shiftKey) isPanning = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;

      if (isMouseDown) {
        if (isPanning) {
          const forward = new THREE.Vector3();
          camera.getWorldDirection(forward);
          const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
          const up = camera.up.clone().normalize();
          const pan = right.multiplyScalar(-deltaX * 0.02).add(up.multiplyScalar(deltaY * 0.02));
          camera.position.add(pan);
          target.add(pan);
        } else {
          const offset = camera.position.clone().sub(target);
          const radius = offset.length();
          let theta = Math.atan2(offset.x, offset.z);
          let phi = Math.acos(Math.max(0.01, Math.min(0.99, offset.y / radius)));

          theta -= deltaX * 0.009;
          phi -= deltaY * 0.009;
          phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.02, phi));

          offset.x = radius * Math.sin(phi) * Math.sin(theta);
          offset.y = radius * Math.cos(phi);
          offset.z = radius * Math.sin(phi) * Math.cos(theta);

          camera.position.copy(target).add(offset);
          camera.lookAt(target);
        }
      }
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isMouseDown = false;
      isPanning = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.025;
      const dir = camera.position.clone().sub(target);
      const newLen = Math.max(5, Math.min(60, dir.length() + zoomDelta));
      dir.setLength(newLen);
      camera.position.copy(target).add(dir);
      camera.lookAt(target);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    controlsRef.current = {
      zoomIn: () => {
        const dir = camera.position.clone().sub(target);
        dir.setLength(Math.max(5, dir.length() - 4));
        camera.position.copy(target).add(dir);
      },
      zoomOut: () => {
        const dir = camera.position.clone().sub(target);
        dir.setLength(Math.min(60, dir.length() + 4));
        camera.position.copy(target).add(dir);
      },
      resetView: () => {
        target.set(0, 1.2, 0);
        camera.position.set(16, 12, 18);
        camera.lookAt(target);
      },
    };

    let animId;
    let clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const s = 1 + Math.sin(t * 4) * 0.16;
      beacon.scale.set(s, s, s);
      ring.scale.set(s * 1.2, s * 1.2, s * 1.2);
      ring.rotation.z = t * 0.8;
      clashBeaconGroup.visible = Boolean(selectedClashId);
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
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [selectedClashId]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar matching app layout */}
      <Box className="topbar">
        <TextField select size="small" value={testData.iModel || 'Project name'} SelectProps={{ IconComponent: ExpandMoreIcon }} sx={{ width: 150 }}>
          <MenuItem value={testData.iModel || 'Project name'}>{testData.iModel || 'Project name'}</MenuItem>
        </TextField>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 1 }}>
          <ClashIcon sx={{ fontSize: 16, color: '#536066' }} />
          <Link
            underline="always"
            color="text.primary"
            onClick={() => navigate('/clash-detection')}
            sx={{ fontSize: 12, cursor: 'pointer' }}
          >
            Clash Detection
          </Link>
          <Typography sx={{ fontSize: 12, color: '#8a9296', ml: 0.5 }}>/</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 0.5 }}>
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 14, color: '#536066' }} />
            <Link underline="always" color="text.primary" href="#" sx={{ fontSize: 12, fontWeight: 500 }}>
              {testData.name || 'AR vs EL'}
            </Link>
          </Box>
        </Box>
        <SearchIcon sx={{ ml: 'auto', mr: 1, fontSize: 20, color: '#8a9296' }} />
      </Box>

      {/* Main Page Layout */}
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Left Side: Test Title, Actions, Clashes Table */}
        <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header row: Title & Settings Gear */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#1c1f21', letterSpacing: '-0.02em' }}>
                {testData.name || 'AR vs EL'}
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#657075', mt: 0.5 }}>
                {testData.lastRun || '07 August 2026 09:00AM EST'}
              </Typography>
            </Box>
            <IconButton
              size="small"
              sx={{
                border: '1px solid #c2c9cd',
                borderRadius: '6px',
                p: 0.75,
                color: '#536066',
                '&:hover': { backgroundColor: '#f5f7f8' },
              }}
            >
              <SettingsOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          {/* Action Toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
            {/* Left Action Buttons (Only active when at least one clash is selected) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant={hasSelection ? 'contained' : 'outlined'}
                size="small"
                disabled={!hasSelection}
                sx={{
                  textTransform: 'none',
                  color: hasSelection ? '#fff' : '#a0aab0',
                  backgroundColor: hasSelection ? '#087f6c' : '#fafbfc',
                  borderColor: hasSelection ? '#087f6c' : '#e0e4e6',
                  borderRadius: '4px',
                  fontSize: 13,
                  fontWeight: 500,
                  px: 1.5,
                  py: 0.5,
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: hasSelection ? '#066657' : '#fafbfc',
                    boxShadow: 'none',
                  },
                  '&.Mui-disabled': {
                    color: '#a0aab0',
                    borderColor: '#e0e4e6',
                    backgroundColor: '#fafbfc',
                  },
                }}
              >
                Create a form
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={!hasSelection}
                onClick={handleOpenSuppressMenu}
                endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: 'none',
                  color: hasSelection ? '#344046' : '#a0aab0',
                  borderColor: hasSelection ? '#c2c9cd' : '#e0e4e6',
                  borderRadius: '4px',
                  fontSize: 13,
                  fontWeight: 500,
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: hasSelection ? '#fff' : '#fafbfc',
                  '&:hover': {
                    backgroundColor: hasSelection ? '#f5f7f8' : 'transparent',
                    borderColor: hasSelection ? '#8a9296' : '#e0e4e6',
                  },
                  '&.Mui-disabled': {
                    color: '#a0aab0',
                    borderColor: '#e0e4e6',
                    backgroundColor: '#fafbfc',
                  },
                }}
              >
                Suppress
              </Button>

              {/* Suppress Dropdown Menu matching Screenshot 3 */}
              <Menu
                anchorEl={suppressMenuAnchorEl}
                open={Boolean(suppressMenuAnchorEl)}
                onClose={handleCloseSuppressMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{
                  paper: {
                    sx: {
                      minWidth: 210,
                      borderRadius: '4px',
                      border: '1px solid #c2c9cd',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                      py: 0.5,
                    },
                  },
                }}
              >
                <MenuItem
                  onClick={handleQuickSuppressClash}
                  sx={{
                    fontSize: 13,
                    color: '#344046',
                    py: 1,
                    '&:hover': { backgroundColor: '#f5f7f8' },
                  }}
                >
                  Suppress this clash
                </MenuItem>
                <MenuItem
                  onClick={handleCreateRuleFromClash}
                  sx={{
                    fontSize: 13,
                    color: '#344046',
                    py: 1,
                    '&:hover': { backgroundColor: '#f5f7f8' },
                  }}
                >
                  Create a rule based on this clash
                </MenuItem>
              </Menu>
              <Button
                variant="outlined"
                size="small"
                disabled={!hasSelection}
                endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: 'none',
                  color: hasSelection ? '#344046' : '#a0aab0',
                  borderColor: hasSelection ? '#c2c9cd' : '#e0e4e6',
                  borderRadius: '4px',
                  fontSize: 13,
                  fontWeight: 500,
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: hasSelection ? '#fff' : '#fafbfc',
                  '&:hover': {
                    backgroundColor: hasSelection ? '#f5f7f8' : 'transparent',
                    borderColor: hasSelection ? '#8a9296' : '#e0e4e6',
                  },
                  '&.Mui-disabled': {
                    color: '#a0aab0',
                    borderColor: '#e0e4e6',
                    backgroundColor: '#fafbfc',
                  },
                }}
              >
                Export
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={!hasSelection}
                onClick={handleOpenTagPopover}
                endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: 'none',
                  color: hasSelection ? '#344046' : '#a0aab0',
                  borderColor: hasSelection ? '#c2c9cd' : '#e0e4e6',
                  borderRadius: '4px',
                  fontSize: 13,
                  fontWeight: 500,
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: hasSelection ? '#fff' : '#fafbfc',
                  '&:hover': {
                    backgroundColor: hasSelection ? '#f5f7f8' : 'transparent',
                    borderColor: hasSelection ? '#8a9296' : '#e0e4e6',
                  },
                  '&.Mui-disabled': {
                    color: '#a0aab0',
                    borderColor: '#e0e4e6',
                    backgroundColor: '#fafbfc',
                  },
                }}
              >
                Tag
              </Button>
            </Box>

            {/* Right Search and Cluster Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: 'none',
                  color: '#344046',
                  borderColor: '#c2c9cd',
                  borderRadius: '4px',
                  fontSize: 13,
                  fontWeight: 500,
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: '#fff',
                  '&:hover': { backgroundColor: '#f5f7f8', borderColor: '#8a9296' },
                }}
              >
                Cluster by
              </Button>
              <TextField
                placeholder="Find a clash"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: '#8a9296' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: 220,
                  '& .MuiOutlinedInput-root': {
                    height: 32,
                    fontSize: 13,
                    borderRadius: '4px',
                    '& fieldset': { borderColor: '#c2c9cd' },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Clashes Table */}
          <TableContainer sx={{ flex: 1 }}>
            <Table size="small" sx={{ '& .MuiTableCell-root': { fontSize: 12.5, borderBottom: '1px solid #eaedf0', py: 0.85 } }}>
              <TableHead>
                <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 600, color: '#4a555b', borderBottom: '1.5px solid #c2c9cd' } }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={allChecked}
                      onChange={toggleAll}
                      sx={{ p: 0.5, color: '#9fb8ae', '&.Mui-checked': { color: '#087f6c' } }}
                    />
                  </TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Element A</TableCell>
                  <TableCell>Element B</TableCell>
                  <TableCell>Model A</TableCell>
                  <TableCell>Model B</TableCell>
                  <TableCell>Category A</TableCell>
                  <TableCell align="right" sx={{ width: 36 }}>
                    <IconButton size="small" sx={{ color: '#536066', p: 0.2 }}>
                      <ViewWeekOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClashes.map((clash) => {
                  const isSelected = selectedClashId === clash.id;
                  const isChecked = checkedIds.includes(clash.id);
                  return (
                    <TableRow
                      key={clash.id}
                      hover
                      onClick={() => handleRowClick(clash.id)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: isChecked ? '#d8e8e3' : isSelected ? '#f2f8f6' : 'transparent',
                        '&:hover': { backgroundColor: isChecked ? '#cfe2dc' : isSelected ? '#e8f3ef' : '#f8fafb' },
                      }}
                    >
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          size="small"
                          checked={isChecked}
                          onChange={(e) => handleToggleCheck(clash.id, e)}
                          sx={{ p: 0.5, color: '#9fb8ae', '&.Mui-checked': { color: '#087f6c' } }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#1c1f21' }}>{clash.id}</TableCell>
                      <TableCell sx={{ color: clash.status ? '#536066' : 'transparent' }}>
                        {clash.status || '—'}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 140 }}>
                        <Typography noWrap sx={{ fontSize: 12.5 }}>
                          {clash.elementA}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 140 }}>
                        <Typography noWrap sx={{ fontSize: 12.5 }}>
                          {clash.elementB}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 130 }}>
                        <Typography noWrap sx={{ fontSize: 12.5 }}>
                          {clash.modelA}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 130 }}>
                        <Typography noWrap sx={{ fontSize: 12.5 }}>
                          {clash.modelB}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 130 }}>
                        <Typography noWrap sx={{ fontSize: 12.5 }}>
                          {clash.categoryA}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" />
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table Footer Pagination */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, pt: 2, mt: 'auto', borderTop: '1px solid #eaedf0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: 12, color: '#657075' }}>Rows per page:</Typography>
              <Button size="small" endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 14 }} />} sx={{ textTransform: 'none', color: '#1c1f21', fontSize: 12, p: 0, minWidth: 'auto' }}>
                10
              </Button>
            </Box>
            <Typography sx={{ fontSize: 12, color: '#657075' }}>
              1-5 of {clashes.length}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton size="small" sx={{ color: '#8a9296' }}>
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: '#8a9296' }}>
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Right Side: Interactive 3D Model + Clash Details Panel */}
        <Box
          sx={{
            width: 380,
            flexShrink: 0,
            borderLeft: '1px solid #e0e4e6',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fff',
          }}
        >
          {/* Top Interactive 3D Model Viewport (Replaces green block) */}
          <Box sx={{ position: 'relative', width: '100%', height: 280, backgroundColor: '#1a2428', borderBottom: '1px solid #e0e4e6' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

            {/* Floating 3D overlay controls */}
            <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
              <Chip
                label={hasClashSelected ? `Interactive 3D: ${selectedClashId}` : 'Interactive 3D iModel'}
                size="small"
                sx={{
                  backgroundColor: 'rgba(20, 26, 30, 0.85)',
                  color: '#fff',
                  border: '1px solid #2d3b42',
                  fontSize: 10.5,
                  fontWeight: 600,
                  height: 22,
                }}
              />
            </Box>

            <Paper
              elevation={2}
              sx={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                backgroundColor: 'rgba(20, 26, 30, 0.9)',
                backdropFilter: 'blur(4px)',
                border: '1px solid #2f3c44',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                p: 0.3,
                gap: 0.2,
              }}
            >
              <Tooltip title="Zoom in">
                <IconButton size="small" onClick={() => controlsRef.current?.zoomIn()} sx={{ color: '#fff', p: 0.5 }}>
                  <ZoomInIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom out">
                <IconButton size="small" onClick={() => controlsRef.current?.zoomOut()} sx={{ color: '#fff', p: 0.5 }}>
                  <ZoomOutIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset view">
                <IconButton size="small" onClick={() => controlsRef.current?.resetView()} sx={{ color: '#fff', p: 0.5 }}>
                  <CenterFocusStrongIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Paper>
          </Box>

          {/* Details Accordion Panel */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {hasClashSelected && currentClash ? (
              /* ============================================================
                 CLASH SELECTED: Details, Forms, Images
                 ============================================================ */
              <>
                {/* Details Section */}
                <Box sx={{ borderBottom: '1px solid #e0e4e6' }}>
                  <Box
                    onClick={() => setClashDetailsOpen(!clashDetailsOpen)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2.5,
                      py: 1.5,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f8fafb' },
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#1c1f21' }}>Details</Typography>
                    {clashDetailsOpen ? <KeyboardArrowUpIcon sx={{ fontSize: 18, color: '#536066' }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#536066' }} />}
                  </Box>

                  <Collapse in={clashDetailsOpen}>
                    <Box sx={{ px: 2.5, pb: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* ID Number */}
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>ID Number</Typography>
                        <Typography sx={{ fontSize: 13, color: '#1c1f21', mt: 0.25 }}>{currentClash.idNum}</Typography>
                      </Box>

                      {/* Link */}
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Link</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                          <Link
                            href="#"
                            underline="always"
                            noWrap
                            sx={{ fontSize: 13, color: '#087f6c', maxWidth: 300 }}
                          >
                            https://infrastructurecloud.bentley.c...
                          </Link>
                          <LaunchIcon sx={{ fontSize: 14, color: '#087f6c' }} />
                        </Box>
                      </Box>

                      {/* Elements */}
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Elements</Typography>
                        <Typography sx={{ fontSize: 12.5, color: '#1c1f21', mt: 0.25 }}>
                          {currentClash.elementA}
                        </Typography>
                        <Typography sx={{ fontSize: 12.5, color: '#1c1f21', mt: 0.25 }}>
                          {currentClash.elementB}
                        </Typography>
                      </Box>

                      {/* Status */}
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Status</Typography>
                        <Typography sx={{ fontSize: 13, color: '#1c1f21', mt: 0.25 }}>
                          {currentClash.status ? 'Suppressed' : 'Unsuppressed'}
                        </Typography>
                      </Box>

                      {/* Penetration */}
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Penetration</Typography>
                        <Typography sx={{ fontSize: 13, color: '#1c1f21', mt: 0.25 }}>
                          {currentClash.penetration}
                        </Typography>
                      </Box>

                      {/* Tags */}
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500, mb: 0.5 }}>Tags</Typography>
                        {currentClash.tags && currentClash.tags.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.25 }}>
                            {currentClash.tags.map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: 12,
                                  height: 24,
                                  borderRadius: '16px',
                                  borderColor: '#c2c9cd',
                                  color: '#344046',
                                  backgroundColor: '#fff',
                                }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography sx={{ fontSize: 13, color: '#1c1f21', mt: 0.25 }}>
                            None
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Collapse>
                </Box>

                {/* Forms Section */}
                <Box sx={{ borderBottom: '1px solid #e0e4e6' }}>
                  <Box
                    onClick={() => setClashFormsOpen(!clashFormsOpen)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2.5,
                      py: 1.5,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f8fafb' },
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#1c1f21' }}>Forms</Typography>
                    {clashFormsOpen ? <KeyboardArrowUpIcon sx={{ fontSize: 18, color: '#536066' }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#536066' }} />}
                  </Box>
                  <Collapse in={clashFormsOpen}>
                    <Box sx={{ px: 2.5, pb: 2, pt: 0.5 }}>
                      <Typography sx={{ fontSize: 12.5, color: '#657075' }}>No forms linked to this clash.</Typography>
                    </Box>
                  </Collapse>
                </Box>

                {/* Images Section */}
                <Box sx={{ borderBottom: '1px solid #e0e4e6' }}>
                  <Box
                    onClick={() => setClashImagesOpen(!clashImagesOpen)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2.5,
                      py: 1.5,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f8fafb' },
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#1c1f21' }}>Images</Typography>
                    {clashImagesOpen ? <KeyboardArrowUpIcon sx={{ fontSize: 18, color: '#536066' }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#536066' }} />}
                  </Box>
                  <Collapse in={clashImagesOpen}>
                    <Box sx={{ px: 2.5, pb: 2, pt: 0.5 }}>
                      <Typography sx={{ fontSize: 12.5, color: '#657075' }}>No images uploaded.</Typography>
                    </Box>
                  </Collapse>
                </Box>
              </>
            ) : (
              /* ============================================================
                 ZERO CLASHES SELECTED: Test details, Settings, Forms, History
                 (Matching "right panel" and "dynamic states" attachments)
                 ============================================================ */
              <>
                {/* 1. Test details Section */}
                <Box sx={{ borderBottom: '1px solid #e0e4e6' }}>
                  <Box
                    onClick={() => setTestDetailsOpen(!testDetailsOpen)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2.5,
                      py: 1.5,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f8fafb' },
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#1c1f21' }}>Test details</Typography>
                    {testDetailsOpen ? <KeyboardArrowUpIcon sx={{ fontSize: 18, color: '#536066' }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#536066' }} />}
                  </Box>
                  <Collapse in={testDetailsOpen}>
                    <Box sx={{ px: 2.5, pb: 2.5, pt: 0.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Description</Typography>
                        <Typography sx={{ fontSize: 13, color: '#1c1f21', mt: 0.25 }}>
                          {testData.description !== undefined && testData.description !== null && testData.description.trim() !== ''
                            ? testData.description
                            : '—'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Tags</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={testData.tag || 'WP03'}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: 12,
                              height: 24,
                              borderRadius: '16px',
                              borderColor: '#c2c9cd',
                              color: '#344046',
                              backgroundColor: '#fff',
                            }}
                          />
                        </Box>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Created by</Typography>
                        <Typography sx={{ fontSize: 13, color: '#1c1f21', mt: 0.25 }}>
                          {testData.createdBy || 'Jeanlouise Hornberger'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Last run</Typography>
                        <Typography sx={{ fontSize: 13, color: '#1c1f21', mt: 0.25 }}>
                          {testData.lastRunDate || '02 April 2026'}
                        </Typography>
                      </Box>
                    </Box>
                  </Collapse>
                </Box>

                {/* 2. Settings Section */}
                <Box sx={{ borderBottom: '1px solid #e0e4e6' }}>
                  <Box
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2.5,
                      py: 1.5,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f8fafb' },
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#1c1f21' }}>Settings</Typography>
                    {settingsOpen ? <KeyboardArrowUpIcon sx={{ fontSize: 18, color: '#536066' }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#536066' }} />}
                  </Box>
                  <Collapse in={settingsOpen}>
                    <Box sx={{ px: 2.5, pb: 2.5, pt: 0.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Suppression rules</Typography>
                        <Link
                          onClick={() => setSuppressionDrawerOpen(true)}
                          underline="always"
                          sx={{
                            color: '#087f6c',
                            fontSize: 13,
                            cursor: 'pointer',
                            mt: 0.25,
                            display: 'inline-block',
                            fontWeight: 500,
                            '&:hover': { color: '#066657' },
                          }}
                        >
                          {suppressionRules.length} {suppressionRules.length === 1 ? 'rule' : 'rules'} applied
                        </Link>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Touching tolerance</Typography>
                        <Typography sx={{ fontSize: 13, color: '#1c1f21', mt: 0.25 }}>.05"</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Reference models</Typography>
                        <Typography sx={{ fontSize: 13, color: '#1c1f21', mt: 0.25 }}>Included</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Automatic run</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.25 }}>
                          <Typography sx={{ fontSize: 13, color: '#1c1f21' }}>Every Monday at 9:00 AM EST</Typography>
                          <IconButton size="small" sx={{ p: 0.25, color: '#657075', '&:hover': { color: '#087f6c' } }}>
                            <EditOutlinedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </Collapse>
                </Box>

                {/* 3. Forms Section */}
                <Box sx={{ borderBottom: '1px solid #e0e4e6' }}>
                  <Box
                    onClick={() => setTestFormsOpen(!testFormsOpen)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2.5,
                      py: 1.5,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f8fafb' },
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#1c1f21' }}>Forms</Typography>
                    {testFormsOpen ? <KeyboardArrowUpIcon sx={{ fontSize: 18, color: '#536066' }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#536066' }} />}
                  </Box>
                  <Collapse in={testFormsOpen}>
                    <Box sx={{ px: 2.5, pb: 2.5, pt: 0.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Open</Typography>
                        <Link
                          underline="always"
                          sx={{
                            color: '#087f6c',
                            fontSize: 13,
                            cursor: 'pointer',
                            mt: 0.25,
                            display: 'inline-block',
                          }}
                        >
                          34 forms
                        </Link>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Closed</Typography>
                        <Link
                          underline="always"
                          sx={{
                            color: '#087f6c',
                            fontSize: 13,
                            cursor: 'pointer',
                            mt: 0.25,
                            display: 'inline-block',
                          }}
                        >
                          290 forms
                        </Link>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Waiting review</Typography>
                        <Link
                          underline="always"
                          sx={{
                            color: '#087f6c',
                            fontSize: 13,
                            cursor: 'pointer',
                            mt: 0.25,
                            display: 'inline-block',
                          }}
                        >
                          123 forms
                        </Link>
                      </Box>
                    </Box>
                  </Collapse>
                </Box>

                {/* 4. History Section */}
                <Box sx={{ borderBottom: '1px solid #e0e4e6' }}>
                  <Box
                    onClick={() => setHistoryOpen(!historyOpen)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2.5,
                      py: 1.5,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f8fafb' },
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#1c1f21' }}>History</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {historyOpen && (
                        <Typography sx={{ fontSize: 12, color: '#657075' }}>6 total runs</Typography>
                      )}
                      {historyOpen ? (
                        <KeyboardArrowUpIcon sx={{ fontSize: 18, color: '#536066' }} />
                      ) : (
                        <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#536066' }} />
                      )}
                    </Box>
                  </Box>
                  <Collapse in={historyOpen}>
                    <Box sx={{ px: 2.5, pb: 2.5, pt: 0.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[
                        { date: '02 April 2026', count: '3,340 clashes' },
                        { date: '24 March 2026', count: '4,012 clashes' },
                        { date: '21 October 2025', count: '12,793 clashes' },
                        { date: '14 October 2025', count: '23,002 clashes' },
                        { date: '29 September 2025', count: '33,022 clashes' },
                        { date: '17 September 2025', count: '34,702 clashes' },
                      ].map((run, i) => (
                        <Box key={i}>
                          <Typography sx={{ fontSize: 13, color: '#1c1f21' }}>{run.date}</Typography>
                          <Typography sx={{ fontSize: 12, color: '#657075', mt: 0.25 }}>{run.count}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Tagging Dropdown Popover matching Frames 3 & 4 */}
      <Popover
        open={Boolean(tagAnchorEl)}
        anchorEl={tagAnchorEl}
        onClose={handleCloseTagPopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 260,
              borderRadius: '8px',
              border: '1px solid #c2c9cd',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              p: 1.5,
              mt: 0.5,
            },
          },
        }}
      >
        {/* Search input inside popover */}
        <TextField
          placeholder="Find tags"
          size="small"
          fullWidth
          value={tagFilterQuery}
          onChange={(e) => setTagFilterQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: '#8a9296' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              height: 32,
              fontSize: 13,
              borderRadius: '4px',
              '& fieldset': { borderColor: '#c2c9cd' },
            },
          }}
        />

        {/* Tag Options with Rounded Checkboxes */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 220, overflowY: 'auto' }}>
          {AVAILABLE_TAGS.filter((t) =>
            t.toLowerCase().includes(tagFilterQuery.toLowerCase())
          ).map((tagName) => {
            const isChecked = pendingSelectedTags.includes(tagName);
            return (
              <Box
                key={tagName}
                onClick={() => handleTogglePendingTag(tagName)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  py: 0.4,
                  px: 0.5,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f0f4f7' },
                }}
              >
                <Checkbox
                  size="small"
                  checked={isChecked}
                  onChange={() => handleTogglePendingTag(tagName)}
                  sx={{
                    p: 0.25,
                    color: '#55626a',
                    '& .MuiSvgIcon-root': {
                      fontSize: 18,
                      borderRadius: '4px',
                    },
                    '&.Mui-checked': {
                      color: '#087f6c',
                    },
                  }}
                />
                <Typography sx={{ fontSize: 13, color: '#1c1f21' }}>{tagName}</Typography>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ my: 1.5, borderColor: '#eaedf0' }} />

        {/* Popover Footer Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            size="small"
            sx={{
              textTransform: 'none',
              fontSize: 12.5,
              fontWeight: 500,
              color: '#1c1f21',
              p: 0,
              minWidth: 'auto',
              '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
            }}
          >
            Manage tags
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCloseTagPopover}
              sx={{
                textTransform: 'none',
                color: '#344046',
                borderColor: '#c2c9cd',
                borderRadius: '4px',
                fontSize: 12.5,
                fontWeight: 500,
                px: 1.2,
                py: 0.3,
                height: 28,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              disabled={pendingSelectedTags.length === 0}
              onClick={handleApplyTags}
              sx={{
                textTransform: 'none',
                backgroundColor: '#087f6c',
                color: '#fff',
                borderRadius: '4px',
                fontSize: 12.5,
                fontWeight: 500,
                px: 1.4,
                py: 0.3,
                height: 28,
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#066657', boxShadow: 'none' },
                '&.Mui-disabled': { backgroundColor: '#e0e4e6', color: '#909ba0' },
              }}
            >
              {pendingSelectedTags.length > 0 ? `Add ${pendingSelectedTags.length} selected` : 'Add selected'}
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* Dark Pill Toast Notification with Undo button matching Frame 5 */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => {
          setToastMessage('');
          setUndoBackup(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{
          sx: {
            backgroundColor: '#262d31',
            color: '#fff',
            fontSize: 13.5,
            fontWeight: 400,
            borderRadius: '6px',
            minWidth: 260,
            px: 2,
            py: 0.5,
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            '& .MuiSnackbarContent-message': {
              p: 0,
              width: '100%',
            },
          },
        }}
        message={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3, width: '100%' }}>
            <Typography sx={{ fontSize: 13, color: '#f5f7f8' }}>{toastMessage}</Typography>
            {undoBackup && (
              <Button
                onClick={handleUndoTagging}
                sx={{
                  color: '#65c49f',
                  textTransform: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#8fe0c0',
                  },
                }}
              >
                Undo
              </Button>
            )}
          </Box>
        }
      />

      {/* Suppression Rules Drawer matching Screenshot 2 */}
      <SuppressionRulesDrawer
        open={suppressionDrawerOpen}
        onClose={() => {
          setSuppressionDrawerOpen(false);
          setInitialCreateRuleData(null);
        }}
        rules={suppressionRules}
        testName={testData.name || 'AR vs EL'}
        onSaveRule={handleSaveSuppressionRule}
        onDeleteRule={handleDeleteSuppressionRule}
        initialCreateRule={initialCreateRuleData}
        onSaveAndApply={handleSaveAndApplyFromDrawer}
      />
    </Box>
  );
};

export default ClashTestDetail;

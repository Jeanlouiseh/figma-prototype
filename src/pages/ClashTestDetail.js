import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import * as THREE from 'three';
import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
  Collapse,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Link,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Slider,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  ListItemIcon,
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
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UndoIcon from '@mui/icons-material/Undo';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { getModelForIModel } from '../utils/pittsburghModels.js';
import { generateClashesForTest } from '../utils/tailoredClashes.js';
import { ClashIcon } from '../components/Sidebar';
import SuppressionRulesDrawer from '../components/SuppressionRulesDrawer';
import CreateClashFormDialog from '../components/CreateClashFormDialog';
import {
  getStoredTests,
  updateTestInStore,
  ROBERTO_CLEMENTE_DEFAULT_RULES,
  LIBERTY_BRIDGE_DEFAULT_RULES,
  PPG_PLACE_DEFAULT_RULES,
} from '../data/clashTestsStore';

const TEST_SETTINGS_TAG_USAGE = [
  { name: 'Architectural' },
  { name: 'Structural' },
  { name: 'Plumbing' },
  { name: 'Electrical' },
  { name: 'Pipes' },
  { name: 'Concrete' },
  { name: 'Foundation' },
  { name: 'Doors' },
];

// "Suppressed" is a status, not a user-assignable tag, so strip it from
// generated mock data before it ever reaches tag-related UI.
const stripSuppressedTag = (clashesList) =>
  clashesList.map((c) => ({
    ...c,
    tags: (c.tags || []).filter((t) => t !== 'Suppressed'),
  }));

const CLUSTER_OPTIONS = [
  'Element A',
  'Element B',
  'Status',
  'Model A',
  'Model B',
  'Category A',
  'Category B',
  'Tags',
  'Location',
  'Form',
  'Form status',
];

const getClusterGroups = (clashesList, clusterType) => {
  if (!clusterType) return null;

  if (clusterType === 'Tags') {
    const tagOrder = ['Architectural', 'Plumbing'];
    const groups = [];

    tagOrder.forEach((tag) => {
      const matching = clashesList.filter((c) => c.tags && c.tags.includes(tag));
      if (matching.length > 0) {
        groups.push({
          id: tag,
          name: tag,
          clashes: matching,
        });
      }
    });

    const otherTags = new Set();
    clashesList.forEach((c) => {
      (c.tags || []).forEach((t) => {
        if (!tagOrder.includes(t)) otherTags.add(t);
      });
    });
    otherTags.forEach((tag) => {
      const matching = clashesList.filter((c) => c.tags && c.tags.includes(tag));
      if (matching.length > 0) {
        groups.push({
          id: tag,
          name: tag,
          clashes: matching,
        });
      }
    });

    return groups;
  }

  if (clusterType === 'Form') {
    const groups = [];
    const formMap = new Map();
    const noFormClashes = [];

    clashesList.forEach((clash) => {
      if (clash.hasForm && clash.formId) {
        if (!formMap.has(clash.formId)) {
          formMap.set(clash.formId, []);
        }
        formMap.get(clash.formId).push(clash);
      } else {
        noFormClashes.push(clash);
      }
    });

    formMap.forEach((groupClashes, formId) => {
      const withSubject = groupClashes.find((c) => c.subject);
      groups.push({
        id: formId,
        name: withSubject ? withSubject.subject : formId,
        clashes: groupClashes,
      });
    });

    if (noFormClashes.length > 0) {
      groups.push({
        id: 'no-form',
        name: 'No form',
        clashes: noFormClashes,
      });
    }

    return groups;
  }

  // Generic clustering for other attributes
  const map = new Map();
  clashesList.forEach((clash) => {
    let key = '';
    switch (clusterType) {
      case 'Status':
        key = clash.status || 'Unsuppressed';
        break;
      case 'Model A':
        key = clash.modelA || 'Ref-11, I-95_Geometry';
        break;
      case 'Model B':
        key = clash.modelB || 'Ref, DrainageRegion01';
        break;
      case 'Category A':
        key = clash.categoryA || 'Util_Storm_Pipes';
        break;
      case 'Category B':
        key = clash.categoryB || 'Drainage';
        break;
      case 'Element A':
        key = clash.elementA || 'Element A';
        break;
      case 'Element B':
        key = clash.elementB || 'Element B';
        break;
      case 'Location':
        key = clash.location || 'Level 1';
        break;
      case 'Form status':
        key = clash.formStatus || 'No form';
        break;
      default:
        key = clash[clusterType] || 'Other';
    }
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(clash);
  });

  return Array.from(map.entries()).map(([name, groupClashes]) => ({
    id: name,
    name,
    clashes: groupClashes,
  }));
};

const getMeshBounds = (mesh) => {
  const bounds = new THREE.Box3();
  mesh.updateWorldMatrix(true, false);
  return bounds.setFromObject(mesh);
};

const getStableClashParts = (setAGroup, setBGroup, clashId) => {
  const structuralMeshes = [];
  const mepMeshes = [];

  setAGroup.traverse((object) => {
    if (object.isMesh) structuralMeshes.push(object);
  });
  setBGroup.traverse((object) => {
    if (object.isMesh) mepMeshes.push(object);
  });

  if (structuralMeshes.length === 0 || mepMeshes.length === 0) return null;

  const intersectingPairs = [];
  structuralMeshes.forEach((structuralMesh) => {
    const structuralBounds = getMeshBounds(structuralMesh);
    mepMeshes.forEach((mepMesh) => {
      const mepBounds = getMeshBounds(mepMesh);
      if (structuralBounds.intersectsBox(mepBounds)) {
        intersectingPairs.push({
          structuralMesh,
          mepMesh,
          position: structuralBounds
            .clone()
            .intersect(mepBounds)
            .getCenter(new THREE.Vector3()),
        });
      }
    });
  });

  if (intersectingPairs.length === 0) return null;

  const seed = Array.from(clashId).reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 0);
  return intersectingPairs[seed % intersectingPairs.length];
};

const highlightModelMesh = (sourceMesh, color, opacity = 0.88) => {
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.35,
    roughness: 0.4,
    metalness: 0.25,
    transparent: true,
    opacity,
    depthTest: false,
  });
  const originalMaterial = sourceMesh.material;
  sourceMesh.material = material;
  const originalRenderOrder = sourceMesh.renderOrder;
  sourceMesh.renderOrder = 1;
  return { sourceMesh, originalMaterial, originalRenderOrder, material };
};

const dimModelMeshes = (groups, opacity = 0.22) => {
  const dimmedMeshes = [];
  groups.forEach((group) => {
    group.traverse((object) => {
      if (!object.isMesh) return;
      const originalMaterial = object.material;
      const material = new THREE.MeshStandardMaterial({
        color: 0x8c959b,
        roughness: 0.8,
        metalness: 0.05,
        transparent: true,
        opacity,
        depthWrite: false,
      });
      object.material = material;
      dimmedMeshes.push({ sourceMesh: object, originalMaterial, material });
    });
  });
  return dimmedMeshes;
};

const clearModelSelection = (highlightGroup) => {
  const selectedMeshes = [
    ...(highlightGroup.userData.highlightedMeshes || []),
    ...(highlightGroup.userData.dimmedMeshes || []),
  ];
  selectedMeshes.forEach(({ sourceMesh, originalMaterial, originalRenderOrder, material }) => {
    sourceMesh.material = originalMaterial;
    if (originalRenderOrder !== undefined) sourceMesh.renderOrder = originalRenderOrder;
    material.dispose();
  });
  highlightGroup.children.forEach((child) => {
    child.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  });
  highlightGroup.clear();
  highlightGroup.userData.dimmedMeshes = [];
  highlightGroup.userData.highlightedMeshes = [];
  highlightGroup.userData.selectionCenter = null;
};

const ClashTestDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { id: routeTestId } = useParams();

  const testData = useMemo(() => {
    if (location.state) return location.state;
    if (routeTestId) {
      const stored = getStoredTests();
      const found = stored.find((t) => String(t.id) === String(routeTestId));
      if (found) return found;
    }
    return {
      name: 'AR vs EL',
      iModel: 'Roberto Clemente Bridge',
      lastRun: '07 August 2026 09:00AM EST',
      description: 'This is where the test description will go.',
      tag: 'WP03',
      createdBy: 'Jeanlouise Hornberger',
      lastRunDate: '02 April 2026',
    };
  }, [location.state, routeTestId]);

  const [clashes, setClashes] = useState(() =>
    stripSuppressedTag(generateClashesForTest(testData.name, testData.iModel))
  );

  useEffect(() => {
    setClashes(stripSuppressedTag(generateClashesForTest(testData.name, testData.iModel)));
    setSelectedClashId(null);
    setCheckedIds([]);
  }, [testData.name, testData.iModel]);

  const [selectedClashId, setSelectedClashId] = useState(null);
  const [checkedIds, setCheckedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Clustering state (matching default.png and clusters.png)
  const [clusterBy, setClusterBy] = useState(null);
  const [clusterMenuAnchorEl, setClusterMenuAnchorEl] = useState(null);
  const [collapsedClusters, setCollapsedClusters] = useState({});
  const [clusterActionAnchorEl, setClusterActionAnchorEl] = useState(null);
  const [clusterActionGroup, setClusterActionGroup] = useState(null);

  // Accordion states when a clash IS selected
  const [clashDetailsOpen, setClashDetailsOpen] = useState(true);
  const [clashFormsOpen, setClashFormsOpen] = useState(false);
  const [clashImagesOpen, setClashImagesOpen] = useState(false);
  const [clashImages, setClashImages] = useState({});
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [pendingImages, setPendingImages] = useState([]);
  const imageInputRef = useRef(null);
  const [markupImage, setMarkupImage] = useState(null);
  const [markupColor, setMarkupColor] = useState('#d32f2f');
  const [markupTool, setMarkupTool] = useState('draw');
  const [annotationDraft, setAnnotationDraft] = useState(null);
  const markupCanvasRef = useRef(null);
  const isDrawingMarkupRef = useRef(false);
  const markupHistoryRef = useRef([]);
  const annotationDragRef = useRef(null);

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
    const model = (testData.iModel || '').toLowerCase();
    if (model.includes('liberty')) {
      return LIBERTY_BRIDGE_DEFAULT_RULES;
    }
    if (model.includes('ppg') || model.includes('tied')) {
      return PPG_PLACE_DEFAULT_RULES;
    }
    return ROBERTO_CLEMENTE_DEFAULT_RULES;
  }, [testData]);

  const [suppressionRules, setSuppressionRules] = useState(initialRules);

  useEffect(() => {
    setSuppressionRules(initialRules);
  }, [initialRules]);

  const handleSwitchIModel = (newIModel) => {
    const stored = getStoredTests();
    const matching = stored.find((t) => t.iModel === newIModel);
    if (matching) {
      navigate(`/clash-detection/test/${matching.id}`, { state: matching });
    } else {
      const fallbackTest = {
        ...testData,
        id: Date.now(),
        iModel: newIModel,
      };
      navigate(`/clash-detection/test/${testData.id || 1}`, { state: fallbackTest });
    }
  };
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

  const handleQuickUnsuppressClash = () => {
    const targetRows = checkedIds.length > 0 ? checkedIds : selectedClashId ? [selectedClashId] : [];
    if (targetRows.length === 0) return;

    setClashes((prev) =>
      prev.map((c) => (targetRows.includes(c.id) ? { ...c, status: '' } : c))
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

  // Create Clash Form Modal State
  const [createFormDialogOpen, setCreateFormDialogOpen] = useState(false);

  // Test Settings Popover State (gear icon)
  const [testSettingsAnchorEl, setTestSettingsAnchorEl] = useState(null);
  const [testSettingsTab, setTestSettingsTab] = useState('schedule');
  const [tsAutoRun, setTsAutoRun] = useState(true);
  const [tsFrequency, setTsFrequency] = useState('Weekly');
  const [tsStartDate, setTsStartDate] = useState('');
  const [tsStartTime, setTsStartTime] = useState('09:00 AM');
  const [tsEndDate, setTsEndDate] = useState('');
  const [tsTagSearch, setTsTagSearch] = useState('');
  const [tsTagList, setTsTagList] = useState(TEST_SETTINGS_TAG_USAGE);
  const [tsTagMenuAnchorEl, setTsTagMenuAnchorEl] = useState(null);
  const [tsTagMenuTarget, setTsTagMenuTarget] = useState(null);
  const [tsElementAPct, setTsElementAPct] = useState(20);
  const [tsElementBPct, setTsElementBPct] = useState(20);
  const [tsNonClashPct, setTsNonClashPct] = useState(20);
  const [tsAutoClose, setTsAutoClose] = useState(true);
  const [tsDefaultClosedStatus, setTsDefaultClosedStatus] = useState('Closed');
  const [tsDefaultOpenStatus, setTsDefaultOpenStatus] = useState('Open');

  const handleOpenTestSettings = (e) => {
    setTestSettingsTab('schedule');
    setTestSettingsAnchorEl(e.currentTarget);
  };

  const handleCloseTestSettings = () => {
    setTestSettingsAnchorEl(null);
  };

  const handleCreateTagFromSearch = () => {
    const newTagName = tsTagSearch.trim();
    if (!newTagName) return;
    const alreadyExists = tsTagList.some((t) => t.name.toLowerCase() === newTagName.toLowerCase());
    if (alreadyExists) return;
    setTsTagList((prev) => [{ name: newTagName }, ...prev]);
    setTsTagSearch('');
  };

  const handleOpenTagRowMenu = (e, tagName) => {
    setTsTagMenuAnchorEl(e.currentTarget);
    setTsTagMenuTarget(tagName);
  };

  const handleCloseTagRowMenu = () => {
    setTsTagMenuAnchorEl(null);
    setTsTagMenuTarget(null);
  };

  const handleDeleteTagFromMenu = () => {
    const tagName = tsTagMenuTarget;
    handleCloseTagRowMenu();
    if (!tagName) return;
    setTsTagList((prev) => prev.filter((t) => t.name !== tagName));
  };

  const filteredTsTagList = tsTagList.filter((t) =>
    t.name.toLowerCase().includes(tsTagSearch.trim().toLowerCase())
  );
  const tsTagExactMatch = tsTagList.some(
    (t) => t.name.toLowerCase() === tsTagSearch.trim().toLowerCase()
  );
  const tsTagCanCreate = tsTagSearch.trim().length > 0 && !tsTagExactMatch;

  // Live count of how many clashes each tag is actually applied to
  const tsTagUsageCounts = useMemo(() => {
    const counts = {};
    clashes.forEach((c) => {
      (c.tags || []).forEach((tagName) => {
        counts[tagName] = (counts[tagName] || 0) + 1;
      });
    });
    return counts;
  }, [clashes]);

  const TEST_SETTINGS_NAV_ITEMS = [
    { key: 'schedule', label: 'Schedule' },
    { key: 'tags', label: 'Tags' },
    { key: 'modelDisplay', label: 'Model display' },
    { key: 'forms', label: 'Forms' },
  ];

  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const highlightGroupRef = useRef(null);
  const targetCamPosRef = useRef(new THREE.Vector3());
  const targetLookAtRef = useRef(new THREE.Vector3());
  const isAnimatingCamRef = useRef(false);
  const bridgeRef = useRef(null);
  const cameraRef = useRef(null);
  const targetRef = useRef(null);

  const primarySelectedClashId = selectedClashId || checkedIds[0] || null;
  const currentClash = primarySelectedClashId ? clashes.find((c) => c.id === primarySelectedClashId) || null : null;
  const hasClashSelected = Boolean(selectedClashId && currentClash);
  const selectedModelClashes = useMemo(() => {
    const selectedIds = checkedIds.length > 0 ? checkedIds : selectedClashId ? [selectedClashId] : [];
    return selectedIds
      .map((clashId) => clashes.find((clash) => clash.id === clashId))
      .filter(Boolean);
  }, [checkedIds, clashes, selectedClashId]);
  const hasModelSelection = selectedModelClashes.length > 0;
  const hasSelection = checkedIds.length > 0 || Boolean(selectedClashId);
  const selectedClashCount = checkedIds.length > 0 ? checkedIds.length : selectedClashId ? 1 : 0;
  const detailValues = useMemo(() => {
    const detailClashes = selectedModelClashes.length > 0 ? selectedModelClashes : currentClash ? [currentClash] : [];
    const getMixedValue = (getValue, fallback = '—') => {
      if (detailClashes.length === 0) return fallback;
      const values = detailClashes.map((clash) => getValue(clash) || fallback);
      return values.every((value) => value === values[0]) ? values[0] : 'Mixed';
    };
    const getMixedTags = () => {
      if (detailClashes.length === 0) return { mixed: false, tags: [] };
      const tagLists = detailClashes.map((clash) => clash.tags || []);
      const tagKeys = tagLists.map((tags) => [...tags].sort().join('\u0000'));
      return tagKeys.every((tagKey) => tagKey === tagKeys[0])
        ? { mixed: false, tags: tagLists[0] }
        : { mixed: true, tags: [] };
    };

    return {
      idNum: getMixedValue((clash) => clash.idNum),
      link: getMixedValue((clash) => clash.link || 'https://infrastructurecloud.bentley.c...'),
      elementA: getMixedValue((clash) => clash.elementA),
      elementB: getMixedValue((clash) => clash.elementB),
      status: getMixedValue((clash) => (clash.status ? 'Suppressed' : 'Unsuppressed')),
      penetration: getMixedValue((clash) => clash.penetration),
      tags: getMixedTags(),
    };
  }, [currentClash, selectedModelClashes]);
  const selectedTagCount = useMemo(() => {
    const targetRows = checkedIds.length > 0 ? checkedIds : selectedClashId ? [selectedClashId] : [];
    return clashes
      .filter((clash) => targetRows.includes(clash.id))
      .reduce((count, clash) => count + (clash.tags || []).length, 0);
  }, [checkedIds, clashes, selectedClashId]);

  const handleOpenCreateForm = () => {
    const targetRows = checkedIds.length > 0 ? checkedIds : selectedClashId ? [selectedClashId] : [];
    if (targetRows.length === 0) return;
    setCreateFormDialogOpen(true);
  };

  const handleCloseCreateForm = () => {
    setCreateFormDialogOpen(false);
  };

  const addPendingImages = (files) => {
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxFileSize = 3 * 1024 * 1024;
    const newImages = Array.from(files).map((file) => {
      if (!validTypes.includes(file.type)) {
        return { id: `${file.name}-${file.lastModified}`, file, error: 'Only JPG, PNG, or PDF files are accepted.' };
      }
      if (file.size > maxFileSize) {
        return { id: `${file.name}-${file.lastModified}`, file, error: 'File exceeds the 3 MB limit.' };
      }
      return {
        id: `${file.name}-${file.lastModified}`,
        file,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      };
    });
    setPendingImages((previous) => [...previous, ...newImages]);
  };

  const handleImageInput = (event) => {
    addPendingImages(event.target.files);
    event.target.value = '';
  };

  const removePendingImage = (imageId) => {
    setPendingImages((previous) => {
      const removedImage = previous.find((image) => image.id === imageId);
      if (removedImage?.previewUrl) URL.revokeObjectURL(removedImage.previewUrl);
      return previous.filter((image) => image.id !== imageId);
    });
  };

  const closeImageUpload = () => {
    pendingImages.forEach((image) => {
      if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
    });
    setPendingImages([]);
    setImageUploadOpen(false);
  };

  const handleAddImages = () => {
    const validImages = pendingImages.filter((image) => !image.error);
    if (!currentClash || validImages.length === 0) return;
    setClashImages((previous) => ({
      ...previous,
      [currentClash.id]: [...(previous[currentClash.id] || []), ...validImages],
    }));
    setPendingImages([]);
    setImageUploadOpen(false);
    setClashImagesOpen(true);
    setToastMessage(`${validImages.length} image${validImages.length === 1 ? '' : 's'} added to ${currentClash.id}`);
  };

  const removeClashImage = (imageId) => {
    if (!currentClash) return;
    setClashImages((previous) => {
      const images = previous[currentClash.id] || [];
      const removedImage = images.find((image) => image.id === imageId);
      if (removedImage?.previewUrl) URL.revokeObjectURL(removedImage.previewUrl);
      return { ...previous, [currentClash.id]: images.filter((image) => image.id !== imageId) };
    });
  };

  useEffect(() => {
    if (!markupImage?.previewUrl || !markupCanvasRef.current) return;
    const canvas = markupCanvasRef.current;
    const context = canvas.getContext('2d');
    const image = new Image();
    image.onload = () => {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (markupImage.markupUrl) {
        const markup = new Image();
        markup.onload = () => context.drawImage(markup, 0, 0, canvas.width, canvas.height);
        markup.src = markupImage.markupUrl;
      }
      markupHistoryRef.current = [];
    };
    image.src = markupImage.previewUrl;
  }, [markupImage]);

  const getMarkupPoint = (event) => {
    const canvas = markupCanvasRef.current;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
      y: (event.clientY - bounds.top) * (canvas.height / bounds.height),
    };
  };

  const startMarkup = (event) => {
    if (markupTool === 'text') {
      const canvas = markupCanvasRef.current;
      const bounds = canvas.getBoundingClientRect();
      setAnnotationDraft({
        x: ((event.clientX - bounds.left) / bounds.width) * 100,
        y: ((event.clientY - bounds.top) / bounds.height) * 100,
        text: '',
        color: markupColor,
      });
      return;
    }
    const canvas = markupCanvasRef.current;
    const context = canvas.getContext('2d');
    markupHistoryRef.current.push(canvas.toDataURL());
    const point = getMarkupPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.strokeStyle = markupColor;
    context.lineWidth = Math.max(4, canvas.width * 0.006);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    isDrawingMarkupRef.current = true;
  };

  const drawMarkup = (event) => {
    if (!isDrawingMarkupRef.current) return;
    const point = getMarkupPoint(event);
    const context = markupCanvasRef.current.getContext('2d');
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const stopMarkup = () => {
    isDrawingMarkupRef.current = false;
  };

  const undoMarkup = () => {
    const previous = markupHistoryRef.current.pop();
    if (!previous) return;
    const canvas = markupCanvasRef.current;
    const context = canvas.getContext('2d');
    const image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = previous;
  };

  const saveMarkup = () => {
    if (!currentClash || !markupImage) return;
    const markupUrl = markupCanvasRef.current.toDataURL('image/png');
    setClashImages((previous) => {
      const savedImage = { ...markupImage, markupUrl, annotations: markupImage.annotations || [], isNewCapture: false };
      const images = previous[currentClash.id] || [];
      return {
        ...previous,
        [currentClash.id]: markupImage.isNewCapture
          ? [...images, savedImage]
          : images.map((image) => (image.id === markupImage.id ? savedImage : image)),
      };
    });
    setMarkupImage(null);
    setToastMessage(`Markups saved to ${markupImage.file.name}`);
  };

  const saveTextAnnotation = () => {
    if (!annotationDraft?.text.trim()) {
      setAnnotationDraft(null);
      return;
    }
    setMarkupImage((image) => ({
      ...image,
      annotations: [
        ...(image.annotations || []),
        { ...annotationDraft, id: `${Date.now()}-${annotationDraft.x}-${annotationDraft.y}`, text: annotationDraft.text.trim() },
      ],
    }));
    setAnnotationDraft(null);
  };

  const startAnnotationDrag = (event, annotation) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    annotationDragRef.current = { id: annotation.id };
  };

  const moveAnnotation = (event) => {
    if (!annotationDragRef.current) return;
    const canvas = markupCanvasRef.current;
    const bounds = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100));
    setMarkupImage((image) => ({
      ...image,
      annotations: (image.annotations || []).map((annotation) =>
        annotation.id === annotationDragRef.current.id ? { ...annotation, x, y } : annotation
      ),
    }));
  };

  const stopAnnotationDrag = () => {
    annotationDragRef.current = null;
  };

  const captureModelView = () => {
    if (!currentClash || !controlsRef.current?.captureView) return;
    const capture = controlsRef.current.captureView();
    const image = {
      id: `capture-${Date.now()}`,
      file: new File([capture.blob], `model-view-${currentClash.id}-${Date.now()}.png`, { type: 'image/png' }),
      previewUrl: capture.url,
      annotations: [],
      isNewCapture: true,
    };
    setMarkupTool('draw');
    setAnnotationDraft(null);
    setMarkupImage(image);
  };


  const handleCreateClashForm = ({ subject, assignedTo, dueDate, comment, formStatus }) => {
    const targetRows = checkedIds.length > 0 ? checkedIds : selectedClashId ? [selectedClashId] : [];
    if (targetRows.length === 0) return;

    const sharedFormId = `FORM-${Date.now()}`;

    setClashes((prev) =>
      prev.map((c) => {
        if (targetRows.includes(c.id)) {
          return {
            ...c,
            subject: subject || '',
            formStatus: formStatus || 'Open',
            assignedTo: assignedTo || 'Jeanlouise Hornberger',
            dueDate: dueDate || '',
            comment: comment || '',
            hasForm: true,
            formId: sharedFormId,
          };
        }
        return c;
      })
    );

    setCreateFormDialogOpen(false);

    // Toast notification matching Screenshot 2: "Form added to CL-001"
    const toastText =
      targetRows.length === 1
        ? `Form added to ${targetRows[0]}`
        : `Form added to ${targetRows.length} clashes`;

    setToastMessage(toastText);
    setUndoBackup(null);
  };

  const handleOpenTagPopover = (e) => {
    // If no row is explicitly checked, apply tag to the currently selected clash
    const targetRows = checkedIds.length > 0 ? checkedIds : selectedClashId ? [selectedClashId] : [];
    if (targetRows.length === 0) return;
    if (checkedIds.length === 0 && selectedClashId) {
      setCheckedIds([selectedClashId]);
    }
    const targetClash = clashes.find((c) => c.id === targetRows[0]);
    setPendingSelectedTags(targetClash ? [...(targetClash.tags || [])] : []);
    setTagFilterQuery('');
    setTagAnchorEl(e.currentTarget || e);
  };

  const handleCloseTagPopover = () => {
    setTagAnchorEl(null);
  };

  const handleRemoveAllTags = () => {
    const targetRowIds = checkedIds.length > 0 ? checkedIds : selectedClashId ? [selectedClashId] : [];
    if (targetRowIds.length === 0) {
      handleCloseTagPopover();
      return;
    }

    const removedCount = clashes
      .filter((c) => targetRowIds.includes(c.id))
      .reduce((count, c) => count + (c.tags || []).length, 0);

    if (removedCount === 0) {
      handleCloseTagPopover();
      return;
    }

    setUndoBackup({
      clashesState: clashes.map((c) => ({ ...c, tags: [...(c.tags || [])] })),
      targetIds: [...targetRowIds],
    });

    setClashes((prev) =>
      prev.map((c) => (targetRowIds.includes(c.id) ? { ...c, tags: [] } : c))
    );

    const targetLabel = targetRowIds.length === 1 ? targetRowIds[0] : `${targetRowIds.length} clashes`;
    setToastMessage(`${removedCount} tag${removedCount > 1 ? 's' : ''} removed from ${targetLabel}`);
    handleCloseTagPopover();
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
      clashesState: clashes.map((c) => ({ ...c, tags: [...(c.tags || [])] })),
      targetIds: [...targetRowIds],
    });

    setClashes((prev) =>
      prev.map((c) => {
        if (!targetRowIds.includes(c.id)) return c;
        const merged = Array.from(new Set([...(c.tags || []), ...pendingSelectedTags]));
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

  const clusterGroups = useMemo(() => {
    return getClusterGroups(filteredClashes, clusterBy);
  }, [filteredClashes, clusterBy]);

  const toggleClusterCollapse = (clusterId) => {
    setCollapsedClusters((prev) => ({
      ...prev,
      [clusterId]: !prev[clusterId],
    }));
  };

  const toggleGroupAll = (groupClashes) => {
    const groupIds = groupClashes.map((c) => c.id);
    const allInGroupChecked = groupIds.length > 0 && groupIds.every((id) => checkedIds.includes(id));
    if (allInGroupChecked) {
      setCheckedIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setCheckedIds((prev) => Array.from(new Set([...prev, ...groupIds])));
    }
  };

  const handleExportClashes = () => {
    const isCategorized = Boolean(clusterBy && clusterGroups && clusterGroups.length > 0);
    const testTitle = testData.name || 'Clash_Test';

    let csvContent = '';

    if (isCategorized) {
      // Categorized CSV reflecting active clusters
      const headers = [
        'Cluster Category',
        'Cluster Group',
        'Clash ID',
        'Status',
        'Element A',
        'Element B',
        'Model A',
        'Model B',
        'Category A',
        'Penetration',
        'Tags',
      ];

      const rows = [];
      clusterGroups.forEach((group) => {
        group.clashes.forEach((clash) => {
          rows.push([
            `"${clusterBy}"`,
            `"${group.name}"`,
            `"${clash.id}"`,
            `"${clash.status || 'Unsuppressed'}"`,
            `"${(clash.elementA || '').replace(/"/g, '""')}"`,
            `"${(clash.elementB || '').replace(/"/g, '""')}"`,
            `"${(clash.modelA || '').replace(/"/g, '""')}"`,
            `"${(clash.modelB || '').replace(/"/g, '""')}"`,
            `"${(clash.categoryA || '').replace(/"/g, '""')}"`,
            `"${clash.penetration || ''}"`,
            `"${(clash.tags || []).join('; ')}"`,
          ]);
        });
      });

      csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else {
      const targetClashes =
        checkedIds.length > 0
          ? clashes.filter((c) => checkedIds.includes(c.id))
          : filteredClashes;
      const headers = [
        'Clash ID',
        'Status',
        'Element A',
        'Element B',
        'Model A',
        'Model B',
        'Category A',
        'Penetration',
        'Tags',
      ];

      const rows = targetClashes.map((clash) => [
        `"${clash.id}"`,
        `"${clash.status || 'Unsuppressed'}"`,
        `"${(clash.elementA || '').replace(/"/g, '""')}"`,
        `"${(clash.elementB || '').replace(/"/g, '""')}"`,
        `"${(clash.modelA || '').replace(/"/g, '""')}"`,
        `"${(clash.modelB || '').replace(/"/g, '""')}"`,
        `"${(clash.categoryA || '').replace(/"/g, '""')}"`,
        `"${clash.penetration || ''}"`,
        `"${(clash.tags || []).join('; ')}"`,
      ]);

      csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fileName = isCategorized
      ? `${testTitle.replace(/\s+/g, '_')}_clustered_by_${clusterBy.toLowerCase().replace(/\s+/g, '_')}.csv`
      : `${testTitle.replace(/\s+/g, '_')}_clashes.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSingleCluster = (group) => {
    if (!group) return;
    const testTitle = testData.name || 'Clash_Test';
    const headers = [
      'Cluster Group',
      'Clash ID',
      'Status',
      'Element A',
      'Element B',
      'Model A',
      'Model B',
      'Category A',
      'Penetration',
      'Tags',
    ];

    const rows = group.clashes.map((clash) => [
      `"${group.name}"`,
      `"${clash.id}"`,
      `"${clash.status || 'Unsuppressed'}"`,
      `"${(clash.elementA || '').replace(/"/g, '""')}"`,
      `"${(clash.elementB || '').replace(/"/g, '""')}"`,
      `"${(clash.modelA || '').replace(/"/g, '""')}"`,
      `"${(clash.modelB || '').replace(/"/g, '""')}"`,
      `"${(clash.categoryA || '').replace(/"/g, '""')}"`,
      `"${clash.penetration || ''}"`,
      `"${(clash.tags || []).join('; ')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fileName = `${testTitle.replace(/\s+/g, '_')}_${group.name.toLowerCase().replace(/\s+/g, '_')}_cluster.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setClusterActionAnchorEl(null);
  };

  const handleSuppressCluster = (group) => {
    if (!group) return;
    const groupIds = group.clashes.map((c) => c.id);
    setClashes((prev) =>
      prev.map((c) => (groupIds.includes(c.id) ? { ...c, status: 'Suppressed' } : c))
    );
    setToastMessage(`Suppressed ${groupIds.length} clashes in ${group.name}`);
    setClusterActionAnchorEl(null);
  };

  const handleSelectClusterAll = (group) => {
    if (!group) return;
    toggleGroupAll(group.clashes);
    setClusterActionAnchorEl(null);
  };

  const handleTagCluster = (group, e) => {
    if (!group) return;
    const groupIds = group.clashes.map((c) => c.id);
    setCheckedIds(groupIds);
    setPendingSelectedTags([]);
    setTagAnchorEl(e.currentTarget);
    setClusterActionAnchorEl(null);
  };

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

    // 3D Model: Dispatched according to the test's iModel (Roberto Clemente Bridge, Liberty Bridge, or PPG Place)
    const bridge = getModelForIModel(testData.iModel || 'Roberto Clemente Bridge', THREE, { showWater: true });
    bridge.clashBeaconGroup.visible = false; // Superseded by dynamic dual-element highlight system
    scene.add(bridge.modelGroup);
    bridgeRef.current = bridge;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 500);
    camera.position.copy(bridge.defaultCameraPos);
    cameraRef.current = camera;

    const target = bridge.defaultTarget.clone();
    targetRef.current = target;
    camera.lookAt(target);

    // Target positions for smooth camera fly-to lerp
    targetCamPosRef.current.copy(bridge.defaultCameraPos);
    targetLookAtRef.current.copy(bridge.defaultTarget);
    isAnimatingCamRef.current = false;

    // Tracks temporary materials applied to the model during clash selection.
    const highlightGroup = new THREE.Group();
    scene.add(highlightGroup);
    highlightGroupRef.current = highlightGroup;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights - Warm golden hour sunlight highlighting Aztec Gold steel
    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambLight);

    const sunLight = new THREE.DirectionalLight(0xfff8e7, 1.5);
    sunLight.position.set(25, 35, 25);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x42a5f5, 0.55);
    fillLight.position.set(-25, 15, -25);
    scene.add(fillLight);

    // Subtle coordinate ground reference
    const grid = new THREE.GridHelper(60, 30, 0x087f6c, 0x223036);
    grid.position.y = -0.55;
    scene.add(grid);

    // Orbit Controls
    let isMouseDown = false;
    let isPanning = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isAnimatingCamRef.current = false;
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
      isAnimatingCamRef.current = false;
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
        isAnimatingCamRef.current = false;
        const dir = camera.position.clone().sub(target);
        dir.setLength(Math.max(5, dir.length() - 4));
        camera.position.copy(target).add(dir);
      },
      zoomOut: () => {
        isAnimatingCamRef.current = false;
        const dir = camera.position.clone().sub(target);
        dir.setLength(Math.min(60, dir.length() + 4));
        camera.position.copy(target).add(dir);
      },
      resetView: () => {
        if (highlightGroupRef.current?.userData.selectionCenter) {
          const spot = highlightGroupRef.current.userData.selectionCenter;
          targetLookAtRef.current.copy(spot);
          targetCamPosRef.current.copy(spot).add(new THREE.Vector3(6.5, 4.5, 7.0));
          isAnimatingCamRef.current = true;
        } else if (bridgeRef.current) {
          targetLookAtRef.current.copy(bridgeRef.current.defaultTarget);
          targetCamPosRef.current.copy(bridgeRef.current.defaultCameraPos);
          isAnimatingCamRef.current = true;
        }
      },
      captureView: () => {
        renderer.render(scene, camera);
        const url = renderer.domElement.toDataURL('image/png');
        const imageData = atob(url.split(',')[1]);
        const bytes = new Uint8Array(imageData.length);
        for (let index = 0; index < imageData.length; index += 1) {
          bytes[index] = imageData.charCodeAt(index);
        }
        return { url, blob: new Blob([bytes], { type: 'image/png' }) };
      },
    };

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth camera fly-to lerp when moving to clash spot
      if (isAnimatingCamRef.current) {
        camera.position.lerp(targetCamPosRef.current, 0.08);
        target.lerp(targetLookAtRef.current, 0.08);
        camera.lookAt(target);
        if (
          camera.position.distanceTo(targetCamPosRef.current) < 0.05 &&
          target.distanceTo(targetLookAtRef.current) < 0.05
        ) {
          isAnimatingCamRef.current = false;
        }
      }

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
      clearModelSelection(highlightGroup);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [testData.iModel]);

  // -------------------------------------------------------------
  // Focus the model's real clash location and highlight two model parts
  // -------------------------------------------------------------
  useEffect(() => {
    if (!highlightGroupRef.current || !bridgeRef.current || !cameraRef.current || !targetRef.current) {
      return;
    }

    if (selectedModelClashes.length > 0) {
      const { modelGroup, setAGroup, setBGroup } = bridgeRef.current;
      const selectedClashParts = selectedModelClashes
        .map((clash, index) => {
          const clashParts = getStableClashParts(setAGroup, setBGroup, clash.id);
          if (!clashParts) {
            console.error(`No intersecting model parts were found for clash ${clash.id}.`);
            return null;
          }
          return { clash, index, ...clashParts };
        })
        .filter(Boolean);

      clearModelSelection(highlightGroupRef.current);

      if (selectedClashParts.length === 0) {
        return;
      }

      highlightGroupRef.current.userData.dimmedMeshes = dimModelMeshes([modelGroup], tsNonClashPct / 100);
      const highlightedMeshes = [];
      const highlightedMeshSet = new Set();
      const selectionBounds = new THREE.Box3();

      selectedClashParts.forEach(({ structuralMesh, mepMesh, position: spot }) => {
        if (!highlightedMeshSet.has(structuralMesh)) {
          highlightedMeshes.push({ ...highlightModelMesh(structuralMesh, 0xff1744, tsElementAPct / 100), kind: 'A' });
          highlightedMeshSet.add(structuralMesh);
        }
        if (!highlightedMeshSet.has(mepMesh)) {
          highlightedMeshes.push({ ...highlightModelMesh(mepMesh, 0x2f6fed, tsElementBPct / 100), kind: 'B' });
          highlightedMeshSet.add(mepMesh);
        }
        selectionBounds.expandByPoint(spot);
      });

      highlightGroupRef.current.userData.highlightedMeshes = highlightedMeshes;

      const selectionCenter = selectionBounds.getCenter(new THREE.Vector3());
      const selectionRadius = Math.max(
        1,
        ...selectedClashParts.map(({ position: spot }) => spot.distanceTo(selectionCenter))
      );
      highlightGroupRef.current.userData.selectionCenter = selectionCenter.clone();

      // Smoothly fly camera to frame all selected collision spots.
      targetLookAtRef.current.copy(selectionCenter);
      targetCamPosRef.current
        .copy(selectionCenter)
        .add(new THREE.Vector3(6.5 + selectionRadius * 1.4, 4.5 + selectionRadius * 0.7, 7.0 + selectionRadius * 1.4));
      isAnimatingCamRef.current = true;
    } else {
      clearModelSelection(highlightGroupRef.current);
      // Return to landmark overview
      targetLookAtRef.current.copy(bridgeRef.current.defaultTarget);
      targetCamPosRef.current.copy(bridgeRef.current.defaultCameraPos);
      isAnimatingCamRef.current = true;
    }
    // Element A/B opacity and non-clashing dimming are intentionally excluded so
    // dragging the Model display sliders doesn't rebuild the selection/camera fly-to;
    // see the dedicated live-update effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModelClashes, testData.iModel]);

  // Live-update the highlighted Element A / Element B mesh opacity as the
  // Model display sliders in the Test settings popover are dragged, without
  // rebuilding the selection or refiring the camera fly-to animation.
  useEffect(() => {
    const highlightedMeshes = highlightGroupRef.current?.userData.highlightedMeshes || [];
    highlightedMeshes.forEach(({ material, kind }) => {
      if (kind === 'A') material.opacity = tsElementAPct / 100;
      if (kind === 'B') material.opacity = tsElementBPct / 100;
    });
  }, [tsElementAPct, tsElementBPct]);

  // Live-update the dimmed non-clashing element opacity as its slider moves.
  useEffect(() => {
    const dimmedMeshes = highlightGroupRef.current?.userData.dimmedMeshes || [];
    dimmedMeshes.forEach(({ material }) => {
      material.opacity = tsNonClashPct / 100;
    });
  }, [tsNonClashPct]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar matching app layout */}
      <Box className="topbar">
        <TextField
          select
          size="small"
          value={testData.iModel || 'Roberto Clemente Bridge'}
          onChange={(e) => handleSwitchIModel(e.target.value)}
          SelectProps={{ IconComponent: ExpandMoreIcon }}
          sx={{
            width: 220,
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#fff',
              fontSize: 13,
              fontWeight: 500,
              height: 32,
              '& fieldset': { borderColor: '#c2c9cd' },
              '&:hover fieldset': { borderColor: '#8a9296' },
            },
          }}
        >
          <MenuItem value="Roberto Clemente Bridge">Roberto Clemente Bridge</MenuItem>
          <MenuItem value="Liberty Bridge">Liberty Bridge</MenuItem>
          <MenuItem value="PPG Place">PPG Place</MenuItem>
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
              onClick={handleOpenTestSettings}
              sx={{
                border: '1px solid #c2c9cd',
                borderRadius: '6px',
                p: 0.75,
                color: '#536066',
                backgroundColor: testSettingsAnchorEl ? '#f5f7f8' : 'transparent',
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
                variant="outlined"
                size="small"
                disabled={!hasSelection}
                onClick={handleOpenCreateForm}
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
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: hasSelection ? '#f5f7f8' : '#fafbfc',
                    borderColor: hasSelection ? '#8a9296' : '#e0e4e6',
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
              <ButtonGroup
                variant="outlined"
                size="small"
                disabled={!hasSelection}
                sx={{
                  boxShadow: 'none',
                  '& .MuiButtonGroup-grouped': {
                    borderColor: hasSelection ? '#c2c9cd' : '#e0e4e6',
                  },
                }}
              >
                <Button
                  onClick={handleQuickSuppressClash}
                  sx={{
                    textTransform: 'none',
                    color: hasSelection ? '#344046' : '#a0aab0',
                    borderColor: hasSelection ? '#c2c9cd' : '#e0e4e6',
                    borderRadius: '4px 0 0 4px',
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
                <Button
                  onClick={handleOpenSuppressMenu}
                  sx={{
                    color: hasSelection ? '#344046' : '#a0aab0',
                    borderColor: hasSelection ? '#c2c9cd' : '#e0e4e6',
                    borderRadius: '0 4px 4px 0',
                    px: 0.5,
                    minWidth: '28px',
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
                  <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                </Button>
              </ButtonGroup>

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
                  onClick={handleQuickUnsuppressClash}
                  sx={{
                    fontSize: 13,
                    color: '#344046',
                    py: 1,
                    '&:hover': { backgroundColor: '#f5f7f8' },
                  }}
                >
                  Unsuppress this clash
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
                onClick={handleExportClashes}
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
                {selectedClashCount === 0
                  ? 'Export'
                  : `Export ${selectedClashCount} ${selectedClashCount === 1 ? 'clash' : 'clashes'}`}
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={!hasSelection}
                onClick={handleOpenTagPopover}
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
                onClick={(e) => setClusterMenuAnchorEl(e.currentTarget)}
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
                  backgroundColor: clusterBy ? '#f0f4f3' : '#fff',
                  '&:hover': { backgroundColor: '#f5f7f8', borderColor: '#8a9296' },
                }}
              >
                {clusterBy ? `Cluster by: ${clusterBy}` : 'Cluster by'}
              </Button>
              {clusterBy && (
                <Tooltip title="Clear clustering">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setClusterBy(null);
                      setCollapsedClusters({});
                    }}
                    aria-label="Clear clustering"
                    sx={{
                      ml: -0.65,
                      color: '#536066',
                      '&:hover': { color: '#1c1f21', backgroundColor: '#eef2f3' },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Cluster By Menu matching default.png */}
              <Menu
                anchorEl={clusterMenuAnchorEl}
                open={Boolean(clusterMenuAnchorEl)}
                onClose={() => setClusterMenuAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{
                  paper: {
                    sx: {
                      minWidth: 160,
                      borderRadius: '4px',
                      border: '1px solid #d4d8db',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      py: 0.5,
                    },
                  },
                }}
              >
                {CLUSTER_OPTIONS.map((opt) => {
                  const isSelected = clusterBy === opt;
                  return (
                    <MenuItem
                      key={opt}
                      onClick={() => {
                        setClusterBy(isSelected ? null : opt);
                        setClusterMenuAnchorEl(null);
                      }}
                      sx={{
                        fontSize: 13,
                        py: 0.75,
                        px: 2,
                        color: '#1c1f21',
                        backgroundColor: isSelected ? '#eaedf0' : 'transparent',
                        '&:hover': { backgroundColor: '#f0f3f5' },
                      }}
                    >
                      {opt}
                    </MenuItem>
                  );
                })}
              </Menu>

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

          {/* Clashes Table - Clustered or Default */}
          {clusterBy && clusterGroups ? (
            /* Clustered Clashes Table matching clusters.png */
            <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
              {clusterGroups.map((group, index) => {
                const isCollapsed = Boolean(collapsedClusters[group.id]);
                const groupIds = group.clashes.map((c) => c.id);
                const isGroupAllChecked =
                  groupIds.length > 0 && groupIds.every((id) => checkedIds.includes(id));
                const isGroupSomeChecked =
                  groupIds.some((id) => checkedIds.includes(id)) && !isGroupAllChecked;

                return (
                  <Box key={group.id} sx={{ mb: isCollapsed ? 0.5 : 2 }}>
                    {/* Cluster Header matching Screenshot */}
                    <Box
                      onClick={() => toggleClusterCollapse(group.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 1,
                        py: 1.25,
                        borderTop: index > 0 ? '1px solid #e0e4e6' : 'none',
                        cursor: 'pointer',
                        userSelect: 'none',
                        '&:hover': { backgroundColor: '#f8fafb' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleClusterCollapse(group.id);
                          }}
                          sx={{ p: 0.25, mr: 0.5, color: '#536066' }}
                        >
                          {isCollapsed ? (
                            <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                        <LocalOfferOutlinedIcon
                          sx={{
                            fontSize: 16,
                            color: '#536066',
                            mr: 1,
                            transform: 'scaleX(-1)',
                          }}
                        />
                        <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#1c1f21' }}>
                          {group.name}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: 12.5, color: '#536066', pr: 0.5 }}>
                          {group.clashes.length} {group.clashes.length === 1 ? 'clash' : 'clashes'}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setClusterActionAnchorEl(e.currentTarget);
                            setClusterActionGroup(group);
                          }}
                          sx={{ color: '#536066', p: 0.5 }}
                        >
                          <MoreVertIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Clustered Table Content matching clusters.png */}
                    <Collapse in={!isCollapsed}>
                      <Table
                        size="small"
                        sx={{
                          '& .MuiTableCell-root': {
                            fontSize: 12.5,
                            borderBottom: '1px solid #eaedf0',
                            py: 0.85,
                          },
                        }}
                      >
                        <TableHead>
                          <TableRow
                            sx={{
                              '& .MuiTableCell-root': {
                                fontWeight: 600,
                                color: '#1c1f21',
                                borderBottom: '1.5px solid #c2c9cd',
                              },
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                size="small"
                                checked={isGroupAllChecked}
                                indeterminate={isGroupSomeChecked}
                                onChange={() => toggleGroupAll(group.clashes)}
                                sx={{
                                  p: 0.5,
                                  color: '#9fb8ae',
                                  '&.Mui-checked': { color: '#087f6c' },
                                }}
                              />
                            </TableCell>
                            <TableCell>ID</TableCell>
                            <TableCell>Element A</TableCell>
                            <TableCell>Element B</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Model A</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {group.clashes.map((clash) => {
                            const isSelected = selectedClashId === clash.id;
                            const isChecked = checkedIds.includes(clash.id);
                            return (
                              <TableRow
                                key={clash.id}
                                hover
                                onClick={() => handleRowClick(clash.id)}
                                sx={{
                                  cursor: 'pointer',
                                  backgroundColor: isChecked
                                    ? '#d8e8e3'
                                    : isSelected
                                    ? '#f2f8f6'
                                    : 'transparent',
                                  '&:hover': {
                                    backgroundColor: isChecked
                                      ? '#cfe2dc'
                                      : isSelected
                                      ? '#e8f3ef'
                                      : '#f8fafb',
                                  },
                                }}
                              >
                                <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                  <Checkbox
                                    size="small"
                                    checked={isChecked}
                                    onChange={(e) => handleToggleCheck(clash.id, e)}
                                    sx={{
                                      p: 0.5,
                                      color: '#9fb8ae',
                                      '&.Mui-checked': { color: '#087f6c' },
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 500, color: '#1c1f21', fontSize: 12.5, whiteSpace: 'nowrap' }}>
                                  {clash.id}
                                </TableCell>
                                <TableCell sx={{ maxWidth: 140 }}>
                                  <Typography noWrap sx={{ fontSize: 12.5, color: '#1c1f21' }}>
                                    {clash.elementA}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ maxWidth: 140 }}>
                                  <Typography noWrap sx={{ fontSize: 12.5, color: '#1c1f21' }}>
                                    {clash.elementB}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ color: clash.status ? '#536066' : 'transparent', fontSize: 12.5 }}>
                                  {clash.status || ''}
                                </TableCell>
                                <TableCell sx={{ maxWidth: 130 }}>
                                  <Typography noWrap sx={{ fontSize: 12.5, color: '#536066' }}>
                                    {clash.modelA}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </Collapse>
                  </Box>
                );
              })}

              {/* Cluster Group Quick Actions Menu */}
              <Menu
                anchorEl={clusterActionAnchorEl}
                open={Boolean(clusterActionAnchorEl)}
                onClose={() => setClusterActionAnchorEl(null)}
                slotProps={{
                  paper: {
                    sx: {
                      minWidth: 200,
                      borderRadius: '4px',
                      border: '1px solid #d4d8db',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      py: 0.5,
                    },
                  },
                }}
              >
                <MenuItem
                  onClick={() => handleSelectClusterAll(clusterActionGroup)}
                  sx={{ fontSize: 13, py: 0.8, px: 1.5, color: '#1c1f21' }}
                >
                  <ListItemIcon sx={{ color: '#536066', minWidth: 28 }}>
                    <CheckBoxOutlinedIcon sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  {clusterActionGroup?.clashes.every((c) => checkedIds.includes(c.id))
                    ? 'Deselect all'
                    : 'Select all in cluster'}
                </MenuItem>

                <MenuItem
                  onClick={() => handleSuppressCluster(clusterActionGroup)}
                  sx={{ fontSize: 13, py: 0.8, px: 1.5, color: '#1c1f21' }}
                >
                  <ListItemIcon sx={{ color: '#536066', minWidth: 28 }}>
                    <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  Suppress cluster
                </MenuItem>

                <MenuItem
                  onClick={() => handleExportSingleCluster(clusterActionGroup)}
                  sx={{ fontSize: 13, py: 0.8, px: 1.5, color: '#1c1f21' }}
                >
                  <ListItemIcon sx={{ color: '#536066', minWidth: 28 }}>
                    <FileUploadOutlinedIcon sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  Export cluster as .csv
                </MenuItem>

                <MenuItem
                  onClick={(e) => handleTagCluster(clusterActionGroup, e)}
                  sx={{ fontSize: 13, py: 0.8, px: 1.5, color: '#1c1f21' }}
                >
                  <ListItemIcon sx={{ color: '#536066', minWidth: 28 }}>
                    <LocalOfferOutlinedIcon sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  Tag cluster
                </MenuItem>
              </Menu>
            </TableContainer>
          ) : (
            /* Clashes Table (Default / Unclustered) */
            <>
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
                          <TableCell sx={{ fontWeight: 500, color: '#1c1f21', whiteSpace: 'nowrap' }}>{clash.id}</TableCell>
                          <TableCell sx={{ color: clash.status ? '#536066' : 'transparent' }}>
                            {clash.status || ''}
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
            </>
          )}
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
            overflow: 'hidden',
          }}
        >
          {/* Top Interactive 3D Model Viewport (Replaces green block) */}
          <Box sx={{ position: 'relative', width: '100%', height: 280, backgroundColor: '#1a2428', borderBottom: '1px solid #e0e4e6', overflow: 'hidden' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />

            {/* Floating 3D overlay controls */}
            <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 0.5, pointerEvents: 'none', maxWidth: '85%' }}>
              <Chip
                label={
                  hasModelSelection
                    ? selectedModelClashes.length === 1
                      ? `${testData.iModel || '3D Model'}: ${selectedModelClashes[0].id}`
                      : `${testData.iModel || '3D Model'}: ${selectedModelClashes.length} clashes`
                    : `${testData.iModel || '3D Model'} (Pittsburgh, PA)`
                }
                size="small"
                sx={{
                  backgroundColor: 'rgba(20, 26, 30, 0.85)',
                  color: '#fff',
                  border: '1px solid #2d3b42',
                  fontSize: 10.5,
                  fontWeight: 600,
                  height: 22,
                  width: 'fit-content',
                }}
              />
              {hasModelSelection && (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {selectedModelClashes.length === 1 && currentClash ? (
                    <>
                      <Chip
                        size="small"
                        label={`Element A: ${(currentClash.elementA || 'Structural').split('[')[0].trim()}`}
                        sx={{
                          backgroundColor: 'rgba(255, 23, 68, 0.92)',
                          color: '#fff',
                          fontSize: 9.5,
                          fontWeight: 600,
                          height: 18,
                          border: '1px solid #ff5252',
                        }}
                      />
                      <Chip
                        size="small"
                        label={`Element B: ${(currentClash.elementB || 'MEP Utility').split('[')[0].trim()}`}
                        sx={{
                          backgroundColor: 'rgba(47, 111, 237, 0.92)',
                          color: '#fff',
                          fontSize: 9.5,
                          fontWeight: 700,
                          height: 18,
                          border: '1px solid #8ab4ff',
                        }}
                      />
                    </>
                  ) : (
                    <Chip
                      size="small"
                      label={`Showing ${selectedModelClashes.map((clash) => clash.id).join(', ')}`}
                      sx={{
                        backgroundColor: 'rgba(255, 214, 0, 0.92)',
                        color: '#1c1f21',
                        fontSize: 9.5,
                        fontWeight: 700,
                        height: 18,
                        border: '1px solid #fff176',
                      }}
                    />
                  )}
                </Box>
              )}
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
              <Tooltip title={hasClashSelected ? 'Capture view and add to clash images' : 'Select a clash to capture this view'}>
                <span>
                  <IconButton size="small" disabled={!hasClashSelected} onClick={captureModelView} sx={{ color: '#fff', p: 0.5, '&.Mui-disabled': { color: '#657075' } }}>
                    <CameraAltOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </span>
              </Tooltip>
            </Paper>
          </Box>

          {/* Details Accordion Panel */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {hasModelSelection && currentClash ? (
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
                        <Typography sx={{ fontSize: 13, color: '#1c1f21', mt: 0.25 }}>{detailValues.idNum}</Typography>
                      </Box>

                      {/* Link */}
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Link</Typography>
                        {detailValues.link === 'Mixed' ? (
                          <Typography sx={{ fontSize: 13, color: '#1c1f21', mt: 0.25 }}>Mixed</Typography>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                            <Link
                              href="#"
                              underline="always"
                              noWrap
                              sx={{ fontSize: 13, color: '#087f6c', maxWidth: 300 }}
                            >
                              {detailValues.link}
                            </Link>
                            <LaunchIcon sx={{ fontSize: 14, color: '#087f6c' }} />
                          </Box>
                        )}
                      </Box>

                      {/* Elements */}
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Elements</Typography>
                        <Typography sx={{ fontSize: 12.5, color: '#1c1f21', mt: 0.25 }}>
                          {detailValues.elementA}
                        </Typography>
                        <Typography sx={{ fontSize: 12.5, color: '#1c1f21', mt: 0.25 }}>
                          {detailValues.elementB}
                        </Typography>
                      </Box>

                      {/* Status */}
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Status</Typography>
                        <Typography sx={{ fontSize: 13, color: '#1c1f21', mt: 0.25 }}>
                          {detailValues.status}
                        </Typography>
                      </Box>

                      {/* Penetration */}
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500 }}>Penetration</Typography>
                        <Typography sx={{ fontSize: 13, color: '#1c1f21', mt: 0.25 }}>
                          {detailValues.penetration}
                        </Typography>
                      </Box>

                      {/* Tags */}
                      <Box>
                        <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500, mb: 0.5 }}>Tags</Typography>
                        {detailValues.tags.mixed ? (
                          <Typography sx={{ fontSize: 13, color: '#1c1f21', mt: 0.25 }}>
                            Mixed
                          </Typography>
                        ) : detailValues.tags.tags.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.25 }}>
                            {detailValues.tags.tags.map((tag) => (
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
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#1c1f21' }}>
                      Forms ({currentClash.hasForm || currentClash.formStatus ? 1 : 0})
                    </Typography>
                    {clashFormsOpen ? <KeyboardArrowUpIcon sx={{ fontSize: 18, color: '#536066' }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#536066' }} />}
                  </Box>
                  <Collapse in={clashFormsOpen}>
                    <Box sx={{ px: 2.5, pb: 2, pt: 0.5 }}>
                      {currentClash.hasForm || currentClash.formStatus ? (
                        <Box sx={{ p: 1.5, backgroundColor: '#f8fafb', borderRadius: '4px', border: '1px solid #e0e4e6' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>
                              {currentClash.subject || currentClash.formId || `FORM-${currentClash.id}`}
                            </Typography>
                            <Chip
                              label={currentClash.formStatus || 'Open'}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: 11,
                                fontWeight: 600,
                                backgroundColor: '#e6f4ea',
                                color: '#137333',
                              }}
                            />
                          </Box>
                          {currentClash.assignedTo && (
                            <Typography sx={{ fontSize: 12, color: '#536066', mb: 0.5 }}>
                              <span style={{ fontWeight: 500, color: '#1c1f21' }}>Assigned to:</span> {currentClash.assignedTo}
                            </Typography>
                          )}
                          {currentClash.dueDate && (
                            <Typography sx={{ fontSize: 12, color: '#536066', mb: 0.5 }}>
                              <span style={{ fontWeight: 500, color: '#1c1f21' }}>Due date:</span> {currentClash.dueDate}
                            </Typography>
                          )}
                          {currentClash.comment && (
                            <Typography sx={{ fontSize: 12, color: '#657075', mt: 0.5, fontStyle: 'italic' }}>
                              "{currentClash.comment}"
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ minHeight: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, textAlign: 'center' }}>
                          <FlagOutlinedIcon sx={{ fontSize: 38, color: '#657075' }} />
                          <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#344046' }}>Create a form</Typography>
                          <Typography sx={{ fontSize: 12, color: '#657075' }}>.JPG, .PDF, or .PNG files accepted</Typography>
                          <Button variant="outlined" size="small" onClick={handleOpenCreateForm} sx={{ textTransform: 'none', borderColor: '#aeb8bd', color: '#344046' }}>Create a form</Button>
                        </Box>
                      )}
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
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#1c1f21' }}>
                      Images ({(clashImages[currentClash.id] || []).length})
                    </Typography>
                    {clashImagesOpen ? <KeyboardArrowUpIcon sx={{ fontSize: 18, color: '#536066' }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#536066' }} />}
                  </Box>
                  <Collapse in={clashImagesOpen}>
                    <Box sx={{ px: 2.5, pb: 2, pt: 0.5 }}>
                      {(clashImages[currentClash.id] || []).length > 0 ? (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
                          <Box
                            component="button"
                            type="button"
                            onClick={() => setImageUploadOpen(true)}
                            sx={{
                              minHeight: 106,
                              border: '1px dashed #8a989e',
                              bgcolor: '#f8fafb',
                              color: '#536066',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '&:hover': { bgcolor: '#eef6f4', borderColor: '#087f6c', color: '#087f6c' },
                            }}
                            aria-label="Add images"
                          >
                            <AddPhotoAlternateOutlinedIcon />
                          </Box>
                          {(clashImages[currentClash.id] || []).map((image) => (
                            <Box key={image.id} sx={{ position: 'relative', minHeight: 106, bgcolor: '#e0e4e6', overflow: 'hidden' }}>
                              {image.previewUrl ? (
                                <Box
                                  component="button"
                                  type="button"
                                  onClick={() => setMarkupImage(image)}
                                  sx={{ border: 0, p: 0, display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
                                  aria-label={`Open ${image.file.name} for markup`}
                                >
                                  <Box component="img" src={image.previewUrl} alt={image.file.name} sx={{ width: '100%', height: '100%', minHeight: 106, display: 'block', objectFit: 'cover' }} />
                                  {image.markupUrl && <Box component="img" src={image.markupUrl} alt="" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', minHeight: 106, objectFit: 'cover', pointerEvents: 'none' }} />}
                                </Box>
                              ) : (
                                <Box sx={{ height: 106, px: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: '#536066' }}>
                                  <InsertDriveFileOutlinedIcon />
                                  <Typography sx={{ fontSize: 11, textAlign: 'center', overflowWrap: 'anywhere' }}>{image.file.name}</Typography>
                                </Box>
                              )}
                              <IconButton onClick={(event) => { event.stopPropagation(); removeClashImage(image.id); }} aria-label={`Remove ${image.file.name}`} size="small" sx={{ position: 'absolute', top: 3, right: 3, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}>
                                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Box sx={{ minHeight: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, textAlign: 'center' }}>
                          <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 38, color: '#657075' }} />
                          <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#344046' }}>Add images</Typography>
                          <Typography sx={{ fontSize: 12, color: '#657075' }}>.JPG, .PNG, or .PDF files accepted</Typography>
                          <Button variant="outlined" size="small" onClick={() => setImageUploadOpen(true)} sx={{ textTransform: 'none', borderColor: '#aeb8bd', color: '#344046' }}>Upload images</Button>
                        </Box>
                      )}
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
              width: 320,
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
          {tsTagList
            .map((t) => t.name)
            .filter((t) => t.toLowerCase().includes(tagFilterQuery.toLowerCase()))
            .map((tagName) => {
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Button
            size="small"
            disabled={selectedTagCount === 0}
            onClick={handleRemoveAllTags}
            sx={{
              textTransform: 'none',
              fontSize: 12.5,
              fontWeight: 500,
              color: '#1c1f21',
              p: 0,
              minWidth: 'auto',
              whiteSpace: 'nowrap',
              '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
              '&.Mui-disabled': { color: '#a0aab0' },
            }}
          >
            Remove all tags
          </Button>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
                px: 1.25,
                py: 0.3,
                height: 28,
                whiteSpace: 'nowrap',
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
                px: 1.5,
                py: 0.3,
                height: 28,
                boxShadow: 'none',
                whiteSpace: 'nowrap',
                minWidth: 'max-content',
                lineHeight: 1.2,
                '&:hover': { backgroundColor: '#066657', boxShadow: 'none' },
                '&.Mui-disabled': { backgroundColor: '#e0e4e6', color: '#909ba0' },
              }}
            >
              {pendingSelectedTags.length > 0 ? `Add ${pendingSelectedTags.length} selected` : 'Add selected'}
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* Test Settings Popover (gear icon) matching Test settings frames */}
      <Popover
        open={Boolean(testSettingsAnchorEl)}
        onClose={handleCloseTestSettings}
        anchorReference="anchorPosition"
        anchorPosition={{ top: window.innerHeight / 2, left: window.innerWidth / 2 }}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 638,
              maxWidth: '90vw',
              borderRadius: '10px',
              border: '1px solid #e0e4e6',
              boxShadow: '0 12px 32px rgba(0,0,0,0.16)',
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: 22, fontWeight: 600, color: '#1c1f21', px: 3, pt: 2.5, pb: 2 }}>
            Test settings
          </Typography>

          <Box sx={{ display: 'flex', minHeight: 320 }}>
            {/* Left Nav */}
            <Box sx={{ width: 148, pl: 1.5, pr: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {TEST_SETTINGS_NAV_ITEMS.map((item) => {
                const isActive = testSettingsTab === item.key;
                return (
                  <Box
                    key={item.key}
                    onClick={() => setTestSettingsTab(item.key)}
                    sx={{
                      px: 1.25,
                      py: 0.75,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: isActive ? '1px solid #087f6c' : '1px solid transparent',
                      fontSize: 13.5,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#087f6c' : '#1c1f21',
                      '&:hover': { backgroundColor: '#f5f7f8' },
                    }}
                  >
                    {item.label}
                  </Box>
                );
              })}
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: '#e0e4e6' }} />

            {/* Right Content */}
            <Box sx={{ flex: 1, px: 3, py: 1, display: 'flex', flexDirection: 'column' }}>
              {testSettingsTab === 'schedule' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#1c1f21' }}>
                        Automatically run
                      </Typography>
                      <Typography sx={{ fontSize: 12.5, color: '#657075', mt: 0.25 }}>
                        Set a schedule and the test will run automatically.
                      </Typography>
                    </Box>
                    <Switch
                      checked={tsAutoRun}
                      onChange={(e) => setTsAutoRun(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#087f6c' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#087f6c' },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500, mb: 0.5 }}>
                      Frequency
                    </Typography>
                    <TextField
                      select
                      size="small"
                      value={tsFrequency}
                      onChange={(e) => setTsFrequency(e.target.value)}
                      disabled={!tsAutoRun}
                      SelectProps={{ IconComponent: ExpandMoreIcon }}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          height: 36,
                          fontSize: 13,
                          '& fieldset': { borderColor: '#c2c9cd' },
                        },
                      }}
                    >
                      <MenuItem value="Daily">Daily</MenuItem>
                      <MenuItem value="Weekly">Weekly</MenuItem>
                      <MenuItem value="Monthly">Monthly</MenuItem>
                    </TextField>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500, mb: 0.5 }}>
                      Start date
                    </Typography>
                    <TextField
                      size="small"
                      placeholder="MM/DD/YYYY"
                      value={tsStartDate}
                      onChange={(e) => setTsStartDate(e.target.value)}
                      disabled={!tsAutoRun}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: '#8a9296' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          height: 36,
                          fontSize: 13,
                          '& fieldset': { borderColor: '#c2c9cd' },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500, mb: 0.5 }}>
                      Start time
                    </Typography>
                    <TextField
                      size="small"
                      placeholder="09:00 AM"
                      value={tsStartTime}
                      onChange={(e) => setTsStartTime(e.target.value)}
                      disabled={!tsAutoRun}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: '#8a9296' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          height: 36,
                          fontSize: 13,
                          '& fieldset': { borderColor: '#c2c9cd' },
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500, mb: 0.5 }}>
                      End date
                    </Typography>
                    <TextField
                      size="small"
                      placeholder="MM/DD/YYYY"
                      value={tsEndDate}
                      onChange={(e) => setTsEndDate(e.target.value)}
                      disabled={!tsAutoRun}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: '#8a9296' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          height: 36,
                          fontSize: 13,
                          '& fieldset': { borderColor: '#c2c9cd' },
                        },
                      }}
                    />
                  </Box>
                </Box>
              )}

              {testSettingsTab === 'tags' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#1c1f21' }}>Tags</Typography>
                  <Typography sx={{ fontSize: 12.5, color: '#657075', mt: 0.25 }}>
                    Use tags to sort and find clashes. These tags are available for all iModels in this project.
                  </Typography>

                  <TextField
                    placeholder="Find or add tags"
                    size="small"
                    fullWidth
                    value={tsTagSearch}
                    onChange={(e) => setTsTagSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateTagFromSearch();
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: 18, color: '#8a9296' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mt: 1.5,
                      '& .MuiOutlinedInput-root': {
                        height: 34,
                        fontSize: 13,
                        borderRadius: '4px',
                        '& fieldset': { borderColor: '#c2c9cd' },
                      },
                    }}
                  />
                  {tsTagCanCreate && (
                    <Typography sx={{ fontSize: 12, color: '#657075', mt: 0.5, mb: 0.5 }}>
                      Hit 'enter' to create this tag
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5, py: 0.75, mt: tsTagCanCreate ? 0 : 1 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#657075' }}>Tag</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#657075' }}># of uses</Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#e0e4e6' }} />

                  {filteredTsTagList.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', px: 2, py: 4 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1c1f21' }}>No tags found</Typography>
                      <Typography sx={{ fontSize: 12.5, color: '#657075', mt: 0.5 }}>
                        {tsTagSearch.trim().length === 0
                          ? "Type a tag name in the field above then hit 'Enter' to create."
                          : "Check spelling or hit 'Enter' to create a new tag."}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: 220, overflowY: 'auto' }}>
                      {filteredTsTagList.map((tag) => (
                        <Box
                          key={tag.name}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 0.5,
                            py: 1,
                            borderBottom: '1px solid #f0f2f3',
                            '&:hover .tag-row-kebab': { visibility: 'visible !important' },
                          }}
                        >
                          <Typography sx={{ fontSize: 13, color: '#1c1f21' }}>{tag.name}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography sx={{ fontSize: 13, color: '#1c1f21', minWidth: 24, textAlign: 'right' }}>
                              {String(tsTagUsageCounts[tag.name] || 0).padStart(2, '0')}
                            </Typography>
                            <IconButton
                              size="small"
                              className="tag-row-kebab"
                              onClick={(e) => handleOpenTagRowMenu(e, tag.name)}
                              style={tsTagMenuTarget === tag.name ? { visibility: 'visible' } : undefined}
                              sx={{
                                p: 0.25,
                                color: '#657075',
                                visibility: 'hidden',
                              }}
                            >
                              <MoreVertIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}

                  <Menu
                    anchorEl={tsTagMenuAnchorEl}
                    open={Boolean(tsTagMenuAnchorEl)}
                    onClose={handleCloseTagRowMenu}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <MenuItem
                      onClick={handleDeleteTagFromMenu}
                      sx={{ fontSize: 13, color: '#d32f2f', gap: 1 }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                      Delete tag
                    </MenuItem>
                  </Menu>
                </Box>
              )}

              {testSettingsTab === 'modelDisplay' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#1c1f21' }}>
                        Model display
                      </Typography>
                      <Typography sx={{ fontSize: 12.5, color: '#657075', mt: 0.25 }}>
                        Control display settings for model elements.
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      sx={{
                        border: '1px solid #c2c9cd',
                        borderRadius: '6px',
                        p: 0.5,
                        color: '#536066',
                        '&:hover': { backgroundColor: '#f5f7f8' },
                      }}
                    >
                      <AddIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>

                  {[
                    { label: 'Element A', color: '#e0364f', value: tsElementAPct, setValue: setTsElementAPct },
                    { label: 'Element B', color: '#2f6fed', value: tsElementBPct, setValue: setTsElementBPct },
                    {
                      label: 'Non-clashing elements',
                      color: '#8a9296',
                      value: tsNonClashPct,
                      setValue: setTsNonClashPct,
                    },
                  ].map((row) => (
                    <Box key={row.label} sx={{ mt: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: row.color,
                          }}
                        />
                        <Typography sx={{ fontSize: 13, color: '#1c1f21' }}>{row.label}</Typography>
                      </Box>
                      <Slider
                        size="small"
                        value={row.value}
                        onChange={(e, val) => row.setValue(val)}
                        sx={{
                          color: row.color,
                          height: 4,
                          '& .MuiSlider-thumb': {
                            width: 16,
                            height: 16,
                            backgroundColor: '#fff',
                            border: `2px solid ${row.color}`,
                          },
                        }}
                      />
                      <Typography sx={{ fontSize: 12, color: '#657075', textAlign: 'right', mt: -0.5 }}>
                        {row.value}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {testSettingsTab === 'forms' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#1c1f21' }}>Forms settings</Typography>
                    <Typography sx={{ fontSize: 12.5, color: '#657075', mt: 0.25 }}>
                      Manage form automation and formatting.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 13, color: '#1c1f21' }}>Turn on auto-close</Typography>
                    <Switch
                      checked={tsAutoClose}
                      onChange={(e) => setTsAutoClose(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#087f6c' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#087f6c' },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500, mb: 0.5 }}>
                      Default closed status
                    </Typography>
                    <TextField
                      select
                      size="small"
                      value={tsDefaultClosedStatus}
                      onChange={(e) => setTsDefaultClosedStatus(e.target.value)}
                      disabled={!tsAutoClose}
                      SelectProps={{ IconComponent: ExpandMoreIcon }}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          height: 36,
                          fontSize: 13,
                          '& fieldset': { borderColor: '#c2c9cd' },
                        },
                      }}
                    >
                      <MenuItem value="Closed">Closed</MenuItem>
                      <MenuItem value="Resolved">Resolved</MenuItem>
                      <MenuItem value="Approved">Approved</MenuItem>
                    </TextField>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#657075', fontWeight: 500, mb: 0.5 }}>
                      Default open status
                    </Typography>
                    <TextField
                      select
                      size="small"
                      value={tsDefaultOpenStatus}
                      onChange={(e) => setTsDefaultOpenStatus(e.target.value)}
                      SelectProps={{ IconComponent: ExpandMoreIcon }}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          height: 36,
                          fontSize: 13,
                          '& fieldset': { borderColor: '#c2c9cd' },
                        },
                      }}
                    >
                      <MenuItem value="Open">Open</MenuItem>
                      <MenuItem value="In review">In review</MenuItem>
                      <MenuItem value="New">New</MenuItem>
                    </TextField>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#e0e4e6' }} />

          {/* Footer actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, px: 3, py: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCloseTestSettings}
              sx={{
                textTransform: 'none',
                borderColor: '#c2c9cd',
                color: '#1c1f21',
                borderRadius: '4px',
                fontSize: 13,
                fontWeight: 500,
                px: 2,
                '&:hover': { borderColor: '#8a9296', backgroundColor: '#f5f7f8' },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setToastMessage('Test settings saved');
                handleCloseTestSettings();
              }}
              sx={{
                textTransform: 'none',
                backgroundColor: '#087f6c',
                color: '#fff',
                borderRadius: '4px',
                fontSize: 13,
                fontWeight: 500,
                px: 2,
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#066657', boxShadow: 'none' },
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* Dark Pill Toast Notification matching default-1.png & Frame 5 */}
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
            backgroundColor: '#202326',
            color: '#fff',
            fontSize: 13,
            fontWeight: 400,
            borderRadius: '4px',
            minWidth: 220,
            px: 2,
            py: 0.6,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            '& .MuiSnackbarContent-message': {
              p: 0,
              width: '100%',
            },
          },
        }}
        message={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, width: '100%' }}>
            <Typography sx={{ fontSize: 13, color: '#f5f7f8' }}>{toastMessage}</Typography>
            {undoBackup ? (
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
            ) : (
              <IconButton
                size="small"
                onClick={() => setToastMessage('')}
                sx={{ color: '#8a9296', p: 0.2, ml: 1, '&:hover': { color: '#fff' } }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        }
      />

      {/* Create Clash Form Dialog matching Screenshot 1 */}
      <CreateClashFormDialog
        open={createFormDialogOpen}
        onClose={handleCloseCreateForm}
        onSubmit={handleCreateClashForm}
        targetClashes={
          checkedIds.length > 0
            ? clashes.filter((c) => checkedIds.includes(c.id))
            : selectedClashId
            ? clashes.filter((c) => c.id === selectedClashId)
            : []
        }
      />

      <Dialog open={imageUploadOpen} onClose={closeImageUpload} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontSize: 20, fontWeight: 500 }}>
          Add images to {currentClash?.id || 'clash'}
        </DialogTitle>
        <DialogContent>
          <input
            ref={imageInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            multiple
            hidden
            onChange={handleImageInput}
          />
          <Box
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              addPendingImages(event.dataTransfer.files);
            }}
            onClick={() => imageInputRef.current?.click()}
            sx={{
              minHeight: 142,
              border: '1px dashed #9aa7ad',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              color: '#536066',
              '&:hover': { bgcolor: '#f5faf9', borderColor: '#087f6c' },
            }}
          >
            <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 34 }} />
            <Typography sx={{ fontSize: 14 }}>
              <Box component="span" sx={{ color: '#087f6c', textDecoration: 'underline' }}>Upload from file</Box> or drag and drop
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#657075' }}>.JPG, .PNG, or .PDF (Max. 3 MB)</Typography>
          </Box>
          {pendingImages.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {pendingImages.map((image) => (
                <Box key={image.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  {image.previewUrl ? <Box component="img" src={image.previewUrl} alt="" sx={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 0.5 }} /> : <InsertDriveFileOutlinedIcon sx={{ color: image.error ? '#d32f2f' : '#657075' }} />}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{image.file.name}</Typography>
                    <Typography sx={{ fontSize: 12, color: image.error ? '#d32f2f' : '#657075' }}>
                      {image.error || `${Math.ceil(image.file.size / 1024)} KB • Ready to upload`}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => removePendingImage(image.id)} aria-label={`Remove ${image.file.name}`}><DeleteOutlineIcon fontSize="small" /></IconButton>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeImageUpload} sx={{ textTransform: 'none', color: '#344046' }}>Cancel</Button>
          <Button variant="contained" disabled={!pendingImages.some((image) => !image.error)} onClick={handleAddImages} sx={{ textTransform: 'none', bgcolor: '#087f6c', '&:hover': { bgcolor: '#066657' } }}>Add images</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(markupImage)} onClose={() => setMarkupImage(null)} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 500 }}>Mark up image</Typography>
            <Typography sx={{ fontSize: 12, color: '#657075', mt: 0.25 }}>{markupImage?.file.name}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
            {['#d32f2f', '#1976d2', '#f9a825'].map((color) => (
              <IconButton key={color} onClick={() => setMarkupColor(color)} aria-label={`Use ${color} markup`} sx={{ p: 0.35, border: markupColor === color ? '2px solid #1c1f21' : '2px solid transparent' }}>
                <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: color }} />
              </IconButton>
            ))}
            <Button
              startIcon={<TextFieldsIcon />}
              onClick={() => setMarkupTool((tool) => (tool === 'text' ? 'draw' : 'text'))}
              sx={{ textTransform: 'none', color: markupTool === 'text' ? '#087f6c' : '#344046', fontWeight: markupTool === 'text' ? 700 : 500 }}
            >
              Text
            </Button>
            <Button startIcon={<UndoIcon />} onClick={undoMarkup} sx={{ textTransform: 'none', color: '#344046' }}>Undo</Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#344046', display: 'flex', justifyContent: 'center', py: 2 }}>
          {markupImage?.previewUrl ? (
            <Box sx={{ position: 'relative', display: 'inline-flex', maxWidth: '100%', maxHeight: '62vh' }}>
              <Box component="img" src={markupImage.previewUrl} alt={markupImage.file.name} sx={{ display: 'block', maxWidth: '100%', maxHeight: '62vh', objectFit: 'contain' }} />
              <Box
                component="canvas"
                ref={markupCanvasRef}
                onPointerDown={startMarkup}
                onPointerMove={drawMarkup}
                onPointerUp={stopMarkup}
                onPointerLeave={stopMarkup}
                sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: markupTool === 'text' ? 'text' : 'crosshair', touchAction: 'none' }}
              />
              {(markupImage.annotations || []).map((annotation) => (
                <Box
                  key={annotation.id}
                  sx={{
                    position: 'absolute',
                    left: `${annotation.x}%`,
                    top: `${annotation.y}%`,
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255,255,255,0.94)',
                    border: `2px solid ${annotation.color}`,
                    borderRadius: 0.5,
                    color: '#1c1f21',
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.2,
                    maxWidth: 180,
                    px: 0.75,
                    py: 0.45,
                    cursor: 'grab',
                    userSelect: 'none',
                  }}
                  onPointerDown={(event) => startAnnotationDrag(event, annotation)}
                  onPointerMove={moveAnnotation}
                  onPointerUp={stopAnnotationDrag}
                  onPointerCancel={stopAnnotationDrag}
                >
                  {annotation.text}
                </Box>
              ))}
              {annotationDraft && (
                <TextField
                  autoFocus
                  size="small"
                  value={annotationDraft.text}
                  placeholder="Type annotation"
                  onChange={(event) => setAnnotationDraft((draft) => ({ ...draft, text: event.target.value }))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') saveTextAnnotation();
                    if (event.key === 'Escape') setAnnotationDraft(null);
                  }}
                  sx={{
                    position: 'absolute',
                    left: `${annotationDraft.x}%`,
                    top: `${annotationDraft.y}%`,
                    transform: 'translateY(-50%)',
                    width: 190,
                    bgcolor: '#fff',
                    '& .MuiOutlinedInput-root': { fontSize: 13, '& fieldset': { borderColor: annotationDraft.color } },
                  }}
                />
              )}
            </Box>
          ) : (
            <Typography sx={{ color: '#fff' }}>Markup is available for image files only.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setMarkupImage(null)} sx={{ textTransform: 'none', color: '#344046' }}>Cancel</Button>
          <Button variant="contained" onClick={saveMarkup} disabled={!markupImage?.previewUrl} sx={{ textTransform: 'none', bgcolor: '#087f6c', '&:hover': { bgcolor: '#066657' } }}>Save markups</Button>
        </DialogActions>
      </Dialog>

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

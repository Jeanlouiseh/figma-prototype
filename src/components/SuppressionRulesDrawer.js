import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Paper,
  SvgIcon,
  Menu,
  ListItemIcon,
  Tooltip,
  Checkbox,
  Dialog,
  LinearProgress,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

// Gavel / hammer icon from the screenshot empty state
const GavelIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 48 48" sx={{ fontSize: 44, color: '#4a555b', ...props.sx }}>
    <path
      d="M17.5 6.5l8 8-3.5 3.5-8-8 3.5-3.5zm10 10l5 5-2 2-5-5 2-2zm-12.5-2.5l2-2 5 5-2 2-5-5zM22 22l18 18-3 3-18-18 3-3z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="2" y="40" width="16" height="4" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
  </SvgIcon>
);

// Import icon matching Screenshot 2
const ImportActionIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M9.5 5.5H6.5A2 2 0 0 0 4.5 7.5v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 6c-3.5 0-6.5 2-6.5 7.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M9 11l3 3 3-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);

const SUPPRESS_BASED_OPTIONS = [
  'Model',
  'Category',
  'Property',
  'Class',
  'Group',
  'Relationship',
  'ECSQL expression',
];

const TARGET_OPTIONS = ['one element', 'both elements'];

const MODEL_NAME_OPTIONS = [
  'Ref-11, I-95_CL_Corridor_Pavt.dgn, Default-3D',
  'Ref-11, I-95_Geometry',
  'Ref, DrainageRegion01',
  'Pipes',
  'Walls',
  'Bolts',
  'Windows',
  'Doors',
  'Columns',
];

const PROPERTY_NAME_OPTIONS = [
  'BBoxhigh',
  'BBoxlow',
  '@Design',
  '@Window',
  '@Length',
  '@Diameter',
  '@Material',
  'Height',
  'Width',
];

const CLASS_NAME_OPTIONS = [
  'Structural',
  'Architectural',
  'Mechanical',
  'Electrical',
  'Plumbing',
];

// Mock rules available for import from different clash tests
const MOCK_TEST_RULES = {
  'Test 1': [
    {
      id: 't1_r1',
      name: 'Rule name',
      description: 'Description',
      suppressBasedOn: 'Category',
      targetScope: 'one element',
      property1: 'BBoxhigh',
      propertyVal1: '34',
      property2: 'BBoxlow',
      propertyVal2: '42',
      isDualCondition: true,
    },
    {
      id: 't1_r2',
      name: 'Rule name',
      description: 'Description',
      suppressBasedOn: 'Model',
      targetScope: 'both elements',
    },
    {
      id: 't1_r3',
      name: 'Rule name',
      description: 'Description',
      suppressBasedOn: 'Group',
      selectedGroup: 'Plumbing',
    },
  ],
  'AR vs PH': [
    {
      id: 'ar_r1',
      name: 'Group',
      description: 'Suppress clash results between plumbing elements in both sets.',
      suppressBasedOn: 'Group',
      selectedGroup: 'Plumbing',
    },
    {
      id: 'ar_r2',
      name: 'Rule name',
      description: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
      suppressBasedOn: 'Property',
      targetScope: 'one element',
      property1: 'BBoxhigh',
      propertyVal1: '34',
      property2: 'BBoxlow',
      propertyVal2: '42',
      isDualCondition: true,
    },
  ],
  'AR vs EL': [
    {
      id: 'el_r1',
      name: 'Cable tray clearance',
      description: 'Suppress low-voltage tray collisions with light framing fixtures.',
      suppressBasedOn: 'Model',
      targetScope: 'one element',
      attribute1: 'Pipes',
      attribute2: 'Walls',
      isDualCondition: true,
    },
    {
      id: 'el_r2',
      name: 'Lighting fixtures in ceiling',
      description: 'Suppress fixtures within ceiling grid bounding envelope.',
      suppressBasedOn: 'Category',
      targetScope: 'both elements',
    },
  ],
  'Roberto Clemente Bridge': [
    {
      id: 'rc_r1',
      name: 'Eyebar Suspension Pin Fasteners',
      description: 'Suppress clearance overlap between suspender pinheads and truss top chord gussets.',
      suppressBasedOn: 'Model',
      targetScope: 'one element',
      attribute1: 'Eyebar_Chains',
    },
    {
      id: 'rc_r2',
      name: 'Deck Finger Expansion Joints',
      description: 'Suppress thermal expansion gap intersections between road deck fingers and floor stringers.',
      suppressBasedOn: 'Category',
      targetScope: 'both elements',
      attribute1: 'Deck_Expansion_Fingers',
      attribute2: 'Steel_Floor_Stringers',
      isDualCondition: true,
    },
    {
      id: 'rc_r3',
      name: 'Promenade Picket Luminaire Wiring',
      description: 'Suppress architectural railing pickets vs low-voltage LED luminaire conduits.',
      suppressBasedOn: 'Category',
      targetScope: 'one element',
      attribute1: 'Promenade_Pickets',
      attribute2: 'LED_Luminaire_Conduit',
      isDualCondition: true,
    },
  ],
  'Parkway': [
    {
      id: 'pw_r1',
      name: 'Eyebar Suspension Pin Fasteners',
      description: 'Suppress clearance overlap between suspender pinheads and truss top chord gussets.',
      suppressBasedOn: 'Model',
      targetScope: 'one element',
      attribute1: 'Eyebar_Chains',
    },
  ],
  'PPG Place': [
    {
      id: 'ppg_r1',
      name: 'Gothic Spire Curtain-Wall Outriggers',
      description: 'Suppress curtain-wall glass facade brackets attaching to corner spire structural outriggers.',
      suppressBasedOn: 'Category',
      targetScope: 'both elements',
      attribute1: 'CurtainWall_Mullions',
      attribute2: 'Gothic_Spire_Outriggers',
      isDualCondition: true,
    },
    {
      id: 'ppg_r2',
      name: 'Wintergarden Space-Frame Purlins',
      description: 'Suppress atrium diagonal space-frame struts intersecting secondary glazing purlins.',
      suppressBasedOn: 'Model',
      targetScope: 'one element',
      attribute1: 'Wintergarden_SpaceFrame',
    },
    {
      id: 'ppg_r3',
      name: 'High-Rise Elevator Core Raceways',
      description: 'Suppress high-voltage elevator traction risers within designated drywall shaft enclosures.',
      suppressBasedOn: 'Group',
      selectedGroup: 'Electrical',
    },
  ],
  'Tied Arch Bridge': [
    {
      id: 'tab_r1',
      name: 'Gothic Spire Curtain-Wall Outriggers',
      description: 'Suppress curtain-wall glass facade brackets attaching to corner spire structural outriggers.',
      suppressBasedOn: 'Category',
      targetScope: 'both elements',
      attribute1: 'CurtainWall_Mullions',
      attribute2: 'Gothic_Spire_Outriggers',
      isDualCondition: true,
    },
  ],
  'Liberty Bridge': [
    {
      id: 'lb_r1',
      name: 'Tunnel Portal Exhaust Transition',
      description: 'Suppress mechanical ventilation plenum transitions inside Liberty Tunnel south portal concrete abutment.',
      suppressBasedOn: 'Category',
      targetScope: 'both elements',
      attribute1: 'Tunnel_Portal_Abutment',
      attribute2: 'Tunnel_Vent_Plenums',
      isDualCondition: true,
    },
    {
      id: 'lb_r2',
      name: 'Cantilever Warren Truss Gussets',
      description: 'Suppress heavy truss gusset plate fastener intersections with deck cross-girders.',
      suppressBasedOn: 'Model',
      targetScope: 'one element',
      attribute1: 'Cantilever_Truss_Gussets',
    },
    {
      id: 'lb_r3',
      name: 'De-icing Hydronic Loop Sleeves',
      description: 'Suppress hydronic roadway heating pipes passing through pre-engineered floor beam web sleeves.',
      suppressBasedOn: 'Category',
      targetScope: 'one element',
      attribute1: 'Hydronic_Deicing_Pipes',
      attribute2: 'Floor_Beam_Webs',
      isDualCondition: true,
    },
  ],
  'Data Centre - 1': [
    {
      id: 'dc_r1',
      name: 'Tunnel Portal Exhaust Transition',
      description: 'Suppress mechanical ventilation plenum transitions inside Liberty Tunnel south portal concrete abutment.',
      suppressBasedOn: 'Category',
      targetScope: 'both elements',
      attribute1: 'Tunnel_Portal_Abutment',
      attribute2: 'Tunnel_Vent_Plenums',
      isDualCondition: true,
    },
  ],
};

const GROUP_OPTIONS = [
  'Plumbing',
  'HVAC',
  'Electrical',
  'Structural Frame',
  'Architectural Enclosure',
];

const DIRECTION_OPTIONS = ['forward', 'backward', 'any'];

const DEFAULT_ECSQL = `SELECT
  SourceECInstanceId AS ElementA,
  TargetECInstanceId AS ElementB
FROM
  bis.Element
WHERE
  -- Suppress if both elements are in the exact same Category
  bis.Element.Category.Id = bis.Element.Category.Id
  -- And ensure we are looking at two different elements
  AND SourceECInstanceId != TargetECInstanceId`;

// Pill tag style matching the dark badges in screenshot
const Pill = ({ children, color = '#263238' }) => (
  <Box
    component="span"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      px: 1.25,
      py: 0.35,
      borderRadius: '16px',
      backgroundColor: color,
      color: '#fff',
      fontSize: 12,
      fontWeight: 500,
      mx: 0.5,
      verticalAlign: 'middle',
    }}
  >
    {children}
  </Box>
);

const SuppressionRulesDrawer = ({
  open,
  onClose,
  rules = [],
  testName = 'AR vs PH',
  onSaveRule,
  onDeleteRule,
  initialCreateRule = null,
  onSaveAndApply,
}) => {
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Snapshot initial rules count/IDs to detect changes
  const initialRulesSnapshot = React.useRef(rules);
  React.useEffect(() => {
    if (open) {
      initialRulesSnapshot.current = rules;
      setHasUnsavedChanges(Boolean(initialCreateRule));
    } else {
      setHasUnsavedChanges(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialCreateRule]);

  // Common rule fields
  const [ruleName, setRuleName] = useState('');
  const [description, setDescription] = useState('');
  const [suppressBasedOn, setSuppressBasedOn] = useState('Model');

  // Condition fields for Model & Category
  const [targetScope, setTargetScope] = useState('one element');
  const [attribute1, setAttribute1] = useState('Pipes');
  const [attribute2, setAttribute2] = useState('Walls');
  const [isDualCondition, setIsDualCondition] = useState(true);

  // Condition fields for Property
  const [property1, setProperty1] = useState('@Design');
  const [propertyVal1, setPropertyVal1] = useState('36');
  const [property2, setProperty2] = useState('@Window');
  const [propertyVal2, setPropertyVal2] = useState('42');

  // Condition fields for Class
  const [class1, setClass1] = useState('@Design');
  const [class2, setClass2] = useState('@Window');

  // Condition fields for Group
  const [selectedGroup, setSelectedGroup] = useState('Plumbing');

  // Condition fields for Relationship
  const [relSourceClass, setRelSourceClass] = useState('@Design');
  const [relTargetClass, setRelTargetClass] = useState('@Window');
  const [relViaClass, setRelViaClass] = useState('@Box');
  const [relDirection, setRelDirection] = useState('forward');

  // Condition fields for ECSQL
  const [ecsqlTarget, setEcsqlTarget] = useState('one element');
  const [ecsqlCode, setEcsqlCode] = useState(DEFAULT_ECSQL);

  // Import rule state
  const [isImportedRule, setIsImportedRule] = useState(false);
  const [importedFromTest, setImportedFromTest] = useState('AR vs PH');
  const [importMenuAnchorEl, setImportMenuAnchorEl] = useState(null);

  // Import Dialog State
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedImportTest, setSelectedImportTest] = useState('');
  const [selectedRuleIds, setSelectedRuleIds] = useState([]);
  const [isImportLoading, setIsImportLoading] = useState(false);

  // Card Context Menu
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuRule, setMenuRule] = useState(null);

  // Sync initialCreateRule when provided from parent
  React.useEffect(() => {
    if (initialCreateRule && open) {
      setEditingRuleId(initialCreateRule.id || null);
      setRuleName(initialCreateRule.name || '');
      setDescription(initialCreateRule.description || '');
      setSuppressBasedOn(initialCreateRule.suppressBasedOn || 'Model');
      setTargetScope(initialCreateRule.targetScope || 'one element');
      setAttribute1(initialCreateRule.attribute1 || 'Ref-11, I-95_CL_Corridor_Pavt.dgn, Default-3D');
      setAttribute2(initialCreateRule.attribute2 || 'Walls');
      setIsDualCondition(Boolean(initialCreateRule.isDualCondition));
      setProperty1(initialCreateRule.property1 || '@Design');
      setPropertyVal1(initialCreateRule.propertyVal1 || '36');
      setProperty2(initialCreateRule.property2 || '@Window');
      setPropertyVal2(initialCreateRule.propertyVal2 || '42');
      setClass1(initialCreateRule.class1 || 'Structural');
      setClass2(initialCreateRule.class2 || 'Architectural');
      setSelectedGroup(initialCreateRule.selectedGroup || 'Plumbing');
      setRelSourceClass(initialCreateRule.relSourceClass || '@Design');
      setRelTargetClass(initialCreateRule.relTargetClass || '@Window');
      setRelViaClass(initialCreateRule.relViaClass || '@Box');
      setRelDirection(initialCreateRule.relDirection || 'forward');
      setEcsqlTarget(initialCreateRule.ecsqlTarget || 'one element');
      setEcsqlCode(initialCreateRule.ecsqlCode || DEFAULT_ECSQL);
      setIsImportedRule(Boolean(initialCreateRule.isImported));
      setImportedFromTest(initialCreateRule.importedFrom || testName || 'AR vs PH');
      setIsCreatingRule(true);
    }
  }, [initialCreateRule, open, testName]);

  const handleOpenCreateForm = () => {
    setEditingRuleId(null);
    setRuleName('Rule name');
    setDescription(
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.'
    );
    setSuppressBasedOn('Category');
    setTargetScope('one element');
    setAttribute1('BBoxhigh');
    setAttribute2('BBoxlow');
    setIsDualCondition(true);
    setProperty1('BBoxhigh');
    setPropertyVal1('34');
    setProperty2('BBoxlow');
    setPropertyVal2('42');
    setClass1('@Design');
    setClass2('@Window');
    setSelectedGroup('Plumbing');
    setRelSourceClass('@Design');
    setRelTargetClass('@Window');
    setRelViaClass('@Box');
    setRelDirection('forward');
    setEcsqlTarget('one element');
    setEcsqlCode(DEFAULT_ECSQL);
    setIsImportedRule(false);
    setImportedFromTest(testName || 'AR vs PH');
    setIsCreatingRule(true);
  };

  const handleCancelCreate = () => {
    setIsCreatingRule(false);
    setEditingRuleId(null);
  };

  const handleSave = () => {
    const newRule = {
      id: editingRuleId || Date.now(),
      name: ruleName.trim() || 'Rule name',
      description: description.trim(),
      suppressBasedOn,
      targetScope,
      attribute1,
      attribute2,
      isDualCondition,
      property1,
      propertyVal1,
      property2,
      propertyVal2,
      class1,
      class2,
      selectedGroup,
      testName,
      relSourceClass,
      relTargetClass,
      relViaClass,
      relDirection,
      ecsqlTarget,
      ecsqlCode,
      isImported: isImportedRule,
      importedFrom: isImportedRule ? (importedFromTest.trim() || testName || 'AR vs PH') : '',
    };
    onSaveRule(newRule);
    setHasUnsavedChanges(true);
    setIsCreatingRule(false);
    setEditingRuleId(null);
  };

  const handleOpenImportDialog = () => {
    setImportMenuAnchorEl(null);
    setSelectedImportTest('');
    setSelectedRuleIds([]);
    setImportDialogOpen(true);
  };

  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
    setSelectedImportTest('');
    setSelectedRuleIds([]);
  };

  const handleToggleRuleSelection = (ruleId) => {
    setSelectedRuleIds((prev) =>
      prev.includes(ruleId) ? prev.filter((id) => id !== ruleId) : [...prev, ruleId]
    );
  };

  const handleConfirmImport = () => {
    if (!selectedImportTest || selectedRuleIds.length === 0) return;
    setImportDialogOpen(false);
    setIsImportLoading(true);

    const availableRules = MOCK_TEST_RULES[selectedImportTest] || [];
    const rulesToImport = availableRules
      .filter((r) => selectedRuleIds.includes(r.id))
      .map((r, idx) => ({
        ...r,
        id: Date.now() + idx + Math.random(),
        isImported: true,
        importedFrom: selectedImportTest,
      }));

    setTimeout(() => {
      if (onSaveRule) {
        rulesToImport.forEach((importedRule) => {
          onSaveRule(importedRule);
        });
        setHasUnsavedChanges(true);
      }
      setIsImportLoading(false);
    }, 1200);
  };

  const handleCardMenuOpen = (e, rule) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
    setMenuRule(rule);
  };

  const handleCardMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuRule(null);
  };

  const handleEditRule = () => {
    if (!menuRule) return;
    setEditingRuleId(menuRule.id);
    setRuleName(menuRule.name || '');
    setDescription(menuRule.description || '');
    setSuppressBasedOn(menuRule.suppressBasedOn || 'Model');
    setTargetScope(menuRule.targetScope || 'one element');
    setAttribute1(menuRule.attribute1 || 'Pipes');
    setAttribute2(menuRule.attribute2 || 'Walls');
    setIsDualCondition(menuRule.isDualCondition !== false);
    setProperty1(menuRule.property1 || '@Design');
    setPropertyVal1(menuRule.propertyVal1 || '36');
    setProperty2(menuRule.property2 || '@Window');
    setPropertyVal2(menuRule.propertyVal2 || '42');
    setClass1(menuRule.class1 || '@Design');
    setClass2(menuRule.class2 || '@Window');
    setSelectedGroup(menuRule.selectedGroup || 'Plumbing');
    setRelSourceClass(menuRule.relSourceClass || '@Design');
    setRelTargetClass(menuRule.relTargetClass || '@Window');
    setRelViaClass(menuRule.relViaClass || '@Box');
    setRelDirection(menuRule.relDirection || 'forward');
    setEcsqlTarget(menuRule.ecsqlTarget || 'one element');
    setEcsqlCode(menuRule.ecsqlCode || DEFAULT_ECSQL);
    setIsImportedRule(Boolean(menuRule.isImported || menuRule.importedFrom));
    setImportedFromTest(menuRule.importedFrom || testName || 'AR vs PH');
    setIsCreatingRule(true);
    handleCardMenuClose();
  };

  const handleToggleDisableRule = () => {
    if (!menuRule) return;
    const isCurrentlyDisabled = Boolean(menuRule.disabled);
    const updatedRule = {
      ...menuRule,
      disabled: !isCurrentlyDisabled,
    };
    if (onSaveRule) {
      onSaveRule(updatedRule);
    }
    setHasUnsavedChanges(true);
    handleCardMenuClose();
  };

  const handleExportRuleCsv = () => {
    if (!menuRule) return;
    const ruleNameClean = (menuRule.name || 'suppression_rule').replace(/[^a-zA-Z0-9_-]/g, '_');
    const status = menuRule.disabled ? 'Disabled' : 'Active';

    let conditionSummary = '';
    if (menuRule.suppressBasedOn === 'Model') {
      conditionSummary = `Model: ${menuRule.attribute1 || 'Pipes'}`;
    } else if (menuRule.suppressBasedOn === 'Category') {
      conditionSummary = `Category: ${menuRule.attribute1 || 'Pipes'} vs ${menuRule.attribute2 || 'Walls'}`;
    } else if (menuRule.suppressBasedOn === 'Property') {
      conditionSummary = `Property: ${menuRule.property1 || '@Design'}=${menuRule.propertyVal1 || '36'}`;
    } else if (menuRule.suppressBasedOn === 'ECSQL expression') {
      conditionSummary = 'ECSQL custom expression';
    } else if (menuRule.suppressBasedOn === 'Relationship') {
      conditionSummary = `Relationship: ${menuRule.relSourceClass || ''} -> ${menuRule.relTargetClass || ''} via ${menuRule.relViaClass || ''}`;
    } else {
      conditionSummary = menuRule.suppressBasedOn || 'Condition';
    }

    const headers = ['ID', 'Rule Name', 'Type', 'Target Scope', 'Status', 'Condition Summary', 'Description', 'Imported From'];
    const row = [
      menuRule.id,
      `"${(menuRule.name || '').replace(/"/g, '""')}"`,
      `"${(menuRule.suppressBasedOn || '').replace(/"/g, '""')}"`,
      `"${(menuRule.targetScope || 'one element').replace(/"/g, '""')}"`,
      status,
      `"${conditionSummary.replace(/"/g, '""')}"`,
      `"${(menuRule.description || '').replace(/"/g, '""')}"`,
      `"${(menuRule.importedFrom || '').replace(/"/g, '""')}"`,
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), row.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${ruleNameClean}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleCardMenuClose();
  };

  const handleDeleteRule = () => {
    if (!menuRule) return;
    if (onDeleteRule) onDeleteRule(menuRule.id);
    setHasUnsavedChanges(true);
    handleCardMenuClose();
  };

  // Render the sentence builder form dynamically matching each column in the matrix screenshot
  const renderSentenceBuilder = () => {
    switch (suppressBasedOn) {
      case 'Model': {
        const isBoth = targetScope === 'both elements';
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, mb: 3 }}>
            {/* Line 1 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1c1f21' }}>If</Typography>
              <TextField
                select
                size="small"
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value)}
                SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                sx={{ width: 160, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13 } }}
              >
                {TARGET_OPTIONS.map((t) => (
                  <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t}</MenuItem>
                ))}
              </TextField>

              {isBoth ? (
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>
                  are in the same model
                </Typography>
              ) : (
                <>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>
                    belongs to a model named
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={attribute1}
                    onChange={(e) => setAttribute1(e.target.value)}
                    SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                    sx={{
                      maxWidth: 280,
                      minWidth: 170,
                      '& .MuiOutlinedInput-root': {
                        height: 34,
                        fontSize: 13,
                        '& fieldset': { borderColor: '#c2c9cd' },
                      },
                    }}
                  >
                    {MODEL_NAME_OPTIONS.map((m) => (
                      <MenuItem key={m} value={m} sx={{ fontSize: 13 }}>{m}</MenuItem>
                    ))}
                  </TextField>
                  {!isDualCondition && (
                    <IconButton
                      size="small"
                      onClick={() => setIsDualCondition(true)}
                      sx={{ border: '1px solid #c2c9cd', borderRadius: '4px', p: 0.6, color: '#657075' }}
                    >
                      <AddIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </>
              )}
            </Box>

            {/* Line 2 (Dual Condition for Model) */}
            {!isBoth && isDualCondition && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>
                  and the other belongs to a model named
                </Typography>
                <TextField
                  select
                  size="small"
                  value={attribute2}
                  onChange={(e) => setAttribute2(e.target.value)}
                  SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                  sx={{ width: 170, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13 } }}
                >
                  {MODEL_NAME_OPTIONS.map((m) => (
                    <MenuItem key={m} value={m} sx={{ fontSize: 13 }}>{m}</MenuItem>
                  ))}
                </TextField>
                <IconButton
                  size="small"
                  onClick={() => setIsDualCondition(false)}
                  sx={{ border: '1px solid #c2c9cd', borderRadius: '4px', p: 0.6, color: '#657075' }}
                >
                  <RemoveIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )}
          </Box>
        );
      }

      case 'Category': {
        const isBoth = targetScope === 'both elements';
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, mb: 3 }}>
            {/* Line 1 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1c1f21' }}>If</Typography>
              <TextField
                select
                size="small"
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value)}
                SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                sx={{ width: 160, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13 } }}
              >
                {TARGET_OPTIONS.map((t) => (
                  <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t}</MenuItem>
                ))}
              </TextField>

              {isBoth ? (
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>
                  are in the same category
                </Typography>
              ) : (
                <>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>
                    has a category matching
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={attribute1}
                    onChange={(e) => setAttribute1(e.target.value)}
                    SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                    sx={{ width: 170, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13, '& fieldset': { borderColor: '#087f6c' } } }}
                  >
                    {MODEL_NAME_OPTIONS.map((m) => (
                      <MenuItem key={m} value={m} sx={{ fontSize: 13 }}>{m}</MenuItem>
                    ))}
                  </TextField>
                  {!isDualCondition && (
                    <IconButton
                      size="small"
                      onClick={() => setIsDualCondition(true)}
                      sx={{ border: '1px solid #c2c9cd', borderRadius: '4px', p: 0.6, color: '#657075' }}
                    >
                      <AddIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </>
              )}
            </Box>

            {/* Line 2 (Dual Condition for Category) */}
            {!isBoth && isDualCondition && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>
                  and the other has a category matching
                </Typography>
                <TextField
                  select
                  size="small"
                  value={attribute2}
                  onChange={(e) => setAttribute2(e.target.value)}
                  SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                  sx={{ width: 170, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13 } }}
                >
                  {MODEL_NAME_OPTIONS.map((m) => (
                    <MenuItem key={m} value={m} sx={{ fontSize: 13 }}>{m}</MenuItem>
                  ))}
                </TextField>
                <IconButton
                  size="small"
                  onClick={() => setIsDualCondition(false)}
                  sx={{ border: '1px solid #c2c9cd', borderRadius: '4px', p: 0.6, color: '#657075' }}
                >
                  <RemoveIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )}
          </Box>
        );
      }

      case 'Property': {
        const isBoth = targetScope === 'both elements';
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, mb: 3 }}>
            {/* Line 1 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1c1f21' }}>If</Typography>
              <TextField
                select
                size="small"
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value)}
                SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                sx={{ width: 160, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13 } }}
              >
                {TARGET_OPTIONS.map((t) => (
                  <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t}</MenuItem>
                ))}
              </TextField>

              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>
                {isBoth ? 'have a property of' : 'has a property of'}
              </Typography>

              <TextField
                select
                size="small"
                value={property1}
                onChange={(e) => setProperty1(e.target.value)}
                SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                sx={{ width: 150, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13 } }}
              >
                {PROPERTY_NAME_OPTIONS.map((p) => (
                  <MenuItem key={p} value={p} sx={{ fontSize: 13 }}>{p}</MenuItem>
                ))}
              </TextField>

              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>
                with the value
              </Typography>

              <TextField
                size="small"
                placeholder="Value"
                value={propertyVal1}
                onChange={(e) => setPropertyVal1(e.target.value)}
                sx={{ width: 100, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13 } }}
              />

              {!isBoth && !isDualCondition && (
                <IconButton
                  size="small"
                  onClick={() => setIsDualCondition(true)}
                  sx={{ border: '1px solid #c2c9cd', borderRadius: '4px', p: 0.6, color: '#657075' }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>

            {/* Line 2 (Dual Condition for Property) */}
            {!isBoth && isDualCondition && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>
                  and the other has a property of
                </Typography>
                <TextField
                  select
                  size="small"
                  value={property2}
                  onChange={(e) => setProperty2(e.target.value)}
                  SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                  sx={{ width: 150, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13 } }}
                >
                  {PROPERTY_NAME_OPTIONS.map((p) => (
                    <MenuItem key={p} value={p} sx={{ fontSize: 13 }}>{p}</MenuItem>
                  ))}
                </TextField>

                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>
                  with the value
                </Typography>

                <TextField
                  size="small"
                  placeholder="Value"
                  value={propertyVal2}
                  onChange={(e) => setPropertyVal2(e.target.value)}
                  sx={{ width: 100, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13 } }}
                />

                <IconButton
                  size="small"
                  onClick={() => setIsDualCondition(false)}
                  sx={{ border: '1px solid #c2c9cd', borderRadius: '4px', p: 0.6, color: '#657075' }}
                >
                  <RemoveIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )}
          </Box>
        );
      }

      case 'Class': {
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, mb: 3 }}>
            {/* Line 1 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>
                If one element has a class of
              </Typography>
              <TextField
                select
                size="small"
                value={class1}
                onChange={(e) => setClass1(e.target.value)}
                SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                sx={{ width: 170, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13 } }}
              >
                {CLASS_NAME_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>{c}</MenuItem>
                ))}
              </TextField>

              {!isDualCondition && (
                <IconButton
                  size="small"
                  onClick={() => setIsDualCondition(true)}
                  sx={{ border: '1px solid #c2c9cd', borderRadius: '4px', p: 0.6, color: '#657075' }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>

            {/* Line 2 */}
            {isDualCondition && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>
                  and the other has a class of
                </Typography>
                <TextField
                  select
                  size="small"
                  value={class2}
                  onChange={(e) => setClass2(e.target.value)}
                  SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                  sx={{ width: 170, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13 } }}
                >
                  {CLASS_NAME_OPTIONS.map((c) => (
                    <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>{c}</MenuItem>
                  ))}
                </TextField>
                <IconButton
                  size="small"
                  onClick={() => setIsDualCondition(false)}
                  sx={{ border: '1px solid #c2c9cd', borderRadius: '4px', p: 0.6, color: '#657075' }}
                >
                  <RemoveIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )}
          </Box>
        );
      }

      case 'Group': {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', mb: 3 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>
              If one of the elements belongs to the group(s)
            </Typography>
            <TextField
              select
              size="small"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
              sx={{ width: 210, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13 } }}
            >
              {GROUP_OPTIONS.map((g) => (
                <MenuItem key={g} value={g} sx={{ fontSize: 13 }}>{g}</MenuItem>
              ))}
            </TextField>
          </Box>
        );
      }

      case 'Relationship': {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', mb: 3 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1c1f21' }}>If</Typography>
            <TextField
              select
              size="small"
              value={relSourceClass}
              onChange={(e) => setRelSourceClass(e.target.value)}
              SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
              sx={{ width: 135, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13 } }}
            >
              {CLASS_NAME_OPTIONS.map((c) => (
                <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>{c}</MenuItem>
              ))}
            </TextField>

            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>is related to</Typography>
            <TextField
              select
              size="small"
              value={relTargetClass}
              onChange={(e) => setRelTargetClass(e.target.value)}
              SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
              sx={{ width: 135, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13 } }}
            >
              {CLASS_NAME_OPTIONS.map((c) => (
                <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>{c}</MenuItem>
              ))}
            </TextField>

            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>via</Typography>
            <TextField
              select
              size="small"
              value={relViaClass}
              onChange={(e) => setRelViaClass(e.target.value)}
              SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
              sx={{ width: 135, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13 } }}
            >
              {CLASS_NAME_OPTIONS.map((c) => (
                <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>{c}</MenuItem>
              ))}
            </TextField>

            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>in the</Typography>
            <TextField
              select
              size="small"
              value={relDirection}
              onChange={(e) => setRelDirection(e.target.value)}
              SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
              sx={{ width: 110, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13 } }}
            >
              {DIRECTION_OPTIONS.map((d) => (
                <MenuItem key={d} value={d} sx={{ fontSize: 13 }}>{d}</MenuItem>
              ))}
            </TextField>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>direction</Typography>
          </Box>
        );
      }

      case 'ECSQL expression': {
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1c1f21' }}>If</Typography>
              <TextField
                select
                size="small"
                value={ecsqlTarget}
                onChange={(e) => setEcsqlTarget(e.target.value)}
                SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                sx={{ width: 160, '& .MuiOutlinedInput-root': { height: 34, fontSize: 13 } }}
              >
                {TARGET_OPTIONS.map((t) => (
                  <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t}</MenuItem>
                ))}
              </TextField>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1c1f21' }}>
                meets the expression
              </Typography>
            </Box>

            {/* SQL textarea */}
            <TextField
              multiline
              rows={8}
              value={ecsqlCode}
              onChange={(e) => setEcsqlCode(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: 12.5,
                  backgroundColor: '#1b2226',
                  color: '#e0e6ea',
                  lineHeight: 1.5,
                  borderRadius: '4px',
                  '& fieldset': { borderColor: '#3a474e' },
                  '&:hover fieldset': { borderColor: '#087f6c' },
                  '&.Mui-focused fieldset': { borderColor: '#087f6c' },
                },
              }}
            />
            <Typography sx={{ fontSize: 12, color: '#657075' }}>
              Use named parameter 'elementId' to bind the id of either clashing element
            </Typography>
          </Box>
        );
      }

      default:
        return null;
    }
  };

  // Render the formatted rule card matching each column in the matrix screenshot
  const renderRuleCardContent = (rule) => {
    switch (rule.suppressBasedOn) {
      case 'Model': {
        if (rule.targetScope === 'both elements') {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 1.25 }}>
              <Typography sx={{ fontSize: 13, color: '#4a555b' }}>Suppress if</Typography>
              <Pill>{rule.targetScope || 'both elements'}</Pill>
              <Pill>are in the same model</Pill>
            </Box>
          );
        }
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 1.25 }}>
            <Typography sx={{ fontSize: 13, color: '#4a555b' }}>Suppress if</Typography>
            <Pill>{rule.targetScope || 'one element'}</Pill>
            <Typography sx={{ fontSize: 13, color: '#4a555b' }}>belongs to a model named</Typography>
            <Pill>{rule.attribute1 || 'Pipes'}</Pill>
            {rule.isDualCondition && (
              <>
                <Typography sx={{ fontSize: 13, color: '#4a555b' }}>and the other belongs to a model named</Typography>
                <Pill>{rule.attribute2 || 'Walls'}</Pill>
              </>
            )}
          </Box>
        );
      }

      case 'Category': {
        if (rule.targetScope === 'both elements') {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 1.25 }}>
              <Typography sx={{ fontSize: 13, color: '#4a555b' }}>Suppress if</Typography>
              <Pill>{rule.targetScope || 'both elements'}</Pill>
              <Pill>are in the same category</Pill>
            </Box>
          );
        }
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 1.25 }}>
            <Typography sx={{ fontSize: 13, color: '#4a555b' }}>Suppress if</Typography>
            <Pill>{rule.targetScope || 'one element'}</Pill>
            <Typography sx={{ fontSize: 13, color: '#4a555b' }}>has a category matching</Typography>
            <Pill>{rule.attribute1 || 'Pipes'}</Pill>
            {rule.isDualCondition && (
              <>
                <Typography sx={{ fontSize: 13, color: '#4a555b' }}>and the other has a category matching</Typography>
                <Pill>{rule.attribute2 || 'Walls'}</Pill>
              </>
            )}
          </Box>
        );
      }

      case 'Property': {
        const isBoth = rule.targetScope === 'both elements';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 1.25 }}>
            <Typography sx={{ fontSize: 13, color: '#4a555b' }}>Suppress if</Typography>
            <Pill>{rule.targetScope || 'one element'}</Pill>
            <Typography sx={{ fontSize: 13, color: '#4a555b' }}>
              {isBoth ? 'have a property of' : 'has a property of'}
            </Typography>
            <Pill>{rule.property1 || '@Design'}</Pill>
            <Typography sx={{ fontSize: 13, color: '#4a555b' }}>with the value</Typography>
            <Pill>{rule.propertyVal1 || '36'}</Pill>
            {!isBoth && rule.isDualCondition && (
              <>
                <Typography sx={{ fontSize: 13, color: '#4a555b' }}>and the other has a property of</Typography>
                <Pill>{rule.property2 || '@Window'}</Pill>
                <Typography sx={{ fontSize: 13, color: '#4a555b' }}>with the value</Typography>
                <Pill>{rule.propertyVal2 || '42'}</Pill>
              </>
            )}
          </Box>
        );
      }

      case 'Class': {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 1.25 }}>
            <Typography sx={{ fontSize: 13, color: '#4a555b' }}>Suppress if one element has a class of</Typography>
            <Pill>{rule.class1 || '@Design'}</Pill>
            {rule.isDualCondition && (
              <>
                <Typography sx={{ fontSize: 13, color: '#4a555b' }}>and the other has a class of</Typography>
                <Pill>{rule.class2 || '@Window'}</Pill>
              </>
            )}
          </Box>
        );
      }

      case 'Group': {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 1.25 }}>
            <Typography sx={{ fontSize: 13, color: '#4a555b' }}>
              If one of the elements belongs to the group(s)
            </Typography>
            <Pill>{rule.selectedGroup || 'Plumbing'}</Pill>
          </Box>
        );
      }

      case 'Relationship': {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 1.25 }}>
            <Typography sx={{ fontSize: 13, color: '#4a555b' }}>If</Typography>
            <Pill>{rule.relSourceClass || '@Design'}</Pill>
            <Typography sx={{ fontSize: 13, color: '#4a555b' }}>{rule.relVerb || 'is related to'}</Typography>
            <Pill>{rule.relTargetClass || '@Window'}</Pill>
            <Typography sx={{ fontSize: 13, color: '#4a555b' }}>via</Typography>
            <Pill>{rule.relViaClass || '@Box'}</Pill>
            <Typography sx={{ fontSize: 13, color: '#4a555b' }}>in the</Typography>
            <Pill>{rule.relDirection || 'forward'}</Pill>
            <Typography sx={{ fontSize: 13, color: '#4a555b' }}>direction</Typography>
          </Box>
        );
      }

      case 'ECSQL expression': {
        return (
          <Box sx={{ mt: 1.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
              <Typography sx={{ fontSize: 13, color: '#4a555b' }}>If</Typography>
              <Pill>{rule.ecsqlTarget || 'one element'}</Pill>
              <Typography sx={{ fontSize: 13, color: '#4a555b' }}>{rule.ecsqlIntro || 'meets the expression'}</Typography>
            </Box>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                backgroundColor: '#263238',
                color: '#eceff1',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: 12,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.45,
                border: '1px solid #37474f',
              }}
            >
              {rule.ecsqlCode || DEFAULT_ECSQL}
            </Paper>
          </Box>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '58vw',
          maxWidth: '840px',
          minWidth: '540px',
          backgroundColor: '#fff',
          p: 0,
          boxSizing: 'border-box',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.14)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        },
      }}
    >
      {/* Scrollable Main Content Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
        {/* Top Header Bar */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1c1f21', letterSpacing: '-0.02em' }}>
              Suppression rules
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#657075', mt: 0.5 }}>
              {rules.length} applied
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" sx={{ color: '#657075' }}>
              <HelpOutlineIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton size="small" onClick={onClose} sx={{ color: '#657075' }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

      {/* Action Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleOpenCreateForm}
            sx={{
              backgroundColor: isCreatingRule ? '#066657' : '#087f6c',
              textTransform: 'none',
              borderRadius: '4px',
              fontSize: 13,
              fontWeight: 500,
              px: 1.75,
              py: 0.6,
              boxShadow: 'none',
              '&:hover': { backgroundColor: '#066657', boxShadow: 'none' },
            }}
          >
            Create a rule
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={(e) => setImportMenuAnchorEl(e.currentTarget)}
            endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: 'none',
              color: '#344046',
              borderColor: '#e0e4e6',
              backgroundColor: '#f5f7f8',
              borderRadius: '4px',
              fontSize: 13,
              fontWeight: 500,
              px: 1.5,
              py: 0.6,
              '&:hover': { backgroundColor: '#eef1f3', borderColor: '#c2c9cd' },
            }}
          >
            Import rules
          </Button>

          {/* Import Rules Dropdown Menu */}
          <Menu
            anchorEl={importMenuAnchorEl}
            open={Boolean(importMenuAnchorEl)}
            onClose={() => setImportMenuAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{
              paper: {
                sx: {
                  minWidth: 170,
                  borderRadius: '4px',
                  border: '1px solid #c2c9cd',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                  py: 0.5,
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                setImportMenuAnchorEl(null);
              }}
              sx={{
                fontSize: 13,
                color: '#344046',
                py: 0.75,
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                '&:hover': { backgroundColor: '#f5f7f8' },
              }}
            >
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: '#536066' }} />
              From file
            </MenuItem>
            <MenuItem
              onClick={handleOpenImportDialog}
              sx={{
                fontSize: 13,
                color: '#344046',
                py: 0.75,
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                '&:hover': { backgroundColor: '#f5f7f8' },
              }}
            >
              <TableChartOutlinedIcon sx={{ fontSize: 16, color: '#536066' }} />
              From another test
            </MenuItem>
          </Menu>

          <IconButton
            size="small"
            sx={{
              border: '1px solid #e0e4e6',
              backgroundColor: '#f5f7f8',
              borderRadius: '4px',
              p: 0.7,
              color: '#536066',
              '&:hover': { backgroundColor: '#eef1f3' },
            }}
          >
            <FileUploadOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Right utility icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" sx={{ color: '#657075' }}>
            <SearchIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton size="small" sx={{ color: '#657075' }}>
            <FilterListIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton size="small" sx={{ color: '#657075' }}>
            <SwapVertIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Loading Bar & Indicator during Rule Import (Screenshot 5) */}
      {isImportLoading && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}>
            <Typography sx={{ fontSize: 12.5, color: '#4a555b', fontWeight: 500 }}>
              Importing suppression rules
            </Typography>
          </Box>
          <LinearProgress
            sx={{
              height: 4,
              borderRadius: 2,
              backgroundColor: '#d8e5e1',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#087f6c',
              },
            }}
          />
          {/* Skeleton placeholder rows matching Screenshot 5 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2.5 }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Box
                key={item}
                sx={{
                  height: 58,
                  backgroundColor: '#f5f7f8',
                  borderRadius: '6px',
                  border: '1px solid #edf1f3',
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Inline Rule Creator Form Card (when Create a rule is active) */}
      {isCreatingRule && (
        <Paper
          elevation={0}
          sx={{
            border: '1.5px solid #087f6c',
            borderRadius: '8px',
            p: 2.5,
            mb: 3,
            backgroundColor: '#fff',
          }}
        >
          {/* Row 1: Rule name* & Description */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 12, color: '#4a555b', fontWeight: 500, mb: 0.5 }}>
                Rule name<span style={{ color: '#d32f2f' }}>*</span>
              </Typography>
              <TextField
                placeholder="Add a name"
                size="small"
                fullWidth
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 34,
                    fontSize: 13,
                    borderRadius: '4px',
                    '& fieldset': { borderColor: '#c2c9cd' },
                    '&:hover fieldset': { borderColor: '#8a9499' },
                    '&.Mui-focused fieldset': { borderColor: '#087f6c' },
                  },
                }}
              />
            </Box>

            <Box sx={{ flex: 1.5 }}>
              <Typography sx={{ fontSize: 12, color: '#4a555b', fontWeight: 500, mb: 0.5 }}>
                Description
              </Typography>
              <TextField
                placeholder="Add a description"
                size="small"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 34,
                    fontSize: 13,
                    borderRadius: '4px',
                    '& fieldset': { borderColor: '#c2c9cd' },
                    '&:hover fieldset': { borderColor: '#8a9499' },
                    '&.Mui-focused fieldset': { borderColor: '#087f6c' },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Row 2: Suppress based on* */}
          <Box sx={{ mb: 2.5, width: '42%', maxWidth: 280 }}>
            <Typography sx={{ fontSize: 12, color: '#4a555b', fontWeight: 500, mb: 0.5 }}>
              Suppress based on<span style={{ color: '#d32f2f' }}>*</span>
            </Typography>
            <TextField
              select
              size="small"
              fullWidth
              value={suppressBasedOn}
              onChange={(e) => {
                setSuppressBasedOn(e.target.value);
                setIsDualCondition(true);
              }}
              SelectProps={{
                IconComponent: KeyboardArrowDownIcon,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 34,
                  fontSize: 13,
                  borderRadius: '4px',
                  '& fieldset': { borderColor: '#c2c9cd' },
                  '&:hover fieldset': { borderColor: '#8a9499' },
                  '&.Mui-focused fieldset': { borderColor: '#087f6c' },
                },
              }}
            >
              {SUPPRESS_BASED_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Row 3: Sentence builder based on matrix columns */}
          {renderSentenceBuilder()}

          {/* Form Actions: Cancel & Save */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancelCreate}
              sx={{
                textTransform: 'none',
                color: '#344046',
                borderColor: '#c2c9cd',
                borderRadius: '4px',
                fontSize: 13,
                fontWeight: 500,
                px: 2,
                py: 0.5,
                '&:hover': { backgroundColor: '#f5f7f8' },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleSave}
              sx={{
                textTransform: 'none',
                backgroundColor: '#087f6c',
                color: '#fff',
                borderRadius: '4px',
                fontSize: 13,
                fontWeight: 500,
                px: 2.2,
                py: 0.5,
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#066657', boxShadow: 'none' },
              }}
            >
              Save
            </Button>
          </Box>
        </Paper>
      )}

      {/* Rules List OR Empty State (Frame 1 vs Frame 6) */}
      {rules.length === 0 && !isCreatingRule ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 10,
          }}
        >
          <GavelIcon sx={{ mb: 2 }} />
          <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#1c1f21', mb: 0.5 }}>
            No suppression rules assigned
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#657075', mb: 2.5, textAlign: 'center', maxWidth: 300 }}>
            Click Add rules to assign suppression rules to this test.
          </Typography>
          <Button
            variant="outlined"
            onClick={handleOpenCreateForm}
            sx={{
              textTransform: 'none',
              color: '#1c1f21',
              borderColor: '#c2c9cd',
              borderRadius: '4px',
              fontSize: 13,
              fontWeight: 500,
              px: 2,
              py: 0.6,
              '&:hover': { borderColor: '#8a9499', backgroundColor: '#f5f7f8' },
            }}
          >
            Create a rule
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {rules.map((rule) => {
            const isImported = Boolean(rule.isImported || rule.importedFrom);
            const sourceTestName = rule.importedFrom || rule.testName || testName || 'AR vs PH';
            const ruleDescription =
              rule.description ||
              'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.';
            return (
              <Paper
                key={rule.id}
                elevation={0}
                sx={{
                  border: '1px solid #c2c9cd',
                  borderRadius: '8px',
                  p: 2.5,
                  backgroundColor: rule.disabled ? '#f6f8f9' : '#edf1f3',
                  opacity: rule.disabled ? 0.65 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 15, color: rule.disabled ? '#657075' : '#1c1f21' }}>
                        {rule.name}
                      </Typography>
                      {rule.disabled && (
                        <Typography
                          component="span"
                          sx={{
                            fontSize: 10.5,
                            fontWeight: 600,
                            color: '#536066',
                            backgroundColor: '#e0e4e6',
                            px: 0.8,
                            py: 0.15,
                            borderRadius: '4px',
                            lineHeight: 1.2,
                            letterSpacing: '0.02em',
                          }}
                        >
                          Disabled
                        </Typography>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: 12.5, color: '#657075', mt: 0.25 }}>
                      {rule.suppressBasedOn || 'Category'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {/* Display import icon ONLY if the rule was imported */}
                    {isImported && (
                      <Tooltip
                        arrow
                        placement="top"
                        title={`Imported from ${sourceTestName}`}
                        slotProps={{
                          tooltip: {
                            sx: {
                              bgcolor: '#161c20',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 400,
                              px: 1.5,
                              py: 0.75,
                              borderRadius: '4px',
                              boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
                            },
                          },
                          arrow: {
                            sx: {
                              color: '#161c20',
                            },
                          },
                        }}
                      >
                        <IconButton size="small" sx={{ color: '#455a64', p: 0.5 }}>
                          <ImportActionIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* Question mark icon displaying description on hover */}
                    <Tooltip
                      arrow
                      placement="top"
                      title={ruleDescription}
                      slotProps={{
                        tooltip: {
                          sx: {
                            bgcolor: '#161c20',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 400,
                            lineHeight: 1.45,
                            maxWidth: 240,
                            px: 1.5,
                            py: 1,
                            borderRadius: '4px',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
                          },
                        },
                        arrow: {
                          sx: {
                            color: '#161c20',
                          },
                        },
                      }}
                    >
                      <IconButton size="small" sx={{ color: '#455a64', p: 0.5 }}>
                        <HelpOutlineIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>

                    <IconButton
                      size="small"
                      onClick={(e) => handleCardMenuOpen(e, rule)}
                      sx={{ color: '#455a64', p: 0.5 }}
                    >
                      <MoreVertIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Formatted Condition Expression matching screenshot */}
                {renderRuleCardContent(rule)}
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Card Context Menu matching Figma _MenuList_ */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCardMenuClose}
        slotProps={{
          paper: {
            sx: {
              minWidth: 175,
              borderRadius: '4px',
              border: '1px solid #d4d8db',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              py: 0.5,
            },
          },
        }}
      >
        <MenuItem
          onClick={handleToggleDisableRule}
          sx={{
            fontSize: 13,
            py: 0.85,
            px: 1.5,
            color: '#1c1f21',
            '&:hover': { backgroundColor: '#f0f3f5' },
          }}
        >
          <ListItemIcon sx={{ color: '#2c3437', minWidth: 28 }}>
            {menuRule?.disabled ? (
              <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
            ) : (
              <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
            )}
          </ListItemIcon>
          {menuRule?.disabled ? 'Enable rule' : 'Disable rule'}
        </MenuItem>

        <Divider sx={{ my: 0.25, borderColor: '#e4e7e9' }} />

        <MenuItem
          onClick={handleExportRuleCsv}
          sx={{
            fontSize: 13,
            py: 0.85,
            px: 1.5,
            color: '#1c1f21',
            '&:hover': { backgroundColor: '#f0f3f5' },
          }}
        >
          <ListItemIcon sx={{ color: '#2c3437', minWidth: 28 }}>
            <FileUploadOutlinedIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          Export rule as .csv
        </MenuItem>

        <Divider sx={{ my: 0.25, borderColor: '#e4e7e9' }} />

        <MenuItem
          onClick={handleEditRule}
          sx={{
            fontSize: 13,
            py: 0.85,
            px: 1.5,
            color: '#1c1f21',
            '&:hover': { backgroundColor: '#f0f3f5' },
          }}
        >
          <ListItemIcon sx={{ color: '#2c3437', minWidth: 28 }}>
            <EditOutlinedIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          Edit rule
        </MenuItem>

        <MenuItem
          onClick={handleDeleteRule}
          sx={{
            fontSize: 13,
            py: 0.85,
            px: 1.5,
            color: '#1c1f21',
            '&:hover': { backgroundColor: '#f0f3f5' },
          }}
        >
          <ListItemIcon sx={{ color: '#2c3437', minWidth: 28 }}>
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          Delete rule
        </MenuItem>
      </Menu>

      {/* Import suppression rules from test Dialog (matching screenshot exactly) */}
      <Dialog
        open={importDialogOpen}
        onClose={handleCloseImportDialog}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 580,
            borderRadius: '6px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
            backgroundColor: '#fff',
            overflow: 'hidden',
            m: 2,
          },
        }}
        slotProps={{
          paper: {
            sx: {
              width: '100%',
              maxWidth: 580,
              borderRadius: '6px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
              backgroundColor: '#fff',
              overflow: 'hidden',
              m: 2,
            },
          },
        }}
      >
        <Box sx={{ p: '24px', display: 'flex', flexDirection: 'column' }}>
          {/* Title */}
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: 19,
              color: '#1c1f21',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
              mb: 2.25,
            }}
          >
            Import suppression rules from test
          </Typography>

          {/* Test Selector */}
          <Box sx={{ mb: 1.5 }}>
            <Typography sx={{ fontSize: 12, color: '#536066', fontWeight: 500, mb: 0.5 }}>
              Test
            </Typography>
            <TextField
              select
              size="small"
              fullWidth
              value={selectedImportTest}
              onChange={(e) => {
                setSelectedImportTest(e.target.value);
                setSelectedRuleIds([]);
              }}
              SelectProps={{
                IconComponent: KeyboardArrowDownIcon,
                displayEmpty: true,
                renderValue: (val) => {
                  if (!val) {
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SearchIcon sx={{ fontSize: 18, color: '#8a9296' }} />
                        <Typography sx={{ fontSize: 13, color: '#8a9296' }}>Find a test</Typography>
                      </Box>
                    );
                  }
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SearchIcon sx={{ fontSize: 18, color: '#536066' }} />
                      <Typography sx={{ fontSize: 13, color: '#1c1f21' }}>{val}</Typography>
                    </Box>
                  );
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 36,
                  fontSize: 13,
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  '& fieldset': { borderColor: '#c2c9cd' },
                  '&:hover fieldset': { borderColor: '#8a9499' },
                  '&.Mui-focused fieldset': { borderColor: '#087f6c' },
                },
                '& .MuiSelect-icon': {
                  color: '#657075',
                  fontSize: 20,
                },
              }}
            >
              {Object.keys(MOCK_TEST_RULES).map((tName) => (
                <MenuItem key={tName} value={tName} sx={{ fontSize: 13 }}>
                  {tName}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Rules Checklist Container */}
          <Box
            sx={{
              border: '1px solid #c2c9cd',
              borderRadius: '4px',
              height: 230,
              minHeight: 200,
              overflowY: 'auto',
              p: 2,
              mb: 2.5,
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            {!selectedImportTest ? (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontSize: 13.5, color: '#657075', textAlign: 'center' }}>
                  Select a test to view rules.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {(MOCK_TEST_RULES[selectedImportTest] || []).map((item) => {
                  const isChecked = selectedRuleIds.includes(item.id);
                  return (
                    <Box
                      key={item.id}
                      onClick={() => handleToggleRuleSelection(item.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.25,
                        p: 1,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#f5f7f8' },
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={isChecked}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => handleToggleRuleSelection(item.id)}
                        sx={{
                          p: 0.25,
                          mt: 0.2,
                          color: '#657075',
                          '&.Mui-checked': { color: '#087f6c' },
                        }}
                      />
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1c1f21', lineHeight: 1.3 }}>
                          {item.name}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: '#657075', mt: 0.25, lineHeight: 1.3 }}>
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Dialog Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={handleCloseImportDialog}
              sx={{
                textTransform: 'none',
                color: '#1c1f21',
                borderColor: '#73627a',
                borderRadius: '4px',
                fontSize: 13,
                fontWeight: 500,
                px: 2.2,
                py: 0.5,
                height: 32,
                boxShadow: 'none',
                '&:hover': { borderColor: '#524557', backgroundColor: '#f9f8fa' },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              disabled={!selectedImportTest || selectedRuleIds.length === 0}
              onClick={handleConfirmImport}
              sx={{
                textTransform: 'none',
                borderRadius: '4px',
                fontSize: 13,
                fontWeight: 500,
                px: 2,
                py: 0.5,
                height: 32,
                color: '#73627a',
                borderColor: '#73627a',
                backgroundColor: '#fff',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#f5f2f7',
                  borderColor: '#524557',
                },
                '&.Mui-disabled': {
                  color: '#9e92a4',
                  borderColor: '#c5bec9',
                  backgroundColor: '#fff',
                },
              }}
            >
              Import rules
            </Button>
          </Box>
        </Box>
      </Dialog>
      </Box>

      {/* Sticky Bottom Footer Actions (Cancel & Save and apply) - only shown when changes are made */}
      {Boolean(onSaveAndApply && (hasUnsavedChanges || isCreatingRule)) && (
        <Box
          sx={{
            flexShrink: 0,
            p: 2.5,
            px: 3,
            borderTop: '1px solid #e0e4e6',
            backgroundColor: '#fff',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
            boxShadow: '0 -4px 12px rgba(0,0,0,0.04)',
            zIndex: 10,
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              textTransform: 'none',
              color: '#344046',
              borderColor: '#c2c9cd',
              borderRadius: '4px',
              fontSize: 13,
              fontWeight: 500,
              px: 2.2,
              py: 0.6,
              '&:hover': { borderColor: '#8a9499', backgroundColor: '#f5f7f8' },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (isCreatingRule) {
                handleSave();
              }
              onSaveAndApply();
            }}
            sx={{
              textTransform: 'none',
              backgroundColor: '#087f6c',
              color: '#fff',
              borderRadius: '4px',
              fontSize: 13,
              fontWeight: 500,
              px: 2.2,
              py: 0.6,
              boxShadow: 'none',
              '&:hover': { backgroundColor: '#066657', boxShadow: 'none' },
            }}
          >
            Save and apply
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default SuppressionRulesDrawer;

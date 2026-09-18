import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Divider,
  IconButton,
  Link,
  MenuItem,
  Paper,
  Popover,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { ClashIcon } from '../components/Sidebar';
import IModelViewerModal from '../components/IModelViewerModal';
import IModelQuickViewModal from '../components/IModelQuickViewModal';
import SuppressionRulesDrawer from '../components/SuppressionRulesDrawer';

const createOptionGroup = (id, name, children) => ({
  id,
  name,
  children: children.map((childName) => ({
    id: `${id}_${childName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`,
    name: childName,
  })),
});

const ROBERTO_CLEMENTE_SET_OPTIONS = {
  A: {
    models: [
      createOptionGroup('rc_a_bridge_structural_dgn', 'RCB_Bridge_Structural.dgn', [
        'Three-Hinged Tied Arch Ribs',
        'Portal Towers & Transoms',
        'Eyebar Suspension Chains',
        'Vertical Hanger Cables',
        'Steel Floorbeams & Stringers',
        'Orthotropic Deck Plate',
      ]),
      createOptionGroup('rc_a_substructure_dgn', 'RCB_Substructure.dgn', [
        'North Shore Abutment',
        'Downtown Abutment',
        'River Pier Pedestals',
        'Bearing Assemblies',
      ]),
    ],
    categories: [
      createOptionGroup('rc_a_cat_structural_steel', 'Structural Steel', [
        'Arch Rib Members',
        'Portal Bracing',
        'Floor Framing',
        'Connection Plates',
      ]),
      createOptionGroup('rc_a_cat_concrete', 'Concrete', [
        'Abutment Walls',
        'Pier Caps',
        'Deck Overlay',
      ]),
      createOptionGroup('rc_a_cat_bridge_accessories', 'Bridge Accessories', [
        'Sidewalk Rails',
        'Expansion Joints',
        'Maintenance Platforms',
      ]),
    ],
    groups: [
      createOptionGroup('rc_a_grp_main_span', 'Main Span Structure', [
        'West Arch Line',
        'East Arch Line',
        'Center Deck Framing',
      ]),
      createOptionGroup('rc_a_grp_north_approach', 'North Shore Approach', [
        'North Approach Deck',
        'North Bearing Zone',
      ]),
      createOptionGroup('rc_a_grp_downtown_approach', 'Downtown Approach', [
        'Downtown Approach Deck',
        'Downtown Bearing Zone',
      ]),
    ],
  },
  B: {
    models: [
      createOptionGroup('rc_b_utilities_dgn', 'RCB_Utilities.dgn', [
        'Storm Drainage Piping',
        'Deck Lighting Conduit',
        'Navigation Light Feeders',
        'Maintenance Power Raceways',
      ]),
      createOptionGroup('rc_b_mechanical_dgn', 'RCB_Maintenance_MEP.dgn', [
        'Utility Service Ducts',
        'Heat Trace Lines',
        'Control Cabinets',
      ]),
    ],
    categories: [
      createOptionGroup('rc_b_cat_plumbing', 'Plumbing', [
        'Storm Drain Mains',
        'Downspouts',
        'Scuppers',
      ]),
      createOptionGroup('rc_b_cat_electrical', 'Electrical', [
        'Cable Trays',
        'Lighting Conduit',
        'Panel Feeders',
      ]),
      createOptionGroup('rc_b_cat_mechanical', 'Mechanical', [
        'Ventilation Ducts',
        'Heat Trace Assemblies',
      ]),
    ],
    groups: [
      createOptionGroup('rc_b_grp_deck_utilities', 'Deck Utility Runs', [
        'West Side Utility Corridor',
        'East Side Utility Corridor',
        'Underdeck Crossovers',
      ]),
      createOptionGroup('rc_b_grp_pier_services', 'Pier Service Zones', [
        'North Pier Services',
        'South Pier Services',
      ]),
    ],
  },
};

const LIBERTY_BRIDGE_SET_OPTIONS = {
  A: {
    models: [
      createOptionGroup('lib_a_truss_dgn', 'Liberty_Bridge_Truss.dgn', [
        'Cantilever Deck Trusses',
        'Lower Chord Assemblies',
        'Diagonal Web Members',
        'Floorbeams & Stringers',
        'Outrigger Deck Brackets',
      ]),
      createOptionGroup('lib_a_roadway_dgn', 'Liberty_Roadway_Deck.dgn', [
        'Asphalt Roadway Deck',
        'Concrete Barriers',
        'Stone River Piers',
        'Liberty Tunnel Portal',
      ]),
    ],
    categories: [
      createOptionGroup('lib_a_cat_structural_steel', 'Structural Steel', [
        'Deck Truss Chords',
        'Truss Diagonals',
        'Floor Framing',
        'Bearing Shoes',
      ]),
      createOptionGroup('lib_a_cat_transportation', 'Transportation', [
        'Roadway Surface',
        'Lane Markings',
        'Traffic Barriers',
        'Sign Gantries',
      ]),
      createOptionGroup('lib_a_cat_masonry', 'Masonry / Stone', [
        'River Pier Masonry',
        'Tunnel Portal Stone',
        'Pylon Caps',
      ]),
    ],
    groups: [
      createOptionGroup('lib_a_grp_main_cantilever', 'Main Cantilever Span', [
        'West Cantilever Arm',
        'East Cantilever Arm',
        'Suspended Center Span',
      ]),
      createOptionGroup('lib_a_grp_south_hills', 'South Hills Approach', [
        'Tunnel Portal Approach',
        'South Approach Framing',
      ]),
      createOptionGroup('lib_a_grp_downtown', 'Downtown Approach', [
        'North Approach Framing',
        'Downtown Ramp Tie-In',
      ]),
    ],
  },
  B: {
    models: [
      createOptionGroup('lib_b_hydronics_dgn', 'Liberty_Deck_Hydronics.dgn', [
        'Hydronic Deicing Supply Loop',
        'Hydronic Deicing Return Loop',
        'Heat Exchanger Connections',
        'Zone Valve Boxes',
      ]),
      createOptionGroup('lib_b_fire_dgn', 'Liberty_FireProtection.dgn', [
        'Dry Standpipe Header',
        'Standpipe Risers',
        'Sprinkler Branch Lines',
        'Fire Department Connections',
      ]),
    ],
    categories: [
      createOptionGroup('lib_b_cat_mechanical', 'Mechanical', [
        'Hydronic Deicing',
        'Glycol Supply Piping',
        'Tunnel Ventilation',
      ]),
      createOptionGroup('lib_b_cat_fire_protection', 'Fire Protection', [
        'Dry Standpipes',
        'Wet Sprinkler Lines',
        'Inspector Test Connections',
      ]),
      createOptionGroup('lib_b_cat_electrical', 'Electrical', [
        'Heat Trace Circuits',
        'Deicing Controls',
        'Sensor Conduit',
      ]),
    ],
    groups: [
      createOptionGroup('lib_b_grp_deck_deicing', 'Deck Deicing Zones', [
        'Zone 1 Supply / Return',
        'Zone 2 Supply / Return',
        'Expansion Joint Heat Trace',
      ]),
      createOptionGroup('lib_b_grp_fire_risers', 'Fire Protection Risers', [
        'Pier 1 Standpipe Zone',
        'Pier 2 Standpipe Zone',
        'Tunnel Portal Sprinklers',
      ]),
    ],
  },
};

const PPG_PLACE_SET_OPTIONS = {
  A: {
    models: [
      createOptionGroup('ppg_a_architecture_dgn', 'PPG_Place_Architecture.dgn', [
        'Glass Curtain Wall Panels',
        'Gothic Spires & Turrets',
        'Granite Base Facade',
        'Wintergarden Framing',
      ]),
      createOptionGroup('ppg_a_structure_dgn', 'PPG_Tower_Structure.dgn', [
        'Steel Moment Frame',
        'Concrete Core Walls',
        'Transfer Girders',
        'Plaza Slab',
      ]),
    ],
    categories: [
      createOptionGroup('ppg_a_cat_architecture', 'Architecture', [
        'Curtain Wall',
        'Spandrel Panels',
        'Lobby Storefront',
        'Granite Cladding',
      ]),
      createOptionGroup('ppg_a_cat_structural', 'Structural', [
        'Steel Columns',
        'Composite Beams',
        'Core Shear Walls',
        'Roof Framing',
      ]),
      createOptionGroup('ppg_a_cat_site', 'Site / Plaza', [
        'Plaza Pavers',
        'Fountain Basin',
        'Street Edge Curbs',
      ]),
    ],
    groups: [
      createOptionGroup('ppg_a_grp_tower_core', 'Tower Core', [
        'Central Elevator Core',
        'Stair Core Walls',
        'Mechanical Floor Framing',
      ]),
      createOptionGroup('ppg_a_grp_crown', 'Crown and Spires', [
        'Central Spire Cluster',
        'Corner Turrets',
        'Roof Screen Framing',
      ]),
      createOptionGroup('ppg_a_grp_plaza', 'Plaza Level', [
        'Wintergarden Entrance',
        'Plaza Fountain',
        'Retail Pavilion Facades',
      ]),
    ],
  },
  B: {
    models: [
      createOptionGroup('ppg_b_mep_dgn', 'PPG_Tower_MEP.dgn', [
        'Main Mechanical Risers',
        'Supply Air Shafts',
        'Return Air Shafts',
        'Condenser Water Risers',
      ]),
      createOptionGroup('ppg_b_electrical_dgn', 'PPG_Electrical_Distribution.dgn', [
        'Bus Duct Risers',
        'Cable Tray Banks',
        'Emergency Power Feeders',
        'Lighting Control Panels',
      ]),
      createOptionGroup('ppg_b_plumbing_dgn', 'PPG_Plumbing_Fire.dgn', [
        'Domestic Water Risers',
        'Sanitary Stacks',
        'Fire Standpipe Mains',
        'Sprinkler Mains',
      ]),
    ],
    categories: [
      createOptionGroup('ppg_b_cat_mechanical', 'Mechanical', [
        'HVAC Ductwork',
        'Hydronic Piping',
        'Mechanical Equipment',
      ]),
      createOptionGroup('ppg_b_cat_electrical', 'Electrical', [
        'Busway',
        'Cable Trays',
        'Conduit Banks',
      ]),
      createOptionGroup('ppg_b_cat_plumbing_fire', 'Plumbing / Fire Protection', [
        'Water Risers',
        'Waste Piping',
        'Sprinkler Piping',
        'Standpipes',
      ]),
    ],
    groups: [
      createOptionGroup('ppg_b_grp_riser_shafts', 'Riser Shafts', [
        'North Mechanical Shaft',
        'South Electrical Shaft',
        'Core Plumbing Chase',
      ]),
      createOptionGroup('ppg_b_grp_mechanical_floors', 'Mechanical Floors', [
        'Low-Rise Mechanical Level',
        'Mid-Rise Mechanical Level',
        'Penthouse Mechanical Level',
      ]),
      createOptionGroup('ppg_b_grp_lobby_services', 'Lobby Service Zones', [
        'Retail MEP Distribution',
        'Wintergarden HVAC',
        'Plaza Fountain Equipment',
      ]),
    ],
  },
};

const getSetOptionsForIModel = (iModel) => {
  const normalized = (iModel || '').toLowerCase();
  if (normalized.includes('liberty')) return LIBERTY_BRIDGE_SET_OPTIONS;
  if (normalized.includes('ppg')) return PPG_PLACE_SET_OPTIONS;
  return ROBERTO_CLEMENTE_SET_OPTIONS;
};

// Diamond empty set illustration
const EmptySetIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 48 48" sx={{ fontSize: 44, color: '#4a555b', ...props.sx }}>
    <rect x="20" y="4" width="8" height="8" rx="1.5" transform="rotate(45 24 8)" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <rect x="20" y="24" width="8" height="8" rx="1.5" transform="rotate(45 24 28)" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <rect x="10" y="14" width="8" height="8" rx="1.5" transform="rotate(45 14 18)" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <rect x="30" y="14" width="8" height="8" rx="1.5" transform="rotate(45 34 18)" fill="none" stroke="currentColor" strokeWidth="1.8" />
  </SvgIcon>
);

const CreateClashTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const testInfo = location.state || { name: 'Test name', iModel: 'Roberto Clemente Bridge', description: '' };
  const setOptions = useMemo(() => getSetOptionsForIModel(testInfo.iModel), [testInfo.iModel]);

  // Set selections (start empty for new test configuration)
  const [setAItems, setSetAItems] = useState([]);
  const [setBItems, setSetBItems] = useState([]);

  // Expanded states in tree popover
  const [popoverExpanded, setPopoverExpanded] = useState({
    drainage: false,
    geom_align: false,
    i95_geom: true,
  });

  // Expanded states inside Set cards
  const [setAExpanded, setSetAExpanded] = useState({
    drainage: false,
    geom_align: false,
    i95_geom: true,
  });
  const [setBExpanded, setSetBExpanded] = useState({
    drainage: false,
    geom_align: false,
    i95_geom: true,
  });

  // Popover state
  const [activePopoverSet, setActivePopoverSet] = useState(null);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState('models');
  const [setSearchQueries, setSetSearchQueries] = useState({ A: '', B: '' });

  // Hovered item for trash icon display
  const [hoveredItemId, setHoveredItemId] = useState(null);

  // 3D Viewer modal state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Suppression rules drawer state
  const [suppressionDrawerOpen, setSuppressionDrawerOpen] = useState(false);
  const [suppressionRules, setSuppressionRules] = useState([
    {
      id: 1,
      name: 'Rule name',
      description:
        'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
      suppressBasedOn: 'Property',
      targetScope: 'one element',
      property1: 'BBoxhigh',
      propertyVal1: '34',
      property2: 'BBoxlow',
      propertyVal2: '42',
      isDualCondition: true,
      isImported: false,
      importedFrom: '',
    },
  ]);

  // Clearances and checks
  const [selfCheckA, setSelfCheckA] = useState(false);
  const [clearanceA, setClearanceA] = useState('0.00');
  const [selfCheckB, setSelfCheckB] = useState(false);
  const [clearanceB, setClearanceB] = useState('0.00');

  // Settings column
  const [touchingTolerance, setTouchingTolerance] = useState('00.00');
  const [calculateOverlap, setCalculateOverlap] = useState(false);
  const [includeRefModels, setIncludeRefModels] = useState(false);
  const [includeNonPhysical, setIncludeNonPhysical] = useState(false);
  const [runAutomatically, setRunAutomatically] = useState(false);

  const getOptionGroupsForSet = (setKey, tab = activeTab) => setOptions[setKey]?.[tab] || [];
  const getAllOptionGroupsForSet = (setKey) =>
    ['models', 'categories', 'groups'].flatMap((tab) => getOptionGroupsForSet(setKey, tab));
  const filterOptionGroups = (groups, query) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return groups;

    return groups
      .map((group) => {
        const groupMatches = group.name.toLowerCase().includes(normalizedQuery);
        const matchingChildren = groupMatches
          ? group.children
          : group.children.filter((child) => child.name.toLowerCase().includes(normalizedQuery));
        return matchingChildren.length > 0 ? { ...group, children: matchingChildren } : null;
      })
      .filter(Boolean);
  };

  const roundedCheckboxSx = {
    p: 0.5,
    color: '#8a9296',
    '& .MuiSvgIcon-root': {
      fontSize: 20,
      borderRadius: '4px',
    },
    '&.Mui-checked': {
      color: '#087f6c',
    },
  };

  // Custom rounded tree checkbox matching screenshot 1
  const treeCheckboxSx = {
    p: 0.5,
    color: '#55626a',
    '& .MuiSvgIcon-root': {
      fontSize: 18,
      borderRadius: '4px',
    },
    '&.Mui-checked, &.MuiCheckbox-indeterminate': {
      color: '#087f6c',
    },
  };

  const handleOpenPopover = (event, targetSet) => {
    setActivePopoverSet(targetSet);
    setActiveTab('models');
    setPopoverAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setActivePopoverSet(null);
    setPopoverAnchorEl(null);
  };

  const handleToggleSingleElement = (childId, targetSet) => {
    const isSetA = targetSet === 'A' || targetSet === 'Set A';
    if (isSetA) {
      setSetAItems((prev) =>
        prev.includes(childId) ? prev.filter((id) => id !== childId) : [...prev, childId]
      );
      // When added to Set A, ensure it is only included in Set A
      setSetBItems((prev) => prev.filter((id) => id !== childId));
    } else {
      setSetBItems((prev) =>
        prev.includes(childId) ? prev.filter((id) => id !== childId) : [...prev, childId]
      );
      // When added to Set B, ensure it is only included in Set B
      setSetAItems((prev) => prev.filter((id) => id !== childId));
    }
  };

  const handleToggleGroup = (group, targetSet) => {
    const isSetA = targetSet === 'A' || targetSet === 'Set A';
    const childIds = group.children.map((c) => c.id);

    if (isSetA) {
      setSetAItems((prev) => {
        const allSelected = childIds.every((id) => prev.includes(id));
        if (allSelected) {
          return prev.filter((id) => !childIds.includes(id));
        } else {
          return Array.from(new Set([...prev, ...childIds]));
        }
      });
      // When elements are added to Set A, remove them from Set B
      setSetBItems((prev) => prev.filter((id) => !childIds.includes(id)));
    } else {
      setSetBItems((prev) => {
        const allSelected = childIds.every((id) => prev.includes(id));
        if (allSelected) {
          return prev.filter((id) => !childIds.includes(id));
        } else {
          return Array.from(new Set([...prev, ...childIds]));
        }
      });
      // When elements are added to Set B, remove them from Set A
      setSetAItems((prev) => prev.filter((id) => !childIds.includes(id)));
    }
  };

  const handleRemoveSingleItem = (childId, targetSet) => {
    const isSetA = targetSet === 'A' || targetSet === 'Set A';
    if (isSetA) {
      setSetAItems((prev) => prev.filter((id) => id !== childId));
    } else {
      setSetBItems((prev) => prev.filter((id) => id !== childId));
    }
  };

  const handleRemoveGroupItems = (childIds, targetSet) => {
    const isSetA = targetSet === 'A' || targetSet === 'Set A';
    if (isSetA) {
      setSetAItems((prev) => prev.filter((id) => !childIds.includes(id)));
    } else {
      setSetBItems((prev) => prev.filter((id) => !childIds.includes(id)));
    }
  };

  const handleClearAll = (targetSet) => {
    const isSetA = targetSet === 'A' || targetSet === 'Set A';
    if (isSetA) setSetAItems([]);
    else setSetBItems([]);
  };

  const renderSetCard = (badgeColor, badgeLetter, targetSet, selfCheck, setSelfCheck, clearance, setClearance) => {
    const isSetA = targetSet === 'A' || targetSet === 'Set A';
    const setKey = isSetA ? 'A' : 'B';
    const selectedItems = isSetA ? setAItems : setBItems;
    const expandedMap = isSetA ? setAExpanded : setBExpanded;
    const setExpandedMap = isSetA ? setSetAExpanded : setSetBExpanded;
    const selectedOptionGroups = getAllOptionGroupsForSet(setKey);
    const searchQuery = setSearchQueries[setKey] || '';

    return (
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #c2c9cd',
          borderRadius: '8px',
          p: 2.5,
          backgroundColor: '#fff',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: badgeColor,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {badgeLetter}
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#1c1f21' }}>Set {badgeLetter}</Typography>
          </Box>

          <Button
            onClick={() => handleClearAll(setKey)}
            sx={{
              textTransform: 'none',
              color: '#087f6c',
              fontWeight: 600,
              fontSize: 13,
              p: 0,
              minWidth: 'auto',
              '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
            }}
          >
            Clear all
          </Button>
        </Box>

        {/* Search box trigger */}
        <TextField
          placeholder="Search or browse to add elements"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => {
            setActivePopoverSet(setKey);
            setSetSearchQueries((prev) => ({ ...prev, [setKey]: e.target.value }));
            if (activePopoverSet !== setKey) {
              handleOpenPopover(e, setKey);
            }
          }}
          onFocus={(e) => handleOpenPopover(e, setKey)}
          onClick={(e) => handleOpenPopover(e, setKey)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ fontSize: 18, color: '#8a9296', mr: 1 }} />,
            endAdornment: <ExpandMoreIcon sx={{ fontSize: 20, color: '#8a9296' }} />,
          }}
          sx={{
            mb: 2.5,
            cursor: 'text',
            '& .MuiOutlinedInput-root': {
              cursor: 'text',
              borderRadius: '6px',
              fontSize: 13,
              '& fieldset': { borderColor: '#c2c9cd' },
              '&:hover fieldset': { borderColor: '#087f6c' },
            },
            '& input': { cursor: 'text' },
          }}
        />

        {/* Content Area: Selected Elements Tree OR Empty State */}
        {selectedItems.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
            }}
          >
            <EmptySetIcon sx={{ mb: 2 }} />
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#1c1f21', mb: 0.5 }}>
              This set is empty
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#657075' }}>
              Use the search box to add elements
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
            {selectedOptionGroups.map((group) => {
              const matchingChildItems = group.children.filter((c) => selectedItems.includes(c.id));
              if (matchingChildItems.length === 0) return null;

              const isExpanded = expandedMap[group.id] !== false;
              const isGroupHovered = hoveredItemId === `${targetSet}-${group.id}`;

              return (
                <Box key={group.id} sx={{ mb: 1 }}>
                  {/* Category / Model row header */}
                  <Box
                    onMouseEnter={() => setHoveredItemId(`${targetSet}-${group.id}`)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1.25,
                      py: 0.65,
                      borderRadius: '4px',
                      my: 0.25,
                      borderBottom: '1px solid #eaedf0',
                      backgroundColor: isGroupHovered ? '#f5f5f5' : 'transparent',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <Box
                      onClick={() =>
                        setExpandedMap((prev) => ({
                          ...prev,
                          [group.id]: !isExpanded,
                        }))
                      }
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        cursor: 'pointer',
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      {isExpanded ? (
                        <KeyboardArrowUpIcon sx={{ fontSize: 18, color: '#2a3337', flexShrink: 0 }} />
                      ) : (
                        <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#2a3337', flexShrink: 0 }} />
                      )}
                      <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: '#1c1f21' }} noWrap>
                        {group.name}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      aria-label={`Remove ${group.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveGroupItems(matchingChildItems.map((item) => item.id), targetSet);
                      }}
                      sx={{
                        p: 0.4,
                        color: '#2a3337',
                        visibility: isGroupHovered ? 'visible' : 'hidden',
                        '&:hover': { color: '#d32f2f' },
                      }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>

                  {/* Child element list rows with hover trash button */}
                  <Collapse in={isExpanded}>
                    <Box sx={{ pt: 0.5, pl: 1.5 }}>
                      {matchingChildItems.map((item) => {
                        const isHovered = hoveredItemId === `${targetSet}-${item.id}`;
                        return (
                          <Box
                            key={item.id}
                            onMouseEnter={() => setHoveredItemId(`${targetSet}-${item.id}`)}
                            onMouseLeave={() => setHoveredItemId(null)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              px: 1.25,
                              py: 0.65,
                              borderRadius: '4px',
                              my: 0.25,
                              backgroundColor: isHovered ? '#f5f5f5' : 'transparent',
                              transition: 'background-color 0.15s',
                            }}
                          >
                            <Typography sx={{ fontSize: 13, color: '#263137' }}>
                              {item.name}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSingleItem(item.id, targetSet);
                              }}
                              sx={{
                                p: 0.4,
                                color: '#2a3337',
                                visibility: isHovered ? 'visible' : 'hidden',
                                '&:hover': { color: '#d32f2f' },
                              }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Box>
                        );
                      })}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Footer controls: Self check & Clearance */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 2,
            mt: 'auto',
            borderTop: selectedItems.length > 0 ? '1px solid #eaedf0' : 'none',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: 13, color: '#4a5257' }}>Self check</Typography>
            <Checkbox
              size="small"
              checked={selfCheck}
              onChange={(e) => setSelfCheck(e.target.checked)}
              sx={roundedCheckboxSx}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: 13, color: '#4a5257' }}>Clearance</Typography>
            <TextField
              size="small"
              value={clearance}
              onChange={(e) => setClearance(e.target.value)}
              sx={{
                width: 68,
                '& .MuiOutlinedInput-root': {
                  height: 30,
                  fontSize: 13,
                  borderRadius: '4px',
                  '& fieldset': { borderColor: '#c2c9cd' },
                },
                '& input': { textAlign: 'center', py: 0.5, px: 0.5 },
              }}
            />
            <Typography sx={{ fontSize: 13, color: '#4a5257' }}>inches</Typography>
          </Box>
        </Box>
      </Paper>
    );
  };

  const activePopoverSetKey = activePopoverSet || 'A';
  const activeSetSearchQuery = setSearchQueries[activePopoverSetKey] || '';
  const filteredPopoverGroups = filterOptionGroups(
    activeSetSearchQuery.trim()
      ? getAllOptionGroupsForSet(activePopoverSetKey)
      : getOptionGroupsForSet(activePopoverSetKey),
    activeSetSearchQuery
  );

  return (
    <Box sx={{ p: 0, backgroundColor: '#fff', height: '100vh', minHeight: '650px', display: 'flex', flexDirection: 'column' }}>
      {/* Top breadcrumb bar */}
      <Box className="topbar">
        <TextField select size="small" value={testInfo.iModel || 'Project name'} SelectProps={{ IconComponent: ExpandMoreIcon }} sx={{ width: 150 }}>
          <MenuItem value={testInfo.iModel || 'Project name'}>{testInfo.iModel || 'Project name'}</MenuItem>
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
          <Typography sx={{ fontSize: 12, color: '#4a5257', ml: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <span style={{ fontSize: 14 }}>+</span> Create a new test
          </Typography>
        </Box>
        <SearchIcon sx={{ ml: 'auto', mr: 1, fontSize: 20, color: '#8a9296' }} />
      </Box>

      {/* Title & Action header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1c1f21' }}>
          {testInfo.name || 'Test name'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.25 }}>
          <Button
            variant="outlined"
            size="small"
            sx={{
              textTransform: 'none',
              color: '#344046',
              borderColor: '#c2c9cd',
              borderRadius: '4px',
              fontSize: 13,
              fontWeight: 500,
              px: 1.5,
              py: 0.6,
            }}
          >
            Edit test details
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() =>
              navigate(`/clash-detection/test/${testInfo.id || 'new'}`, {
                state: {
                  ...testInfo,
                  suppressionRules,
                },
              })
            }
            sx={{
              textTransform: 'none',
              color: '#344046',
              borderColor: '#c2c9cd',
              borderRadius: '4px',
              fontSize: 13,
              fontWeight: 500,
              px: 1.5,
              py: 0.6,
            }}
          >
            Preview results
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setQuickViewOpen(true)}
            sx={{
              textTransform: 'none',
              color: '#344046',
              borderColor: '#c2c9cd',
              borderRadius: '4px',
              fontSize: 13,
              fontWeight: 500,
              px: 1.5,
              py: 0.6,
            }}
          >
            View iModel
          </Button>
        </Box>
      </Box>

      {/* Main Content Area: Set A, Set B, and Right Settings column */}
      <Box sx={{ flex: 1, px: 3, pb: 3, display: 'flex', gap: 2.5, minHeight: 0 }}>
        {/* Set A */}
        {renderSetCard('#1976d2', 'A', 'A', selfCheckA, setSelfCheckA, clearanceA, setClearanceA)}

        {/* Set B */}
        {renderSetCard('#d04a02', 'B', 'B', selfCheckB, setSelfCheckB, clearanceB, setClearanceB)}

        {/* Right Settings Column */}
        <Box sx={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Suppression settings Card */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #c2c9cd',
              borderRadius: '8px',
              p: 2.5,
              backgroundColor: '#fff',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: 15, color: '#1c1f21' }}>
                  Suppression settings
                </Typography>
                <Typography sx={{ fontSize: 13, color: '#657075', mt: 0.5 }}>
                  {suppressionRules.length} rules applied
                </Typography>
              </Box>
              <Button
                onClick={() => setSuppressionDrawerOpen(true)}
                sx={{
                  textTransform: 'none',
                  color: '#087f6c',
                  fontWeight: 600,
                  fontSize: 13,
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                }}
              >
                Manage rules
              </Button>
            </Box>
          </Paper>

          {/* Test settings Card */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #c2c9cd',
              borderRadius: '8px',
              p: 2.5,
              backgroundColor: '#fff',
            }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: 15, color: '#1c1f21', mb: 2 }}>
              Test settings
            </Typography>

            {/* Touching tolerance */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontSize: 13, color: '#4a5257' }}>Touching tolerance</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  size="small"
                  value={touchingTolerance}
                  onChange={(e) => setTouchingTolerance(e.target.value)}
                  sx={{
                    width: 68,
                    '& .MuiOutlinedInput-root': {
                      height: 30,
                      fontSize: 13,
                      borderRadius: '4px',
                      '& fieldset': { borderColor: '#c2c9cd' },
                    },
                    '& input': { textAlign: 'center', py: 0.5, px: 0.5 },
                  }}
                />
                <Typography sx={{ fontSize: 13, color: '#4a5257' }}>inches</Typography>
              </Box>
            </Box>

            {/* Calculate overlap */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: 13, color: '#4a5257' }}>Calculate overlap</Typography>
              <Checkbox
                size="small"
                checked={calculateOverlap}
                onChange={(e) => setCalculateOverlap(e.target.checked)}
                sx={roundedCheckboxSx}
              />
            </Box>

            {/* Include reference models */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: 13, color: '#4a5257' }}>Include reference models</Typography>
              <Checkbox
                size="small"
                checked={includeRefModels}
                onChange={(e) => setIncludeRefModels(e.target.checked)}
                sx={roundedCheckboxSx}
              />
            </Box>

            {/* Include non-physical elements */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontSize: 13, color: '#4a5257' }}>Include non-physical elements</Typography>
              <Checkbox
                size="small"
                checked={includeNonPhysical}
                onChange={(e) => setIncludeNonPhysical(e.target.checked)}
                sx={roundedCheckboxSx}
              />
            </Box>

            <Divider sx={{ my: 2, borderColor: '#e4e8eb' }} />

            {/* Run automatically */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 13, color: '#4a5257' }}>Run automatically</Typography>
              <Checkbox
                size="small"
                checked={runAutomatically}
                onChange={(e) => setRunAutomatically(e.target.checked)}
                sx={roundedCheckboxSx}
              />
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Bottom Footer Actions */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderTop: '1px solid #e4e8eb',
          backgroundColor: '#fff',
        }}
      >
        <Button
          variant="outlined"
          onClick={() => navigate('/clash-detection')}
          sx={{
            textTransform: 'none',
            color: '#344046',
            borderColor: '#c2c9cd',
            borderRadius: '4px',
            fontSize: 14,
            fontWeight: 500,
            px: 2,
            py: 0.7,
            '&:hover': { borderColor: '#8a9296', backgroundColor: '#f5f7f8' },
          }}
        >
          Delete test
        </Button>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() =>
              navigate('/clash-detection', {
                state: {
                  newTest: {
                    ...testInfo,
                    suppressionRules,
                  },
                },
              })
            }
            sx={{
              textTransform: 'none',
              color: '#344046',
              borderColor: '#c2c9cd',
              borderRadius: '4px',
              fontSize: 14,
              fontWeight: 500,
              px: 2.5,
              py: 0.7,
              '&:hover': { borderColor: '#8a9296', backgroundColor: '#f5f7f8' },
            }}
          >
            Save and close
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              navigate('/clash-detection', {
                state: {
                  runTestId: testInfo.id,
                  newTest: {
                    ...testInfo,
                    suppressionRules,
                  },
                },
              })
            }
            sx={{
              textTransform: 'none',
              backgroundColor: '#087f6c',
              color: '#fff',
              borderRadius: '4px',
              fontSize: 14,
              fontWeight: 500,
              px: 2.5,
              py: 0.7,
              boxShadow: 'none',
              '&:hover': { backgroundColor: '#066657', boxShadow: 'none' },
            }}
          >
            Run test
          </Button>
        </Box>
      </Box>

      {/* Elements Tree Popover (Screenshot 1) */}
      <Popover
        open={Boolean(popoverAnchorEl)}
        anchorEl={popoverAnchorEl}
        onClose={handleClosePopover}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
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
              width: 330,
              maxHeight: 460,
              borderRadius: '4px',
              border: '1px solid #c2c9cd',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              mt: 0.5,
            },
          },
        }}
      >
        {/* Popover Header Tabs */}
        <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e0e4e6', px: 1.5, pt: 1 }}>
          <Box
            onClick={() => setActiveTab('models')}
            sx={{
              pb: 0.8,
              px: 1.5,
              cursor: 'pointer',
              borderBottom: activeTab === 'models' ? '2.5px solid #087f6c' : '2.5px solid transparent',
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: activeTab === 'models' ? 600 : 400,
                color: activeTab === 'models' ? '#1c1f21' : '#657075',
              }}
            >
              Models
            </Typography>
          </Box>
          <Box
            onClick={() => setActiveTab('categories')}
            sx={{
              pb: 0.8,
              px: 1.5,
              cursor: 'pointer',
              borderBottom: activeTab === 'categories' ? '2.5px solid #087f6c' : '2.5px solid transparent',
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: activeTab === 'categories' ? 600 : 400,
                color: activeTab === 'categories' ? '#1c1f21' : '#657075',
              }}
            >
              Categories
            </Typography>
          </Box>
          <Box
            onClick={() => setActiveTab('groups')}
            sx={{
              pb: 0.8,
              px: 1.5,
              cursor: 'pointer',
              borderBottom: activeTab === 'groups' ? '2.5px solid #087f6c' : '2.5px solid transparent',
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: activeTab === 'groups' ? 600 : 400,
                color: activeTab === 'groups' ? '#1c1f21' : '#657075',
              }}
            >
              Groups
            </Typography>
          </Box>
        </Box>

        {/* Tree Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.25 }}>
          {filteredPopoverGroups.map((group) => {
            const isGroupExpanded = popoverExpanded[group.id] !== false;
            const currentSetItems = activePopoverSet === 'A' ? setAItems : setBItems;
            const childIds = group.children.map((c) => c.id);
            const selectedCount = childIds.filter((id) => currentSetItems.includes(id)).length;
            const isAllSelected = childIds.length > 0 && selectedCount === childIds.length;
            const isIndeterminate = selectedCount > 0 && selectedCount < childIds.length;

            return (
              <Box key={group.id} sx={{ mb: 0.5 }}>
                {/* Group Parent Row with Checkbox and Chevron */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    py: 0.5,
                    px: 0.5,
                    borderRadius: '4px',
                    borderBottom: '1px solid #f2f4f6',
                    '&:hover': { backgroundColor: '#f8fafb' },
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleToggleGroup(group, activePopoverSet)}
                    sx={treeCheckboxSx}
                  />
                  <Box
                    onClick={() =>
                      setPopoverExpanded((prev) => ({
                        ...prev,
                        [group.id]: !isGroupExpanded,
                      }))
                    }
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer', flex: 1 }}
                  >
                    {isGroupExpanded ? (
                      <KeyboardArrowUpIcon sx={{ fontSize: 18, color: '#3a444a' }} />
                    ) : (
                      <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#3a444a' }} />
                    )}
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1c1f21' }}>
                      {group.name}
                    </Typography>
                  </Box>
                </Box>

                {/* Children rows with checkboxes */}
                <Collapse in={isGroupExpanded}>
                  <Box sx={{ pl: 4, pt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    {group.children.map((child) => {
                      const isChildChecked = currentSetItems.includes(child.id);
                      return (
                        <Box
                          key={child.id}
                          onClick={() => handleToggleSingleElement(child.id, activePopoverSet)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            py: 0.35,
                            px: 0.5,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: '#f0f4f7' },
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isChildChecked}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => handleToggleSingleElement(child.id, activePopoverSet)}
                            sx={treeCheckboxSx}
                          />
                          <Typography sx={{ fontSize: 12.5, color: '#2a3337' }}>
                            {child.name}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
          {filteredPopoverGroups.length === 0 && (
            <Typography sx={{ px: 1, py: 2, fontSize: 13, color: '#657075' }}>
              No matching elements
            </Typography>
          )}
        </Box>
      </Popover>

      {/* iModel Quick View Modal matching screenshot */}
      <IModelQuickViewModal
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        modelName={testInfo.iModel || 'Roberto Clemente Bridge'}
        selectedSetA={setAItems}
        selectedSetB={setBItems}
      />

      {/* Suppression Rules Drawer matching Screenshots 1-6 */}
      <SuppressionRulesDrawer
        open={suppressionDrawerOpen}
        onClose={() => setSuppressionDrawerOpen(false)}
        rules={suppressionRules}
        testName={testInfo.name || 'AR vs PH'}
        onSaveRule={(newRule) => {
          setSuppressionRules((prev) => [newRule, ...prev]);
        }}
        onDeleteRule={(ruleId) => {
          setSuppressionRules((prev) => prev.filter((r) => r.id !== ruleId));
        }}
      />

      {/* 3D iModel & Results Viewer Modal */}
      <IModelViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        modelName={testInfo.iModel || 'Roberto Clemente Bridge'}
        selectedSetA={setAItems}
        selectedSetB={setBItems}
        onSelectElement={(elementName, setBadge) => {
          // Find matching child id or add directly
          const isA = setBadge === 'A';
          const newId = elementName.toLowerCase().replace(/[^a-z0-9]/g, '_');
          if (isA) {
            setSetAItems((prev) => Array.from(new Set([...prev, newId])));
            setSetBItems((prev) => prev.filter((id) => id !== newId));
          } else {
            setSetBItems((prev) => Array.from(new Set([...prev, newId])));
            setSetAItems((prev) => prev.filter((id) => id !== newId));
          }
        }}
      />
    </Box>
  );
};

export default CreateClashTest;

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Divider,
  IconButton,
  Link,
  Menu,
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

// Hierarchical element tree matching the Models tab in the design
export const MODEL_ELEMENTS_TREE = [
  {
    id: 'drainage',
    name: 'DrainageRegion01',
    defaultExpanded: false,
    children: [
      { id: 'dr_pipes', name: 'DR_Pipes' },
      { id: 'dr_manholes', name: 'DR_Manholes' },
      { id: 'dr_catchbasins', name: 'DR_CatchBasins' },
      { id: 'dr_outfalls', name: 'DR_Outfalls' },
    ],
  },
  {
    id: 'geom_align',
    name: 'Geometry_Project_Align',
    defaultExpanded: false,
    children: [
      { id: 'align_base', name: 'Align_Baseline' },
      { id: 'align_center', name: 'Align_Centerline' },
      { id: 'align_prof', name: 'Align_Profile' },
      { id: 'align_superelev', name: 'Align_Superelevation' },
    ],
  },
  {
    id: 'i95_geom',
    name: 'I-95_Geometry',
    defaultExpanded: true,
    children: [
      { id: 'e_road_edge', name: 'E_Road_EdgeOfPavement' },
      { id: 'e_road_lane', name: 'E_Road_LaneEdge' },
      { id: 'e_road_shoulder', name: 'E_Road_Shoulder' },
      { id: 'e_terrain_break', name: 'E_Terrain_Breakline' },
      { id: 'default_item', name: 'Default' },
      { id: 'matchline', name: 'Matchline' },
      { id: 'geom_civil_cell', name: 'Geom_Civil_Cell_Control' },
      { id: 'ref_i95_median', name: 'Ref, I95_Median Crossover' },
      { id: 'z_construction', name: 'z_Construction' },
      { id: 'i95_median_cross', name: 'I95_MedianCrossover' },
    ],
  },
];

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
  const testInfo = location.state || { name: 'Test name', iModel: 'Parkway', description: '' };

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

  // Hovered item for trash icon display
  const [hoveredItemId, setHoveredItemId] = useState(null);

  // Remove menu state
  const [removeAnchorEl, setRemoveAnchorEl] = useState(null);
  const [removeTargetSet, setRemoveTargetSet] = useState(null);

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

  const handleClearAll = (targetSet) => {
    const isSetA = targetSet === 'A' || targetSet === 'Set A';
    if (isSetA) setSetAItems([]);
    else setSetBItems([]);
    setRemoveAnchorEl(null);
  };

  const renderSetCard = (badgeColor, badgeLetter, targetSet, selfCheck, setSelfCheck, clearance, setClearance) => {
    const isSetA = targetSet === 'A' || targetSet === 'Set A';
    const setKey = isSetA ? 'A' : 'B';
    const selectedItems = isSetA ? setAItems : setBItems;
    const expandedMap = isSetA ? setAExpanded : setBExpanded;
    const setExpandedMap = isSetA ? setSetAExpanded : setSetBExpanded;

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

          {selectedItems.length > 0 ? (
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => {
                setRemoveTargetSet(setKey);
                setRemoveAnchorEl(e.currentTarget);
              }}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#4a555b' }} />}
              sx={{
                textTransform: 'none',
                color: '#1c1f21',
                borderColor: '#c2c9cd',
                borderRadius: '4px',
                fontSize: 13,
                fontWeight: 400,
                px: 1.25,
                py: 0.25,
                height: 28,
                '&:hover': { borderColor: '#8a9499', backgroundColor: '#f5f7f8' },
              }}
            >
              Remove
            </Button>
          ) : (
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
          )}
        </Box>

        {/* Search box trigger */}
        <TextField
          placeholder="Search or browse to add elements"
          size="small"
          fullWidth
          onClick={(e) => handleOpenPopover(e, setKey)}
          InputProps={{
            readOnly: true,
            startAdornment: <SearchIcon sx={{ fontSize: 18, color: '#8a9296', mr: 1 }} />,
            endAdornment: <ExpandMoreIcon sx={{ fontSize: 20, color: '#8a9296' }} />,
          }}
          sx={{
            mb: 2.5,
            cursor: 'pointer',
            '& .MuiOutlinedInput-root': {
              cursor: 'pointer',
              borderRadius: '6px',
              fontSize: 13,
              '& fieldset': { borderColor: '#c2c9cd' },
              '&:hover fieldset': { borderColor: '#087f6c' },
            },
            '& input': { cursor: 'pointer' },
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
            {MODEL_ELEMENTS_TREE.map((group) => {
              const matchingChildItems = group.children.filter((c) => selectedItems.includes(c.id));
              if (matchingChildItems.length === 0) return null;

              const isExpanded = expandedMap[group.id] !== false;

              return (
                <Box key={group.id} sx={{ mb: 1 }}>
                  {/* Category / Model row header */}
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
                      py: 0.75,
                      px: 0.5,
                      cursor: 'pointer',
                      borderBottom: '1px solid #eaedf0',
                      '&:hover': { backgroundColor: '#f8fafb' },
                    }}
                  >
                    {isExpanded ? (
                      <KeyboardArrowUpIcon sx={{ fontSize: 18, color: '#2a3337' }} />
                    ) : (
                      <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#2a3337' }} />
                    )}
                    <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: '#1c1f21' }}>
                      {group.name}
                    </Typography>
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
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', pb: 0.8 }}>
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: activePopoverSet === 'A' ? '#1976d2' : '#d04a02',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
                mr: 0.5,
              }}
            >
              {activePopoverSet || 'A'}
            </Box>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: activePopoverSet === 'A' ? '#1976d2' : '#d04a02' }}>
              Set {activePopoverSet || 'A'}
            </Typography>
          </Box>
        </Box>

        {/* Tree Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.25 }}>
          {MODEL_ELEMENTS_TREE.map((group) => {
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
        </Box>
      </Popover>

      {/* Remove Dropdown Menu */}
      <Menu
        anchorEl={removeAnchorEl}
        open={Boolean(removeAnchorEl)}
        onClose={() => setRemoveAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 150,
              borderRadius: '4px',
              border: '1px solid #c2c9cd',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
          },
        }}
      >
        <MenuItem
          onClick={() => handleClearAll(removeTargetSet)}
          sx={{ fontSize: 13, py: 1, color: '#c62839' }}
        >
          Remove all items
        </MenuItem>
      </Menu>

      {/* iModel Quick View Modal matching screenshot */}
      <IModelQuickViewModal
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        modelName={testInfo.iModel || 'Parkway'}
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
        modelName={testInfo.iModel || 'Tied Arch Bridge'}
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

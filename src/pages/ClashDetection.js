import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Checkbox,
  Chip,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Snackbar,
  SvgIcon,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { ClashIcon } from '../components/Sidebar';
import { getStoredTests, saveStoredTests } from '../data/clashTestsStore';

// Toolbar action icons matching the design specification: Import, Export, Download
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

const ExportActionIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M7 13.5L5.2 18a1.5 1.5 0 0 0 1.4 2h10.8a1.5 1.5 0 0 0 1.4-2L17 13.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 4.5v10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M8 8.5l4-4 4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);

const DownloadActionIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M5.5 16.5v1a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 4.5v10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M8 10.5l4 4 4-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
);

const ClashDetection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tests, setTests] = useState(() => getStoredTests());

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);
  const [runningTests, setRunningTests] = useState([]);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    description: true,
    iModel: true,
    active: true,
    total: true,
    lastRun: true,
    tag: true,
    creationDate: false,
    createdBy: false,
    iModelVersion: false,
  });

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuRowId, setMenuRowId] = useState(null);

  // Dialog & Notification states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [targetDeleteIds, setTargetDeleteIds] = useState([]);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [targetStopIds, setTargetStopIds] = useState([]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', description: '', iModel: '', tag: '' });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [deletedBackup, setDeletedBackup] = useState(null);

  const showToast = (msg) => setToastMessage(msg);

  const openRowMenu = (event, testId) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuRowId(testId);
  };
  const closeRowMenu = () => {
    setMenuAnchor(null);
    setMenuRowId(null);
  };

  const currentMenuTest = tests.find((t) => t.id === menuRowId);

  // Actions
  const handleStartTests = (ids) => {
    if (!ids || ids.length === 0) return;
    setRunningTests((prev) => Array.from(new Set([...prev, ...ids])));
    showToast(`${ids.length} test${ids.length > 1 ? 's' : ''} in progress`);

    setTimeout(() => {
      setRunningTests((currentRunning) => {
        const stillRunning = ids.filter((id) => currentRunning.includes(id));
        if (stillRunning.length === 0) return currentRunning;

        setTests((prevTests) => {
          const updatedTests = prevTests.map((t) => {
            if (!stillRunning.includes(t.id)) return t;
            const activeVal = Math.floor(Math.random() * 2500) + 400;
            const totalVal = activeVal + Math.floor(Math.random() * 1200) + 120;
            return {
              ...t,
              active: String(activeVal),
              total: String(totalVal),
              lastRun: 'Just now',
            };
          });
          saveStoredTests(updatedTests);
          return updatedTests;
        });
        showToast(`${stillRunning.length} test${stillRunning.length > 1 ? 's' : ''} completed — results found`);
        return currentRunning.filter((id) => !stillRunning.includes(id));
      });
    }, 5000);
  };

  useEffect(() => {
    if (location.state?.newTest) {
      setTests((prev) => {
        if (prev.some((t) => t.id === location.state.newTest.id)) return prev;
        const next = [location.state.newTest, ...prev];
        saveStoredTests(next);
        return next;
      });
    }
    if (location.state?.runTestId) {
      handleStartTests([location.state.runTestId]);
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handlePromptStopTests = (ids) => {
    setTargetStopIds(ids);
    setStopDialogOpen(true);
  };

  const confirmStopTests = () => {
    setRunningTests((prev) => prev.filter((id) => !targetStopIds.includes(id)));
    setStopDialogOpen(false);
    showToast(`Stopped ${targetStopIds.length} test${targetStopIds.length > 1 ? 's' : ''}`);
    setTargetStopIds([]);
  };

  const handlePromptDelete = (ids) => {
    setTargetDeleteIds(ids);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    const deletedItems = tests.filter((t) => targetDeleteIds.includes(t.id));
    setDeletedBackup(deletedItems);
    const remaining = tests.filter((t) => !targetDeleteIds.includes(t.id));
    setTests(remaining);
    saveStoredTests(remaining);
    setSelectedTests((prev) => prev.filter((id) => !targetDeleteIds.includes(id)));
    setRunningTests((prev) => prev.filter((id) => !targetDeleteIds.includes(id)));
    setDeleteDialogOpen(false);
    showToast(`${targetDeleteIds.length} test${targetDeleteIds.length > 1 ? 's' : ''} deleted`);
    setTargetDeleteIds([]);
  };

  const handleUndoDelete = () => {
    if (deletedBackup && deletedBackup.length > 0) {
      const restored = [...deletedBackup, ...tests];
      setTests(restored);
      saveStoredTests(restored);
      setDeletedBackup(null);
      setToastMessage('');
    }
  };

  const handleDuplicate = (test) => {
    if (!test) return;
    const newTest = {
      ...test,
      id: Date.now(),
      name: `${test.name} (Copy)`,
      lastRun: 'Just now',
    };
    const updated = [newTest, ...tests];
    setTests(updated);
    saveStoredTests(updated);
    showToast(`Duplicated ${test.name}`);
  };

  const handleEditClick = (test) => {
    if (!test) return;
    setEditFormData({ id: test.id, name: test.name, description: test.description, iModel: test.iModel, tag: test.tag || '' });
    setEditFormErrors({});
    setEditDialogOpen(true);
  };

  const saveEdit = () => {
    if (!editFormData.name || !editFormData.name.trim()) {
      setEditFormErrors({ name: 'Test name is required' });
      return;
    }
    setEditFormErrors({});
    if (editFormData.id) {
      const updated = tests.map((t) =>
        t.id === editFormData.id
          ? {
              ...t,
              name: editFormData.name.trim(),
              description: editFormData.description ? editFormData.description.trim() : '',
              iModel: editFormData.iModel || 'Roberto Clemente Bridge',
              tag: editFormData.tag || t.tag,
            }
          : t
      );
      setTests(updated);
      saveStoredTests(updated);
      showToast(`Updated ${editFormData.name.trim()}`);
    } else {
      const created = {
        id: Date.now(),
        name: editFormData.name.trim(),
        description: editFormData.description ? editFormData.description.trim() : '',
        iModel: editFormData.iModel || 'Roberto Clemente Bridge',
        active: '0',
        total: '0',
        lastRun: 'Never',
        tag: editFormData.tag || 'WP03',
        createdBy: 'Jeanlouise Hornberger',
        lastRunDate: '02 April 2026',
      };
      const updated = [created, ...tests];
      setTests(updated);
      saveStoredTests(updated);
      setEditDialogOpen(false);
      navigate('/clash-detection/new', { state: created });
      return;
    }
    setEditDialogOpen(false);
  };

  const toggleColumn = (key) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filters = ['All', 'Roberto Clemente Bridge', 'Liberty Bridge', 'PPG Place'];

  const filteredTests = tests.filter((test) => {
    const matchesFilter = selectedFilter === 'All' || test.iModel === selectedFilter;
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleToggleTest = (testId) => {
    setSelectedTests((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    );
  };

  const allSelected = filteredTests.length > 0 && filteredTests.every((t) => selectedTests.includes(t.id));
  const toggleAll = () => setSelectedTests(allSelected ? [] : filteredTests.map((t) => t.id));

  const checkboxSx = {
    p: 0.5,
    color: '#9fb8ae',
    '& .MuiSvgIcon-root': { fontSize: 18, backgroundColor: '#eef7f3', borderRadius: '4px' },
    '&.Mui-checked': { color: '#087f6c' },
  };

  const toolbarGroups = [
    [
      { icon: PlayArrowOutlinedIcon, label: 'Run', onClick: () => handleStartTests(selectedTests.length > 0 ? selectedTests : (filteredTests[0] ? [filteredTests[0].id] : [])) },
      { icon: CropSquareIcon, label: 'Stop', onClick: () => handlePromptStopTests(selectedTests.length > 0 ? selectedTests : runningTests.slice(0, 2)) },
    ],
    [
      { icon: EditOutlinedIcon, label: 'Edit', onClick: () => handleEditClick(tests.find((t) => selectedTests.includes(t.id)) || tests[0]) },
      { icon: ContentCopyOutlinedIcon, label: 'Duplicate', onClick: () => handleDuplicate(tests.find((t) => selectedTests.includes(t.id)) || tests[0]) },
      { icon: DeleteOutlineIcon, label: 'Delete', onClick: () => handlePromptDelete(selectedTests.length > 0 ? selectedTests : (tests[0] ? [tests[0].id] : [])) },
    ],
    [
      { icon: ImportActionIcon, label: 'Import', onClick: () => setImportDialogOpen(true) },
      { icon: ExportActionIcon, label: 'Export', onClick: () => setExportDialogOpen(true) },
      { icon: DownloadActionIcon, label: 'Download', onClick: () => showToast('Downloaded results table (Excel)') },
    ],
  ];

  return (
    <Box className="dashboard-page" sx={{ p: 0, backgroundColor: '#fff', minHeight: '100vh' }}>
      {/* Top bar */}
      <Box className="topbar">
        <TextField select size="small" value="Project name" SelectProps={{ IconComponent: ExpandMoreIcon }} sx={{ width: 150 }}>
          <MenuItem value="Project name">Project name</MenuItem>
        </TextField>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 1 }}>
          <ClashIcon sx={{ fontSize: 16, color: '#536066' }} />
          <Link underline="always" color="text.primary" href="#" sx={{ fontSize: 12 }}>Clash Detection</Link>
          <Typography sx={{ fontSize: 12, color: '#8a9296', ml: 0.5 }}>/</Typography>
        </Box>
        <SearchIcon sx={{ ml: 'auto', mr: 1, fontSize: 20, color: '#8a9296' }} />
      </Box>

      {/* Page heading */}
      <Box className="canvas-heading" sx={{ borderBottom: '1px solid #c6cdd0 !important' }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>Clash Detection</Typography>
      </Box>

      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 101px)' }}>
        {/* iModels panel */}
        <Box sx={{ width: 176, flexShrink: 0, borderRight: '1px solid #c6cdd0', pt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, px: 2, mb: 1 }}>iModels</Typography>
          <List sx={{ p: 0 }}>
            {filters.map((filter) => (
              <ListItem key={filter} disablePadding>
                <ListItemButton
                  selected={selectedFilter === filter}
                  onClick={() => setSelectedFilter(filter)}
                  sx={{
                    py: 0.75,
                    px: 2,
                    borderBottom: selectedFilter === filter ? '2px solid #087f6c' : '2px solid transparent',
                    '&.Mui-selected': { backgroundColor: 'transparent' },
                    '&:hover': { backgroundColor: '#f0f4f3' },
                  }}
                >
                  <ListItemText
                    primaryTypographyProps={{ fontSize: 13, fontWeight: selectedFilter === filter ? 600 : 400, noWrap: true }}
                    primary={filter}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Main content */}
        <Box sx={{ flex: 1, p: 2, minWidth: 0 }}>
          {/* Toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setEditFormData({ id: null, name: '', description: '', iModel: '', tag: '' });
                setEditFormErrors({});
                setEditDialogOpen(true);
              }}
              sx={{ backgroundColor: '#087f6c', textTransform: 'none', borderRadius: '3px', '&:hover': { backgroundColor: '#066657' } }}
            >
              Create a test
            </Button>
            {toolbarGroups.map((group, groupIndex) => (
              <Box key={groupIndex} sx={{ display: 'flex', border: '1px solid #c6cdd0', borderRadius: '3px' }}>
                {group.map((item, iconIndex) => {
                  const Icon = item.icon;
                  return (
                    <IconButton
                      key={item.label}
                      title={item.label}
                      size="small"
                      onClick={item.onClick}
                      sx={{ borderRadius: 0, borderLeft: iconIndex > 0 ? '1px solid #c6cdd0' : 'none', color: '#536066', px: 1 }}
                    >
                      <Icon sx={{ fontSize: 18 }} />
                    </IconButton>
                  );
                })}
              </Box>
            ))}
            <IconButton title="Refresh" size="small" onClick={() => showToast('Refreshed tests')} sx={{ color: '#536066' }}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <TextField
              placeholder="Find a test"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#8a9296' }} /></InputAdornment> }}
              sx={{ ml: 'auto', width: 260, '& .MuiInputBase-root': { fontSize: 13 } }}
            />
          </Box>

          {/* Table */}
          <TableContainer>
            <Table size="small" sx={{ '& .MuiTableCell-root': { fontSize: 13, borderBottom: '1px solid #dfe4e7', py: 1 } }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox sx={checkboxSx} checked={allSelected} onChange={toggleAll} />
                  </TableCell>
                  {visibleColumns.name && <TableCell sx={{ fontWeight: 700 }}>Test name</TableCell>}
                  {visibleColumns.description && <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>}
                  {visibleColumns.iModel && <TableCell sx={{ fontWeight: 700 }}>iModel</TableCell>}
                  {visibleColumns.active && <TableCell sx={{ fontWeight: 700 }} align="right">Active</TableCell>}
                  {visibleColumns.total && <TableCell sx={{ fontWeight: 700 }} align="right">Total</TableCell>}
                  {visibleColumns.lastRun && <TableCell sx={{ fontWeight: 700 }}>Last run</TableCell>}
                  {visibleColumns.tag && <TableCell sx={{ fontWeight: 700 }}>Tag</TableCell>}
                  {visibleColumns.creationDate && <TableCell sx={{ fontWeight: 700 }}>Creation date</TableCell>}
                  {visibleColumns.createdBy && <TableCell sx={{ fontWeight: 700 }}>Created by</TableCell>}
                  {visibleColumns.iModelVersion && <TableCell sx={{ fontWeight: 700 }}>iModel version</TableCell>}
                  <TableCell align="right" sx={{ width: 40 }}>
                    <IconButton
                      size="small"
                      title="Column settings"
                      onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
                      sx={{ color: '#536066' }}
                    >
                      <ViewWeekOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTests.map((test) => {
                  const isRunning = runningTests.includes(test.id);
                  return (
                    <TableRow
                      key={test.id}
                      hover
                      selected={menuRowId === test.id}
                      onClick={() => navigate(`/clash-detection/test/${test.id}`, { state: test })}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: selectedTests.includes(test.id) ? '#eef7f3' : 'transparent',
                        '&:hover .row-menu': { visibility: 'visible' },
                        '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                        ...(menuRowId === test.id && { '& .row-menu': { visibility: 'visible' } }),
                      }}
                    >
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox sx={checkboxSx} checked={selectedTests.includes(test.id)} onChange={() => handleToggleTest(test.id)} />
                      </TableCell>
                      {visibleColumns.name && <TableCell>{test.name}</TableCell>}
                      {visibleColumns.description && <TableCell>{test.description}</TableCell>}
                      {visibleColumns.iModel && <TableCell sx={{ maxWidth: 130 }}><Typography noWrap sx={{ fontSize: 13 }}>{test.iModel}</Typography></TableCell>}
                      {visibleColumns.active && <TableCell align="right">{test.active}</TableCell>}
                      {visibleColumns.total && <TableCell align="right">{test.total}</TableCell>}
                      {visibleColumns.lastRun && <TableCell>{test.lastRun}</TableCell>}
                      {visibleColumns.tag && (
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label={test.tag} size="small" variant="outlined" sx={{ fontSize: 12, height: 22 }} />
                            {isRunning && (
                              <CircularProgress
                                size={14}
                                thickness={5}
                                sx={{ color: '#087f6c' }}
                              />
                            )}
                          </Box>
                        </TableCell>
                      )}
                      {visibleColumns.creationDate && <TableCell>12 Jan 2026</TableCell>}
                      {visibleColumns.createdBy && <TableCell>J. Doe</TableCell>}
                      {visibleColumns.iModelVersion && <TableCell>v2.4</TableCell>}
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <IconButton className="row-menu" size="small" onClick={(event) => openRowMenu(event, test.id)} sx={{ visibility: 'hidden', color: '#536066' }}><MoreVertIcon sx={{ fontSize: 16 }} /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Row Context Menu */}
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={closeRowMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { minWidth: 260, borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.16)' } } }}
          >
            <MenuItem
              onClick={() => {
                const id = menuRowId;
                closeRowMenu();
                if (id) handleStartTests([id]);
              }}
              sx={{ py: 1 }}
            >
              <ListItemIcon sx={{ color: '#536066' }}><PlayArrowOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary="Start test" secondary="Run this clash test" primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }} secondaryTypographyProps={{ fontSize: 11 }} />
            </MenuItem>
            <MenuItem
              onClick={() => {
                const id = menuRowId;
                closeRowMenu();
                if (id) handlePromptStopTests([id]);
              }}
              sx={{ py: 1 }}
            >
              <ListItemIcon sx={{ color: '#536066' }}><CropSquareIcon sx={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary="Stop test" secondary="Ends a run that is in progress" primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }} secondaryTypographyProps={{ fontSize: 11 }} />
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                const test = currentMenuTest;
                closeRowMenu();
                if (test) handleEditClick(test);
              }}
              sx={{ py: 1 }}
            >
              <ListItemIcon sx={{ color: '#536066' }}><EditOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary="Edit test settings" secondary="Alter test settings" primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }} secondaryTypographyProps={{ fontSize: 11 }} />
            </MenuItem>
            <MenuItem
              onClick={() => {
                const test = currentMenuTest;
                closeRowMenu();
                if (test) handleDuplicate(test);
              }}
              sx={{ py: 1 }}
            >
              <ListItemIcon sx={{ color: '#536066' }}><ContentCopyOutlinedIcon sx={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary="Duplicate test" secondary="Create a new test with same settings" primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }} secondaryTypographyProps={{ fontSize: 11 }} />
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                closeRowMenu();
                setExportDialogOpen(true);
              }}
              sx={{ py: 1 }}
            >
              <ListItemIcon sx={{ color: '#536066' }}><ExportActionIcon sx={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary="Export test" secondary="Save a version of the test to device" primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }} secondaryTypographyProps={{ fontSize: 11 }} />
            </MenuItem>
            <MenuItem
              onClick={() => {
                closeRowMenu();
                showToast(`Downloaded results table for ${currentMenuTest ? currentMenuTest.name : 'test'} (Excel)`);
              }}
              sx={{ py: 1 }}
            >
              <ListItemIcon sx={{ color: '#536066' }}><DownloadActionIcon sx={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary="Download results" secondary="Exports results table as Excel file" primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }} secondaryTypographyProps={{ fontSize: 11 }} />
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                const id = menuRowId;
                closeRowMenu();
                if (id) handlePromptDelete([id]);
              }}
              sx={{ py: 1, color: '#c62839', backgroundColor: '#fdf1f2', '&:hover': { backgroundColor: '#fae3e5' } }}
            >
              <ListItemIcon sx={{ color: '#c62839' }}><DeleteOutlineIcon sx={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary="Delete test" secondary="Eliminate test and all associated data" primaryTypographyProps={{ fontSize: 13, fontWeight: 600, color: '#c62839' }} secondaryTypographyProps={{ fontSize: 11, color: '#c62839' }} />
            </MenuItem>
          </Menu>

          {/* Column Visibility Menu */}
          <Menu
            anchorEl={columnMenuAnchor}
            open={Boolean(columnMenuAnchor)}
            onClose={() => setColumnMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { width: 190, p: 0.5, borderRadius: 1.5 } } }}
          >
            {[
              ['name', 'Test name'],
              ['description', 'Description'],
              ['iModel', 'iModel'],
              ['active', 'Active clashes'],
              ['total', 'Total clashes'],
              ['lastRun', 'Last run'],
              ['tag', 'Tag'],
              ['creationDate', 'Creation date'],
              ['createdBy', 'Created by'],
              ['iModelVersion', 'iModel version'],
            ].map(([key, label]) => (
              <MenuItem key={key} dense onClick={() => toggleColumn(key)} sx={{ fontSize: 13, py: 0.5 }}>
                <Checkbox
                  size="small"
                  checked={Boolean(visibleColumns[key])}
                  sx={{ p: 0.5, mr: 1, color: '#9fb8ae', '&.Mui-checked': { color: '#087f6c' } }}
                />
                <ListItemText primary={label} primaryTypographyProps={{ fontSize: 13 }} />
              </MenuItem>
            ))}
          </Menu>

          {/* Delete confirmation dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
          >
            <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>
              {targetDeleteIds.length > 1 ? `Delete ${targetDeleteIds.length} tests?` : 'Delete this test?'}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary">
                Are you sure you want to delete {targetDeleteIds.length > 1 ? 'these tests' : 'this test'}? All data will be lost and cannot be recovered. This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setDeleteDialogOpen(false)}
                sx={{ textTransform: 'none', color: '#536066', borderColor: '#c6cdd0' }}
              >
                Keep test
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={confirmDelete}
                sx={{ textTransform: 'none', backgroundColor: '#d0431a', '&:hover': { backgroundColor: '#b73814' } }}
              >
                Delete test
              </Button>
            </DialogActions>
          </Dialog>

          {/* Stop confirmation dialog */}
          <Dialog
            open={stopDialogOpen}
            onClose={() => setStopDialogOpen(false)}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
          >
            <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>
              {targetStopIds.length > 1 ? `Stop running ${targetStopIds.length} tests?` : 'Stop running this test?'}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary">
                Are you sure you want to stop {targetStopIds.length > 1 ? 'these tests' : 'this test'}? All data will be lost and cannot be recovered. This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setStopDialogOpen(false)}
                sx={{ textTransform: 'none', color: '#536066', borderColor: '#c6cdd0' }}
              >
                Continue running test
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={confirmStopTests}
                sx={{ textTransform: 'none', backgroundColor: '#d0431a', '&:hover': { backgroundColor: '#b73814' } }}
              >
                Stop test
              </Button>
            </DialogActions>
          </Dialog>

          {/* Export tests dialog */}
          <Dialog
            open={exportDialogOpen}
            onClose={() => setExportDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
          >
            <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>
              Export {selectedTests.length > 0 ? selectedTests.length : 3} tests
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                All tests will be exported as individual CSV files.
              </Typography>
              <List sx={{ p: 0 }}>
                {(selectedTests.length > 0
                  ? tests.filter((t) => selectedTests.includes(t.id))
                  : tests.slice(0, 3)
                ).map((item) => (
                  <ListItem key={item.id} sx={{ px: 0, py: 1.25 }}>
                    <ListItemIcon sx={{ minWidth: 36, color: '#536066' }}>
                      <ClashIcon sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      secondary={item.iModel}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                      secondaryTypographyProps={{ fontSize: 12, color: 'text.secondary' }}
                    />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setExportDialogOpen(false)}
                sx={{ textTransform: 'none', color: '#536066', borderColor: '#c6cdd0' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setExportDialogOpen(false);
                  showToast('Export completed (CSV files generated)');
                }}
                sx={{ textTransform: 'none', backgroundColor: '#087f6c', '&:hover': { backgroundColor: '#066657' } }}
              >
                Export tests
              </Button>
            </DialogActions>
          </Dialog>

          {/* Import tests dialog */}
          <Dialog
            open={importDialogOpen}
            onClose={() => setImportDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
          >
            <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>Import Clash Tests</DialogTitle>
            <DialogContent>
              <Box
                sx={{
                  border: '1.5px dashed #b9c1c5',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: '#fafbfc',
                  mb: 3,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f0f5f3', borderColor: '#087f6c' },
                }}
                onClick={() => showToast('File selector opened')}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: '#607274',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1.5,
                  }}
                >
                  <CloudUploadOutlinedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  <Link href="#" underline="always" sx={{ color: '#087f6c', mr: 0.5 }}>Link</Link>
                  or drag and drop
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  CSV (max. 3MB)
                </Typography>
              </Box>

              {/* Upload items list */}
              <List sx={{ p: 0 }}>
                <ListItem
                  sx={{ px: 0, py: 1 }}
                  secondaryAction={
                    <IconButton edge="end" size="small"><DeleteOutlineIcon sx={{ fontSize: 18, color: '#8a9296' }} /></IconButton>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    <Box sx={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: '#607274', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <InsertDriveFileOutlinedIcon sx={{ fontSize: 18 }} />
                    </Box>
                  </ListItemIcon>
                  <Box sx={{ flex: 1, pr: 2 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>document_file_name.csv</Typography>
                    <Typography sx={{ fontSize: 11, color: '#8a9296', mb: 0.5 }}>100kb • Loading</Typography>
                    <LinearProgress variant="determinate" value={45} sx={{ height: 3, borderRadius: 2, backgroundColor: '#dfe4e7', '& .MuiLinearProgress-bar': { backgroundColor: '#087f6c' } }} />
                  </Box>
                </ListItem>

                <ListItem
                  sx={{ px: 0, py: 1 }}
                  secondaryAction={
                    <IconButton edge="end" size="small"><DeleteOutlineIcon sx={{ fontSize: 18, color: '#8a9296' }} /></IconButton>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    <Box sx={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: '#607274', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
                    </Box>
                  </ListItemIcon>
                  <Box sx={{ flex: 1, pr: 2 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>document_file_name.csv</Typography>
                    <Typography sx={{ fontSize: 11, color: '#8a9296', mb: 0.5 }}>100kb • Complete</Typography>
                    <LinearProgress variant="determinate" value={100} sx={{ height: 3, borderRadius: 2, backgroundColor: '#dfe4e7', '& .MuiLinearProgress-bar': { backgroundColor: '#087f6c' } }} />
                  </Box>
                </ListItem>

                <ListItem
                  sx={{ px: 0, py: 1 }}
                  secondaryAction={
                    <IconButton edge="end" size="small"><DeleteOutlineIcon sx={{ fontSize: 18, color: '#8a9296' }} /></IconButton>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    <Box sx={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: '#607274', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <CloseIcon sx={{ fontSize: 18 }} />
                    </Box>
                  </ListItemIcon>
                  <Box sx={{ flex: 1, pr: 2 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#c62839' }}>Upload failed.</Typography>
                    <Typography sx={{ fontSize: 11, color: '#c62839', mb: 0.5 }}>File too large • Failed</Typography>
                    <LinearProgress variant="determinate" value={100} sx={{ height: 3, borderRadius: 2, backgroundColor: '#fce4e4', '& .MuiLinearProgress-bar': { backgroundColor: '#e57373' } }} />
                  </Box>
                </ListItem>
              </List>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setImportDialogOpen(false)}
                sx={{ textTransform: 'none', color: '#536066', borderColor: '#c6cdd0' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setImportDialogOpen(false);
                  showToast('Import completed: tests added to table');
                }}
                sx={{ textTransform: 'none', backgroundColor: '#087f6c', '&:hover': { backgroundColor: '#066657' } }}
              >
                Import tests
              </Button>
            </DialogActions>
          </Dialog>

          {/* Edit / Create dialog (matches Create a clash test popover) */}
          <Dialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '16px',
                p: '8px 12px 14px 12px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
              },
            }}
          >
            <DialogTitle sx={{ fontWeight: 500, fontSize: '1.35rem', px: 2, pt: 2, pb: 1, color: '#1c1f21' }}>
              {editFormData.id ? 'Edit a clash test' : 'Create a clash test'}
            </DialogTitle>
            <DialogContent sx={{ px: 2, pt: 1, pb: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                {/* Test name */}
                <Box>
                  <Typography sx={{ fontSize: 13, color: '#4a5257', mb: 0.75, fontWeight: 500 }}>
                    Test name<span style={{ color: '#d32f2f' }}>*</span>
                  </Typography>
                  <TextField
                    placeholder="Name this test"
                    size="small"
                    value={editFormData.name}
                    error={Boolean(editFormErrors.name)}
                    helperText={editFormErrors.name}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, name: e.target.value });
                      if (editFormErrors.name) setEditFormErrors({ ...editFormErrors, name: '' });
                    }}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '6px',
                        backgroundColor: '#fff',
                        fontSize: 14,
                        '& fieldset': { borderColor: '#c2c9cd' },
                        '&:hover fieldset': { borderColor: '#8a9499' },
                        '&.Mui-focused fieldset': { borderColor: '#087f6c' },
                      },
                    }}
                  />
                </Box>

                {/* Description */}
                <Box>
                  <Typography sx={{ fontSize: 13, color: '#4a5257', mb: 0.75, fontWeight: 500 }}>
                    Description
                  </Typography>
                  <TextField
                    placeholder="What is this test for?"
                    size="small"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '6px',
                        backgroundColor: '#fff',
                        fontSize: 14,
                        '& fieldset': { borderColor: '#c2c9cd' },
                        '&:hover fieldset': { borderColor: '#8a9499' },
                        '&.Mui-focused fieldset': { borderColor: '#087f6c' },
                      },
                    }}
                  />
                </Box>

                {/* iModel dropdown */}
                <Box>
                  <Typography sx={{ fontSize: 13, color: '#4a5257', mb: 0.75, fontWeight: 500 }}>
                    iModel
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={editFormData.iModel}
                    onChange={(e) => setEditFormData({ ...editFormData, iModel: e.target.value })}
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (val) => val || <span style={{ color: '#8a9296' }}>iModel name</span>,
                      IconComponent: ExpandMoreIcon,
                    }}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '6px',
                        backgroundColor: '#fff',
                        fontSize: 14,
                        '& fieldset': { borderColor: '#c2c9cd' },
                        '&:hover fieldset': { borderColor: '#8a9499' },
                        '&.Mui-focused fieldset': { borderColor: '#087f6c' },
                      },
                    }}
                  >
                    {filters
                      .filter((filterName) => filterName !== 'All')
                      .map((filterName) => (
                        <MenuItem key={filterName} value={filterName}>
                          {filterName}
                        </MenuItem>
                      ))}
                  </TextField>
                </Box>

                {/* Add tags */}
                <Box>
                  <Typography sx={{ fontSize: 13, color: '#4a5257', mb: 0.75, fontWeight: 500 }}>
                    Add tags
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={editFormData.tag || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, tag: e.target.value })}
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (val) =>
                        val ? (
                          <Chip label={val} size="small" variant="outlined" sx={{ height: 22, fontSize: 12 }} />
                        ) : (
                          <span style={{ color: '#8a9296', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <SearchIcon sx={{ fontSize: 16, color: '#8a9296' }} /> Find or browse tags
                          </span>
                        ),
                      IconComponent: ExpandMoreIcon,
                    }}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '6px',
                        backgroundColor: '#fff',
                        fontSize: 14,
                        '& fieldset': { borderColor: '#c2c9cd' },
                        '&:hover fieldset': { borderColor: '#8a9499' },
                        '&.Mui-focused fieldset': { borderColor: '#087f6c' },
                      },
                    }}
                  >
                    {['WP01', 'WP03', 'WP05', 'WP09', 'WP11'].map((tag) => (
                      <MenuItem key={tag} value={tag}>
                        <Chip label={tag} size="small" variant="outlined" sx={{ height: 22, fontSize: 12, mr: 1 }} />
                        Work Package {tag}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 2, pt: 2, pb: 1, gap: 1.5 }}>
              <Button
                variant="contained"
                onClick={() => setEditDialogOpen(false)}
                sx={{
                  textTransform: 'none',
                  backgroundColor: '#526066',
                  color: '#fff',
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: 14,
                  px: 2.5,
                  py: 0.7,
                  boxShadow: 'none',
                  '&:hover': { backgroundColor: '#414d52', boxShadow: 'none' },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={saveEdit}
                sx={{
                  textTransform: 'none',
                  backgroundColor: '#087f6c',
                  color: '#fff',
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: 14,
                  px: 2.5,
                  py: 0.7,
                  boxShadow: 'none',
                  '&:hover': { backgroundColor: '#066657', boxShadow: 'none' },
                }}
              >
                {editFormData.id ? 'Save' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Toast Notification Bar (dark pill matching screenshot toast) */}
          <Snackbar
            open={Boolean(toastMessage)}
            autoHideDuration={4000}
            onClose={() => {
              setToastMessage('');
              setDeletedBackup(null);
            }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            ContentProps={{
              sx: {
                backgroundColor: '#262d31',
                color: '#fff',
                fontSize: 14,
                fontWeight: 400,
                borderRadius: '6px',
                minWidth: 'auto',
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, width: '100%' }}>
                <Typography sx={{ fontSize: 14, color: '#f5f7f8' }}>{toastMessage}</Typography>
                {deletedBackup && deletedBackup.length > 0 && toastMessage.includes('deleted') && (
                  <Button
                    onClick={handleUndoDelete}
                    sx={{
                      color: '#65c49f',
                      textTransform: 'none',
                      fontSize: 14,
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
        </Box>
      </Box>
    </Box>
  );
};

export default ClashDetection;

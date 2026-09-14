import React, { useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

const ClashDetection = () => {
  const [tests, setTests] = useState([
    {
      id: 1,
      name: 'Cell',
      description: 'Façade vs Com...',
      iModel: 'Parkway',
      active: 8932,
      total: 9800,
      lastRun: '14 June 2026',
      tag: 'Chip',
    },
    {
      id: 2,
      name: 'Cell',
      description: 'Façade vs Faça...',
      iModel: 'Parkway',
      active: 2745,
      total: 4332,
      lastRun: '23 May 2026',
      tag: 'Chip',
    },
    {
      id: 3,
      name: 'Cell',
      description: 'Façade vs Faça...',
      iModel: 'Parkway',
      active: 1564,
      total: 1564,
      lastRun: '25 May 2026',
      tag: 'Chip',
    },
    {
      id: 4,
      name: 'Cell',
      description: 'Façade vs Faça...',
      iModel: 'Parkway',
      active: 7391,
      total: 12903,
      lastRun: '03 January 2026',
      tag: 'Chip',
    },
  ]);

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);

  const filters = ['All', 'Parkway', 'Data Centre - 1', 'Tied Arch Bridge'];

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

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Clash Detection
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ backgroundColor: '#2E7D32' }}
        >
          Create a test
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Sidebar Filters */}
        <Box sx={{ width: 200, flexShrink: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
            iModels
          </Typography>
          <List sx={{ p: 0 }}>
            {filters.map((filter) => (
              <ListItem key={filter} disablePadding>
                <ListItemButton
                  selected={selectedFilter === filter}
                  onClick={() => setSelectedFilter(filter)}
                  sx={{
                    backgroundColor: selectedFilter === filter ? '#E8F5E9' : 'transparent',
                    borderLeft: selectedFilter === filter ? '4px solid #2E7D32' : 'none',
                    pl: selectedFilter === filter ? 0 : 2,
                    '&:hover': {
                      backgroundColor: '#F0F0F0',
                    },
                  }}
                >
                  <ListItemText primary={filter} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1 }}>
          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Find a test"
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: '#999' }} />,
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                  <TableCell padding="checkbox">
                    <Checkbox />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Test name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>iModel</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Active</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Last run</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tag</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTests.map((test) => (
                  <TableRow
                    key={test.id}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: selectedTests.includes(test.id) ? '#F0F0F0' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#F9F9F9',
                      },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedTests.includes(test.id)}
                        onChange={() => handleToggleTest(test.id)}
                      />
                    </TableCell>
                    <TableCell>{test.name}</TableCell>
                    <TableCell>{test.description}</TableCell>
                    <TableCell>{test.iModel}</TableCell>
                    <TableCell>{test.active}</TableCell>
                    <TableCell>{test.total}</TableCell>
                    <TableCell>{test.lastRun}</TableCell>
                    <TableCell>{test.tag}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default ClashDetection;

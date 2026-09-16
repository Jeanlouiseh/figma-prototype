import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  TextField,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ProjectDashboard = () => {
  const [projects, setProjects] = useState([
    { id: 1, title: 'Parkway Station', description: 'Transit hub redevelopment', status: 'In progress', clashes: 12, updated: '2h ago' },
    { id: 2, title: 'North Quay Offices', description: 'Commercial fit-out', status: 'In review', clashes: 4, updated: 'Yesterday' },
    { id: 3, title: 'Tied Arch Bridge', description: 'Structural infrastructure', status: 'In progress', clashes: 8, updated: '3 days ago' },
    { id: 4, title: 'Data Centre 01', description: 'Mission-critical facilities', status: 'Planning', clashes: 0, updated: '8 days ago' },
  ]);

  const [selectedProject, setSelectedProject] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleProjectClick = (project) => {
    setSelectedProject(project.id);
  };

  const visibleProjects = selectedProject ? projects.filter((project) => project.id === selectedProject) : projects;

  const createProject = () => {
    if (!newProjectName.trim()) return;
    setProjects((current) => [...current, { id: Date.now(), title: newProjectName.trim(), description: 'New coordination project', status: 'Planning', clashes: 0, updated: 'Just now' }]);
    setNewProjectName('');
    setIsCreateOpen(false);
  };

  return (
    <Box className="dashboard-page" sx={{ p: 0 }}>
      <Box className="topbar">
        <TextField select size="small" value="Parkway Station" SelectProps={{ IconComponent: ExpandMoreIcon }} sx={{ width: 150 }}>
          <MenuItem value="Parkway Station">Project name</MenuItem>
        </TextField>
        <Breadcrumbs separator="/" sx={{ fontSize: 12, ml: 1 }}><Link underline="always" color="text.primary" href="#">Link</Link><Link underline="always" color="text.primary" href="#">Link</Link></Breadcrumbs>
        <TextField size="small" placeholder="Search" sx={{ width: 120, ml: 'auto' }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16 }} /></InputAdornment> }} />
      </Box>
      <Box className="canvas-heading">
        <Typography variant="h6" sx={{ fontWeight: 500 }}>Project Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}><Button size="small" variant="outlined" endIcon={<ExpandMoreIcon />}>Project view</Button><Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setIsCreateOpen(true)}>Create</Button></Box>
      </Box>
      <Box sx={{ p: 1.5 }}>
      {/* Header */}
      <Box className="page-header" sx={{ display: 'none', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
        <Box>
          <Typography className="eyebrow">WORKSPACE / PROJECTS</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.04em' }}>
            Project dashboard
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Keep every model, issue, and decision moving forward.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsCreateOpen(true)}>
          New project
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'none', mb: 4, gap: 2 }}>
        <TextField
          select
          label="Project name"
          variant="outlined"
          size="small"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All projects</MenuItem>
          {projects.map((proj) => (
            <MenuItem key={proj.id} value={proj.id}>
              {proj.title}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Hero Card */}
      <Paper className="dashboard-hero"
        sx={{
          p: 0,
          mb: 2,
          minHeight: 154,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">Tile</Typography>
      </Paper>

      {/* Project Cards Grid */}
      <Grid container className="tile-grid" spacing={2}>
        {visibleProjects.map((project, index) => (
          <Grid item xs={12} sm={6} md={6} className={`tile-grid-item tile-grid-item-${index}`} key={project.id}>
            <Card
              onClick={() => handleProjectClick(project)}
              sx={{
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'stretch',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 14px 30px rgba(16, 36, 29, 0.12)',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', p: 0 }}><Typography color="text.secondary">Tile</Typography></CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      </Box>
      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Start a project</DialogTitle>
        <DialogContent><TextField autoFocus fullWidth label="Project name" value={newProjectName} onChange={(event) => setNewProjectName(event.target.value)} sx={{ mt: 1 }} /></DialogContent>
        <DialogActions><Button onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button variant="contained" onClick={createProject}>Create project</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDashboard;

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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const ProjectDashboard = () => {
  const [projects, setProjects] = useState([
    { id: 1, title: 'Project 1', description: 'Project details here' },
    { id: 2, title: 'Project 2', description: 'Project details here' },
    { id: 3, title: 'Project 3', description: 'Project details here' },
    { id: 4, title: 'Project 4', description: 'Project details here' },
  ]);

  const [selectedProject, setSelectedProject] = useState('');

  const handleProjectClick = (project) => {
    console.log('Clicked project:', project);
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Project Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ backgroundColor: '#2E7D32' }}
        >
          Create
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <TextField
          select
          label="Project name"
          variant="outlined"
          size="small"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Projects</MenuItem>
          {projects.map((proj) => (
            <MenuItem key={proj.id} value={proj.id}>
              {proj.title}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Hero Card */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          backgroundColor: '#FAFAFA',
          border: '1px solid #E0E0E0',
          borderRadius: 2,
          minHeight: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" color="textSecondary">
          Title
        </Typography>
      </Paper>

      {/* Project Cards Grid */}
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={6} key={project.id}>
            <Card
              onClick={() => handleProjectClick(project)}
              sx={{
                cursor: 'pointer',
                height: 250,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#FAFAFA',
                border: '1px solid #E0E0E0',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  {project.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {project.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProjectDashboard;

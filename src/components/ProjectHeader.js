import React from 'react';
import { Box, Chip, Divider, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ViewInArOutlinedIcon from '@mui/icons-material/ViewInArOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';

// Persistent brand + project identity block shown at the start of the topbar on every page:
// "B" logo, "Infrastructure Cloud" wordmark, and the active project's icon/name/tag.
const ProjectHeader = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
    <Typography sx={{ fontWeight: 800, fontSize: 20, color: '#1c1f21', letterSpacing: '-0.03em' }}>B</Typography>
    <Typography sx={{ fontSize: 15, color: '#1c1f21' }}>Infrastructure Cloud</Typography>
    <Divider orientation="vertical" flexItem sx={{ borderColor: '#c6cdd0', my: 0.5 }} />
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: '4px',
        background: 'linear-gradient(135deg, #d7dee2, #aab4b9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <ViewInArOutlinedIcon sx={{ fontSize: 15, color: '#536066' }} />
    </Box>
    <Box>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1c1f21', lineHeight: 1.25 }}>NGJ-DEMO-2024</Typography>
      <Typography sx={{ fontSize: 11, color: '#657075', lineHeight: 1.25 }}>Clash and Pineapple demo Project</Typography>
    </Box>
    <Chip
      label="PROJECT"
      size="small"
      sx={{ backgroundColor: '#4f7a86', color: '#fff', fontWeight: 700, fontSize: 10, height: 20, borderRadius: '4px' }}
    />
    <StarBorderIcon sx={{ fontSize: 17, color: '#657075', cursor: 'pointer' }} />
    <ExpandMoreIcon sx={{ fontSize: 17, color: '#657075', cursor: 'pointer' }} />
  </Box>
);

export default ProjectHeader;

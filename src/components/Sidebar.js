import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StorageIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Home', icon: HomeIcon, path: '/', id: 'dashboard' },
    { label: 'Clash Detection', icon: AssignmentIcon, path: '/clash-detection', id: 'clash' },
    { label: 'Data', icon: StorageIcon, path: '#', id: 'data' },
  ];

  const handleNavigation = (path, id) => {
    setCurrentPage(id);
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 60,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 60,
          boxSizing: 'border-box',
          backgroundColor: '#F5F5F5',
          borderRight: '1px solid #E0E0E0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 2,
        },
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        B
      </Typography>
      <List sx={{ width: '100%', px: 0 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.id}
            onClick={() => handleNavigation(item.path, item.id)}
            sx={{
              justifyContent: 'center',
              py: 2,
              backgroundColor: currentPage === item.id ? '#E8F5E9' : 'transparent',
              borderLeft: currentPage === item.id ? '4px solid #2E7D32' : 'none',
              '&:hover': {
                backgroundColor: '#F0F0F0',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 'auto', color: '#666' }}>
              <item.icon fontSize="small" />
            </ListItemIcon>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2, width: '80%' }} />
      <Box sx={{ mt: 'auto', pb: 2 }}>
        <ListItem
          button
          sx={{
            justifyContent: 'center',
            '&:hover': {
              backgroundColor: '#F0F0F0',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 'auto', color: '#666' }}>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
        </ListItem>
      </Box>
    </Drawer>
  );
};

export default Sidebar;

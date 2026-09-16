import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Badge, Box, Divider, Drawer, List, ListItem, ListItemIcon, SvgIcon, Tooltip, Typography } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

// Design-system "clash" starburst glyph (detect/conflict/collide)
export const ClashIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      d="M12 2.8 14.1 7l4.6-2.2-1.1 5 5 1.2-4.2 2.9 2.6 4.4-5-.7-.6 5-3.4-3.8-3.4 3.8-.6-5-5 .7 2.6-4.4L3.4 11l5-1.2-1.1-5L11.9 7z"
    />
  </SvgIcon>
);

const menuItems = [
  { label: 'Home', icon: HomeOutlinedIcon, path: '/', dot: null },
  { label: 'Projects', icon: WorkOutlineIcon, path: '#projects', dot: '#ad7100' },
  { label: 'Data', icon: StorageOutlinedIcon, path: '#data', dot: null },
  { label: 'Clash detection', icon: ClashIcon, path: '/clash-detection', dot: '#1976d2' },
  { label: 'Ideas', icon: LightbulbOutlinedIcon, path: '#ideas', dot: null },
  { label: 'Deliverables', icon: DescriptionOutlinedIcon, path: '#deliverables', dividerAfter: true, dot: null },
  { label: 'Reviews', icon: FactCheckOutlinedIcon, path: '#reviews', dot: '#6f777b' },
  { label: 'Timeline', icon: ViewSidebarOutlinedIcon, path: '#timeline', dot: null },
  { label: 'Automation', icon: AutoAwesomeOutlinedIcon, path: '#automation', dot: null },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleNavigation = (path) => { if (path.startsWith('/')) navigate(path); };
  const utilityItems = [['Help', HelpOutlineIcon], ['Notifications', NotificationsNoneOutlinedIcon], ['Settings', SettingsOutlinedIcon]];

  return (
    <Drawer variant="permanent" sx={{ width: 56, flexShrink: 0, '& .MuiDrawer-paper': { width: 56, boxSizing: 'border-box', backgroundColor: '#f8fafb', borderRight: '1px solid #c6cdd0', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 1 } }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, color: '#70777b', letterSpacing: '-0.04em' }}>B</Typography>
      <List sx={{ width: '100%', px: 0 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return <React.Fragment key={item.label}>
            <Tooltip title={item.label} placement="right">
              <ListItem button onClick={() => handleNavigation(item.path)} sx={{ justifyContent: 'center', minHeight: 48, py: 0.5, mx: 0.75, color: active ? '#087f6c' : '#6b7478', backgroundColor: active ? '#d9f1eb' : 'transparent', border: active ? '1px solid #6dc7b4' : '1px solid transparent', borderRadius: 1, '&:hover': { backgroundColor: '#e8f1ef' } }}>
                <ListItemIcon sx={{ minWidth: 'auto', color: 'inherit' }}><Badge variant="dot" invisible={!item.dot} sx={{ '& .MuiBadge-badge': { backgroundColor: item.dot, right: -4, top: 0 } }}><Icon fontSize="small" /></Badge></ListItemIcon>
              </ListItem>
            </Tooltip>
            {item.dividerAfter && <Divider sx={{ my: 0.5, mx: 1, borderColor: '#c6cdd0' }} />}
          </React.Fragment>;
        })}
      </List>
      <Box sx={{ mt: 'auto', pb: 1, width: '100%' }}>
        <Divider sx={{ mx: 1, mb: 0.5, borderColor: '#c6cdd0' }} />
        {utilityItems.map(([label, Icon]) => <Tooltip title={label} placement="right" key={label}><ListItem button sx={{ justifyContent: 'center', minHeight: 48, '&:hover': { backgroundColor: '#e8f1ef' } }}><ListItemIcon sx={{ minWidth: 'auto', color: '#6b7478' }}><Icon fontSize="small" /></ListItemIcon></ListItem></Tooltip>)}
        <Divider sx={{ mx: 1, my: 0.5, borderColor: '#c6cdd0' }} />
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}><Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: '#687177' }}>A</Avatar></Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;

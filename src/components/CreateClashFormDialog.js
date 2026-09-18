import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Menu,
  Popover,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';

const TEAM_MEMBERS = [
  'Jeanlouise Hornberger',
  'Alex Chen',
  'Sarah Miller',
  'David Rodriguez',
  'Elena Rostova',
  'Michael Chang',
];

const FORM_STATUS_OPTIONS = ['Open', 'In Review', 'Closed', 'Draft'];

const DEFAULT_COMMENT =
  'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.';

const CreateClashFormDialog = ({
  open,
  onClose,
  onSubmit,
  targetClashes = [],
}) => {
  const [subject, setSubject] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberMenuAnchorEl, setMemberMenuAnchorEl] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [dueDateAnchorEl, setDueDateAnchorEl] = useState(null);
  const [comment, setComment] = useState(DEFAULT_COMMENT);
  const [formStatus, setFormStatus] = useState('Open');

  // Reset or initialize when opened
  useEffect(() => {
    if (open) {
      setSubject('');
      setAssignedTo('');
      setMemberSearchQuery('');
      setDueDate('');
      setDueDateAnchorEl(null);
      setComment(DEFAULT_COMMENT);
      setFormStatus('Open');
      setMemberMenuAnchorEl(null);
    }
  }, [open]);

  const handleOpenMemberMenu = (e) => {
    setMemberMenuAnchorEl(e.currentTarget);
  };

  const handleCloseMemberMenu = () => {
    setMemberMenuAnchorEl(null);
  };

  const handleSelectMember = (member) => {
    setAssignedTo(member);
    setMemberSearchQuery(member);
    setMemberMenuAnchorEl(null);
  };

  const handleOpenDueDateCalendar = (e) => {
    setDueDateAnchorEl(e.currentTarget);
  };

  const handleCloseDueDateCalendar = () => {
    setDueDateAnchorEl(null);
  };

  const handleSelectDueDate = (value) => {
    if (value) {
      setDueDate(value.format('MM/DD/YYYY'));
    }
    setDueDateAnchorEl(null);
  };

  const handleSubmit = () => {
    onSubmit({
      subject,
      assignedTo: assignedTo || 'Jeanlouise Hornberger',
      dueDate,
      comment,
      formStatus,
      targetClashes,
    });
  };

  const filteredMembers = TEAM_MEMBERS.filter((m) =>
    m.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 440,
          maxWidth: '92vw',
          borderRadius: '12px',
          p: 3,
          boxShadow: '0 12px 36px rgba(0,0,0,0.2), 0 2px 10px rgba(0,0,0,0.08)',
          backgroundColor: '#ffffff',
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.12)',
          },
        },
      }}
    >
      {/* Title matching Screenshot 1 */}
      <Typography
        sx={{
          fontSize: 18,
          fontWeight: 600,
          color: '#1c1f21',
          mb: 2.5,
          letterSpacing: '-0.01em',
        }}
      >
        Create a Clash Form
      </Typography>

      {/* Field 1: Subject* */}
      <Box sx={{ mb: 2 }}>
        <Typography
          sx={{
            fontSize: 12.5,
            fontWeight: 500,
            color: '#4a555b',
            mb: 0.75,
          }}
        >
          Subject<span style={{ color: '#d32f2f' }}>*</span>
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="What is the topic of this form?"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: 13,
              borderRadius: '4px',
              '& fieldset': { borderColor: '#c2c9cd' },
              '&:hover fieldset': { borderColor: '#8a9296' },
            },
            '& .MuiOutlinedInput-input': {
              py: 0.95,
            },
          }}
        />
      </Box>

      {/* Field 2: Assign to* */}
      <Box sx={{ mb: 2 }}>
        <Typography
          sx={{
            fontSize: 12.5,
            fontWeight: 500,
            color: '#4a555b',
            mb: 0.75,
          }}
        >
          Assign to<span style={{ color: '#d32f2f' }}>*</span>
        </Typography>

        <Box
          onClick={handleOpenMemberMenu}
          sx={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #c2c9cd',
            borderRadius: '4px',
            px: 1.25,
            py: 0.7,
            backgroundColor: '#fff',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            '&:hover': {
              borderColor: '#8a9296',
            },
          }}
        >
          <SearchIcon sx={{ fontSize: 18, color: '#8a9296', mr: 1, flexShrink: 0 }} />
          <Typography
            sx={{
              flex: 1,
              fontSize: 13,
              color: assignedTo ? '#1c1f21' : '#8a9296',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {assignedTo || 'Find team members'}
          </Typography>
          <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#8a9296', flexShrink: 0 }} />
        </Box>

        {/* Member selection dropdown menu */}
        <Menu
          anchorEl={memberMenuAnchorEl}
          open={Boolean(memberMenuAnchorEl)}
          onClose={handleCloseMemberMenu}
          slotProps={{
            paper: {
              sx: {
                width: 392,
                maxHeight: 240,
                borderRadius: '6px',
                border: '1px solid #c2c9cd',
                boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                mt: 0.5,
                p: 0.5,
              },
            },
          }}
        >
          <Box sx={{ px: 1, py: 0.5 }}>
            <TextField
              size="small"
              fullWidth
              autoFocus
              placeholder="Search members..."
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: '#8a9296' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 32,
                  fontSize: 12.5,
                  borderRadius: '4px',
                },
              }}
            />
          </Box>
          {filteredMembers.map((member) => (
            <MenuItem
              key={member}
              onClick={() => handleSelectMember(member)}
              sx={{
                fontSize: 13,
                py: 0.75,
                px: 1.5,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                '&:hover': { backgroundColor: '#f0f4f7' },
              }}
            >
              <ListItemText
                primary={member}
                primaryTypographyProps={{ fontSize: 13, color: '#1c1f21' }}
              />
              {assignedTo === member && (
                <ListItemIcon sx={{ minWidth: 'auto', color: '#087f6c' }}>
                  <CheckIcon sx={{ fontSize: 16 }} />
                </ListItemIcon>
              )}
            </MenuItem>
          ))}
          {filteredMembers.length === 0 && (
            <Box sx={{ px: 1.5, py: 1 }}>
              <Typography sx={{ fontSize: 12.5, color: '#8a9296' }}>No team members found</Typography>
            </Box>
          )}
        </Menu>
      </Box>

      {/* Field 3: Due date */}
      <Box sx={{ mb: 2 }}>
        <Typography
          sx={{
            fontSize: 12.5,
            fontWeight: 500,
            color: '#4a555b',
            mb: 0.75,
          }}
        >
          Due date
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="MM/DD/YYYY"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton
                  size="small"
                  onClick={handleOpenDueDateCalendar}
                  sx={{ p: 0.25, '&:hover': { backgroundColor: 'transparent' } }}
                >
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: '#657075' }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 38,
              fontSize: 13,
              borderRadius: '4px',
              '& fieldset': { borderColor: '#c2c9cd' },
              '&:hover fieldset': { borderColor: '#8a9296' },
              '&.Mui-focused fieldset': { borderColor: '#087f6c', borderWidth: 1 },
            },
            '& input::placeholder': {
              color: '#8a9296',
              opacity: 1,
            },
          }}
        />
        <Popover
          open={Boolean(dueDateAnchorEl)}
          anchorEl={dueDateAnchorEl}
          onClose={handleCloseDueDateCalendar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: {
                borderRadius: '6px',
                border: '1px solid #c2c9cd',
                boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                mt: 0.5,
              },
            },
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={dueDate ? dayjs(dueDate, 'MM/DD/YYYY') : null}
              onChange={handleSelectDueDate}
              disablePast
            />
          </LocalizationProvider>
        </Popover>
      </Box>

      {/* Field 4: Comment */}
      <Box sx={{ mb: 2 }}>
        <Typography
          sx={{
            fontSize: 12.5,
            fontWeight: 500,
            color: '#4a555b',
            mb: 0.75,
          }}
        >
          Comment
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: 13,
              lineHeight: 1.45,
              borderRadius: '4px',
              p: 1.25,
              '& fieldset': { borderColor: '#c2c9cd' },
              '&:hover fieldset': { borderColor: '#8a9296' },
              '&.Mui-focused fieldset': { borderColor: '#087f6c', borderWidth: 1 },
            },
          }}
        />
      </Box>

      {/* Field 5: Form status */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: 12.5,
            fontWeight: 500,
            color: '#4a555b',
            mb: 0.75,
          }}
        >
          Form status
        </Typography>
        <TextField
          select
          fullWidth
          size="small"
          value={formStatus}
          onChange={(e) => setFormStatus(e.target.value)}
          SelectProps={{
            IconComponent: KeyboardArrowDownIcon,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 38,
              fontSize: 13,
              borderRadius: '4px',
              '& fieldset': { borderColor: '#c2c9cd' },
              '&:hover fieldset': { borderColor: '#8a9296' },
              '&.Mui-focused fieldset': { borderColor: '#087f6c', borderWidth: 1 },
            },
            '& .MuiSelect-icon': {
              fontSize: 18,
              color: '#8a9296',
            },
          }}
        >
          {FORM_STATUS_OPTIONS.map((status) => (
            <MenuItem key={status} value={status} sx={{ fontSize: 13, py: 0.8 }}>
              {status}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Action Buttons matching Screenshot 1 */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.25 }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            textTransform: 'none',
            backgroundColor: '#5c6870',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 500,
            px: 2,
            py: 0.65,
            borderRadius: '4px',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#4d575d',
              boxShadow: 'none',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            textTransform: 'none',
            backgroundColor: '#087f6c',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 500,
            px: 2,
            py: 0.65,
            borderRadius: '4px',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#066657',
              boxShadow: 'none',
            },
          }}
        >
          Create
        </Button>
      </Box>
    </Dialog>
  );
};

export default CreateClashFormDialog;

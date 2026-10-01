import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Drawer,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import HistoryIcon from '@mui/icons-material/History';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { TEAM_MEMBERS, FORM_STATUS_OPTIONS } from './CreateClashFormDialog';

const TABS = [
  { id: 'details', label: 'Details', icon: InfoOutlinedIcon },
  { id: 'comments', label: 'Comments', icon: SmsOutlinedIcon },
  { id: 'attachments', label: 'Attachments', icon: AttachFileIcon },
  { id: 'history', label: 'History', icon: HistoryIcon },
];

const ACCENT = '#087f6c';
const MENTION_PATTERN = new RegExp(`(@(?:${TEAM_MEMBERS.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')}))`, 'g');

const getInitials = (name = '') =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const UserAvatar = ({ name, size = 32 }) => (
  <Avatar
    title={name}
    sx={{ width: size, height: size, bgcolor: '#687177', color: '#fff', fontSize: size * 0.38, fontWeight: 600, flexShrink: 0 }}
  >
    {getInitials(name)}
  </Avatar>
);

const SectionTitle = ({ children }) => (
  <Typography component="h3" sx={{ fontSize: 15, fontWeight: 500, color: '#1c1f21', mb: 1.5 }}>
    {children}
  </Typography>
);

const PropertyRow = ({ label, children }) => (
  <Box sx={{ mb: 2 }}>
    <Typography sx={{ fontSize: 13.5, color: '#1c1f21' }}>{label}</Typography>
    <Box sx={{ fontSize: 13.5, color: '#536066', overflowWrap: 'anywhere' }}>{children}</Box>
  </Box>
);

const EmptyState = ({ title, description, action }) => (
  <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
    <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#344046' }}>{title}</Typography>
    <Typography sx={{ fontSize: 12.5, color: '#657075', mt: 0.5 }}>{description}</Typography>
    {action && <Box sx={{ mt: 2 }}>{action}</Box>}
  </Box>
);

const editFieldSx = {
  '& .MuiOutlinedInput-root': { fontSize: 13.5, '& fieldset': { borderColor: '#c2c9cd' } },
  '& .MuiInputLabel-root': { fontSize: 13.5 },
};

const DetailsTab = ({ form, elements, location, isEditing, onSave, onCancelEdit }) => {
  const [draft, setDraft] = useState(form);

  useEffect(() => {
    if (isEditing) setDraft(form);
  }, [isEditing, form]);

  if (isEditing) {
    const updateDraft = (key) => (event) => setDraft((prev) => ({ ...prev, [key]: event.target.value }));
    return (
      <Box sx={{ px: 2, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SectionTitle>Edit properties</SectionTitle>
        <TextField label="Subject" size="small" value={draft.subject || ''} onChange={updateDraft('subject')} sx={editFieldSx} />
        <TextField label="Description" size="small" multiline minRows={3} value={draft.comment || ''} onChange={updateDraft('comment')} sx={editFieldSx} />
        <TextField select label="Status" size="small" value={draft.status || 'Open'} onChange={updateDraft('status')} sx={editFieldSx}>
          {FORM_STATUS_OPTIONS.map((status) => (
            <MenuItem key={status} value={status} sx={{ fontSize: 13.5 }}>{status}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Assigned to" size="small" value={draft.assignedTo || ''} onChange={updateDraft('assignedTo')} sx={editFieldSx}>
          {TEAM_MEMBERS.map((member) => (
            <MenuItem key={member} value={member} sx={{ fontSize: 13.5 }}>{member}</MenuItem>
          ))}
        </TextField>
        <TextField label="Due date" placeholder="MM/DD/YYYY" size="small" value={draft.dueDate || ''} onChange={updateDraft('dueDate')} sx={editFieldSx} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onCancelEdit} sx={{ textTransform: 'none', color: '#344046' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => onSave(draft)}
            disabled={!draft.subject?.trim()}
            sx={{ textTransform: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: '#066657' } }}
          >
            Save
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <SectionTitle>Properties</SectionTitle>
      <Box sx={{ pl: 1 }}>
        <PropertyRow label="Description">{form.comment || 'None'}</PropertyRow>
        <PropertyRow label="Status">{form.status || 'Open'}</PropertyRow>
        <PropertyRow label="State">{form.status === 'Closed' ? 'Closed' : 'Open'}</PropertyRow>
        <PropertyRow label="Assigned to">{form.assignedTo || 'Unassigned'}</PropertyRow>
        <PropertyRow label="Due date">{form.dueDate || 'None'}</PropertyRow>
        <PropertyRow label="ID number">{form.number || form.id}</PropertyRow>
      </Box>

      <Box sx={{ mt: 1 }}>
        <SectionTitle>Elements</SectionTitle>
        <Box sx={{ pl: 1 }}>
          {elements.length > 0 ? (
            elements.map((element) => (
              <Typography key={element} sx={{ fontSize: 13.5, color: '#1c1f21', mb: 2, overflowWrap: 'anywhere' }}>
                {element}
              </Typography>
            ))
          ) : (
            <Typography sx={{ fontSize: 13.5, color: '#536066', mb: 2 }}>None</Typography>
          )}
        </Box>
      </Box>

      {location && (
        <Box sx={{ mt: 1 }}>
          <SectionTitle>Location</SectionTitle>
          <Box sx={{ pl: 1 }}>
            <PropertyRow label="Latitude">{location.latitude}</PropertyRow>
            <PropertyRow label="Longitude">{location.longitude}</PropertyRow>
            <PropertyRow label="Elevation">{location.elevation}</PropertyRow>
          </Box>
        </Box>
      )}
    </Box>
  );
};

const CommentText = ({ text }) =>
  text.split(MENTION_PATTERN).map((part, index) =>
    index % 2 === 1 ? (
      <Box component="span" key={index} sx={{ color: '#7fd1b0' }}>{part}</Box>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    )
  );

const CommentsTab = ({ comments, currentUser, onAddComment }) => {
  const [message, setMessage] = useState('');
  const listEndRef = useRef(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ block: 'end' });
  }, [comments.length]);

  const submit = () => {
    const text = message.trim();
    if (!text) return;
    onAddComment(text);
    setMessage('');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2, display: 'flex', flexDirection: 'column' }}>
        {comments.length === 0 ? (
          <EmptyState title="No comments yet" description="Start the conversation about this form. Use @ to mention a teammate." />
        ) : (
          <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {comments.map((comment) => {
              const isCurrentUser = comment.author === currentUser;
              return (
                <Box
                  key={comment.id}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexDirection: isCurrentUser ? 'row' : 'row-reverse' }}
                >
                  <UserAvatar name={comment.author} size={34} />
                  <Box
                    title={`${comment.author} · ${dayjs(comment.createdAt).format('MMM D, YYYY h:mm A')}`}
                    sx={{
                      position: 'relative',
                      flex: 1,
                      bgcolor: '#3a3f44',
                      color: '#fff',
                      borderRadius: '3px',
                      px: 1.25,
                      py: 0.75,
                      fontSize: 13.5,
                      lineHeight: 1.45,
                      overflowWrap: 'anywhere',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        [isCurrentUser ? 'left' : 'right']: -5,
                        borderTop: '5px solid transparent',
                        borderBottom: '5px solid transparent',
                        [isCurrentUser ? 'borderRight' : 'borderLeft']: '5px solid #3a3f44',
                      },
                    }}
                  >
                    <CommentText text={comment.text} />
                  </Box>
                </Box>
              );
            })}
            <Box ref={listEndRef} />
          </Box>
        )}
      </Box>
      <Box sx={{ px: 2, pb: 2, pt: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Your message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          inputProps={{ 'aria-label': 'Add a comment' }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" aria-label="Send comment" onClick={submit} disabled={!message.trim()} sx={{ color: '#536066' }}>
                  <SendOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { fontSize: 13.5, '& fieldset': { borderColor: '#8a9296' } } }}
        />
        <Typography sx={{ fontSize: 12, color: '#657075', mt: 0.5 }}>Add a comment</Typography>
      </Box>
    </Box>
  );
};

const AttachmentsTab = ({ attachments, onAddAttachments, onRemoveAttachment }) => {
  const inputRef = useRef(null);
  const [menuState, setMenuState] = useState(null);

  const attachButton = (
    <Button
      variant="outlined"
      size="small"
      startIcon={<AttachFileIcon sx={{ fontSize: 16 }} />}
      onClick={() => inputRef.current?.click()}
      sx={{ textTransform: 'none', borderColor: '#aeb8bd', color: '#344046' }}
    >
      Attach a file
    </Button>
  );

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files || []);
          if (files.length > 0) onAddAttachments(files);
          event.target.value = '';
        }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography component="h3" sx={{ fontSize: 15, fontWeight: 500, color: '#1c1f21' }}>Attachments</Typography>
        {attachments.length > 0 && attachButton}
      </Box>
      {attachments.length === 0 ? (
        <EmptyState title="No attachments yet" description="Attach documents or images related to this form." action={attachButton} />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {attachments.map((attachment) => (
            <Box
              key={attachment.id}
              sx={{ p: 1.5, bgcolor: '#fff', border: '1px solid #8a9296', borderRadius: '3px' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                <Typography sx={{ fontSize: 18, lineHeight: 1.3, color: '#30343a', overflowWrap: 'anywhere' }}>
                  {attachment.name}
                </Typography>
                <IconButton
                  size="small"
                  aria-label={`More actions for ${attachment.name}`}
                  onClick={(event) => setMenuState({ anchorEl: event.currentTarget, attachment })}
                  sx={{ color: '#536066', mt: -0.25, mr: -0.5 }}
                >
                  <MoreVertIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
              <Typography sx={{ fontSize: 13.5, lineHeight: 1.45, color: '#4b535a' }}>
                {[attachment.type || 'File', formatFileSize(attachment.size)].join(' · ')}
              </Typography>
              <Typography sx={{ fontSize: 13.5, lineHeight: 1.45, color: '#4b535a' }}>
                Attached by {attachment.attachedBy} on {dayjs(attachment.attachedAt).format('MMM D, YYYY')}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
      <Menu
        anchorEl={menuState?.anchorEl}
        open={Boolean(menuState)}
        onClose={() => setMenuState(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {menuState?.attachment.url && (
          <MenuItem
            component="a"
            href={menuState.attachment.url}
            download={menuState.attachment.name}
            onClick={() => setMenuState(null)}
            sx={{ fontSize: 13 }}
          >
            Download
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            onRemoveAttachment(menuState.attachment);
            setMenuState(null);
          }}
          sx={{ fontSize: 13 }}
        >
          Remove
        </MenuItem>
      </Menu>
    </Box>
  );
};

const HistoryTab = ({ history }) => {
  const [expandedOverrides, setExpandedOverrides] = useState({});

  const days = useMemo(() => {
    const grouped = [];
    [...history]
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .forEach((entry) => {
        const key = dayjs(entry.at).format('YYYY-MM-DD');
        const group = grouped.find((g) => g.key === key);
        if (group) group.entries.push(entry);
        else grouped.push({ key, label: dayjs(entry.at).format('dddd D MMMM YYYY'), entries: [entry] });
      });
    return grouped;
  }, [history]);

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Typography component="h3" sx={{ fontSize: 15, fontWeight: 500, color: '#1c1f21', mb: 1 }}>History</Typography>
      {days.length === 0 ? (
        <EmptyState title="No activity yet" description="Changes, comments, and attachments will appear here." />
      ) : (
        days.map((day, index) => {
          const expanded = expandedOverrides[day.key] ?? index === 0;
          return (
            <Box key={day.key} sx={{ borderBottom: '1px solid #8a9296' }}>
              <Box
                component="button"
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpandedOverrides((prev) => ({ ...prev, [day.key]: !expanded }))}
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  border: 0,
                  bgcolor: 'transparent',
                  px: 1,
                  py: 1.25,
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: '#1c1f21',
                  '&:hover': { bgcolor: '#f8fafb' },
                }}
              >
                {expanded ? <KeyboardArrowUpIcon sx={{ fontSize: 18 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
                <Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>{day.label}</Typography>
              </Box>
              <Collapse in={expanded}>
                <Box sx={{ pl: 3.5, pr: 1, pb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {day.entries.map((entry) => (
                    <Box key={entry.id} sx={{ display: 'flex', gap: 1.25 }}>
                      <UserAvatar name={entry.user} size={28} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 13.5, color: '#1c1f21' }}>{entry.user}</Typography>
                        <Typography sx={{ fontSize: 13, color: '#536066', mt: 0.5, overflowWrap: 'anywhere' }}>{entry.action}</Typography>
                        <Typography sx={{ fontSize: 13, color: '#536066' }}>{dayjs(entry.at).format('h:mm:ss A')}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          );
        })
      )}
    </Box>
  );
};

const FormDetailPanel = ({
  form,
  elements = [],
  location = null,
  activity,
  currentUser,
  onClose,
  onSaveForm,
  onAddComment,
  onAddAttachments,
  onRemoveAttachment,
}) => {
  const [tab, setTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const formId = form?.id;

  useEffect(() => {
    setTab('details');
    setIsEditing(false);
  }, [formId]);

  const comments = activity?.comments || [];
  const attachments = activity?.attachments || [];
  const history = activity?.history || [];

  return (
    <Drawer
      anchor="right"
      open={Boolean(form)}
      onClose={onClose}
      slotProps={{ backdrop: { sx: { backgroundColor: 'transparent' } } }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 360 },
          maxWidth: '100vw',
          boxShadow: '0 8px 24px rgba(28, 31, 33, 0.22)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {form && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, px: 2, pt: 2, pb: 1.5 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography component="h2" sx={{ fontSize: 20, lineHeight: 1.3, color: '#1c1f21', overflowWrap: 'anywhere' }}>
                {form.subject || form.number || form.id}
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: '#657075' }}>
                Created by {form.createdBy || 'Unknown'}
              </Typography>
              {form.createdAt && (
                <Typography sx={{ fontSize: 13.5, color: '#657075' }}>
                  Created on {dayjs(form.createdAt).format('DD, MMM. YYYY')}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.25 }}>
              <Tooltip title="Edit form">
                <IconButton
                  size="small"
                  aria-label="Edit form"
                  onClick={() => {
                    setTab('details');
                    setIsEditing(true);
                  }}
                  sx={{ color: isEditing ? ACCENT : '#536066' }}
                >
                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <IconButton size="small" aria-label="Close form details" onClick={onClose} sx={{ color: '#1c1f21' }}>
                <CloseIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>

          <Box role="tablist" aria-label="Form sections" sx={{ display: 'flex', justifyContent: 'space-between', px: 2, borderBottom: '1px solid #8a9296' }}>
            {TABS.map(({ id, label, icon: TabIcon }) => {
              const selected = tab === id;
              return (
                <Tooltip key={id} title={label}>
                  <IconButton
                    role="tab"
                    aria-selected={selected}
                    aria-label={label}
                    onClick={() => setTab(id)}
                    sx={{
                      borderRadius: 0,
                      px: 1.5,
                      py: 1,
                      color: selected ? '#1c1f21' : '#536066',
                      borderBottom: `3px solid ${selected ? ACCENT : 'transparent'}`,
                      mb: '-1px',
                    }}
                  >
                    <TabIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              );
            })}
          </Box>

          <Box role="tabpanel" sx={{ flex: 1, minHeight: 0, overflowY: tab === 'comments' ? 'hidden' : 'auto' }}>
            {tab === 'details' && (
              <DetailsTab
                form={form}
                elements={elements}
                location={location}
                isEditing={isEditing}
                onCancelEdit={() => setIsEditing(false)}
                onSave={(draft) => {
                  onSaveForm(draft);
                  setIsEditing(false);
                }}
              />
            )}
            {tab === 'comments' && (
              <CommentsTab comments={comments} currentUser={currentUser} onAddComment={onAddComment} />
            )}
            {tab === 'attachments' && (
              <AttachmentsTab
                attachments={attachments}
                onAddAttachments={onAddAttachments}
                onRemoveAttachment={onRemoveAttachment}
              />
            )}
            {tab === 'history' && <HistoryTab history={history} />}
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default FormDetailPanel;

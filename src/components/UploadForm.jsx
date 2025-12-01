import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { checkDuplicateDriveLink } from "../services/driveLinks.js";
import { checkDuplicateWhatsappLink } from "../services/whatsappGroups.js";
import { checkDuplicateUniversityLink } from "../services/universityGroups.js";
import { uploadRateLimiter, getClientId } from "../utils/rateLimiter.js";
import { sanitizeUrl, sanitizeString } from "../utils/inputSanitizer.js";

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import donateImage from '../images/Gemini_Generated_Image_d5zif3d5zif3d5zi.png';

const initialFormState = {
    subject: '',
    grade: '',
    level: 'school',
    medium: '',
    file: null,
    whatsappLink: '',
    driveLink: '',
    universityName: '',
    description: ''
};

export function UploadForm() {
  const [form, setForm] = useState(initialFormState);
  const [mode, setMode] = useState('file'); // 'file' | 'links' | 'whatsapp' | 'uni'
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    // Clear any previous validation message when user edits fields
    setError('');
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Rate limiting check
    const clientId = getClientId();
    if (!uploadRateLimiter.isAllowed(clientId)) {
      const timeUntilReset = Math.ceil(uploadRateLimiter.getTimeUntilReset(clientId) / 1000);
      setError(
        `Too many upload attempts. Please wait ${timeUntilReset} seconds before trying again. This helps protect our servers from abuse.`
      );
      return;
    }

    // Sanitize and validate inputs
    if (mode === 'links') {
      const driveUrl = sanitizeUrl(String(form.driveLink || '').trim());
      const drivePattern = /^https?:\/\/(drive\.google\.com|docs\.google\.com)\//i;
      if (!driveUrl || !drivePattern.test(driveUrl)) {
        setError(
          'Please paste a valid Google Drive link starting with https://drive.google.com or https://docs.google.com.'
        );
        return;
      }
      // Update form with sanitized URL
      form.driveLink = driveUrl;
    }

    if (mode === 'whatsapp' || mode === 'uni') {
      const waUrl = sanitizeUrl(String(form.whatsappLink || '').trim());
      const whatsappPattern = /^https?:\/\/(chat\.whatsapp\.com|wa\.me)\//i;
      if (!waUrl || !whatsappPattern.test(waUrl)) {
        setError(
          'Please paste a valid WhatsApp invite link (for example https://chat.whatsapp.com/...).'
        );
        return;
      }
      // Update form with sanitized URL
      form.whatsappLink = waUrl;
    }

    // Sanitize text fields
    if (form.subject) {
      form.subject = sanitizeString(form.subject);
    }
    if (form.description) {
      form.description = sanitizeString(form.description);
    }
    if (form.universityName) {
      form.universityName = sanitizeString(form.universityName);
    }

    // Check for duplicate URLs before submitting
    try {
      if (mode === 'links') {
        const driveUrl = String(form.driveLink || '').trim();
        const isDuplicate = await checkDuplicateDriveLink(driveUrl);
        if (isDuplicate) {
          setError(
            'This Google Drive link has already been uploaded. Please check the Browse Notes section or share a different link.'
          );
          return;
        }
      } else if (mode === 'whatsapp') {
        const waUrl = String(form.whatsappLink || '').trim();
        const isDuplicate = await checkDuplicateWhatsappLink(waUrl);
        if (isDuplicate) {
          setError(
            'This WhatsApp group link has already been uploaded. Please check the WhatsApp Study Groups section or share a different link.'
          );
          return;
        }
      } else if (mode === 'uni') {
        const waUrl = String(form.whatsappLink || '').trim();
        const isDuplicate = await checkDuplicateUniversityLink(waUrl);
        if (isDuplicate) {
          setError(
            'This university WhatsApp group link has already been uploaded. Please check the University WhatsApp Groups section or share a different link.'
          );
          return;
        }
      }
    } catch (checkError) {
      console.error('Error checking for duplicates:', checkError);
      // Continue with submission if duplicate check fails (don't block user)
    }

    // Persist to backend / Firestore depending on mode
    try {
      if (mode === 'links') {
        await addDoc(collection(db, 'driveLinks'), {
          grade: form.grade,
          medium: form.medium,
          url: form.driveLink,
          description: form.subject || '',
          createdAt: serverTimestamp()
        });
      } else if (mode === 'whatsapp') {
        await addDoc(collection(db, 'whatsappGroups'), {
          subject: form.subject || '',
          grade: form.grade || '',
          medium: form.medium || '',
          url: form.whatsappLink,
          description: form.description || '',
          createdAt: serverTimestamp()
        });
      } else if (mode === 'uni') {
        await addDoc(collection(db, 'universityGroups'), {
          universityName: form.universityName,
          year: form.grade,
          medium: form.medium,
          url: form.whatsappLink,
          description: form.description || '',
          createdAt: serverTimestamp()
        });
      }
      // Other modes (file) can be wired similarly later
    } catch (error) {
      console.error('Error saving link to Firestore', error);
      setStatus('Something went wrong while saving. Please try again.');
      return;
    }

    let message =
      'Thank you for sharing your resources. Every upload helps a Sri Lankan student keep learning after disaster.';
    if (mode === 'file') {
      message =
        'Thank you for offering your notes. Once file uploads are ready, these resources will help students rebuild their studies after floods and other disasters.';
    } else if (mode === 'links') {
      message =
        'Thank you for sharing your Google Drive notes. A student who lost their books in a flood may use your link to catch up again.';
    } else if (mode === 'whatsapp') {
      message =
        'Thank you for opening a WhatsApp study group. In a difficult season for Sri Lanka, your group can feel like a small classroom of hope.';
    } else if (mode === 'uni') {
      message =
        'Thank you for creating space for university students to stay connected. Your WhatsApp group can keep an entire batch learning together, even when campuses are disrupted.';
    }
    setStatus(message);

    // Clear form fields after successful submit, keep current mode
    setForm(initialFormState);
  };

  return (
    <Paper
      elevation={4}
      sx={(theme) => ({
        borderRadius: 3,
        p: { xs: 2.4, md: 3.2 },
        boxShadow:
          theme.palette.mode === 'light'
            ? '0 18px 40px rgba(15,23,42,0.12)'
            : '0 26px 60px rgba(0,0,0,0.95)',
        border:
          theme.palette.mode === 'light'
            ? '1px solid rgba(148,163,184,0.25)'
            : '1px solid rgba(30,64,175,0.8)',
        bgcolor:
          theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(240,253,250,0.98))'
            : 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(8,47,73,0.98))'
      })}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {error && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning" variant="outlined">
              {error}
            </Alert>
          </Box>
        )}

        {/* Logo Image Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: { xs: 2, sm: 2.5, md: 3, lg: 3.5 },
            mt: { xs: 0.5, sm: 0 },
            px: { xs: 1, sm: 0 }
          }}
        >
          <Box
            component="img"
            src={donateImage}
            alt="HopeNotes Donate"
            sx={{
              width: { xs: '100%', sm: 160, md: 200, lg: 240 },
              maxWidth: { xs: 180, sm: 'none' },
              height: 'auto',
              borderRadius: { xs: 2.5, sm: 3, md: 4, lg: 5 },
              boxShadow: (theme) =>
                theme.palette.mode === 'light'
                  ? '0 12px 32px rgba(15,23,42,0.15)'
                  : '0 16px 40px rgba(0,0,0,0.6)',
              objectFit: 'contain',
              border: (theme) =>
                theme.palette.mode === 'light'
                  ? '2px solid rgba(148,163,184,0.2)'
                  : '2px solid rgba(30,64,175,0.4)'
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1.5,
            mb: 2.5
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', mb: 0.5 }}>
              How would you like to donate?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload a file or share links that students can access anytime.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.8,
                mt: 1.2
              }}
            >
              <Box
                sx={{
                  px: 1,
                  py: 0.3,
                  borderRadius: 999,
                  fontSize: 11,
                  bgcolor: 'rgba(34,197,94,0.08)',
                  color: '#15803d'
                }}
              >
                100% free for students
              </Box>
              <Box
                sx={{
                  px: 1,
                  py: 0.3,
                  borderRadius: 999,
                  fontSize: 11,
                  bgcolor: 'rgba(59,130,246,0.08)',
                  color: '#1d4ed8'
                }}
              >
                Works across Sri Lanka
              </Box>
              <Box
                sx={{
                  px: 1,
                  py: 0.3,
                  borderRadius: 999,
                  fontSize: 11,
                  bgcolor: 'rgba(14,165,233,0.08)',
                  color: '#0369a1'
                }}
              >
                Perfect for floods & disaster recovery
              </Box>
            </Box>
          </Box>

          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, value) => value && setMode(value)}
            size="small"
            sx={{
              borderRadius: 999,
              bgcolor: 'transparent',
              '& .MuiToggleButton-root': {
                border: 'none',
                px: 1.6,
                fontSize: 13,
                textTransform: 'none',
                borderRadius: 999,
                color: (theme) =>
                  theme.palette.mode === 'light'
                    ? theme.palette.text.secondary
                    : theme.palette.text.secondary,
                '&.Mui-selected': {
                  color: (theme) =>
                    theme.palette.mode === 'light' ? '#0f172a' : '#e5e7eb',
                  bgcolor: 'transparent'
                }
              },
              // Upload file (1) — blue
              '& .MuiToggleButton-root:nth-of-type(1)': {
                border: (theme) =>
                  theme.palette.mode === 'light'
                    ? '1px solid rgba(8,145,178,0.25)'
                    : '1px solid rgba(56,189,248,0.5)',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(8,145,178,0.04)'
                    : 'rgba(15,23,42,0.9)'
              },
              '& .MuiToggleButton-root:nth-of-type(1).Mui-selected': {
                backgroundImage:
                  'linear-gradient(135deg, rgba(8,145,178,0.18), rgba(8,145,178,0.4))',
                color: (theme) =>
                  theme.palette.mode === 'light' ? '#0f172a' : '#f9fafb'
              },
              // Google Drive links (2) — green
              '& .MuiToggleButton-root:nth-of-type(2)': {
                border: (theme) =>
                  theme.palette.mode === 'light'
                    ? '1px solid rgba(34,197,94,0.25)'
                    : '1px solid rgba(74,222,128,0.5)',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(34,197,94,0.04)'
                    : 'rgba(15,23,42,0.9)'
              },
              '& .MuiToggleButton-root:nth-of-type(2).Mui-selected': {
                backgroundImage:
                  'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.5))',
                color: (theme) =>
                  theme.palette.mode === 'light' ? '#064e3b' : '#f9fafb'
              },
              // WhatsApp links (3) — teal
              '& .MuiToggleButton-root:nth-of-type(3)': {
                border: (theme) =>
                  theme.palette.mode === 'light'
                    ? '1px solid rgba(45,212,191,0.3)'
                    : '1px solid rgba(34,211,238,0.6)',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(45,212,191,0.06)'
                    : 'rgba(15,23,42,0.9)'
              },
              '& .MuiToggleButton-root:nth-of-type(3).Mui-selected': {
                backgroundImage:
                  'linear-gradient(135deg, rgba(45,212,191,0.3), rgba(34,211,238,0.6))',
                color: (theme) =>
                  theme.palette.mode === 'light' ? '#022c22' : '#ecfeff'
              },
              // University groups (4) — purple
              '& .MuiToggleButton-root:nth-of-type(4)': {
                border: (theme) =>
                  theme.palette.mode === 'light'
                    ? '1px solid rgba(168,85,247,0.35)'
                    : '1px solid rgba(192,132,252,0.7)',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(168,85,247,0.06)'
                    : 'rgba(15,23,42,0.9)'
              },
              '& .MuiToggleButton-root:nth-of-type(4).Mui-selected': {
                backgroundImage:
                  'linear-gradient(135deg, rgba(168,85,247,0.35), rgba(129,140,248,0.7))',
                color: (theme) =>
                  theme.palette.mode === 'light' ? '#111827' : '#eef2ff'
              },
              '& .MuiToggleButtonGroup-grouped:not(:last-of-type)': {
                marginRight: 0.5
              }
            }}
          >
            <ToggleButton value="file">Upload file</ToggleButton>
            <ToggleButton value="links">Google Drive links</ToggleButton>
            <ToggleButton value="whatsapp">WhatsApp group links</ToggleButton>
            <ToggleButton value="uni">University groups</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {mode !== 'uni' && (
          <Grid container spacing={2}>
            {mode === 'file' ? (
              <>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={(theme) => ({
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      p: 2,
                      borderRadius: 3,
                      border:
                        theme.palette.mode === 'light'
                          ? '1px dashed rgba(148,163,184,0.8)'
                          : '1px dashed rgba(148,163,184,0.7)',
                      background:
                        theme.palette.mode === 'light'
                          ? 'rgba(248,250,252,0.9)'
                          : 'rgba(15,23,42,0.95)'
                    })}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.2,
                        mb: 1
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background:
                            'radial-gradient(circle at 30% 0%, #e0f2fe, #0ea5e9)',
                          boxShadow: '0 10px 24px rgba(37,99,235,0.4)',
                          color: '#f9fafb'
                        }}
                      >
                        <CloudUploadIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          File uploads under construction
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          You&apos;ll soon be able to upload PDFs and images directly. For now,
                          please share notes via Google Drive or WhatsApp groups.
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Tip: use the <strong>Google Drive links</strong> or{' '}
                      <strong>WhatsApp group links</strong> tabs above to share your resources.
                    </Typography>
                  </Box>
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Subject"
                    id="subject"
                    name="subject"
                    placeholder="e.g. Mathematics, History, Science or All subjects"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    helperText={
                      mode === 'links'
                        ? 'For links that help everyone, you can type “All subjects”.'
                        : ''
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="grade-links-label">Grade</InputLabel>
                    <Select
                      labelId="grade-links-label"
                      id="grade-links"
                      name="grade"
                      label="Grade"
                      value={form.grade}
                      onChange={handleChange}
                    >
                      <MenuItem value="">
                        <em>Grade</em>
                      </MenuItem>
                      <MenuItem value="1">Grade 1</MenuItem>
                      <MenuItem value="2">Grade 2</MenuItem>
                      <MenuItem value="3">Grade 3</MenuItem>
                      <MenuItem value="4">Grade 4</MenuItem>
                      <MenuItem value="5">Grade 5</MenuItem>
                      <MenuItem value="6">Grade 6</MenuItem>
                      <MenuItem value="7">Grade 7</MenuItem>
                      <MenuItem value="8">Grade 8</MenuItem>
                      <MenuItem value="9">Grade 9</MenuItem>
                      <MenuItem value="10">Grade 10</MenuItem>
                      <MenuItem value="11">Grade 11</MenuItem>
                      <MenuItem value="12">Grade 12</MenuItem>
                      {/* Grade 13 removed as requested */}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="medium-label">Medium</InputLabel>
                <Select
                  labelId="medium-label"
                  id="medium"
                  name="medium"
                  label="Medium"
                  value={form.medium}
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    <em>Select medium</em>
                  </MenuItem>
                  <MenuItem value="all">All mediums</MenuItem>
                  <MenuItem value="Sinhala">Sinhala Medium</MenuItem>
                  <MenuItem value="Tamil">Tamil Medium</MenuItem>
                  <MenuItem value="English">English Medium</MenuItem>
                  <MenuItem value="Sinhala and English">Sinhala and English</MenuItem>
                  <MenuItem value="Japanese">Japanese Medium</MenuItem>
                  <MenuItem value="Korean">Korean Medium</MenuItem>
                  <MenuItem value="Hindi">Hindi Medium</MenuItem>
                </Select>
                <FormHelperText>
                  Choose the language that best matches your notes or links.
                </FormHelperText>
              </FormControl>
            </Grid>

            {mode === 'file' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="file"
                  name="file"
                  type="file"
                  onChange={handleChange}
                  required
                  inputProps={{
                    accept: '.pdf,.doc,.docx,.ppt,.pptx,.jpg,.png'
                  }}
                  helperText="Upload clear scans or PDFs where possible."
                />
              </Grid>
            )}

            {mode === 'links' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="driveLink"
                  name="driveLink"
                  type="url"
                  label="Google Drive Link (required)"
                  placeholder="https://drive.google.com/..."
                  value={form.driveLink}
                  onChange={handleChange}
                  required
                  helperText="Paste a folder or file link if your notes live on Google Drive."
                />
              </Grid>
            )}
            {mode === 'whatsapp' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="whatsapp-only-link"
                  name="whatsappLink"
                  type="url"
                  label="WhatsApp Group Link (required)"
                  placeholder="https://chat.whatsapp.com/..."
                  value={form.whatsappLink}
                  onChange={handleChange}
                  required
                  helperText="WhatsApp group link for sharing notes and updates."
                />
              </Grid>
            )}
          </Grid>
        )}

        {mode === 'uni' && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="University name"
                id="universityName"
                name="universityName"
                placeholder="e.g. University of Colombo"
                value={form.universityName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="uni-year-label">Year</InputLabel>
                <Select
                  labelId="uni-year-label"
                  id="uni-year"
                  name="grade"
                  label="Year"
                  value={form.grade}
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    <em>Year</em>
                  </MenuItem>
                  <MenuItem value="1">Year 1</MenuItem>
                  <MenuItem value="2">Year 2</MenuItem>
                  <MenuItem value="3">Year 3</MenuItem>
                  <MenuItem value="4">Year 4</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="uni-medium-label">Medium</InputLabel>
                <Select
                  labelId="uni-medium-label"
                  id="uni-medium"
                  name="medium"
                  label="Medium"
                  value={form.medium}
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    <em>Select medium</em>
                  </MenuItem>
                  <MenuItem value="Sinhala">Sinhala Medium</MenuItem>
                  <MenuItem value="Tamil">Tamil Medium</MenuItem>
                  <MenuItem value="English">English Medium</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="uni-whatsapp"
                name="whatsappLink"
                type="url"
                label="WhatsApp Group Link (required)"
                placeholder="https://chat.whatsapp.com/..."
                value={form.whatsappLink}
                onChange={handleChange}
                required
                helperText="University WhatsApp group link for this batch or faculty."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                placeholder="Short description (e.g. CS Department – Year 2 resource sharing group)"
                value={form.description}
                onChange={handleChange}
                multiline
                minRows={3}
              />
            </Grid>
          </Grid>
        )}

        <Box
          sx={{
            mt: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 1.5
          }}
        >
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={mode === 'file'}
            sx={{
              px: 3,
              py: 1.1,
              borderRadius: 999,
              backgroundImage:
                mode === 'file'
                  ? 'linear-gradient(135deg, #0284c7, #22c55e)'
                  : 'linear-gradient(135deg, #16a34a, #22c55e)',
              boxShadow: (theme) =>
                theme.palette.mode === 'light'
                  ? mode === 'file'
                    ? '0 14px 30px rgba(37,99,235,0.5)'
                    : '0 14px 30px rgba(22,163,74,0.55)'
                  : mode === 'file'
                    ? '0 18px 36px rgba(37,99,235,0.9)'
                    : '0 18px 36px rgba(22,163,74,0.95)'
            }}
          >
            Submit Note
          </Button>
        </Box>

        {status && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success" variant="outlined">
              {status}
            </Alert>
          </Box>
        )}
      </Box>
    </Paper>
  );
}



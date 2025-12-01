import React, { useState, useMemo, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Container
} from '@mui/material';
import { Navbar } from './components/Navbar.jsx';
import { Hero } from './components/Hero.jsx';
import { NotesGrid } from './components/NotesGrid.jsx';
import { UploadForm } from './components/UploadForm.jsx';
import { WhatsappGroups } from './components/WhatsappGroups.jsx';
import { UniversityGroups } from './components/UniversityGroups.jsx';
import { TelegramGroups } from './components/TelegramGroups.jsx';
import { WhatsappChannels } from './components/WhatsappChannels.jsx';
import { YoutubeChannels } from './components/YoutubeChannels.jsx';
import { Feedback } from './components/Feedback.jsx';
import { ScrollToTop } from './components/ScrollToTop.jsx';
import { getAppTheme } from './theme.js';
import { fetchDriveLinks } from './services/driveLinks.js';
import { fetchWhatsappGroups } from './services/whatsappGroups.js';
import { fetchUniversityGroups } from './services/universityGroups.js';
import { fetchTelegramGroups } from './services/telegramGroups.js';
import { fetchWhatsappChannels } from './services/whatsappChannels.js';
import { fetchYoutubeChannels } from './services/youtubeChannels.js';
import footerLogoImage from './images/Gemini_Generated_Image_d5zif3d5zif3d5zi.png';

export default function App() {
  const [mode, setMode] = useState('light');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [stats, setStats] = useState({
    notes: 0,
    whatsapp: 0,
    university: 0
  });

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  useEffect(() => {
    document.body.dataset.theme = mode;
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [links, whatsapp, uni, telegram, whatsappChannels, youtube] = await Promise.all([
          fetchDriveLinks(),
          fetchWhatsappGroups(),
          fetchUniversityGroups(),
          fetchTelegramGroups(),
          fetchWhatsappChannels(),
          fetchYoutubeChannels()
        ]);

        // Map driveLinks docs to the shape expected by NotesGrid
        const driveNotes = links.map((link) => ({
          id: link.id,
          subject: link.description || 'Google Drive resource',
          grade: link.grade || link.year || '',
          medium: link.medium || '',
          curriculum: 'Google Drive',
          title: link.description || 'Shared resource',
          region: '',
          url: link.url,
          level: link.level || 'school',
          universityName: link.universityName || '',
          type: 'drive'
        }));

        // Map telegram groups
        const telegramNotes = telegram.map((group) => ({
          id: group.id,
          subject: group.subject || 'Telegram Group',
          grade: group.grade || '',
          medium: group.medium || '',
          curriculum: 'Telegram Group',
          title: group.subject || 'Telegram Study Group',
          region: '',
          url: group.url,
          level: 'school',
          universityName: '',
          type: 'telegram',
          description: group.description || ''
        }));

        // Map WhatsApp Channels
        const whatsappChannelNotes = whatsappChannels.map((channel) => ({
          id: channel.id,
          subject: channel.subject || 'WhatsApp Channel',
          grade: channel.grade || '',
          medium: channel.medium || '',
          curriculum: 'WhatsApp Channel',
          title: channel.subject || 'WhatsApp Channel',
          region: '',
          url: channel.url,
          level: 'school',
          universityName: '',
          type: 'whatsappChannel',
          description: channel.description || ''
        }));

        // Map YouTube Channels
        const youtubeNotes = youtube.map((channel) => ({
          id: channel.id,
          subject: channel.subject || 'YouTube Channel',
          grade: channel.grade || '',
          medium: channel.medium || '',
          curriculum: 'YouTube Channel',
          title: channel.subject || 'YouTube Channel',
          region: '',
          url: channel.url,
          level: 'school',
          universityName: '',
          type: 'youtube',
          description: channel.description || ''
        }));

        // Combine all notes
        const allNotes = [...driveNotes, ...telegramNotes, ...whatsappChannelNotes, ...youtubeNotes];
        setNotes(allNotes);

        setStats({
          notes: links.length,
          whatsapp: whatsapp.length,
          university: uni.length
        });
      } finally {
        setLoadingNotes(false);
      }
    };

    loadData();
  }, []);

  const filteredNotes = notes.filter((note) => {
    const matchesLevel = levelFilter === 'all' || note.level === levelFilter;
    const matchesGrade =
      gradeFilter === 'all' || String(note.grade) === String(gradeFilter);

    return matchesLevel && matchesGrade;
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-shell">
        <Navbar mode={mode} onToggleMode={toggleMode} />

        <main>
          <Hero stats={stats} />

          <section id="browse" className="section">
            <div className="section-header">
              <h2>Browse Notes</h2>
              <p className="section-subtitle">
                Find past papers, summaries, and lesson notes from volunteers across Sri Lanka.
              </p>
            </div>

            <Box
              sx={{
                mb: 2.5,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'flex-end',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 1.5
              }}
            >
              <FormControl
                size="small"
                sx={{ minWidth: { xs: '100%', sm: 160 }, width: { xs: '100%', sm: 'auto' } }}
              >
                <InputLabel id="browse-level-filter-label">Level</InputLabel>
                <Select
                  labelId="browse-level-filter-label"
                  id="browse-level-filter"
                  label="Level"
                  value={levelFilter}
                  onChange={(e) => {
                    setLevelFilter(e.target.value);
                    setGradeFilter('all'); // Reset grade filter when level changes
                  }}
                >
                  <MenuItem value="all">
                    <em>All levels</em>
                  </MenuItem>
                  <MenuItem value="school">School</MenuItem>
                  <MenuItem value="university">University</MenuItem>
                </Select>
              </FormControl>

              {levelFilter === 'all' || levelFilter === 'school' ? (
                <FormControl
                  size="small"
                  sx={{ minWidth: { xs: '100%', sm: 180 }, width: { xs: '100%', sm: 'auto' } }}
                >
                  <InputLabel id="browse-grade-filter-label">Grade</InputLabel>
                  <Select
                    labelId="browse-grade-filter-label"
                    id="browse-grade-filter"
                    label="Grade"
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                  >
                    <MenuItem value="all">
                      <em>All grades</em>
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
                  </Select>
                </FormControl>
              ) : null}
            </Box>

            {loadingNotes ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <NotesGrid notes={filteredNotes} />
            )}
          </section>

          <section id="whatsapp-groups" className="section">
            <div className="section-header">
              <h2>WhatsApp Study Groups</h2>
              <p className="section-subtitle">
                Join community-led WhatsApp groups where volunteers share updates, tips, and
                extra help after disasters.
              </p>
            </div>

            <WhatsappGroups />
          </section>

          <section id="university-groups" className="section">
            <div className="section-header">
              <h2>University WhatsApp Groups</h2>
              <p className="section-subtitle">
                Find your batch or faculty WhatsApp groups to stay connected, share notes, and
                support each other through disruptions.
              </p>
            </div>

            <UniversityGroups />
          </section>

          <section id="telegram-groups" className="section">
            <div className="section-header">
              <h2>Telegram Study Groups</h2>
              <p className="section-subtitle">
                Join Telegram groups where volunteers share notes, updates, and study materials to help students continue learning after disasters.
              </p>
            </div>

            <TelegramGroups />
          </section>

          <section id="whatsapp-channels" className="section">
            <div className="section-header">
              <h2>WhatsApp Channels</h2>
              <p className="section-subtitle">
                Subscribe to WhatsApp Channels for educational content, updates, and study materials broadcasted to help students stay informed and learn.
              </p>
            </div>

            <WhatsappChannels />
          </section>

          <section id="youtube-channels" className="section">
            <div className="section-header">
              <h2>YouTube Channels</h2>
              <p className="section-subtitle">
                Subscribe to YouTube Channels for educational videos, tutorials, and lessons to help students learn visually, especially when physical resources are lost.
              </p>
            </div>

            <YoutubeChannels />
          </section>

          <section id="donate" className="section section-alt">
            <div className="section-header">
              <h2>Donate / Upload Notes</h2>
              <p className="section-subtitle">
                Share your notes to help students catch up after floods and other disasters.
              </p>
            </div>

            <UploadForm />
          </section>

          <section id="feedback" className="section">
            <div className="section-header">
              <h2>Feedback</h2>
              <p className="section-subtitle">
                Share your thoughts, suggestions, or experiences to help us improve HopeNotes for
                students across Sri Lanka.
              </p>
            </div>

            <Feedback />
          </section>
        </main>

        <footer className="footer">
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
                px: { xs: 1, sm: 2 }
              }}
            >
              {/* Footer Logo */}
              <Box
                component="img"
                src={footerLogoImage}
                alt="HopeNotes Logo"
                sx={{
                  width: { xs: 70, sm: 90, md: 110, lg: 140 },
                  height: 'auto',
                  borderRadius: { xs: 2, sm: 2.5, md: 3, lg: 4 },
                  boxShadow: (theme) =>
                    theme.palette.mode === 'light'
                      ? '0 8px 24px rgba(15,23,42,0.12)'
                      : '0 12px 32px rgba(0,0,0,0.5)',
                  objectFit: 'contain',
                  border: (theme) =>
                    theme.palette.mode === 'light'
                      ? '2px solid rgba(148,163,184,0.15)'
                      : '2px solid rgba(30,64,175,0.3)'
                }}
              />
              
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <p>HopeNotes • Rebuilding education, one note at a time.</p>
                <p className="footer-meta">Made with care for students in Sri Lanka.</p>
                <p className="footer-meta">
                  ⚠️ <strong>Disclaimer</strong>: The documents, papers, and short notes available on this
                  website are sent by students and teachers from all over Sri Lanka. We do not claim
                  ownership of any of these materials. All rights belong to their respective owners and
                  authors.
                </p>
              </Box>
            </Box>
          </Container>
        </footer>

        {/* Scroll to Top Button */}
        <ScrollToTop />
      </div>
    </ThemeProvider>
  );
}



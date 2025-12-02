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
  Container,
  Typography
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
import { EducationWebsites } from './components/EducationWebsites.jsx';
import { Feedback } from './components/Feedback.jsx';
import { ScrollToTop } from './components/ScrollToTop.jsx';
import { getAppTheme } from './theme.js';
import { fetchDriveLinks } from './services/driveLinks.js';
import { fetchOneDriveLinks } from './services/oneDriveLinks.js';
import { fetchWhatsappGroups } from './services/whatsappGroups.js';
import { fetchUniversityGroups } from './services/universityGroups.js';
import { fetchTelegramGroups } from './services/telegramGroups.js';
import { fetchWhatsappChannels } from './services/whatsappChannels.js';
import { fetchYoutubeChannels } from './services/youtubeChannels.js';
import { fetchEducationWebsites } from './services/educationWebsites.js';
import { fetchFileUploads } from './services/fileUploads.js';
import footerLogoImage from './images/Gemini_Generated_Image_d5zif3d5zif3d5zi.png';
import newsBackgroundImage from './images/Gemini_Generated_Image_y686jby686jby686.png';

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
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#top');

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  useEffect(() => {
    document.body.dataset.theme = mode;
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Track which hash (section) is active so we can show HN News as a separate view
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#top');
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initialize on first render in case user lands directly on /#hn-news
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [links, oneDriveLinks, whatsapp, uni, telegram, whatsappChannels, youtube, websites, fileUploads] = await Promise.all([
          fetchDriveLinks(),
          fetchOneDriveLinks(),
          fetchWhatsappGroups(),
          fetchUniversityGroups(),
          fetchTelegramGroups(),
          fetchWhatsappChannels(),
          fetchYoutubeChannels(),
          fetchEducationWebsites(),
          fetchFileUploads()
        ]);

        // Map Google Drive docs
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
          type: 'drive',
          provider: 'google'
        }));

        // Map OneDrive docs
        const oneDriveNotes = oneDriveLinks.map((link) => ({
          id: link.id,
          subject: link.description || 'OneDrive resource',
          grade: link.grade || link.year || '',
          medium: link.medium || '',
          curriculum: 'OneDrive',
          title: link.description || 'Shared resource',
          region: '',
          url: link.url,
          level: link.level || 'school',
          universityName: link.universityName || '',
          type: 'drive',
          provider: 'onedrive'
        }));

        // Map telegram groups
        const telegramNotes = telegram.map((group) => ({
          id: group.id,
          subject: group.subject || 'Telegram Group',
          grade: group.level === 'university' ? group.year || '' : group.grade || '',
          medium: group.medium || '',
          curriculum: 'Telegram Group',
          title: group.subject || 'Telegram Study Group',
          region: '',
          url: group.url,
          level: group.level || 'school',
          universityName: group.universityName || '',
          type: 'telegram',
          description: group.description || ''
        }));

        // Map WhatsApp Channels
        const whatsappChannelNotes = whatsappChannels.map((channel) => ({
          id: channel.id,
          subject: channel.subject || 'WhatsApp Channel',
          grade: channel.level === 'university' ? channel.year || '' : channel.grade || '',
          medium: channel.medium || '',
          curriculum: 'WhatsApp Channel',
          title: channel.subject || 'WhatsApp Channel',
          region: '',
          url: channel.url,
          level: channel.level || 'school',
          universityName: channel.universityName || '',
          type: 'whatsappChannel',
          description: channel.description || ''
        }));

        // Map YouTube Channels
        const youtubeNotes = youtube.map((channel) => ({
          id: channel.id,
          subject: channel.subject || 'YouTube Channel',
          grade: channel.level === 'university' ? channel.year || '' : channel.grade || '',
          medium: channel.medium || '',
          curriculum: 'YouTube Channel',
          title: channel.subject || 'YouTube Channel',
          region: '',
          url: channel.url,
          level: channel.level || 'school',
          universityName: channel.universityName || '',
          type: 'youtube',
          description: channel.description || ''
        }));

        // Map Education Websites
        const websiteNotes = websites.map((website) => ({
          id: website.id,
          subject: website.subject || 'Education Website',
          grade: website.level === 'university' ? website.year || '' : website.grade || '',
          medium: website.medium || '',
          curriculum: 'Education Website',
          title: website.subject || 'Education Website',
          region: '',
          url: website.url,
          level: website.level || 'school',
          universityName: website.universityName || '',
          type: 'website',
          description: website.description || ''
        }));

        // Map File Uploads
        const fileUploadNotes = fileUploads.map((file) => ({
          id: file.id,
          subject: file.subject || 'Uploaded File',
          grade: file.grade || '',
          medium: file.medium || '',
          curriculum: 'Uploaded File',
          title: file.subject || file.fileName || 'Uploaded File',
          region: '',
          url: file.url,
          level: 'school', // File uploads are currently school level only
          universityName: '',
          type: 'file',
          description: file.description || '',
          fileName: file.fileName || '',
          fileSize: file.fileSize || 0,
          fileType: file.fileType || ''
        }));

        console.log('File uploads fetched:', fileUploads.length);
        console.log('File upload notes mapped:', fileUploadNotes.length);
        console.log('Sample file upload note:', fileUploadNotes[0]);

        // Combine all notes (Google Drive first, then OneDrive, then others)
        const allNotes = [
          ...driveNotes,
          ...oneDriveNotes,
          ...telegramNotes,
          ...whatsappChannelNotes,
          ...youtubeNotes,
          ...websiteNotes,
          ...fileUploadNotes
        ];
        console.log('Total notes (including file uploads):', allNotes.length);
        setNotes(allNotes);

        setStats({
          notes: links.length + fileUploads.length,
          whatsapp: whatsapp.length,
          university: uni.length
        });
      } finally {
        setLoadingNotes(false);
      }
    };

    loadData();
  }, []);

  const filteredNotes = useMemo(() => {
    const filtered = notes.filter((note) => {
      const matchesLevel = levelFilter === 'all' || note.level === levelFilter;
    const matchesGrade =
      gradeFilter === 'all' || String(note.grade) === String(gradeFilter);

      return matchesLevel && matchesGrade;
    });
    
    console.log('Filtered notes:', filtered.length, 'out of', notes.length);
    console.log('File uploads in filtered:', filtered.filter(n => n.type === 'file').length);
    
    return filtered;
  }, [notes, levelFilter, gradeFilter]);

  const isStandalonePage = currentHash === '#hn-news' || currentHash === '#about';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-shell">
        <Navbar mode={mode} onToggleMode={toggleMode} />

        <main>
          {!isStandalonePage && (
            <>
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
                    Telegram groups where students and teachers can share files, links, and quick help.
                  </p>
                </div>

                <TelegramGroups />
              </section>

              <section id="whatsapp-channels" className="section">
                <div className="section-header">
                  <h2>WhatsApp Channels</h2>
                  <p className="section-subtitle">
                    Follow channels that regularly post educational updates, notes, and videos for Sri Lankan students.
                  </p>
                </div>

                <WhatsappChannels />
              </section>

              <section id="youtube-channels" className="section">
                <div className="section-header">
                  <h2>YouTube Channels</h2>
                  <p className="section-subtitle">
                    Discover learning-focused YouTube channels that explain concepts, past papers, and more.
                  </p>
                </div>

                <YoutubeChannels />
              </section>

              <section id="education-websites" className="section">
                <div className="section-header">
                  <h2>Education Websites</h2>
                  <p className="section-subtitle">
                    Discover free educational websites that provide learning resources, courses, and study materials to help students continue their education online.
                  </p>
                </div>

                <EducationWebsites />
          </section>

              <section id="donate" className="section">
            <div className="section-header">
              <h2>Donate / Upload Notes</h2>
              <p className="section-subtitle">
                    Share your notes, links, and study groups so another student can keep learning, even after disaster.
              </p>
            </div>

            <UploadForm />
              </section>

              <section id="feedback" className="section">
                <div className="section-header">
                  <h2>Feedback</h2>
                  <p className="section-subtitle">
                    Share your thoughts, suggestions, or a short thank-you so we can keep improving HopeNotes for everyone.
                  </p>
                </div>

                <Feedback />
              </section>
            </>
          )}

          {/* HN News as a separate \"page\" view */}
          <section
            id="hn-news"
            className="section"
            style={{ display: currentHash === '#hn-news' ? 'block' : 'none', paddingTop: 0, paddingBottom: 0 }}
          >
            <Box
              sx={{
                position: 'relative',
                height: { xs: 400, sm: 450, md: 650 },
                width: '100vw',
                ml: 'calc(50% - 50vw)', // make the hero image full-width on all screen sizes
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {/* Background image */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${newsBackgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundRepeat: 'no-repeat',
                  filter: 'brightness(0.7)',
                  transform: 'scale(1.02)'
                }}
              />

              {/* Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(circle at 15% 0%, rgba(15,23,42,0.35), transparent 55%), linear-gradient(to bottom, rgba(15,23,42,0.65), rgba(15,23,42,0.85))'
                }}
              />

              {/* Content */}
              <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, py: { xs: 6, md: 8 } }}>
                <Box
                  sx={{
                    textAlign: 'center',
                    color: '#f9fafb',
                    px: { xs: 2, sm: 3, md: 4 }
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      mb: { xs: 1, sm: 1.5 },
                      fontSize: { xs: 26, sm: 32, md: 38 },
                      letterSpacing: { xs: 1.5, md: 2.5 }
                    }}
                  >
                    HOPE<span style={{ color: '#facc15' }}>NOTES</span> NEWS
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: { xs: 2, sm: 2.5 },
                      fontWeight: 600,
                      fontSize: { xs: 15, sm: 16, md: 18 }
                    }}
                  >
                    Voices from the floods. Stories of courage. Updates from the HopeNotes community.
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      maxWidth: 640,
                      mx: 'auto',
                      fontSize: { xs: 13.5, sm: 14.5, md: 15 },
                      lineHeight: 1.8,
                      color: 'rgba(226,232,240,0.95)'
                    }}
                  >
                    This page will soon share short stories, news, and real snapshots of how students,
                    teachers, and volunteers across Sri Lanka are using HopeNotes to keep learning
                    alive during floods and other disasters.
                  </Typography>
                </Box>
              </Container>
            </Box>
          </section>

          {/* About Us as a separate \"page\" view */}
          <section
            id="about"
            className="section"
            style={{ display: currentHash === '#about' ? 'block' : 'none' }}
          >
            <Container maxWidth="md">
              <Box
                sx={{
                  mt: { xs: 6, sm: 7, md: 8 },
                  mb: { xs: 6, sm: 7, md: 8 },
                  p: { xs: 2.5, sm: 3, md: 4 },
                  borderRadius: { xs: 3, sm: 3.5, md: 4 },
                  bgcolor: (theme) =>
                    theme.palette.mode === 'light'
                      ? 'rgba(240,253,250,0.95)'
                      : 'rgba(15,23,42,0.96)',
                  border: (theme) =>
                    theme.palette.mode === 'light'
                      ? '1px solid rgba(34,197,94,0.25)'
                      : '1px solid rgba(45,212,191,0.45)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'light'
                      ? '0 18px 40px rgba(15,23,42,0.14)'
                      : '0 22px 50px rgba(0,0,0,0.6)'
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mb: { xs: 1.5, sm: 2 },
                    fontSize: { xs: 24, sm: 28, md: 32 },
                    textAlign: 'center'
                  }}
                >
                  About HopeNotes
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: 14, sm: 15, md: 16 },
                    lineHeight: 1.8,
                    mb: 2
                  }}
                >
                  HopeNotes was created to help Sri Lankan students rebuild their education when
                  floods, landslides, and other disasters interrupt school. Volunteers, teachers,
                  and past students can share notes, links, and study groups so that learning never
                  fully stops.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: 14, sm: 15, md: 16 },
                    lineHeight: 1.8
                  }}
                >
                  Every Google Drive folder, OneDrive link, WhatsApp or Telegram group, and uploaded
                  file is a small act of kindness. Together, they become a island-wide library of
                  hope — free for any student who needs a second chance to catch up.
                </Typography>
              </Box>
            </Container>
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



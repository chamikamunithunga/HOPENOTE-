import React, { useEffect, useState } from 'react';
import { fetchEducationWebsites } from '../services/educationWebsites.js';
import { Box, Paper, Typography, Button, CircularProgress, Chip } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

export function EducationWebsites() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchEducationWebsites();
        setWebsites(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!websites.length) {
    return (
      <Box
        sx={(theme) => ({
          borderRadius: 2,
          p: 2,
          border:
            theme.palette.mode === 'light'
              ? '1px dashed rgba(148,163,184,0.7)'
              : '1px dashed rgba(148,163,184,0.6)',
          bgcolor:
            theme.palette.mode === 'light'
              ? 'rgba(248,250,252,0.9)'
              : 'rgba(15,23,42,0.95)'
        })}
      >
        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
          No education websites yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          When volunteers share educational websites, they&apos;ll appear here so students can access
          free online learning resources.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: { xs: 1.2, sm: 1.5, md: 1.5 } }}>
      {websites.map((website) => (
        <Paper
          key={website.id}
          sx={(theme) => ({
            p: { xs: 1.3, sm: 1.6, md: 1.6 },
            borderRadius: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1.2, sm: 1.4, md: 1.4 },
            border:
              theme.palette.mode === 'light'
                ? '1px solid rgba(249,115,22,0.4)'
                : '1px solid rgba(251,146,60,0.6)',
            bgcolor:
              theme.palette.mode === 'light'
                ? 'rgba(255,247,237,0.6)'
                : 'rgba(77,36,0,0.2)'
          })}
        >
          <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.1, md: 1.1 }, flex: 1 }}>
            <Box
              sx={{
                width: { xs: 30, sm: 34, md: 34 },
                height: { xs: 30, sm: 34, md: 34 },
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'radial-gradient(circle at 30% 0%, #fed7aa, #f97316)',
                boxShadow: '0 8px 22px rgba(249,115,22,0.55)',
                color: '#f9fafb',
                flexShrink: 0
              }}
            >
              <LanguageIcon sx={{ fontSize: { xs: 18, sm: 20, md: 20 } }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 0.2,
                  fontSize: { xs: 13, sm: 14, md: 14 },
                  whiteSpace: { xs: 'normal', sm: 'nowrap' },
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}
              >
                {website.subject || 'Education Website'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: website.description ? 0.2 : 0, flexWrap: 'wrap' }}>
                {website.level === 'university' ? (
                  <>
                    {website.universityName && (
                      <Chip
                        size="small"
                        label={website.universityName}
                        sx={{ height: { xs: 18, sm: 20 }, fontSize: { xs: 10, sm: 11 }, borderRadius: 999 }}
                      />
                    )}
                    {website.year && (
                      <Chip
                        size="small"
                        label={`Year ${website.year}`}
                        sx={{ height: { xs: 18, sm: 20 }, fontSize: { xs: 10, sm: 11 }, borderRadius: 999 }}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {website.grade && (
                      <Chip
                        size="small"
                        label={`Grade ${website.grade}`}
                        sx={{ height: { xs: 18, sm: 20 }, fontSize: { xs: 10, sm: 11 }, borderRadius: 999 }}
                      />
                    )}
                  </>
                )}
                {website.medium && website.medium !== 'all' && (
                  <Chip
                    size="small"
                    label={`Medium: ${website.medium}`}
                    sx={{ height: { xs: 18, sm: 20 }, fontSize: { xs: 10, sm: 11 }, borderRadius: 999 }}
                  />
                )}
              </Box>
              {website.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: 12, sm: 13 },
                    whiteSpace: { xs: 'normal', sm: 'nowrap' }, 
                    textOverflow: 'ellipsis', 
                    overflow: 'hidden' 
                  }}
                >
                  {website.description}
                </Typography>
              )}
            </Box>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => website.url && window.open(website.url, '_blank', 'noopener')}
            sx={{ 
              alignSelf: { xs: 'stretch', sm: 'center' },
              fontSize: { xs: 12, sm: 13, md: 14 },
              px: { xs: 2, sm: 2.5, md: 2.5 },
              borderColor: (theme) =>
                theme.palette.mode === 'light'
                  ? 'rgba(249,115,22,0.5)'
                  : 'rgba(251,146,60,0.6)',
              color: (theme) =>
                theme.palette.mode === 'light'
                  ? '#c2410c'
                  : '#fb923c',
              '&:hover': {
                borderColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(249,115,22,0.8)'
                    : 'rgba(251,146,60,0.9)',
                bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(249,115,22,0.1)'
                    : 'rgba(251,146,60,0.15)'
              }
            }}
          >
            Visit Website
          </Button>
        </Paper>
      ))}
    </Box>
  );
}


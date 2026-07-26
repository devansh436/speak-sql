import React, { useState } from 'react';
import {
  TextField,
  Button,
  Paper,
  Box,
  Chip,
  Typography,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';

const SAMPLE_QUERIES = [
  "Show me all books",
  "List all available books",
  "Which members have overdue books?",
  "Show me all technology books",
  "How many books has each member borrowed?",
  "List members who joined in 2024",
];

function QueryInput({ onSubmit, loading }) {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmit(question);
    }
  };

  const handleSampleClick = (sample) => {
    setQuestion(sample);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2.5, sm: 4 },
        mb: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 3 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(34, 197, 94, 0.12)',
          }}
        >
          <ChatBubbleOutlineIcon sx={{ fontSize: 17, color: 'primary.main' }} />
        </Box>
        <Typography variant="h6">Ask a question</Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="e.g., Show me all books currently borrowed by students..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
          sx={{ mb: 2.5 }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography variant="caption" color="text.disabled">
            Press Enter for a new line, click Run query to submit
          </Typography>
          <Button
            type="submit"
            variant="contained"
            endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon sx={{ fontSize: 18 }} />}
            disabled={loading || !question.trim()}
            size="large"
            sx={{ px: 4, py: 1.25 }}
          >
            {loading ? 'Running...' : 'Run query'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 3.5, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
          <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
          <Typography variant="body2" color="text.secondary">
            Try one of these
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {SAMPLE_QUERIES.map((sample, index) => (
            <Chip
              key={index}
              label={sample}
              onClick={() => handleSampleClick(sample)}
              variant="outlined"
              size="small"
              disabled={loading}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  backgroundColor: 'rgba(34, 197, 94, 0.08)',
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

export default QueryInput;
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Paper,
  Box,
  Chip,
  Typography,
  Fade,
  Zoom,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const SAMPLE_QUERIES = [
  "Show me all books",
  "List all available books",
  "Which members have overdue books?",
  "Show me all technology books",
  "How many books has each member borrowed?",
  "List members who joined in 2024"
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
    <Fade in timeout={800}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          border: '1px solid rgba(96, 165, 250, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: '1px solid rgba(96, 165, 250, 0.3)',
            boxShadow: '0 8px 32px rgba(96, 165, 250, 0.15)',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AutoAwesomeIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ 
            background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Ask Your Question
          </Typography>
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
            sx={{ 
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  }
                }
              }
            }}
          />
          
          <Button
            type="submit"
            variant="contained"
            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            disabled={loading || !question.trim()}
            fullWidth
            sx={{
              py: 1.5,
              background: loading 
                ? 'rgba(96, 165, 250, 0.3)' 
                : 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 16px rgba(96, 165, 250, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
                boxShadow: '0 6px 24px rgba(96, 165, 250, 0.4)',
                transform: 'translateY(-2px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              }
            }}
          >
            {loading ? 'Processing...' : 'Execute Query'}
          </Button>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 1.5 }}>
            💡 Try these sample queries:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {SAMPLE_QUERIES.map((sample, index) => (
              <Zoom in timeout={300 + index * 100} key={index}>
                <Chip
                  label={sample}
                  onClick={() => handleSampleClick(sample)}
                  variant="outlined"
                  size="small"
                  disabled={loading}
                  sx={{
                    borderColor: 'rgba(96, 165, 250, 0.3)',
                    color: 'text.secondary',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(96, 165, 250, 0.1)',
                      color: 'primary.main',
                      transform: 'translateY(-2px)',
                    }
                  }}
                />
              </Zoom>
            ))}
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
}

export default QueryInput;

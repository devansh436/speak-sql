import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Chip,
  Alert,
  Fade
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloudIcon from '@mui/icons-material/Cloud';

function DocsPage() {
  const sampleQueries = [
    "Show me all books",
    "Which members have overdue books?",
    "List all technology books",
    "How many books has each member borrowed?",
    "Show books that have never been borrowed",
    "List members who joined in 2024"
  ];

  const techStack = [
    { name: 'React', description: 'Frontend UI library', color: '#61dafb' },
    { name: 'Material-UI', description: 'Component library', color: '#007fff' },
    { name: 'Node.js', description: 'Backend runtime', color: '#68a063' },
    { name: 'Express', description: 'Web framework', color: '#000000' },
    { name: 'MySQL', description: 'Database', color: '#4479a1' },
    { name: 'Gemini AI', description: 'NLQ to SQL', color: '#8e75f5' },
    { name: 'Aiven', description: 'Cloud MySQL', color: '#ff3e00' },
    { name: 'Vercel', description: 'Hosting platform', color: '#000000' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <MenuBookIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={700}>
              Documentation
            </Typography>
          </Box>

          {/* Overview */}
          <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon color="primary" />
              Overview
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" paragraph color="text.secondary">
              The Library NLQ (Natural Language Query) System allows users to interact with a MySQL database using natural language instead of writing SQL queries. 
              The system uses Google's Gemini AI to convert English questions into SQL queries automatically.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This full-stack application demonstrates AI-powered database querying with a beautiful, responsive interface and robust error handling including automatic query self-correction.
            </Typography>
          </Paper>

          {/* Features */}
          <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Key Features
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body1" paragraph color="text.secondary">
                <strong>AI-Powered NLQ:</strong> Convert English questions to SQL automatically using Gemini Flash 2.0
              </Typography>
              <Typography component="li" variant="body1" paragraph color="text.secondary">
                <strong>Self-Correction:</strong> Automatically retries and fixes failed queries (up to 2 attempts)
              </Typography>
              <Typography component="li" variant="body1" paragraph color="text.secondary">
                <strong>SQL Injection Prevention:</strong> Validates all generated queries before execution
              </Typography>
              <Typography component="li" variant="body1" paragraph color="text.secondary">
                <strong>Beautiful UI:</strong> Dark mode, syntax highlighting, smooth animations
              </Typography>
              <Typography component="li" variant="body1" paragraph color="text.secondary">
                <strong>Real-time Results:</strong> Instant query execution with formatted table display
              </Typography>
              <Typography component="li" variant="body1" paragraph color="text.secondary">
                <strong>Cloud Hosted:</strong> Deployed on Vercel with Aiven MySQL database
              </Typography>
            </Box>
          </Paper>

          {/* Sample Queries */}
          <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CodeIcon color="primary" />
              Sample Queries
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {sampleQueries.map((query, index) => (
                <Chip 
                  key={index}
                  label={query}
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.95rem',
                    py: 2.5,
                    px: 1,
                    borderColor: 'primary.main',
                    color: 'text.primary'
                  }}
                />
              ))}
            </Box>
          </Paper>

          {/* Database Schema */}
          <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorageIcon color="primary" />
              Database Schema
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
                📚 Books Table
              </Typography>
              <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 3 }}>
                <li>book_id (PRIMARY KEY)</li>
                <li>title, author, isbn, category</li>
                <li>publication_year, publisher</li>
                <li>available_copies, total_copies, status</li>
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600} color="success.main" gutterBottom>
                👤 Members Table
              </Typography>
              <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 3 }}>
                <li>member_id (PRIMARY KEY)</li>
                <li>name, email, phone, address</li>
                <li>membership_type, join_date, expiry_date</li>
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600} color="secondary.main" gutterBottom>
                👨‍💼 Staff Table
              </Typography>
              <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 3 }}>
                <li>staff_id (PRIMARY KEY)</li>
                <li>name, position, email, phone</li>
                <li>hire_date, salary</li>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={600} color="warning.main" gutterBottom>
                📝 Transactions Table
              </Typography>
              <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 3 }}>
                <li>transaction_id (PRIMARY KEY)</li>
                <li>book_id (FOREIGN KEY → books)</li>
                <li>member_id (FOREIGN KEY → members)</li>
                <li>issue_date, due_date, return_date</li>
                <li>status, fine_amount</li>
              </Typography>
            </Box>
          </Paper>

          {/* Tech Stack */}
          <Paper elevation={3} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudIcon color="primary" />
              Technology Stack
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {techStack.map((tech, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    flex: '1 1 calc(50% - 16px)',
                    minWidth: '200px',
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(96, 165, 250, 0.2)'
                    }
                  }}
                >
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {tech.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tech.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* How It Works */}
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              How It Works
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="info" icon={<Typography sx={{ fontSize: '1.5rem' }}>1️⃣</Typography>}>
                <Typography variant="body2">
                  <strong>User Input:</strong> Enter a natural language question (e.g., "Which members have overdue books?")
                </Typography>
              </Alert>
              <Alert severity="info" icon={<Typography sx={{ fontSize: '1.5rem' }}>2️⃣</Typography>}>
                <Typography variant="body2">
                  <strong>AI Processing:</strong> Gemini AI converts the question to SQL query
                </Typography>
              </Alert>
              <Alert severity="info" icon={<Typography sx={{ fontSize: '1.5rem' }}>3️⃣</Typography>}>
                <Typography variant="body2">
                  <strong>Validation:</strong> Backend validates the query for safety
                </Typography>
              </Alert>
              <Alert severity="info" icon={<Typography sx={{ fontSize: '1.5rem' }}>4️⃣</Typography>}>
                <Typography variant="body2">
                  <strong>Execution:</strong> Query runs on Aiven MySQL cloud database
                </Typography>
              </Alert>
              <Alert severity="info" icon={<Typography sx={{ fontSize: '1.5rem' }}>5️⃣</Typography>}>
                <Typography variant="body2">
                  <strong>Display:</strong> Results shown in a beautiful formatted table with syntax highlighting
                </Typography>
              </Alert>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
}

export default DocsPage;

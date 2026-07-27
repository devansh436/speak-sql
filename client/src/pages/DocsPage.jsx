import React from 'react';
import { Container, Typography, Box, Paper, Divider, Chip, Stack } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';

const TECH_STACK = [
  { name: 'React', description: 'Frontend UI library' },
  { name: 'Material UI', description: 'Component library' },
  { name: 'Node.js', description: 'Backend runtime' },
  { name: 'Express', description: 'Web framework' },
  { name: 'MySQL', description: 'Database' },
  { name: 'Gemini AI', description: 'Natural language to SQL' },
  { name: 'Aiven', description: 'Cloud MySQL hosting' },
  { name: 'Vercel', description: 'Hosting platform' },
];

const SCHEMA = [
  {
    table: 'books',
    fields: ['book_id (PK)', 'title, author, isbn, category', 'publication_year, publisher', 'available_copies, total_copies, status'],
  },
  {
    table: 'members',
    fields: ['member_id (PK)', 'name, email, phone, address', 'membership_type, join_date, expiry_date'],
  },
  {
    table: 'staff',
    fields: ['staff_id (PK)', 'name, position, email, phone', 'hire_date, salary'],
  },
  {
    table: 'transactions',
    fields: ['transaction_id (PK)', 'book_id (FK → books)', 'member_id (FK → members)', 'issue_date, due_date, return_date, status, fine_amount'],
  },
];

const STEPS = [
  {
    title: "Authenticate",
    body: "The user signs in with Firebase Authentication and the client sends the Firebase ID token with each query.",
  },
  {
    title: "Generate SQL",
    body: "The backend verifies the token, retrieves the current database schema, and uses the Gemini API to convert the natural-language question into SQL.",
  },
  {
    title: "Validate",
    body: "The generated SQL is checked against the user's role. Unauthorized tables, unsafe operations, injection patterns, and multi-statement queries are rejected.",
  },
  {
    title: "Execute",
    body: "If validation succeeds, the SQL query is executed against the MySQL database.",
  },
  {
    title: "Return Results",
    body: "The query results are returned to the client. If validation fails, a role-based error response is sent instead.",
  },
];
function Section({ icon, title, children }) {
  return (
    <Paper variant="outlined" sx={{ p: 4, mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
        {icon}
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
      </Stack>
      <Divider sx={{ mb: 2.5 }} />
      {children}
    </Paper>
  );
}

function DocsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
        <MenuBookIcon sx={{ fontSize: 34, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight={700}>
          Documentation
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: 4, mb: 3 }}>
  <Typography variant="h5" fontWeight={700} gutterBottom>
    Overview
  </Typography>
  <Divider sx={{ mb: 2.5 }} />

  <Typography variant="body1" color="text.secondary" paragraph>
    SpeakSQL allows authenticated users to query a MySQL library database
    using natural language instead of writing SQL. Questions are converted
    into SQL using external LLM service with the current database schema as
    context, then validated before execution.
  </Typography>

  <Typography variant="body1" color="text.secondary">
    Firebase Authentication secures user access, MongoDB stores user
    profiles and roles, and role-based SQL validation ensures users can
    only execute queries permitted by their assigned permissions.
  </Typography>
</Paper>

      <Section icon={<StorageIcon color="primary" />} title="Database schema">
        <Stack spacing={3}>
          {SCHEMA.map(({ table, fields }) => (
            <Box key={table}>
              <Typography variant="subtitle1" fontWeight={700} color="primary.main" gutterBottom>
                {table}
              </Typography>
              <Box component="ul" sx={{ pl: 3, m: 0, color: 'text.secondary' }}>
                {fields.map((f) => (
                  <Typography key={f} component="li" variant="body2">
                    {f}
                  </Typography>
                ))}
              </Box>
            </Box>
          ))}
        </Stack>
      </Section>

      <Section icon={<CloudIcon color="primary" />} title="Technology stack">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 1.5,
          }}
        >
          {TECH_STACK.map((tech) => (
            <Box
              key={tech.name}
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                {tech.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tech.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Section>

      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          How it works
        </Typography>
        <Divider sx={{ mb: 2.5 }} />
        <Stack spacing={2}>
          {STEPS.map((step, i) => (
            <Stack direction="row" spacing={2} key={step.title}>
              <Box
                sx={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'primary.main',
                }}
              >
                {i + 1}
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.body}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Container>
  );
}

export default DocsPage;
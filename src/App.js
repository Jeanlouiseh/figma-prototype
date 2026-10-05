import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Sidebar from './components/Sidebar';
import ProjectDashboard from './pages/ProjectDashboard';
import ClashDetection from './pages/ClashDetection';
import CreateClashTest from './pages/CreateClashTest';
import ClashTestDetail from './pages/ClashTestDetail';
import { getStoredTests, hasTestResults } from './data/clashTestsStore';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',
    },
    secondary: {
      main: '#1976D2',
    },
    background: {
      default: '#dfe4e7',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell"',
  },
});

function TestResultsRoute() {
  const { id } = useParams();
  const location = useLocation();
  const test = getStoredTests().find((item) => String(item.id) === String(id || location.state?.id))
    || location.state;

  if (test && !hasTestResults(test)) {
    return <Navigate to="/clash-detection/new" state={test} replace />;
  }

  return <ClashTestDetail />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', height: '100vh' }}>
          <Sidebar />
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Routes>
              <Route path="/" element={<ProjectDashboard />} />
              <Route path="/clash-detection" element={<ClashDetection />} />
              <Route path="/clash-detection/new" element={<CreateClashTest />} />
              <Route path="/clash-detection/test/:id" element={<TestResultsRoute />} />
              <Route path="/clash-detection/detail" element={<TestResultsRoute />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

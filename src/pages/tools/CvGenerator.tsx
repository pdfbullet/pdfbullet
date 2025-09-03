import React from 'react';
import { Navigate } from 'react-router-dom';

// This component is a placeholder that redirects to the full-page implementation.
// The actual generator logic is complex and located in pages/CVGeneratorPage.tsx.
// This redirect ensures the new component-based routing works correctly.

const CvGeneratorTool: React.FC = () => {
    return <Navigate to="/cv-generator" replace />;
};

export default CvGeneratorTool;

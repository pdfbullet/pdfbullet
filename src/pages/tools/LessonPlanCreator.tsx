import React from 'react';
import { Navigate } from 'react-router-dom';

// This component is a placeholder that redirects to the full-page implementation.
// The actual generator logic is complex and located in pages/LessonPlanCreatorPage.tsx.
// This redirect ensures the new component-based routing works correctly.

const LessonPlanCreatorTool: React.FC = () => {
    return <Navigate to="/lesson-plan-creator" replace />;
};

export default LessonPlanCreatorTool;

import React from 'react';
import { Navigate } from 'react-router-dom';

// This component is a placeholder that redirects to the full-page implementation.
// The actual generator logic is complex and located in pages/InvoiceGeneratorPage.tsx
// To integrate it here, we would need to extract it into a reusable component.
// For now, this redirect ensures the routing works correctly.

const InvoiceGeneratorTool: React.FC = () => {
    
    return <Navigate to="/invoice-generator" replace />;
};

export default InvoiceGeneratorTool;

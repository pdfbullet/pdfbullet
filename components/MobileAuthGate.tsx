import React from 'react';

interface MobileAuthGateProps {
    children: React.ReactNode;
    onOpenForgotPasswordModal: () => void;
}

const MobileAuthGate: React.FC<MobileAuthGateProps> = ({ children }) => {
    return <>{children}</>;
};

export default MobileAuthGate;

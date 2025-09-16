import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import MobileAuthScreen from './MobileAuthScreen.tsx';
import Preloader from './Preloader.tsx';

interface MobileAuthGateProps {
    children: React.ReactNode;
    onOpenForgotPasswordModal: () => void;
}

const MobileAuthGate: React.FC<MobileAuthGateProps> = ({ children, onOpenForgotPasswordModal }) => {
    const { user, loading } = useAuth();
    const [isGateActive, setIsGateActive] = useState(false);

    useEffect(() => {
        // Determine if the gate should be active only after loading is complete
        if (!loading) {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
            const shouldBeGated = isStandalone && !user;
            setIsGateActive(shouldBeGated);
        }
    }, [user, loading]);

    if (loading) {
        return <Preloader />;
    }

    if (isGateActive) {
        return <MobileAuthScreen onOpenForgotPasswordModal={onOpenForgotPasswordModal} />;
    }

    return <>{children}</>;
};

export default MobileAuthGate;

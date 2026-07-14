import React from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import Preloader from './Preloader.tsx';
import MobileAuthScreen from './MobileAuthScreen.tsx';

interface MobileAuthGateProps {
    children: React.ReactNode;
    onOpenForgotPasswordModal: () => void;
}

const MobileAuthGate: React.FC<MobileAuthGateProps> = ({ children, onOpenForgotPasswordModal }) => {
    const { user, loading } = useAuth();
    const [isGuest, setIsGuest] = React.useState(() => {
        return localStorage.getItem('guest_mode') === 'true';
    });

    if (loading) {
        return <Preloader />;
    }

    if (!user && !isGuest) {
        return (
            <MobileAuthScreen 
                onOpenForgotPasswordModal={onOpenForgotPasswordModal} 
                onContinueAsGuest={() => {
                    localStorage.setItem('guest_mode', 'true');
                    setIsGuest(true);
                }} 
            />
        );
    }

    return <>{children}</>;
};

export default MobileAuthGate;

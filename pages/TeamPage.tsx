import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { CheckIcon } from '../components/icons.tsx';
import UpgradeModal from '../components/UpgradeModal.tsx';
import InviteMembersModal from '../components/InviteMembersModal.tsx';

const TeamPage: React.FC = () => {
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const { user } = useAuth();

    const handleInviteClick = () => {
        if (user?.isPremium) {
            setIsInviteModalOpen(true);
        } else {
            setIsUpgradeModalOpen(true);
        }
    };

    return (
        <>
            <div className="w-full">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-8">Workspace</h1>
                <div className="bg-white dark:bg-surface-dark p-8 md:p-12 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="flex justify-center order-1 md:order-2">
                            <img 
                                src="https://www.ilovepdf.com/img/user/team/workspace.svg" 
                                alt="Team working in a workspace" 
                                className="max-w-xs w-full"
                                width="320"
                                height="275" 
                            />
                        </div>
                        <div className="order-2 md:order-1">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                Create and manage teams in your workspace
                            </h2>
                            <ul className="mt-6 space-y-4 text-gray-600 dark:text-gray-400">
                                <li className="flex items-start gap-3">
                                    <CheckIcon className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                                    <span>Obtain and manage multiple iLovePDFLY licenses inviting several users to your workspace.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckIcon className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                                    <span>Organize your workspace into various teams.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckIcon className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                                    <span>Set permission roles and assign each member to their team in your workspace.</span>
                                </li>
                            </ul>
                            <div className="mt-8">
                                <button
                                    onClick={handleInviteClick}
                                    className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Invite members
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            { !user?.isPremium && <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} /> }
            { user?.isPremium && <InviteMembersModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} /> }
        </>
    );
};

export default TeamPage;
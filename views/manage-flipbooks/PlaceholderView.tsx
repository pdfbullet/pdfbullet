import React from 'react';

interface PlaceholderViewProps {
    title: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title }) => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">{title}</h1>
            <div className="bg-white/90 dark:bg-gray-800/90 p-12 rounded-lg shadow-md backdrop-blur-sm">
                <p className="text-center text-gray-500 dark:text-gray-400">
                    The "{title}" section is under construction. Please check back later!
                </p>
            </div>
        </div>
    );
};

export default PlaceholderView;

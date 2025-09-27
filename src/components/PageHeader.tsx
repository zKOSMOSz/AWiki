import React from 'react';

const PageHeader: React.FC<{title: string, icon?: React.ReactNode}> = ({ title, icon }) => (
    <div className="flex items-center space-x-3 mb-8">
        {icon}
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{title}</h1>
    </div>
);

export default PageHeader;

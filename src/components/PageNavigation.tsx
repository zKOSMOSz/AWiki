import React from 'react';
import type { WikiPage } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

const PageNavigation: React.FC<{nextPage: WikiPage | null, prevPage: WikiPage | null, onSelectPage: (id: string) => void}> = ({ nextPage, prevPage, onSelectPage }) => (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-zinc-800 grid grid-cols-2 gap-4">
        <div>
            {prevPage && (
                <button onClick={() => onSelectPage(prevPage.id)} className="w-full text-left p-4 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Previous</div>
                    <div className="flex items-center text-zinc-900 dark:text-white font-medium">
                        <ChevronLeftIcon className="w-4 h-4 mr-2" />
                        {prevPage.title}
                    </div>
                </button>
            )}
        </div>
        <div>
            {nextPage && (
                <button onClick={() => onSelectPage(nextPage.id)} className="w-full text-right p-4 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Next</div>
                    <div className="flex items-center justify-end text-zinc-900 dark:text-white font-medium">
                        {nextPage.title}
                        <ChevronRightIcon className="w-4 h-4 ml-2" />
                    </div>
                </button>
            )}
        </div>
    </div>
);

export default PageNavigation;

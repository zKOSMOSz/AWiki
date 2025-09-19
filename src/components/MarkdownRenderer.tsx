import React from 'react';
import { InfoIcon, WarningIcon } from './icons';

const applyInlineFormatting = (line: string): React.ReactNode => {
    const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|!\[.*?\]\(.*?\))/g);

    return parts.map((part, index) => {
        if (!part) return null;
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={index}>{part.substring(1, part.length - 1)}</em>;
        }
        if (part.startsWith('![')) {
            const altMatch = part.match(/!\[(.*?)\]/);
            const urlMatch = part.match(/\((.*?)\)/);
            if(altMatch && urlMatch) {
                return <img key={index} src={urlMatch[1]} alt={altMatch[1]} className="my-6 rounded-lg" />;
            }
        }
        return part;
    });
};

const renderListItemContent = (line: string): React.ReactNode => {
    const linkKeywords = ['Вконтакте:', 'Discord:', 'Телеграмм:', 'Онлайн-карта:', 'Донат:'];

    for (const key of linkKeywords) {
        const index = line.indexOf(key);
        if (index !== -1) {
            const prefix = line.substring(0, index + key.length);
            const linkText = line.substring(index + key.length).trim();
            
            const formattedLinkText = applyInlineFormatting(linkText);

            return (
                <>
                    {applyInlineFormatting(prefix)}
                    <a href="#" className="ml-1 text-blue-500 dark:text-blue-400 hover:underline">
                        {formattedLinkText}
                        <span className="inline-block ml-1">↗</span>
                    </a>
                </>
            );
        }
    }

    return applyInlineFormatting(line);
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    if (!content) {
        return <div className="prose dark:prose-invert max-w-none"><p>Select a page to view its content.</p></div>;
    }
    
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-2 my-4 pl-4 text-gray-600 dark:text-gray-300">
                    {listItems.map((item, index) => (
                        <li key={index}>{renderListItemContent(item)}</li>
                    ))}
                </ul>
            );
            listItems = [];
        }
    };
    
    const flushTable = () => {
        if (tableRows.length > 0) {
            const headers = tableRows[0];
            const bodyRows = tableRows.slice(2); // Skip header and separator
            elements.push(
                <div key={`table-${elements.length}`} className="my-6 overflow-x-auto border border-gray-200 dark:border-zinc-800 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50">
                            <tr>
                                {headers.map((header, i) => <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>)}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                           {bodyRows.map((row, i) => (
                             <tr key={i} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                {row.map((cell, j) => <td key={j} className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{cell}</td>)}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            );
            tableRows = [];
        }
    };


    lines.forEach((line) => {
        if (line.startsWith('[TABLE]')) {
            flushList();
            inTable = true;
            return;
        }
        if (line.startsWith('[/TABLE]')) {
            flushTable();
            inTable = false;
            return;
        }
        if (inTable) {
            tableRows.push(line.split(';').map(s => s.trim()));
            return;
        }
        
        if (line.trim() === '---') {
            flushList();
            elements.push(<hr key={elements.length} className="my-8 border-gray-200 dark:border-zinc-800" />);
        } else if (line.startsWith('# ')) {
            // H1 is handled by PageHeader now
            // We can treat it as a bold paragraph or ignore it
        } else if (line.startsWith('## ')) {
            flushList();
            elements.push(<h2 key={elements.length} className="text-2xl font-bold text-zinc-900 dark:text-white border-b border-gray-200 dark:border-zinc-800 pb-2 mt-10 mb-4">{line.substring(3)}</h2>);
        } else if (line.startsWith('### ')) {
            flushList();
            elements.push(<h3 key={elements.length} className="text-xl font-semibold text-zinc-900 dark:text-white mt-8 mb-3">{line.substring(4)}</h3>);
        } else if (line.startsWith('* ')) {
            listItems.push(line.substring(2));
        } else if (line.startsWith('> i ')) {
            flushList();
            elements.push(
                <div key={elements.length} className="my-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg flex items-start space-x-3">
                    <InfoIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-blue-800 dark:text-blue-200">{applyInlineFormatting(line.substring(4))}</div>
                </div>
            );
        } else if (line.startsWith('> ! ')) {
            flushList();
            elements.push(
                <div key={elements.length} className="my-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg flex items-start space-x-3">
                    <WarningIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-yellow-800 dark:text-yellow-200">{applyInlineFormatting(line.substring(4))}</div>
                </div>
            );
        } else if (line.trim() === '') {
            flushList();
        } else {
            flushList();
            elements.push(<p key={elements.length} className="my-4 leading-relaxed text-gray-600 dark:text-gray-300">{applyInlineFormatting(line)}</p>);
        }
    });

    flushList();
    flushTable();

    return <div className="max-w-none text-gray-600 dark:text-gray-300">{elements}</div>;
};

export default MarkdownRenderer;
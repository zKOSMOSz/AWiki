import React from 'react';
import { InfoIcon, WarningIcon } from './icons';

const applyInlineFormatting = (line: string): React.ReactNode => {
    // Regex for bold, italic, inline code, links, and images
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\)|!\[.*?\]\(.*?\))/g;
    const parts = line.split(regex);

    return parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={index}>{part.substring(1, part.length - 1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={index} className="bg-gray-200 dark:bg-zinc-700 rounded px-1.5 py-0.5 text-sm font-mono text-red-500 dark:text-red-400">{part.substring(1, part.length - 1)}</code>;
        }
        if (part.startsWith('![')) {
            const altMatch = part.match(/!\[(.*?)\]/);
            const urlMatch = part.match(/\((.*?)\)/);
            if(altMatch && urlMatch) {
                return <img key={index} src={urlMatch[1]} alt={altMatch[1]} className="my-6 rounded-lg shadow-md" />;
            }
        }
        if (part.startsWith('[')) {
            const textMatch = part.match(/\[(.*?)\]/);
            const urlMatch = part.match(/\((.*?)\)/);
            if (textMatch && urlMatch) {
                if (urlMatch[1].startsWith('http')) {
                    return (
                        <a key={index} href={urlMatch[1]} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline">
                            {textMatch[1]}
                            <span className="inline-block ml-0.5 text-xs align-super">↗</span>
                        </a>
                    );
                }
                return (
                     <a key={index} href={urlMatch[1]} className="text-blue-500 dark:text-blue-400 hover:underline">{textMatch[1]}</a>
                );
            }
        }
        return part;
    });
};

const renderListItemContent = (line: string): React.ReactNode => {
    const linkKeywords = ['Вконтакте:', 'Discord:', 'Телеграмм:', 'Онлайн-карта:', 'Донат:', 'Fabric', 'Forge'];

    for (const key of linkKeywords) {
        if (line.trim().startsWith(key)) {
            const index = line.indexOf(key);
            const prefix = line.substring(0, index + key.length);
            const linkText = line.substring(index + key.length).trim();
            
            const formattedLinkText = applyInlineFormatting(linkText);
            
            let href = '#';
            if (linkText.startsWith('http')) {
                href = linkText;
            } else if (linkText.includes('ссылка')) {
                // Placeholder for now
                href = '#';
            }

            return (
                <>
                    {applyInlineFormatting(prefix)}
                    <a href={href} className="ml-1 text-blue-500 dark:text-blue-400 hover:underline">
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
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        if (line.trim() === '') {
            i++;
            continue;
        }

        // Headers
        if (line.startsWith('### ')) {
            elements.push(<h3 key={i} className="text-xl font-semibold text-zinc-900 dark:text-white mt-8 mb-3">{applyInlineFormatting(line.substring(4))}</h3>);
            i++;
            continue;
        }
        if (line.startsWith('## ')) {
            elements.push(<h2 key={i} className="text-2xl font-bold text-zinc-900 dark:text-white border-b border-gray-200 dark:border-zinc-800 pb-2 mt-10 mb-4">{applyInlineFormatting(line.substring(3))}</h2>);
            i++;
            continue;
        }
        
        // Code blocks
        if (line.startsWith('```')) {
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            elements.push(
                <pre key={i} className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg my-4 overflow-x-auto text-sm">
                    <code>{codeLines.join('\n')}</code>
                </pre>
            );
            i++;
            continue;
        }

        // Custom callouts
        if (line.startsWith('> i ')) {
            elements.push(
                <div key={i} className="my-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg flex items-start space-x-3">
                    <InfoIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-blue-800 dark:text-blue-200">{applyInlineFormatting(line.substring(4))}</div>
                </div>
            );
            i++;
            continue;
        }
        if (line.startsWith('> ! ')) {
            elements.push(
                <div key={i} className="my-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg flex items-start space-x-3">
                    <WarningIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-yellow-800 dark:text-yellow-200">{applyInlineFormatting(line.substring(4))}</div>
                </div>
            );
            i++;
            continue;
        }

        // Blockquotes
        if (line.startsWith('> ')) {
            const bqLines = [];
            while (i < lines.length && lines[i].startsWith('> ')) {
                bqLines.push(lines[i].substring(2));
                i++;
            }
            elements.push(
                <blockquote key={i} className="my-4 pl-4 border-l-4 border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-gray-400 italic">
                    {bqLines.map((bqLine, index) => <p key={index} className="mb-2 last:mb-0">{applyInlineFormatting(bqLine)}</p>)}
                </blockquote>
            );
            continue;
        }

        // Unordered List
        if (line.startsWith('* ') || line.startsWith('- ')) {
            const listItems = [];
            while (i < lines.length && (lines[i].startsWith('* ') || lines[i].startsWith('- '))) {
                listItems.push(lines[i].substring(2));
                i++;
            }
            elements.push(
                <ul key={i} className="list-disc list-inside space-y-2 my-4 pl-4">
                    {listItems.map((item, index) => <li key={index}>{renderListItemContent(item)}</li>)}
                </ul>
            );
            continue;
        }

        // Ordered List
        if (/^\d+\.\s/.test(line)) {
            const listItems = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                listItems.push(lines[i].replace(/^\d+\.\s/, ''));
                i++;
            }
             elements.push(
                <ol key={i} className="list-decimal list-inside space-y-2 my-4 pl-4">
                    {listItems.map((item, index) => <li key={index}>{renderListItemContent(item)}</li>)}
                </ol>
            );
            continue;
        }
        
        // Horizontal Rule
        if (line.trim() === '---') {
            elements.push(<hr key={i} className="my-8 border-gray-200 dark:border-zinc-800" />);
            i++;
            continue;
        }

        // Custom Table
        if (line.startsWith('[TABLE]')) {
            const tableRowsData = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('[/TABLE]')) {
                tableRowsData.push(lines[i].split(';').map(s => s.trim()));
                i++;
            }
            if (tableRowsData.length > 0) {
                 const headers = tableRowsData[0];
                 const bodyRows = tableRowsData.length > 1 ? tableRowsData.slice(1) : [];
                 
                 elements.push(
                    <div key={i} className="my-6 overflow-x-auto border border-gray-200 dark:border-zinc-800 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                            <thead className="bg-gray-50 dark:bg-zinc-800/50">
                                <tr>
                                    {headers.map((header, hIdx) => <th key={hIdx} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>)}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                               {bodyRows.map((row, rIdx) => (
                                 <tr key={rIdx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                    {row.map((cell, cIdx) => <td key={cIdx} className="px-4 py-4 text-sm">{applyInlineFormatting(cell)}</td>)}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                );
            }
            i++; // Skip [/TABLE]
            continue;
        }

        // Standalone Image
        if (line.startsWith('![')) {
             elements.push(<div key={i}>{applyInlineFormatting(line)}</div>)
             i++;
             continue;
        }

        // Paragraph
        const pLines = [];
        while (i < lines.length && lines[i].trim() !== '') {
            const isNewBlock = 
                lines[i].startsWith('##') ||
                lines[i].startsWith('###') ||
                lines[i].startsWith('* ') ||
                lines[i].startsWith('- ') ||
                lines[i].startsWith('> ') ||
                lines[i].startsWith('```') ||
                lines[i].startsWith('[TABLE]') ||
                lines[i].startsWith('![') ||
                lines[i].trim() === '---' ||
                /^\d+\.\s/.test(lines[i]);
            
            if (isNewBlock) break;

            pLines.push(lines[i]);
            i++;
        }
        if (pLines.length > 0) {
            elements.push(
                <p key={i} className="my-4 leading-relaxed">
                  {pLines.map((pLine, index) => (
                    <React.Fragment key={index}>
                        {applyInlineFormatting(pLine)}
                        {index < pLines.length - 1 && ' '} 
                    </React.Fragment>
                  ))}
                </p>
            );
        }
    }

    return <div className="max-w-none text-gray-600 dark:text-gray-300">{elements}</div>;
};

export default MarkdownRenderer;

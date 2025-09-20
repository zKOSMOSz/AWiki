import React from 'react';
import { InfoIcon, WarningIcon } from './icons';

// --- INLINE FORMATTING ---

const applyInlineFormatting = (text: string): React.ReactNode => {
    // Regex for bold, italic, strikethrough, inline code, links, and images
    const regex = /(\*\*.*?\*\*|\*.*?\*|~~.*?~~|`.*?`|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\))/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{applyInlineFormatting(part.substring(2, part.length - 2))}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={index}>{applyInlineFormatting(part.substring(1, part.length - 1))}</em>;
        }
        if (part.startsWith('~~') && part.endsWith('~~')) {
            return <del key={index}>{part.substring(2, part.length - 2)}</del>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={index} className="bg-gray-200 dark:bg-zinc-700 rounded px-1.5 py-0.5 text-sm font-mono text-red-500 dark:text-red-400">{part.substring(1, part.length - 1)}</code>;
        }
        if (part.startsWith('![')) {
            const altMatch = part.match(/!\[(.*?)\]/);
            const urlMatch = part.match(/\((.*?)\)/);
            if (altMatch && urlMatch) {
                return <img key={index} src={urlMatch[1]} alt={altMatch[1]} className="my-6 rounded-lg shadow-md max-w-full" />;
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

const renderListItemContent = (item: string): React.ReactNode => {
    const checkboxRegex = /^\[([x ])\]\s+/;
    const match = item.match(checkboxRegex);

    if (match) {
        const isChecked = match[1] === 'x';
        const text = item.substring(match[0].length);
        return (
            <span className="flex items-center">
                <input type="checkbox" disabled checked={isChecked} className="mr-2 h-4 w-4 rounded border-gray-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500 bg-gray-100 dark:bg-zinc-800" />
                {applyInlineFormatting(text)}
            </span>
        );
    }
    return applyInlineFormatting(item);
};


// --- BLOCK PARSER ---

type Block =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'code'; lang: string; content: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'blockquote'; lines: string[] }
  | { type: 'hr' }
  | { type: 'image'; alt: string; src: string }
  | { type: 'callout'; variant: 'info' | 'warning'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] };

const parseMarkdownToBlocks = (content: string): Block[] => {
    const lines = content.split('\n');
    const blocks: Block[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        if (line.trim() === '') {
            i++;
            continue;
        }

        // Headers
        if (line.startsWith('### ')) { blocks.push({ type: 'h3', text: line.substring(4) }); i++; continue; }
        if (line.startsWith('## ')) { blocks.push({ type: 'h2', text: line.substring(3) }); i++; continue; }
        if (line.startsWith('# ')) { blocks.push({ type: 'h1', text: line.substring(2) }); i++; continue; }
        
        // Horizontal Rule
        if (line.trim() === '---') { blocks.push({ type: 'hr' }); i++; continue; }

        // Callouts
        if (line.startsWith('> i ')) { blocks.push({ type: 'callout', variant: 'info', text: line.substring(4) }); i++; continue; }
        if (line.startsWith('> ! ')) { blocks.push({ type: 'callout', variant: 'warning', text: line.substring(4) }); i++; continue; }
        
        // Code blocks
        if (line.startsWith('```')) {
            const lang = line.substring(3).trim();
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            blocks.push({ type: 'code', lang, content: codeLines.join('\n') });
            i++; continue;
        }

        // Blockquotes
        if (line.startsWith('> ')) {
            const bqLines: string[] = [];
            while (i < lines.length && lines[i].startsWith('> ')) {
                bqLines.push(lines[i].substring(2));
                i++;
            }
            blocks.push({ type: 'blockquote', lines: bqLines });
            continue;
        }
        
        // Unordered List
        if (line.startsWith('* ') || line.startsWith('- ')) {
            const listItems: string[] = [];
            while (i < lines.length && (lines[i].startsWith('* ') || lines[i].startsWith('- '))) {
                listItems.push(lines[i].substring(2));
                i++;
            }
            blocks.push({ type: 'ul', items: listItems });
            continue;
        }

        // Ordered List
        if (/^\d+\.\s/.test(line)) {
            const listItems: string[] = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                listItems.push(lines[i].replace(/^\d+\.\s/, ''));
                i++;
            }
            blocks.push({ type: 'ol', items: listItems });
            continue;
        }

        // Custom Table
        if (line.startsWith('[TABLE]')) {
            const tableRowsData: string[][] = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('[/TABLE]')) {
                tableRowsData.push(lines[i].split(';').map(s => s.trim()));
                i++;
            }
            if (tableRowsData.length > 0) {
                const headers = tableRowsData[0];
                const rows = tableRowsData.length > 1 ? tableRowsData.slice(1) : [];
                blocks.push({ type: 'table', headers, rows });
            }
            i++; // Skip [/TABLE]
            continue;
        }

        // Standalone Image
        const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)/);
        if (imgMatch) {
             blocks.push({ type: 'image', alt: imgMatch[1], src: imgMatch[2] })
             i++;
             continue;
        }

        // Paragraph (the fallback)
        const pLines: string[] = [];
        while (i < lines.length && lines[i].trim() !== '') {
            const nextLine = lines[i];
            const isNewBlock = 
                nextLine.startsWith('#') ||
                nextLine.startsWith('>') ||
                nextLine.startsWith('* ') ||
                nextLine.startsWith('- ') ||
                /^\d+\.\s/.test(nextLine) ||
                nextLine.startsWith('```') ||
                nextLine.startsWith('[TABLE]') ||
                nextLine.startsWith('![') ||
                nextLine.trim() === '---';
            
            if (isNewBlock) break;

            pLines.push(nextLine);
            i++;
        }

        if (pLines.length > 0) {
            blocks.push({ type: 'p', text: pLines.join(' ') });
        }
    }
    return blocks;
};


// --- RENDERER COMPONENT ---

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    if (!content) {
        return <div className="prose dark:prose-invert max-w-none"><p>Select a page to view its content.</p></div>;
    }
    
    const blocks = parseMarkdownToBlocks(content);

    return (
      <div className="max-w-none text-gray-600 dark:text-gray-300">
        {blocks.map((block, index) => {
            switch (block.type) {
                case 'h1':
                    return <h1 key={index} className="text-3xl font-bold text-zinc-900 dark:text-white mt-12 mb-4 border-b border-gray-200 dark:border-zinc-800 pb-2">{applyInlineFormatting(block.text)}</h1>;
                case 'h2':
                    return <h2 key={index} className="text-2xl font-bold text-zinc-900 dark:text-white border-b border-gray-200 dark:border-zinc-800 pb-2 mt-10 mb-4">{applyInlineFormatting(block.text)}</h2>;
                case 'h3':
                    return <h3 key={index} className="text-xl font-semibold text-zinc-900 dark:text-white mt-8 mb-3">{applyInlineFormatting(block.text)}</h3>;
                case 'hr':
                    return <hr key={index} className="my-8 border-gray-200 dark:border-zinc-800" />;
                case 'p':
                    return <p key={index} className="my-4 leading-relaxed">{applyInlineFormatting(block.text)}</p>;
                case 'image':
                    return <img key={index} src={block.src} alt={block.alt} className="my-6 rounded-lg shadow-md max-w-full" />;
                case 'ul':
                    return (
                        <ul key={index} className="list-disc list-inside space-y-2 my-4 pl-4">
                            {block.items.map((item, idx) => <li key={idx}>{renderListItemContent(item)}</li>)}
                        </ul>
                    );
                case 'ol':
                     return (
                        <ol key={index} className="list-decimal list-inside space-y-2 my-4 pl-4">
                            {block.items.map((item, idx) => <li key={idx}>{renderListItemContent(item)}</li>)}
                        </ol>
                    );
                case 'blockquote':
                    return (
                        <blockquote key={index} className="my-4 pl-4 border-l-4 border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-gray-400 italic">
                            {block.lines.map((line, idx) => <p key={idx} className="mb-2 last:mb-0">{applyInlineFormatting(line)}</p>)}
                        </blockquote>
                    );
                case 'callout':
                    if (block.variant === 'info') {
                        return (
                            <div key={index} className="my-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg flex items-start space-x-3">
                                <InfoIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div className="text-blue-800 dark:text-blue-200">{applyInlineFormatting(block.text)}</div>
                            </div>
                        );
                    }
                    return ( // warning
                        <div key={index} className="my-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-lg flex items-start space-x-3">
                            <WarningIcon className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                            <div className="text-yellow-800 dark:text-yellow-200">{applyInlineFormatting(block.text)}</div>
                        </div>
                    );
                case 'code':
                    return (
                        <pre key={index} className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-lg my-4 overflow-x-auto text-sm">
                            <code>{block.content}</code>
                        </pre>
                    );
                case 'table':
                    return (
                        <div key={index} className="my-6 overflow-x-auto border border-gray-200 dark:border-zinc-800 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                                <thead className="bg-gray-50 dark:bg-zinc-800/50">
                                    <tr>
                                        {block.headers.map((header, hIdx) => <th key={hIdx} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{applyInlineFormatting(header)}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                                   {block.rows.map((row, rIdx) => (
                                     <tr key={rIdx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                        {row.map((cell, cIdx) => <td key={cIdx} className="px-4 py-4 text-sm">{applyInlineFormatting(cell)}</td>)}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    );
                default:
                    return null;
            }
        })}
      </div>
    );
};

export default MarkdownRenderer;

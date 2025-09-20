import React, { useMemo, useEffect } from 'react';
import { InfoIcon, WarningIcon } from './icons';

// Allow PrismJS to be used from the global scope (loaded via CDN)
declare const Prism: any;

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
            const content = part.replace(/^`+|`+$/g, '');
            return <code key={index} className="bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded px-1.5 py-px text-sm font-mono text-red-500 dark:text-red-400">{content}</code>;
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
  | { type: 'h4'; text: string }
  | { type: 'h5'; text: string }
  | { type: 'h6'; text: string }
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
        const trimmedLine = line.trim();

        if (trimmedLine === '') {
            i++;
            continue;
        }

        // Headers
        if (trimmedLine.startsWith('###### ')) { blocks.push({ type: 'h6', text: trimmedLine.substring(7) }); i++; continue; }
        if (trimmedLine.startsWith('##### ')) { blocks.push({ type: 'h5', text: trimmedLine.substring(6) }); i++; continue; }
        if (trimmedLine.startsWith('#### ')) { blocks.push({ type: 'h4', text: trimmedLine.substring(5) }); i++; continue; }
        if (trimmedLine.startsWith('### ')) { blocks.push({ type: 'h3', text: trimmedLine.substring(4) }); i++; continue; }
        if (trimmedLine.startsWith('## ')) { blocks.push({ type: 'h2', text: trimmedLine.substring(3) }); i++; continue; }
        if (trimmedLine.startsWith('# ')) { blocks.push({ type: 'h1', text: trimmedLine.substring(2) }); i++; continue; }
        
        // Horizontal Rule
        if (trimmedLine === '---') { blocks.push({ type: 'hr' }); i++; continue; }

        // Callouts
        if (trimmedLine.startsWith('> i ')) { blocks.push({ type: 'callout', variant: 'info', text: trimmedLine.substring(4) }); i++; continue; }
        if (trimmedLine.startsWith('> ! ')) { blocks.push({ type: 'callout', variant: 'warning', text: trimmedLine.substring(4) }); i++; continue; }
        
        // Code blocks
        if (trimmedLine.startsWith('```')) {
            const lang = trimmedLine.substring(3).trim();
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            blocks.push({ type: 'code', lang, content: codeLines.join('\n').trim() });
            i++; continue;
        }

        // Blockquotes
        if (trimmedLine.startsWith('> ')) {
            const bqLines: string[] = [];
            while (i < lines.length && lines[i].trim().startsWith('>')) {
                bqLines.push(lines[i].trim().substring(1).trim());
                i++;
            }
            blocks.push({ type: 'blockquote', lines: bqLines });
            continue;
        }
        
        // Unordered List
        if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
            const listItems: string[] = [];
            while (i < lines.length) {
                const currentTrimmed = lines[i].trim();
                if (currentTrimmed.startsWith('* ') || currentTrimmed.startsWith('- ')) {
                    listItems.push(currentTrimmed.substring(2));
                    i++;
                } else {
                    break;
                }
            }
            blocks.push({ type: 'ul', items: listItems });
            continue;
        }

        // Ordered List
        if (/^\d+\.\s+/.test(trimmedLine)) {
            const listItems: string[] = [];
             while (i < lines.length) {
                const currentTrimmed = lines[i].trim();
                if (/^\d+\.\s+/.test(currentTrimmed)) {
                    listItems.push(currentTrimmed.replace(/^\d+\.\s+/, ''));
                    i++;
                } else {
                    break;
                }
            }
            blocks.push({ type: 'ol', items: listItems });
            continue;
        }

        // Custom Table
        if (trimmedLine.startsWith('[TABLE]')) {
            const tableRowsData: string[][] = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('[/TABLE]')) {
                if (lines[i].trim() !== '') {
                  tableRowsData.push(lines[i].split(';').map(s => s.trim()));
                }
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
        const imgMatch = trimmedLine.match(/^!\[(.*?)\]\((.*?)\)/);
        if (imgMatch) {
             blocks.push({ type: 'image', alt: imgMatch[1], src: imgMatch[2] })
             i++;
             continue;
        }

        // Paragraph (the fallback)
        const pLines: string[] = [];
        while (i < lines.length && lines[i].trim() !== '') {
            const nextTrimmed = lines[i].trim();
            const isNewBlock = 
                /^#{1,6}\s/.test(nextTrimmed) ||
                nextTrimmed.startsWith('> ') ||
                nextTrimmed.startsWith('* ') ||
                nextTrimmed.startsWith('- ') ||
                /^\d+\.\s+/.test(nextTrimmed) ||
                nextTrimmed.startsWith('```') ||
                nextTrimmed.startsWith('[TABLE]') ||
                nextTrimmed.startsWith('![') ||
                nextTrimmed === '---';
            
            if (isNewBlock) break;

            pLines.push(lines[i]);
            i++;
        }

        if (pLines.length > 0) {
            blocks.push({ type: 'p', text: pLines.join('\n') });
        } else {
             // If we are here, it means the line was not empty but didn't form a paragraph,
             // and didn't match any block. This can happen with malformed markdown that
             // looks like a block but isn't (e.g., `#Header` without space).
             // To prevent an infinite loop, we treat it as a plain paragraph and advance `i`.
             if (i < lines.length && lines[i].trim() !== '') {
                blocks.push({ type: 'p', text: lines[i] });
                i++;
             }
        }
    }
    return blocks;
};


// --- RENDERER COMPONENT ---

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const blocks = useMemo(() => {
        if (!content) return [];
        return parseMarkdownToBlocks(content);
    }, [content]);

    useEffect(() => {
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
    }, [blocks]);
    
    if (!content) {
        return <div className="max-w-none"><p>Select a page to view its content.</p></div>;
    }

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
                case 'h4':
                    return <h4 key={index} className="text-lg font-semibold text-zinc-900 dark:text-white mt-6 mb-2">{applyInlineFormatting(block.text)}</h4>;
                case 'h5':
                    return <h5 key={index} className="text-base font-semibold text-zinc-900 dark:text-white mt-5 mb-1">{applyInlineFormatting(block.text)}</h5>;
                case 'h6':
                    return <h6 key={index} className="text-sm font-semibold text-zinc-900 dark:text-white mt-4 mb-1">{applyInlineFormatting(block.text)}</h6>;
                case 'hr':
                    return <hr key={index} className="my-8 border-gray-200 dark:border-zinc-800" />;
                case 'p':
                    return <p key={index} className="my-4 leading-relaxed whitespace-pre-line">{applyInlineFormatting(block.text)}</p>;
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
                        <div key={index} className="relative my-4 font-mono text-sm">
                            <pre className="bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-4 pt-8 rounded-lg overflow-x-auto">
                                <code className={`${block.lang ? `language-${block.lang}` : ''} text-red-500 dark:text-red-400`}>
                                    {block.content}
                                </code>
                            </pre>
                            {block.lang && (
                                <div className="absolute top-2 right-3 text-xs text-gray-400 dark:text-zinc-500 select-none">
                                    {block.lang}
                                </div>
                            )}
                        </div>
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
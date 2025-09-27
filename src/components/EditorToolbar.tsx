import React from 'react';
import {
    IconBold, IconItalic, IconStrikethrough, IconH1, IconH2, IconH3, IconCode, IconQuote, IconLink, IconListUl, IconListOl
} from './icons';

const EditorToolbar: React.FC<{
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    onContentChange: (content: string) => void;
}> = ({ textareaRef, onContentChange }) => {
    
    const applyFormat = (syntax: string, placeholder: string, isBlock: boolean = false) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const textBefore = textarea.value.substring(0, start);
        const textAfter = textarea.value.substring(end);

        // Block-level elements like links don't toggle
        if (isBlock) {
            const replacement = `${syntax}${selectedText || placeholder}`;
            const newContent = textBefore + replacement + textAfter;
            onContentChange(newContent);
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + syntax.length, start + syntax.length + placeholder.length);
            }, 0);
            return;
        }

        const isWrapped = textBefore.endsWith(syntax) && textAfter.startsWith(syntax);

        let newContent;
        let newStart;
        let newEnd;

        if (isWrapped) {
            // Unwrap the text
            newContent = textBefore.slice(0, textBefore.length - syntax.length) + selectedText + textAfter.slice(syntax.length);
            newStart = start - syntax.length;
            newEnd = end - syntax.length;
        } else {
            // Wrap the text
            const replacement = `${syntax}${selectedText || placeholder}${syntax}`;
            newContent = textBefore + replacement + textAfter;
            if (selectedText) {
                newStart = start; // keep selection the same to allow for re-application checks
                newEnd = end + (2 * syntax.length);
            } else { // Placeholder case
                newStart = start + syntax.length;
                newEnd = start + syntax.length + placeholder.length;
            }
        }

        onContentChange(newContent);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newStart, newEnd);
        }, 0);
    };
    
    const applyLineFormat = (prefix: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;

        let lineStart = value.lastIndexOf('\n', start - 1) + 1;
        
        const selectedLinesText = value.substring(lineStart, end);
        const lines = (start === end ? value.substring(lineStart, value.indexOf('\n', lineStart) === -1 ? value.length : value.indexOf('\n', lineStart)) : selectedLinesText).split('\n');
        
        const alreadyHasPrefix = lines.every(line => line.startsWith(prefix) || line.trim() === '');
        
        const newLines = lines.map(line => {
             if (line.trim() === '') return line;
             if (alreadyHasPrefix) {
                 return line.substring(prefix.length);
             }
             // Remove other prefixes before adding new one
             line = line.replace(/^(#+\s|\>\s|-\s|\*\s|\d+\.\s)/, '');
             return prefix + line;
        }).join('\n');

        let newContent;
        if (start === end) {
          const lineEnd = value.indexOf('\n', lineStart) === -1 ? value.length : value.indexOf('\n', lineStart);
          newContent = value.substring(0, lineStart) + newLines + value.substring(lineEnd);
        } else {
          newContent = value.substring(0, lineStart) + newLines + value.substring(end);
        }
        
        onContentChange(newContent);
        setTimeout(() => textarea.focus(), 0);
    };

    const handleLink = () => {
        const url = prompt("Enter the URL:", "https://");
        if (url) {
            applyFormat('[', `link text](${url})`, true);
        }
    };

    const buttons = [
        { icon: IconBold, onClick: () => applyFormat('**', 'bold text'), title: 'Bold' },
        { icon: IconItalic, onClick: () => applyFormat('*', 'italic text'), title: 'Italic' },
        { icon: IconStrikethrough, onClick: () => applyFormat('~~', 'strikethrough'), title: 'Strikethrough' },
        { icon: IconH1, onClick: () => applyLineFormat('# '), title: 'Heading 1' },
        { icon: IconH2, onClick: () => applyLineFormat('## '), title: 'Heading 2' },
        { icon: IconH3, onClick: () => applyLineFormat('### '), title: 'Heading 3' },
        { icon: IconCode, onClick: () => applyFormat('`', 'code'), title: 'Inline Code' },
        { icon: IconQuote, onClick: () => applyLineFormat('> '), title: 'Blockquote' },
        { icon: IconLink, onClick: handleLink, title: 'Link' },
        { icon: IconListUl, onClick: () => applyLineFormat('* '), title: 'Unordered List' },
        { icon: IconListOl, onClick: () => applyLineFormat('1. '), title: 'Ordered List' },
    ];
    
    return (
        <div className="bg-gray-100 dark:bg-zinc-800 p-2 rounded-t-md border-b-0 border-gray-300 dark:border-zinc-700 flex items-center space-x-1 flex-wrap">
            {buttons.map((btn, index) => (
                <button key={index} onClick={btn.onClick} title={btn.title} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300">
                    <btn.icon className="w-5 h-5" />
                </button>
            ))}
        </div>
    );
};

export default EditorToolbar;
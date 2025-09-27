import React from 'react';
import {
    IconBold, IconItalic, IconStrikethrough, IconH1, IconH2, IconH3, IconCode, IconQuote, IconLink, IconListUl, IconListOl
} from './icons';

const EditorToolbar: React.FC<{
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    onContentChange: (content: string) => void;
}> = ({ textareaRef, onContentChange }) => {
    
    const applyFormat = (syntax: string, placeholder: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const textBefore = textarea.value.substring(0, start);
        const textAfter = textarea.value.substring(end);

        const isWrappedByOuter = textBefore.endsWith(syntax) && textAfter.startsWith(syntax);
        const isWrappedByInner = selectedText.startsWith(syntax) && selectedText.endsWith(syntax);

        let newContent;
        let newStart;
        let newEnd;

        if (isWrappedByInner) {
            // Unwrap from inside the selection (e.g., user selected "**text**")
            newContent = textBefore + selectedText.slice(syntax.length, selectedText.length - syntax.length) + textAfter;
            newStart = start;
            newEnd = end - (2 * syntax.length);
        } else if (isWrappedByOuter) {
            // Unwrap from outside the selection (e.g., user selected "text" from "**text**")
            newContent = textBefore.slice(0, textBefore.length - syntax.length) + selectedText + textAfter.slice(syntax.length);
            newStart = start - syntax.length;
            newEnd = end - syntax.length;
        } else {
            // Wrap the text
            const replacement = `${syntax}${selectedText || placeholder}${syntax}`;
            newContent = textBefore + replacement + textAfter;
            newStart = start + syntax.length;
            newEnd = newStart + (selectedText || placeholder).length;
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

        const { selectionStart, selectionEnd, value } = textarea;

        // Find the full lines encompassed by the selection
        const firstLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
        const lastLineEnd = value.indexOf('\n', selectionEnd) === -1 
            ? value.length 
            : value.indexOf('\n', selectionEnd);
        
        const blockToChange = value.substring(firstLineStart, lastLineEnd);
        const lines = blockToChange.split('\n');
        
        const alreadyHasPrefix = lines.every(line => line.trim() === '' || line.startsWith(prefix));
        
        let startDelta = 0;
        let endDelta = 0;

        const newLines = lines.map((line, index) => {
            // Check if this line is before or at the start of the selection
            const lineStartPos = value.indexOf(line, firstLineStart);
            const isBeforeOrAtStart = lineStartPos < selectionStart;

            if (line.trim() === '') return line;
            
            let change = 0;
            let newLine = line;

            if (alreadyHasPrefix) {
                if (line.startsWith(prefix)) {
                    newLine = line.substring(prefix.length);
                    change = -prefix.length;
                }
            } else {
                const originalLength = line.length;
                const cleanedLine = line.replace(/^(#+\s|\>\s|-\s|\*\s|\d+\.\s)/, '');
                newLine = prefix + cleanedLine;
                change = newLine.length - originalLength;
            }

            if (isBeforeOrAtStart) {
                startDelta += change;
            }
            endDelta += change;

            return newLine;
        });

        const newBlock = newLines.join('\n');
        const newContent = value.substring(0, firstLineStart) + newBlock + value.substring(lastLineEnd);
        
        onContentChange(newContent);
        
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(selectionStart + startDelta, selectionEnd + endDelta);
        }, 0);
    };

    const handleLink = () => {
        const url = prompt("Enter the URL:", "https://");
        if (!url) return;
        
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end) || 'link text';
        const textBefore = textarea.value.substring(0, start);
        const textAfter = textarea.value.substring(end);

        const replacement = `[${selectedText}](${url})`;
        const newContent = textBefore + replacement + textAfter;
        onContentChange(newContent);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + replacement.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
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
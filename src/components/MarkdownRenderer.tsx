import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { InfoIcon, WarningIcon, CheckCircleIcon, XCircleIcon, ChevronRightIcon } from './icons';

// Allow PrismJS to be used from the global scope (loaded via CDN)
declare const Prism: any;

const calloutConfig = {
    note: { // The grey info box
        icon: InfoIcon,
        bgColor: 'bg-gray-100 dark:bg-zinc-800',
        titleColor: 'text-zinc-900 dark:text-white',
        iconColor: 'text-gray-600 dark:text-zinc-400'
    },
    tip: { // Standard green for tips
        icon: CheckCircleIcon,
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        titleColor: 'text-green-800 dark:text-green-300',
        iconColor: 'text-green-500'
    },
    warning: { // The red "Важно!" box
        icon: WarningIcon,
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        titleColor: 'text-red-800 dark:text-red-300',
        iconColor: 'text-red-500'
    },
    caution: { // Standard yellow for caution
        icon: WarningIcon,
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        titleColor: 'text-yellow-800 dark:text-yellow-300',
        iconColor: 'text-yellow-500'
    }
};

const Callout: React.FC<{ type: 'note' | 'tip' | 'warning' | 'caution'; title: string; children: React.ReactNode }> = ({ type, title, children }) => {
    const config = calloutConfig[type] || calloutConfig.note;
    const Icon = config.icon;

    return (
        <div className={`my-4 p-4 rounded-lg flex items-start space-x-3 ${config.bgColor}`}>
            <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
            <div className="flex-1">
                <p className={`font-semibold ${config.titleColor}`}>{title}</p>
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                    {children}
                </div>
            </div>
        </div>
    );
};

const Details: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <details className="my-4 p-4 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800/30 open:pb-2">
      <summary className="font-semibold cursor-pointer flex items-center group text-zinc-900 dark:text-white">
        <ChevronRightIcon className="w-4 h-4 mr-2 transition-transform duration-200 group-open:rotate-90" />
        {title}
      </summary>
      <div className="mt-2 pl-6 prose prose-sm dark:prose-invert max-w-none">
        {children}
      </div>
    </details>
  );
};

// Helper to recursively get text content from React nodes
function getReactNodeText(node: React.ReactNode): string {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    // Fix: Reordered array check to prevent incorrect handling of array nodes.
    if (Array.isArray(node)) return node.map(getReactNodeText).join('');
    if (node === null || typeof node !== 'object' || !('props' in node)) return '';

    // Fix: Cast `node.props` to safely access `children`. This resolves the error
    // "Property 'children' does not exist on type 'unknown'".
    const children = (node.props as { children?: React.ReactNode }).children;
    if (children) {
        return getReactNodeText(children);
    }
    return '';
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    React.useEffect(() => {
        if (typeof Prism !== 'undefined') {
            const timeoutId = setTimeout(() => Prism.highlightAll(), 0);
            return () => clearTimeout(timeoutId);
        }
    }, [content]);
    
    if (!content) {
        return <div className="prose dark:prose-invert max-w-none"><p>Select a page to view its content.</p></div>;
    }

    const components = {
        blockquote: ({ node, children, ...props }: any) => {
            const allChildren = React.Children.toArray(children);
            const firstChild = allChildren[0] as React.ReactElement;
            
            if (!firstChild || firstChild.type !== 'p') {
                return <blockquote {...props}>{children}</blockquote>;
            }

            const firstParagraphText = getReactNodeText(firstChild);
            const match = /^\s*\[!(NOTE|TIP|WARNING|CAUTION|DETAILS)\](.*)/s.exec(firstParagraphText);
            
            if (match) {
                const type = match[1].toLowerCase();
                const textAfterTag = match[2].trim();

                if (type === 'details') {
                    const title = textAfterTag || 'Details';
                    const content = allChildren.slice(1);
                    return <Details title={title}>{content}</Details>;
                }
                
                if (type === 'note' || type === 'tip' || type === 'warning' || type === 'caution') {
                    let title;
                    let content;

                    // If there are multiple paragraphs, the first line is the custom title.
                    if (allChildren.length > 1) {
                        title = textAfterTag || (type.charAt(0).toUpperCase() + type.slice(1));
                        content = allChildren.slice(1);
                    } else { // If only one paragraph, its text is the content.
                        title = type.charAt(0).toUpperCase() + type.slice(1);
                        content = textAfterTag ? [<p key="content">{textAfterTag}</p>] : [];
                    }

                    return <Callout type={type as any} title={title}>{content}</Callout>;
                }
            }

            return <blockquote {...props}>{children}</blockquote>;
        },
    }

    return (
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
            {content}
        </ReactMarkdown>
      </div>
    );
};

export default MarkdownRenderer;
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { InfoIcon, WarningIcon, CheckCircleIcon, XCircleIcon, ChevronRightIcon } from './icons';

// Allow PrismJS to be used from the global scope (loaded via CDN)
declare const Prism: any;

const calloutConfig = {
    note: {
        icon: InfoIcon,
        bgColor: 'bg-zinc-100 dark:bg-zinc-800',
        titleColor: 'text-zinc-900 dark:text-zinc-100',
        iconColor: 'text-zinc-500 dark:text-zinc-400'
    },
    tip: {
        icon: CheckCircleIcon,
        bgColor: 'bg-green-100 dark:bg-green-950/70',
        titleColor: 'text-green-800 dark:text-green-300',
        iconColor: 'text-green-500 dark:text-green-400'
    },
    warning: {
        icon: WarningIcon,
        bgColor: 'bg-red-100 dark:bg-red-950/70',
        titleColor: 'text-red-800 dark:text-red-300',
        iconColor: 'text-red-500 dark:text-red-400'
    },
    caution: {
        icon: WarningIcon,
        bgColor: 'bg-yellow-100 dark:bg-yellow-950/70',
        titleColor: 'text-yellow-800 dark:text-yellow-300',
        iconColor: 'text-yellow-500 dark:text-yellow-400'
    }
};

const Callout: React.FC<{ type: 'note' | 'tip' | 'warning' | 'caution'; title: React.ReactNode; children: React.ReactNode }> = ({ type, title, children }) => {
    const config = calloutConfig[type] || calloutConfig.note;
    const Icon = config.icon;

    const hasContent = React.Children.count(children) > 0 && getReactNodeText(children).trim() !== '';

    return (
        <div className={`my-4 rounded-lg ${config.bgColor}`}>
            <div className={`flex items-start space-x-2.5 p-4`}>
                <Icon className={`w-5 h-5 flex-shrink-0 mt-1 ${config.iconColor}`} />
                <div className={`flex-1 font-semibold ${config.titleColor} prose prose-sm max-w-none [&_p]:my-0`}>
                    {title}
                </div>
            </div>
            {hasContent && (
              <div className="pb-4 pr-4 pl-11 prose prose-sm max-w-none text-gray-700 dark:text-gray-300 [&_p]:my-0 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
                  {children}
              </div>
            )}
        </div>
    );
};


const Details: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <details className="my-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 group transition-all duration-200">
      <summary className="font-semibold cursor-pointer flex items-center p-4 text-zinc-900 dark:text-white list-none">
        <ChevronRightIcon className="w-5 h-5 mr-2 transition-transform duration-200 group-open:rotate-90" />
        {title}
      </summary>
      <div className="px-4 pb-4 pl-11 prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
        {children}
      </div>
    </details>
  );
};

// Helper to recursively get text content from React nodes
function getReactNodeText(node: React.ReactNode): string {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(getReactNodeText).join('');
    if (node === null || typeof node !== 'object' || !('props' in node)) return '';
    // Fix: Cast node to a type with props and children to satisfy TypeScript
    const children = (node as { props: { children?: React.ReactNode } }).props.children;
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
        blockquote: (componentProps: { node?: any; children?: React.ReactNode; [key: string]: any }) => {
            const { node, children, ...props } = componentProps;
            // Filter out insignificant children like empty text nodes from newlines
            const significantChildren = React.Children.toArray(children).filter(child => {
                return getReactNodeText(child).trim() !== '';
            });
            
            if (significantChildren.length === 0) {
                return <blockquote {...props}>{children}</blockquote>;
            }

            const firstChild = significantChildren[0];
            
            // Check if the first child is a paragraph element, which is where we expect the tag
            if (!React.isValidElement(firstChild) || firstChild.type !== 'p') {
                return <blockquote {...props}>{children}</blockquote>;
            }

            const firstParagraphText = getReactNodeText(firstChild);
            const match = /^\s*\[!(NOTE|TIP|WARNING|CAUTION|DETAILS)\](.*)/s.exec(firstParagraphText);
            
            if (match) {
                const type = match[1].toLowerCase();
                const titleText = match[2].trim(); // This is the raw text for the title line

                // The rest of the paragraphs form the main content
                const contentNodes = significantChildren.slice(1);

                // --- Handle Details Component ---
                if (type === 'details') {
                    // The 'details' component uses the raw text as a string title
                    return <Details title={titleText || 'Details'}>{contentNodes}</Details>;
                }

                // --- Handle Callout Components (NOTE, TIP, etc.) ---
                if (type === 'note' || type === 'tip' || type === 'warning' || type === 'caution') {
                    
                    // Re-create the first paragraph without the tag to use as the title OR part of the content
                    // FIX: Cast firstChild.props to a type that includes children to resolve TypeScript error.
                    const titleChildren = React.Children.map((firstChild.props as { children?: React.ReactNode }).children, child => {
                        if (typeof child === 'string') {
                            // Remove the tag syntax from the start of the string
                            return child.replace(/^\s*\[!(?:NOTE|TIP|WARNING|CAUTION)\]\s*/, '');
                        }
                        return child;
                    });
                    const firstParagraphNode = <p>{titleChildren}</p>;

                    // If there was text on the title line, it becomes the title.
                    // Otherwise, use the default title and the first paragraph becomes content.
                    if (titleText) {
                        return <Callout type={type} title={firstParagraphNode}>{contentNodes}</Callout>;
                    } else {
                        const defaultTitle = type.charAt(0).toUpperCase() + type.slice(1);
                        return <Callout type={type} title={defaultTitle}>{[firstParagraphNode, ...contentNodes]}</Callout>;
                    }
                }
            }

            // If no match, render a standard blockquote
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
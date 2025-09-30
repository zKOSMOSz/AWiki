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

const Callout: React.FC<{ type: 'note' | 'tip' | 'warning' | 'caution'; title: string; children: React.ReactNode }> = ({ type, title, children }) => {
    const config = calloutConfig[type] || calloutConfig.note;
    const Icon = config.icon;
    const hasContent = React.Children.count(children) > 0 && 
                       (getReactNodeText(children).trim() !== '' || (Array.isArray(children) && children.some(c => (c as React.ReactElement)?.type === 'ul' || (c as React.ReactElement)?.type === 'ol')));

    return (
        <div className={`my-4 p-4 rounded-lg ${config.bgColor}`}>
            <div className="flex items-center space-x-2.5">
                <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
                <p className={`font-semibold ${config.titleColor}`}>{title}</p>
            </div>
            {hasContent && (
                 <div className="pl-8 pt-2 prose prose-sm max-w-none text-gray-700 dark:text-gray-300 [&_p]:my-1">
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
        // Fix: Correctly type the props for the blockquote component to fix spread and property access errors.
        blockquote: ({ node, children, ...props }: { node?: any; children?: React.ReactNode; [key: string]: any }) => {
            const significantChildren = React.Children.toArray(children).filter(child => {
                 const text = getReactNodeText(child);
                 return text.trim() !== '';
            });
            
            if (significantChildren.length === 0) {
                return <blockquote {...props}>{children}</blockquote>;
            }

            const firstChild = significantChildren[0] as React.ReactElement;
            
            if (!firstChild || typeof firstChild !== 'object' || !('type' in firstChild) || firstChild.type !== 'p') {
                return <blockquote {...props}>{children}</blockquote>;
            }

            const firstParagraphText = getReactNodeText(firstChild);
            const match = /^\s*\[!(NOTE|TIP|WARNING|CAUTION|DETAILS)\](.*)/s.exec(firstParagraphText);
            
            if (match) {
                const type = match[1].toLowerCase();
                const rawTextAfterTag = match[2];
                const textAfterTag = rawTextAfterTag.trim();
                
                // Reconstruct the first paragraph without the tag, preserving leading spaces if any
                // Fix: Use React.Children.toArray to safely iterate over children, which may not be an array, fixing the error on line 122.
                const firstParaChildren = React.Children.toArray(firstChild.props.children).map((child: any, index: number) => {
                    if (index === 0 && typeof child === 'string') {
                        return child.replace(/^\s*\[!(NOTE|TIP|WARNING|CAUTION|DETAILS)\]/, '');
                    }
                    return child;
                });

                const remainingChildren = [
                    // Fix: Ensure firstChild.props is treated as an object, fixing the error on line 130.
                    React.cloneElement(firstChild, { ...firstChild.props, children: firstParaChildren }),
                    ...significantChildren.slice(1)
                ];

                const cleanedContent = React.Children.toArray(remainingChildren).filter(child => getReactNodeText(child).trim() !== '');

                if (type === 'details') {
                    const title = textAfterTag || 'Details';
                    const content = cleanedContent.length > 0 && getReactNodeText(cleanedContent).trim() !== '' ? cleanedContent : [];
                    return <Details title={title}>{content}</Details>;
                }
                
                if (type === 'note' || type === 'tip' || type === 'warning' || type === 'caution') {
                    let title = textAfterTag;
                    let content = cleanedContent;

                    // If the text after tag is empty, it means the title is on the same line as the tag.
                    // The first line of the actual content becomes the title.
                    if (!title && cleanedContent.length > 0) {
                        title = getReactNodeText(cleanedContent[0]).trim();
                        content = cleanedContent.slice(1);
                    } else if (title) {
                        content = cleanedContent.map((child: any, index) => {
                           if (index === 0) {
                               const newChildren = React.Children.toArray(child.props.children).map((c: any, i: number) => {
                                   if (i === 0 && typeof c === 'string') return c.replace(rawTextAfterTag, '');
                                   return c;
                               });
                               return React.cloneElement(child, { ...child.props, children: newChildren });
                           }
                           return child;
                        });
                    }
                    
                    if (!title) {
                        title = type.charAt(0).toUpperCase() + type.slice(1);
                    }

                    const finalContent = React.Children.toArray(content).filter(child => getReactNodeText(child).trim() !== '');
                    return <Callout type={type as any} title={title}>{finalContent}</Callout>;
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
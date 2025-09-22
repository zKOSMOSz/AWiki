// Fix: Add Vite client types to declare import.meta.env for TypeScript.
/// <reference types="vite/client" />

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MarkdownRenderer from './components/MarkdownRenderer';
import type { WikiTreeItem, WikiPage, WikiSection } from './types';
import { 
  MenuIcon, XIcon, StoryMCLogoIcon, FolderIcon,
  ChevronLeftIcon, ChevronRightIcon, SunIcon, MoonIcon, ComputerDesktopIcon,
  PencilIcon, DownloadIcon,
} from './components/icons';
import { iconMap } from './components/iconMap';
import { SITE_NAME } from './config';

// Tell typescript about JSZip from CDN
declare const JSZip: any;

const PageHeader: React.FC<{title: string, icon?: React.ReactNode}> = ({ title, icon }) => (
    <div className="flex items-center space-x-3 mb-8">
        {icon}
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{title}</h1>
    </div>
);

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


const App: React.FC = () => {
  const [wikiTree, setWikiTree] = useState<WikiTreeItem[]>([]);
  const [flatPages, setFlatPages] = useState<(WikiPage | {type: 'page', id: string, title: string, path: string})[]>([]);
  const [isTreeLoading, setIsTreeLoading] = useState<boolean>(true);
  const [activePage, setActivePage] = useState<WikiPage | WikiSection | null>(null);
  const [activeContent, setActiveContent] = useState<string>('');
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editableWikiTree, setEditableWikiTree] = useState<WikiTreeItem[]>([]);
  const [editedContentCache, setEditedContentCache] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = SITE_NAME;
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const lightThemeSheet = document.getElementById('prism-light-theme') as HTMLLinkElement | null;
    const darkThemeSheet = document.getElementById('prism-dark-theme') as HTMLLinkElement | null;

    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);

    if (lightThemeSheet && darkThemeSheet) {
      lightThemeSheet.disabled = isDark;
      darkThemeSheet.disabled = !isDark;
    }    
  }, [theme]);
  
  // Listener for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const isDark = mediaQuery.matches;
        document.documentElement.classList.toggle('dark', isDark);
        const lightThemeSheet = document.getElementById('prism-light-theme') as HTMLLinkElement | null;
        const darkThemeSheet = document.getElementById('prism-dark-theme') as HTMLLinkElement | null;
        if (lightThemeSheet && darkThemeSheet) {
          lightThemeSheet.disabled = isDark;
          darkThemeSheet.disabled = !isDark;
        }        
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}wiki-manifest.json`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json()
      })
      .then((data: WikiTreeItem[]) => {
        setWikiTree(data);
        const flatten = (nodes: WikiTreeItem[]) => {
          let flat: (WikiPage | {type: 'page', id: string, title: string, path: string})[] = [];
          nodes.forEach(node => {
            if (node.type === 'page' || (node.type === 'section' && node.path)) {
              flat.push(node as WikiPage);
            }
            if (node.type === 'section') {
              flat = flat.concat(flatten(node.children));
            }
          });
          return flat;
        };
        setFlatPages(flatten(data));
      })
      .catch(err => console.error("Failed to load wiki structure:", err))
      .finally(() => setIsTreeLoading(false));
  }, []);

  const findItemById = (nodes: WikiTreeItem[], id: string): WikiPage | WikiSection | null => {
      for (const item of nodes) {
          if (item.id === id) return item;
          if (item.type === 'section') {
              const found = findItemById(item.children, id);
              if (found) return found;
          }
      }
      return null;
  };

  useEffect(() => {
    if (isTreeLoading || wikiTree.length === 0) return;
    
    if (!activePage) {
      const firstPage = flatPages[0];
      if (firstPage) {
        setActivePage(findItemById(wikiTree, firstPage.id));
      } else {
        setIsPageLoading(false);
        setActiveContent("# Welcome!\n\nSelect a page from the sidebar to get started.");
      }
    }
  }, [activePage, wikiTree, isTreeLoading, flatPages]);


  useEffect(() => {
    if (!activePage || isTreeLoading || isEditMode) return;

    const path = activePage?.type === 'page' ? activePage.path : (activePage?.type === 'section' ? activePage.path : undefined);

    if (path) {
        setIsPageLoading(true);
        setActiveContent('');
        fetch(`${import.meta.env.BASE_URL}wiki/${path}`)
            .then(response => response.ok ? response.text() : Promise.reject(`HTTP error! status: ${response.status}`))
            .then(text => setActiveContent(text))
            .catch(error => {
                console.error("Failed to fetch markdown:", error);
                setActiveContent("# Error\n\nCould not load the page content.");
            })
            .finally(() => setIsPageLoading(false));
    } else {
      setActiveContent('');
      setIsPageLoading(false);
    }
  }, [activePage, isTreeLoading, wikiTree, isEditMode]);
  
  const handleSelectPage = (id: string) => {
    const item = findItemById(isEditMode ? editableWikiTree : wikiTree, id);
    setActivePage(item);
    
    if (isEditMode && item) {
        const path = item.type === 'page' ? item.path : (item.type === 'section' ? item.path : undefined);
        if (path && editedContentCache[path] !== undefined) {
            setActiveContent(editedContentCache[path]);
        } else {
            setActiveContent(item.type === 'section' && !item.path ? 'This is a folder. Select a page inside it or add a new one.' : '');
        }
    }

    if(window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // --- EDIT MODE FUNCTIONS ---

  const handleToggleEditMode = async () => {
    if (!isEditMode) {
      setIsEditMode(true);
      setEditableWikiTree(JSON.parse(JSON.stringify(wikiTree))); // Deep copy

      const contentPromises = flatPages.map(page => 
        fetch(`${import.meta.env.BASE_URL}wiki/${page.path}`)
          .then(res => res.ok ? res.text() : Promise.resolve(`# Error: Could not load ${page.path}`))
          .then(text => ({ path: page.path, content: text }))
      );
      
      try {
        const contents = await Promise.all(contentPromises);
        const cache = contents.reduce((acc, {path, content}) => {
          acc[path] = content;
          return acc;
        }, {} as Record<string, string>);
        setEditedContentCache(cache);
        
        const pagePath = activePage?.type === 'page' ? activePage.path : (activePage?.type === 'section' ? activePage.path : undefined);
        if (pagePath && cache[pagePath]) {
            setActiveContent(cache[pagePath]);
        }
      } catch (error) {
        console.error("Error pre-fetching wiki content:", error);
        alert("Failed to load all content for editing.");
        setIsEditMode(false);
      }
    } else {
      if (confirm("Are you sure? Any unsaved changes will be lost.")) {
          setIsEditMode(false);
          const originalItem = findItemById(wikiTree, activePage?.id || '');
          setActivePage(originalItem);
      }
    }
  };

  const handleContentChange = (newContent: string) => {
    if (!activePage || !isEditMode) return;
    const path = (activePage as WikiPage).path;
    if (path) {
        setActiveContent(newContent);
        setEditedContentCache(prev => ({...prev, [path]: newContent}));
    }
  };

  const handleDownloadZip = async () => {
    if (typeof JSZip === 'undefined') {
        alert("Error: JSZip library not found.");
        return;
    }
    const zip = new JSZip();
    zip.file("wiki-manifest.json", JSON.stringify(editableWikiTree, null, 2));

    try {
        const logoResponse = await fetch(`${import.meta.env.BASE_URL}logo.png`);
        if (logoResponse.ok) zip.file("logo.png", await logoResponse.blob());
    } catch (e) { console.warn("Could not fetch logo.png, skipping."); }

    const wikiFolder = zip.folder("wiki");
    if (wikiFolder) {
        Object.keys(editedContentCache).forEach(path => {
            wikiFolder.file(path, editedContentCache[path]);
        });
    }
    
    zip.generateAsync({ type: "blob" }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "awiki-export.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert("Wiki downloaded!\n\nTo apply changes, unzip the file, replace `wiki-manifest.json` and the `public/wiki/` directory in your project, then commit.");
    });
  };
  
  const generateSafeId = (title: string) => title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const handleAddItem = (parentId: string | null) => {
    const type = prompt("Add 'page' or 'folder'?", "page");
    if (type !== 'page' && type !== 'folder') return;
    
    const title = prompt("Enter the title:");
    if (!title) return;

    const id = generateSafeId(title);
    const icon = prompt("Enter an icon (emoji or icon name):", type === 'page' ? "📜" : "📁");
    
    const getPathPrefixForItem = (nodes: WikiTreeItem[], itemId: string, prefix = ''): string | null => {
        for (const node of nodes) {
            if (node.id === itemId) {
                return prefix;
            }
            if (node.type === 'section') {
                const result = getPathPrefixForItem(node.children, itemId, prefix + node.id + '/');
                if (result !== null) return result;
            }
        }
        return null;
    };

    let basePath = '';
    if (parentId) {
      const parentPrefix = getPathPrefixForItem(editableWikiTree, parentId) || '';
      const parent = findItemById(editableWikiTree, parentId);
      if (parent && parent.type === 'section') {
          basePath = parentPrefix + parent.id + '/';
      } else {
          basePath = parentPrefix;
      }
    }

    const newItem: WikiPage | WikiSection = type === 'page'
        ? { type: 'page', id, title, path: `${basePath}${id}.md`, iconName: icon || undefined }
        : { type: 'section', id, title, iconName: icon || undefined, children: [] };

    if (newItem.type === 'page') {
        setEditedContentCache(prev => ({...prev, [newItem.path]: `# ${newItem.title}\n\nStart writing here.`}));
    }
    
    const addItemRecursive = (nodes: WikiTreeItem[]): WikiTreeItem[] => {
        if (parentId === null) {
            return [...nodes, newItem];
        }
        return nodes.map(node => {
            if (node.id === parentId && node.type === 'section') {
                return { ...node, children: [...node.children, newItem] };
            }
            if (node.type === 'section') {
                return { ...node, children: addItemRecursive(node.children) };
            }
            return node;
        });
    };
    setEditableWikiTree(prev => addItemRecursive(prev));
  };
  
  const handleDeleteItem = (itemId: string, itemPath?: string) => {
    if (!confirm(`Delete this item? This cannot be undone.`)) return;

    const removeItem = (nodes: WikiTreeItem[]): WikiTreeItem[] => {
        return nodes.filter(node => {
            if (node.id === itemId) return false;
            if (node.type === 'section') {
                node.children = removeItem(node.children);
            }
            return true;
        });
    };
    
    setEditableWikiTree(prev => removeItem(JSON.parse(JSON.stringify(prev))));
    if (itemPath) {
        setEditedContentCache(prev => {
            const newCache = {...prev};
            delete newCache[itemPath];
            return newCache;
        });
    }
    if (activePage?.id === itemId) {
       setActivePage(null);
       setActiveContent('');
    }
  };

  const handleEditItem = (item: WikiTreeItem) => {
      const newTitle = prompt("Enter new title:", item.title);
      const newIcon = prompt("Enter new icon:", item.iconName || "");

      if (!newTitle) return;

      const editItem = (nodes: WikiTreeItem[]): WikiTreeItem[] => {
          return nodes.map(node => {
              if (node.id === item.id) {
                  return { ...node, title: newTitle, iconName: newIcon || undefined };
              }
              if (node.type === 'section') {
                  return { ...node, children: editItem(node.children) };
              }
              return node;
          });
      };
      setEditableWikiTree(prev => editItem(prev));
  };

  // --- RENDER LOGIC ---
  
  if (isTreeLoading) {
    return <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">Loading Wiki...</div>;
  }

  const currentTree = isEditMode ? editableWikiTree : wikiTree;
  const currentPageIndex = activePage ? flatPages.findIndex(p => p.id === activePage.id) : -1;
  const prevPage = currentPageIndex > 0 ? flatPages[currentPageIndex - 1] as WikiPage : null;
  const nextPage = currentPageIndex !== -1 && currentPageIndex < flatPages.length - 1 ? flatPages[currentPageIndex + 1] as WikiPage : null;

  const activePageIconName = (activePage?.type === 'page' || activePage?.type === 'section') ? activePage.iconName : undefined;

  const renderPageHeaderIcon = (iconName?: string) => {
      if (!iconName) return <FolderIcon className="w-8 h-8 text-yellow-500" />;
      const CustomIcon = iconMap[iconName];
      if (CustomIcon) return <CustomIcon className="w-8 h-8 text-yellow-500" />;
      return <span className="text-3xl">{iconName}</span>;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-900 font-sans">
      <div 
        className={`fixed inset-0 z-30 bg-black bg-opacity-60 transition-opacity lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside className={`fixed top-0 left-0 z-40 h-full w-64 bg-gray-50 dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          wikiTree={currentTree} 
          activePageId={activePage?.id || null} 
          onSelectPage={handleSelectPage} 
          isEditMode={isEditMode}
          onAddItem={handleAddItem}
          onDeleteItem={handleDeleteItem}
          onEditItem={handleEditItem}
        />
      </aside>

      <div className="flex-1 flex flex-col lg:pl-64">
        <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 lg:px-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-800 lg:hidden">
              {sidebarOpen ? <XIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" /> : <MenuIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />}
            </button>
            <div className="hidden lg:flex items-center space-x-2">
              <StoryMCLogoIcon className="w-8 h-8"/>
              <span className="font-bold text-zinc-900 dark:text-white text-lg">{SITE_NAME}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
             <button onClick={handleToggleEditMode} title={isEditMode ? "Exit Edit Mode" : "Edit Wiki"} className={`p-2 rounded-md transition-colors ${isEditMode ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'hover:bg-gray-200 dark:hover:bg-zinc-800'}`}>
                <PencilIcon className="w-5 h-5"/>
             </button>
          </div>
        </header>

        {isEditMode && (
          <div className="sticky top-16 z-10 bg-yellow-100 dark:bg-yellow-900/50 border-b border-yellow-300 dark:border-yellow-800 p-2 text-center text-sm text-yellow-800 dark:text-yellow-200 flex items-center justify-center space-x-4">
            <span>You are in Edit Mode.</span>
            <button onClick={handleDownloadZip} className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition-colors text-xs font-semibold">
              <DownloadIcon className="w-4 h-4" />
              <span>Download Wiki</span>
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12 relative">
             {isPageLoading && !isEditMode
              ? <div className="text-center text-gray-400">Loading...</div>
              : (
                isEditMode ? (
                  <div>
                    <PageHeader title={activePage?.title || "Edit Mode"} icon={renderPageHeaderIcon(activePageIconName)} />
                    <textarea
                        key={activePage?.id} // Re-mount textarea on page change
                        className="w-full h-[70vh] bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md p-4 font-mono text-sm leading-6 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={activeContent}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Start writing your markdown here..."
                        disabled={!activePage || !(activePage.type === 'page' || (activePage.type === 'section' && activePage.path))}
                    />
                  </div>
                ) : (
                  <>
                    <PageHeader title={activePage?.title || "Welcome"} icon={renderPageHeaderIcon(activePageIconName)}/>
                    <MarkdownRenderer content={activeContent} />
                    <PageNavigation prevPage={prevPage} nextPage={nextPage} onSelectPage={handleSelectPage} />
                  </>
                )
              )
            }
          </div>

          <footer className="px-8 py-4 flex justify-end">
            <div className="flex items-center space-x-2 p-1 bg-gray-200 dark:bg-zinc-800 rounded-md">
                <button onClick={() => setTheme('light')} className={`p-1.5 rounded ${theme === 'light' ? 'bg-white dark:bg-zinc-700' : 'hover:bg-gray-300 dark:hover:bg-zinc-700'}`} aria-label="Switch to light theme">
                  <SunIcon className={`w-5 h-5 ${theme === 'light' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`} />
                </button>
                <button onClick={() => setTheme('system')} className={`p-1.5 rounded ${theme === 'system' ? 'bg-white dark:bg-zinc-700' : 'hover:bg-gray-300 dark:hover:bg-zinc-700'}`} aria-label="Switch to system theme">
                  <ComputerDesktopIcon className={`w-5 h-5 ${theme === 'system' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`} />
                </button>
                <button onClick={() => setTheme('dark')} className={`p-1.5 rounded ${theme === 'dark' ? 'bg-white dark:bg-zinc-700' : 'hover:bg-gray-300 dark:hover:bg-zinc-700'}`} aria-label="Switch to dark theme">
                  <MoonIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`} />
                </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;

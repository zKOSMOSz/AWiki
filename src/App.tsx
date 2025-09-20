import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MarkdownRenderer from './components/MarkdownRenderer';
import type { WikiTreeItem, WikiPage, WikiSection } from './types';
import { 
  MenuIcon, XIcon, StoryMCLogoIcon, FolderIcon,
  ChevronLeftIcon, ChevronRightIcon, SunIcon, MoonIcon, ComputerDesktopIcon
} from './components/icons';
import { iconMap } from './components/iconMap';

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
                    <div className="text-xs text-gray-500 dark:text-gray-400">Предыдущая</div>
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
                    <div className="text-xs text-gray-500 dark:text-gray-400">Следующая</div>
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
    if (!activePage || isTreeLoading) return;

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
  }, [activePage, isTreeLoading, wikiTree]);
  
  const handleSelectPage = (id: string) => {
    const item = findItemById(wikiTree, id);
    setActivePage(item);
    if(window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };
  
  if (isTreeLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
            Loading Wiki...
        </div>
    );
  }

  const currentPageIndex = activePage ? flatPages.findIndex(p => p.id === activePage.id) : -1;
  const prevPage = currentPageIndex > 0 ? flatPages[currentPageIndex - 1] as WikiPage : null;
  const nextPage = currentPageIndex !== -1 && currentPageIndex < flatPages.length - 1 ? flatPages[currentPageIndex + 1] as WikiPage : null;

  const activePageIconName = (activePage?.type === 'page' || activePage?.type === 'section') ? activePage.iconName : undefined;

  const renderPageHeaderIcon = (iconName?: string) => {
      if (!iconName) {
          return <FolderIcon className="w-8 h-8 text-yellow-500" />;
      }
      const CustomIcon = iconMap[iconName];
      if (CustomIcon) {
          return <CustomIcon className="w-8 h-8 text-yellow-500" />;
      }
      return <span className="text-3xl">{iconName}</span>;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-900 font-sans">
      <div 
        className={`fixed inset-0 z-30 bg-black bg-opacity-60 transition-opacity lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside className={`fixed top-0 left-0 z-40 h-full w-64 bg-gray-50 dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar wikiTree={wikiTree} activePageId={activePage?.id || null} onSelectPage={handleSelectPage} />
      </aside>

      <div className="flex-1 flex flex-col lg:pl-64">
        <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 lg:px-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-800 lg:hidden">
              {sidebarOpen ? <XIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" /> : <MenuIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />}
            </button>
            <div className="hidden lg:flex items-center space-x-2">
              <StoryMCLogoIcon className="w-8 h-8"/>
              <span className="font-bold text-zinc-900 dark:text-white text-lg">StoryMC</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12 relative">
             {isPageLoading 
              ? <div className="text-center text-gray-400">Loading...</div>
              : (
                <>
                  <PageHeader title={activePage?.title || "Welcome"} icon={renderPageHeaderIcon(activePageIconName)}/>
                  <MarkdownRenderer content={activeContent} />
                  <PageNavigation prevPage={prevPage} nextPage={nextPage} onSelectPage={handleSelectPage} />
                </>
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

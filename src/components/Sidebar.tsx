import React, { useState } from 'react';
import type { WikiTreeItem } from '../types';
import { ChevronRightIcon } from './icons';
import { iconMap } from './iconMap';
import { SITE_NAME } from '../config';

interface SidebarProps {
  wikiTree: WikiTreeItem[];
  activePageId: string | null;
  onSelectPage: (id: string) => void;
}

const NavItem: React.FC<{ item: WikiTreeItem; activePageId: string | null; onSelectPage: (id: string) => void; level: number }> = ({ item, activePageId, onSelectPage, level }) => {
  const isCollapsible = item.type === 'section' && item.children.length > 0;
  const [isOpen, setIsOpen] = useState(true);

  const isActive = activePageId === item.id;
  const hasContent = item.type === 'page' || (item.type === 'section' && item.path);
  
  const IconComponent = item.iconName ? iconMap[item.iconName] : null;
  const iconElement = IconComponent 
    ? <IconComponent className="w-5 h-5 flex-shrink-0" />
    : item.iconName 
      ? <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-base">{item.iconName}</span>
      : null;

  const handleItemClick = () => {
    if(isCollapsible) {
        setIsOpen(!isOpen);
    }
    if (hasContent) {
        onSelectPage(item.id);
    }
  };

  const commonClasses = `flex items-center w-full text-left space-x-2.5 p-2 rounded-md transition-colors duration-150 text-sm`;
  const activeClasses = 'bg-blue-100 dark:bg-zinc-800 text-blue-600 dark:text-white font-semibold';
  const inactiveClasses = 'text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white';

  if (item.type === 'section' && isCollapsible) {
    return (
      <div>
        <button
          onClick={handleItemClick}
          className={`${commonClasses} justify-between ${isActive && item.path ? activeClasses : inactiveClasses}`}
        >
          <div className="flex items-center space-x-2.5">
            {iconElement}
            <span>{item.title}</span>
          </div>
          <ChevronRightIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </button>
        {isOpen && (
          <div className="mt-1 pl-4 space-y-px">
            {item.children.map((child) => (
              <NavItem key={child.id} item={child} activePageId={activePageId} onSelectPage={onSelectPage} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }
  
  if (!hasContent) return null;

  return (
    <button
      onClick={() => onSelectPage(item.id)}
      className={`${commonClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {iconElement}
      <span>{item.title}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ wikiTree, activePageId, onSelectPage }) => {
  return (
    <div className="h-full flex flex-col text-sm">
        <div className="h-16 flex items-center px-4 lg:hidden">
             <span className="font-bold text-zinc-900 dark:text-white text-lg">{SITE_NAME}</span>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {wikiTree.map((item) => {
              if (item.type === 'section' && !item.path) {
                 return (
                    <div key={item.id} className="pt-5">
                      <h3 className="px-2 mb-2 text-xs font-bold uppercase text-gray-400 dark:text-zinc-500 tracking-wider">{item.title}</h3>
                      <div className="space-y-px">
                        {item.children.map((child) => (
                           <NavItem key={child.id} item={child} activePageId={activePageId} onSelectPage={onSelectPage} level={0} />
                        ))}
                      </div>
                    </div>
                 );
              }
              return <NavItem key={item.id} item={item} activePageId={activePageId} onSelectPage={onSelectPage} level={0} />
            })}
        </nav>
    </div>
  );
};

export default Sidebar;

import React, { useState } from 'react';
import type { WikiTreeItem } from '../types';
import { ChevronRightIcon, PencilIcon, TrashIcon, PlusCircleIcon } from './icons';
import { iconMap } from './iconMap';
import { SITE_NAME } from '../config';

interface SidebarProps {
  wikiTree: WikiTreeItem[];
  activePageId: string | null;
  onSelectPage: (id: string) => void;
  isEditMode?: boolean;
  onAddItem?: (parentId: string | null) => void;
  onDeleteItem?: (itemId: string, itemPath?: string) => void;
  onEditItem?: (item: WikiTreeItem) => void;
}

const NavItem: React.FC<{
  item: WikiTreeItem;
  activePageId: string | null;
  onSelectPage: (id: string) => void;
  level: number;
  isEditMode?: boolean;
  onAddItem?: (parentId: string | null) => void;
  onDeleteItem?: (itemId: string, itemPath?: string) => void;
  onEditItem?: (item: WikiTreeItem) => void;
}> = ({ item, activePageId, onSelectPage, level, isEditMode, onAddItem, onDeleteItem, onEditItem }) => {
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

  const handleItemClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking edit buttons
    if (isEditMode && e.target instanceof Element && e.target.closest('.edit-controls')) {
        return;
    }
    if(isCollapsible) {
        setIsOpen(!isOpen);
    }
    if (hasContent) {
        onSelectPage(item.id);
    }
  };
  
  const commonClasses = `flex items-center w-full text-left space-x-2.5 p-2 rounded-md transition-colors duration-150 text-sm group`;
  const activeClasses = 'bg-blue-100 dark:bg-zinc-800 text-blue-600 dark:text-white font-semibold';
  const inactiveClasses = 'text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white';

  const editControls = isEditMode && onEditItem && onDeleteItem && (
    <div className="edit-controls ml-auto hidden group-hover:flex items-center space-x-1">
      <button onClick={() => onEditItem(item)} className="p-1 rounded hover:bg-gray-300 dark:hover:bg-zinc-700">
        <PencilIcon className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => onDeleteItem(item.id, item.type === 'page' ? item.path : item.path)} className="p-1 rounded hover:bg-gray-300 dark:hover:bg-zinc-700">
        <TrashIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  if (item.type === 'section') {
    return (
      <div>
        <div
          onClick={handleItemClick}
          className={`${commonClasses} justify-between cursor-pointer ${isActive && item.path ? activeClasses : inactiveClasses}`}
        >
          <div className="flex items-center space-x-2.5">
            {iconElement}
            <span>{item.title}</span>
          </div>
          <div className="flex items-center">
            {editControls}
            <ChevronRightIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''} ${isEditMode ? 'mr-1' : ''}`} />
          </div>
        </div>
        {isOpen && (
          <div className="mt-1 pl-4 space-y-px">
            {item.children.map((child) => (
              <NavItem key={child.id} item={child} activePageId={activePageId} onSelectPage={onSelectPage} level={level + 1} isEditMode={isEditMode} onAddItem={onAddItem} onDeleteItem={onDeleteItem} onEditItem={onEditItem} />
            ))}
             {isEditMode && onAddItem && (
                <button onClick={() => onAddItem(item.id)} className="w-full text-left text-xs text-gray-400 dark:text-zinc-500 p-2 flex items-center space-x-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md">
                    <PlusCircleIcon className="w-4 h-4"/>
                    <span>Add Page</span>
                </button>
            )}
          </div>
        )}
      </div>
    );
  }
  
  if (!hasContent) return null;

  return (
    <div
      onClick={handleItemClick}
      className={`${commonClasses} cursor-pointer ${isActive ? activeClasses : inactiveClasses}`}
    >
      {iconElement}
      <span className="flex-grow">{item.title}</span>
      {editControls}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ wikiTree, activePageId, onSelectPage, isEditMode, onAddItem, onDeleteItem, onEditItem }) => {
  return (
    <div className="h-full flex flex-col text-sm">
        <div className="h-16 flex items-center px-4 lg:hidden">
             <span className="font-bold text-zinc-900 dark:text-white text-lg">{SITE_NAME}</span>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {isEditMode && onAddItem && (
              <div className="p-2">
                  <button onClick={() => onAddItem(null)} className="w-full text-left text-xs text-gray-400 dark:text-zinc-500 p-2 flex items-center space-x-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md">
                      <PlusCircleIcon className="w-4 h-4"/>
                      <span>Add Item to Root</span>
                  </button>
              </div>
            )}
            {wikiTree.map((item) => {
              if (item.type === 'section' && !item.path && !isEditMode) {
                 return (
                    <div key={item.id} className="pt-5">
                      <h3 className="px-2 mb-2 text-xs font-bold uppercase text-gray-400 dark:text-zinc-500 tracking-wider">{item.title}</h3>
                      <div className="space-y-px">
                        {item.children.map((child) => (
                           <NavItem key={child.id} item={child} activePageId={activePageId} onSelectPage={onSelectPage} level={0} isEditMode={isEditMode} onAddItem={onAddItem} onDeleteItem={onDeleteItem} onEditItem={onEditItem} />
                        ))}
                      </div>
                    </div>
                 );
              }
              return <NavItem key={item.id} item={item} activePageId={activePageId} onSelectPage={onSelectPage} level={0} isEditMode={isEditMode} onAddItem={onAddItem} onDeleteItem={onDeleteItem} onEditItem={onEditItem}/>
            })}
        </nav>
    </div>
  );
};

export default Sidebar;

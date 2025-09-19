export interface WikiPage {
  type: 'page';
  id: string;
  title: string;
  path: string;
  iconName?: string;
}

export interface WikiSection {
  type: 'section';
  id: string;
  title: string;
  path?: string; // Path to the section's index page markdown
  iconName?: string;
  children: Array<WikiPage | WikiSection>;
}

export type WikiTreeItem = WikiPage | WikiSection;
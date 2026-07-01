import React from 'react';
import { HomeTab } from '../types';
import TabSelector from './TabSelector';

const TABS = ['추천', '랭킹', '이달의 아트'] as const;

// Figma: Tab_Ver1 (344:833)
interface HomeTabSelectorProps {
  activeTab: HomeTab;
  onTabChange: (tab: HomeTab) => void;
}

export default function HomeTabSelector({ activeTab, onTabChange }: HomeTabSelectorProps) {
  return <TabSelector tabs={TABS} activeTab={activeTab} onTabChange={onTabChange} />;
}

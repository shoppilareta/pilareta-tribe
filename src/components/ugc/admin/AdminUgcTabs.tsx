'use client';

import { useState } from 'react';
import { ModerationQueue } from './ModerationQueue';
import { AllPostsManager } from './AllPostsManager';
import { CommentsManager } from './CommentsManager';

type Tab = 'pending' | 'all' | 'comments';

export function AdminUgcTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('pending');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'Pending Review' },
    { key: 'all', label: 'Manage All Posts' },
    { key: 'comments', label: 'Comments' },
  ];

  return (
    <div>
      {/* Tab navigation */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(246, 237, 221, 0.1)',
          paddingBottom: '1px',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #f6eddd' : '2px solid transparent',
              color: activeTab === tab.key ? '#f6eddd' : 'rgba(246, 237, 221, 0.5)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: activeTab === tab.key ? 500 : 400,
              marginBottom: '-1px',
              whiteSpace: 'nowrap',
              minHeight: '44px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'pending' && <ModerationQueue />}
      {activeTab === 'all' && <AllPostsManager />}
      {activeTab === 'comments' && <CommentsManager />}
    </div>
  );
}

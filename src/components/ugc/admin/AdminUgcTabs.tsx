'use client';

import { useState } from 'react';
import { ModerationQueue } from './ModerationQueue';
import { AllPostsManager } from './AllPostsManager';

export function AdminUgcTabs() {
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

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
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '2px solid #f6eddd' : '2px solid transparent',
            color: activeTab === 'pending' ? '#f6eddd' : 'rgba(246, 237, 221, 0.5)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'pending' ? 500 : 400,
            marginBottom: '-1px',
          }}
        >
          Pending Review
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'all' ? '2px solid #f6eddd' : '2px solid transparent',
            color: activeTab === 'all' ? '#f6eddd' : 'rgba(246, 237, 221, 0.5)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'all' ? 500 : 400,
            marginBottom: '-1px',
          }}
        >
          Manage All Posts
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'pending' ? <ModerationQueue /> : <AllPostsManager />}
    </div>
  );
}

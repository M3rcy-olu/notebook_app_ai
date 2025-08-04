import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/layout.jsx';
import Notes from '@/pages/notes.jsx';
import Canvas from '@/pages/canvas.jsx';
import { createPageUrl } from '@/utils';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={createPageUrl('Notes')} replace />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/canvas" element={<Canvas />} />
        <Route path="*" element={<Navigate to={createPageUrl('Notes')} replace />} />
      </Routes>
    </Layout>
  );
}

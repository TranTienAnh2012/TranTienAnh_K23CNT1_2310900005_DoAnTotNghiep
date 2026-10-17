import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Navbar from '../common/Navbar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 w-full overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ onAdd }) => {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar onAddClick={onAdd} />
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;

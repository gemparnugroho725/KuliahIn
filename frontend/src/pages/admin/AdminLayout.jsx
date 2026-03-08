import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import '../../index.css';

const AdminLayout = () => {
    return (
        <div className="app-layout">
            <AdminSidebar />
            <div className="main-content">
                <AdminTopbar />
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;

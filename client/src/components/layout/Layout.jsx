import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/40 rounded-full blur-3xl -z-10 animate-blob"></div>
            <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-secondary-200/40 rounded-full blur-3xl -z-10 animate-blob animation-delay-2000"></div>

            <Navbar />
            <main className="flex-grow pt-20">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;

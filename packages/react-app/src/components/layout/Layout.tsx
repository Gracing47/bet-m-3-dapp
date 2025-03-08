import { FC, ReactNode, useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface Props {
    children: ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
    const [windowWidth, setWindowWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 0
    );

    // Track window size
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => {
                setWindowWidth(window.innerWidth);
            };

            setWindowWidth(window.innerWidth);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    const isMobile = windowWidth < 768; // md breakpoint

    return (
        <div className="min-h-screen bg-[#0C1425] text-white">
            <Header />
            <Sidebar />
            <main className={`pt-16 ${isMobile ? 'pl-0' : 'pl-[200px]'} transition-all duration-300`}>
                {children}
            </main>
        </div>
    );
};

export default Layout; 
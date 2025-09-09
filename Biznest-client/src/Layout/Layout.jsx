import { Outlet } from "react-router-dom";
import Navbar from "../Shared/Navbar & Footer/Navbar/Navbar";
import Footer from "../Shared/Navbar & Footer/Footer/Footer";

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <Outlet></Outlet>
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
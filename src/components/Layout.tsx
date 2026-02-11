import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen relative">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[30%] -right-[15%] w-[700px] h-[700px] rounded-full bg-primary/5 blur-[140px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-[50%] left-[40%] w-[350px] h-[350px] rounded-full bg-accent/30 blur-[100px]" />
      </div>

      <Navbar />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

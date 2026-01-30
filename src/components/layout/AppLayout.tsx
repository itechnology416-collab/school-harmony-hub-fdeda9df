import { Outlet } from 'react-router-dom';
import { MobileNav } from './MobileNav';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="screen-container">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
};

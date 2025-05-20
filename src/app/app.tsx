import { Outlet } from "react-router";
import { Header } from "./header.tsx";

export const App = () => {
  return (
    <div>
      <Header />
      <div>
        <Outlet />
      </div>
    </div>
  );
};

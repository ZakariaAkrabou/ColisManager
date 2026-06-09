import { useEffect } from "react";
import DashboardLayouts from "./components/DashboardLayouts";
import { initializeTheme } from "./utils/theme";

function App() {
   useEffect(() => {
    initializeTheme();
  }, []);
  return (
    <DashboardLayouts />
  );
}

export default App;

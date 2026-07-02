import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LogoDemo from "./pages/LogoDemo";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/logo-demo" element={<LogoDemo />} />
    </Routes>
  );
}

export default App;

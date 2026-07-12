import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LogoDemo from "./pages/LogoDemo";
import Detail from "./pages/Detail";
import Contribute from "./pages/Contribute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/logo-demo" element={<LogoDemo />} />
      <Route path="/detail/:postId" element={<Detail />} />
      <Route path="/contribute" element={<Contribute />} />
    </Routes>
  );
}

export default App;

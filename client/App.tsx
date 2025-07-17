import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StudentApp from "./pages/StudentApp";
import CompanyPortal from "./pages/CompanyPortal";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/student/*" element={<StudentApp />} />
        <Route path="/company/*" element={<CompanyPortal />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Card from "./pages/Card";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/card" element={<Card />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

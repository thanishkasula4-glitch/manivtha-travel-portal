import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Services from "./pages/Services";
import BookNow from "./pages/BookNow";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/book" element={<BookNow />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  );
}

export default App;
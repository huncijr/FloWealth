import Home from "./Pages/Home";
import { Route, Routes } from "react-router-dom";
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/Home" element={<Home />} />
    </Routes>
  );
}

export default App;

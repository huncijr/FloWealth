import Home from "./Pages/Home";
import Login from "./Pages/Login";
import { Route, Routes } from "react-router-dom";
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/Home" element={<Home />} />
      <Route path="/Account" element={<Login />} />
    </Routes>
  );
}

export default App;

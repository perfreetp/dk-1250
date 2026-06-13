import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home";
import Category from "./pages/Category";
import Report from "./pages/Report";
import Budget from "./pages/Budget";
import Items from "./pages/Items";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category" element={<Category />} />
          <Route path="/report" element={<Report />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/items" element={<Items />} />
        </Routes>
      </Layout>
    </Router>
  );
}

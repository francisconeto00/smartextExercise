import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
 import Products from "./pages/Products";
// import ProductDetails from "./pages/ProductDetails";
// import Categories from "./pages/Categories";
// import CategoryDetails from "./pages/CategoryDetails";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Auth />} />
         <Route path="/products" element={<Products />} />
        {/* <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:id" element={<CategoryDetails />} /> */}
      </Routes>
  );
}

export default App;

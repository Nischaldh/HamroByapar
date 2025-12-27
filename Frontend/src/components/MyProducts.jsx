import  { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const MyProducts = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Seller's Products
  const fetchMyProducts = async () => {
    setLoading(true);
    try {
      console.log("Fetching Products...");
      const response = await axios.get(`${backendUrl}/api/products/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API Response:", response.data);
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Fetch Products Error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Delete Product
  const removeProduct = async (id) => {
    try {
      const response = await axios.post(`${backendUrl}/api/products/remove`, 
        { product_id: id }, // ✅ Send product_id in the body
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Delete Product Error:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
};


  useEffect(() => {
    fetchMyProducts();
  }, []);

  return (
    <div>
      <p className="mb-2">MY PRODUCTS</p>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b className="text-center">Action</b>
          </div>

          {/* Product List */}
          {products.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
            >
              <img className="w-12" src={item.images?.[0] || "default.jpg"} alt={item.name} />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>
                {currency}
                {item.price}
              </p>
              <p
                className="text-right md:text-center text-lg cursor-pointer text-red-500"
                onClick={() => removeProduct(item.id)}
              >
                ✖
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;

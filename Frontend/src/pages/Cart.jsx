
import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import axios from "axios";

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, removeFromCart, navigate, backendUrl } =
    useContext(ShopContext);

  const [cartData, setCartData] = useState([]);
  const [editMode, setEditMode] = useState({}); // Track edited items

  // Sync cart data with cartItems
  useEffect(() => {
    const tempData = Object.keys(cartItems).map((itemId) => ({
      ...cartItems[itemId],
      id: itemId,
    }));
    setCartData(tempData);
  }, [cartItems]);

  // ✅ Update quantity in backend
  const updateQuantityInBackend = async (productId, quantity) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.post(
        `${backendUrl}/api/cart/update`,
        { product_id: productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Quantity updated successfully in backend");
      setEditMode((prev) => ({ ...prev, [productId]: false })); // Hide tick after update

    } catch (error) {
      console.error("Error updating quantity in backend:", error);
    }
  };

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"Your"} text2={"Cart"} />
      </div>

      {/* Cart Items */}
      <div>
        {cartData.length > 0 ? (
          cartData.map((item, index) => {
            const productData = products.find((product) => product.id === item.id);

            return (
              <div key={index} className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] items-center gap-4">

                <div className="flex items-start gap-6">
                  <img src={productData?.images[0]} className="w-16 sm:w-20" alt="Product" />
                  <div>
                    <p className="text-xs sm:text-lg font-medium">{productData?.product_name}</p>
                    <p className="mt-2">{currency} {productData?.price * item.quantity}</p>
                  </div>
                </div>

                {/* Quantity Input & Tick Button ✅ */}
                <div className="flex items-center">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity || 1}  // Ensure there's always a valid value
                    className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                    onChange={(e) => {
                      let newQuantity = e.target.value === "" ? "" : Number(e.target.value);
                      if (newQuantity < 1) newQuantity = 1; // Prevent invalid quantity
                      updateQuantity(item.id, newQuantity);
                      setEditMode((prev) => ({ ...prev, [item.id]: true })); // ✅ Show tick
                    }}
                  />

                  {editMode[item.id] && item.quantity > 0 && (
                    <span
                      className="ml-2 text-green-600 cursor-pointer text-xl"
                      onClick={() => updateQuantityInBackend(item.id, item.quantity)}
                    >
                      ✅
                    </span>
                  )}
                </div>

                {/* Remove Button */}
                <img
                  src={assets.bin_icon}
                  className="w-4 mr-4 sm:w-5 cursor-pointer"
                  alt="Remove"
                  onClick={() => removeFromCart(item.id)}
                />
              </div>
            );
          })
        ) : (
          <p className="text-center py-10 text-gray-500">Your cart is empty.</p>
        )}
      </div>

      {/* Checkout Section */}
      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal />
          <div className="w-full text-end">
            <button onClick={() => navigate('/place-order')} className="bg-black text-white text-sm my-8 px-8 py-3 cursor-pointer">
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;


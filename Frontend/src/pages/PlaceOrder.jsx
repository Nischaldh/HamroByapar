import { useContext, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";


const PlaceOrder = () => {
  const { navigate, token, backendUrl } = useContext(ShopContext);
  const [method, setMethod] = useState("cod");
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });



  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({ ...prev, [name]: value }));
  };

  const placeOrderAfterPayment = async (selectedMethod) => {
    try {
      const orderData = {
        payment_method: selectedMethod,
      };

      const response = await axios.post(
        `${backendUrl}/api/orders/place`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const order_id = response.data.order_id;

      const delivery_data = {
        order_id,
        ...deliveryInfo,
        method: selectedMethod,
      };

      const result = await axios.post(
        `${backendUrl}/api/delivery/add`,
        delivery_data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && result.data.success) {
        toast.success("Order placed successfully!");
        //fetchCartItems();
        navigate("/orders");
      } else {
        toast.error("Error placing order.");
      }
    } catch (error) {
      toast.error("Error placing order: " + error.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (Object.values(deliveryInfo).some((field) => !field)) {
      toast.error("Please fill in all the delivery information.");
      return;
    }
    await placeOrderAfterPayment(method);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/* Left Side */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1="DELIVERY" text2="INFORMATION" />
        </div>

        {[
          { name: "name", type: "text", placeholder: "Name" },
          { name: "email", type: "email", placeholder: "Email address" },
          { name: "street", type: "text", placeholder: "Street" },
          { name: "phone", type: "number", placeholder: "Phone" },
        ].map((field) => (
          <input
            key={field.name}
            required
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={deliveryInfo[field.name]}
            onChange={handleDeliveryChange}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
        ))}

        <div className="flex gap-3">
          <input
            required
            name="city"
            type="text"
            placeholder="City"
            value={deliveryInfo.city}
            onChange={handleDeliveryChange}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
          <input
            required
            name="state"
            type="text"
            placeholder="State"
            value={deliveryInfo.state}
            onChange={handleDeliveryChange}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
        </div>

        <div className="flex gap-3">
          <input
            required
            name="zipcode"
            type="number"
            placeholder="Zipcode"
            value={deliveryInfo.zipcode}
            onChange={handleDeliveryChange}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
          <input
            required
            name="country"
            type="text"
            placeholder="Country"
            value={deliveryInfo.country}
            onChange={handleDeliveryChange}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>

        <div className="mt-12">
          <Title text1="PAYMENT" text2="METHOD" />
          <div className="flex gap-3 flex-col lg:flex-row">
            {["cod"].map((payMethod) => (
              <div
                key={payMethod}
                onClick={() => setMethod(payMethod)}
                className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
              >
                <p
                  className={`min-w-3.5 h-3.5 border rounded-full ${
                    method === payMethod ? "bg-green-400" : ""
                  }`}
                ></p>
                <p className="text-gray-500 text-sm font-medium mx-4 uppercase">
                  {payMethod === "cod" ? "Cash on Delivery" : payMethod}
                </p>
              </div>
            ))}
          </div>

          <div className="w-full text-end mt-8">
            <button
              onClick={handlePlaceOrder}
              type="button"
              className="bg-black text-white px-16 py-3 text-sm"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;

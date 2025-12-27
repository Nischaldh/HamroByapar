import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Group items by order_id
  const groupedOrders = orders.reduce((acc, item) => {
    if (!acc[item.order_id]) {
      acc[item.order_id] = {
        order_id: item.order_id,
        order_date: item.order_date,
        total_amount: item.total_amount,
        payment_method: item.payment_method,
        order_status: item.order_status,
        items: [],
      };
    }

    acc[item.order_id].items.push(item);
    return acc;
  }, {});

  return (
    <div className="p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-semibold mb-4">My Orders</h2>

      {Object.keys(groupedOrders).length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        Object.values(groupedOrders).map((order) => (
          <div
            key={order.order_id}
            className="border rounded mb-6 p-4"
          >
            {/* Order Header */}
            <div className="flex justify-between mb-3">
              <div>
                <p className="font-semibold">
                  Order #{order.order_id}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.order_date).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold">
                  Rs {order.total_amount}
                </p>
                <p className="text-sm">
                  {order.payment_method.toUpperCase()}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    order.order_status === "Delivered"
                      ? "text-green-600"
                      : "text-orange-500"
                  }`}
                >
                  {order.order_status}
                </p>
              </div>
            </div>

            {/* Products */}
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Product</th>
                  <th className="border p-2">Seller</th>
                  <th className="border p-2">Qty</th>
                  <th className="border p-2">Price</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.order_item_id} className="text-center">
                    <td className="border p-2">
                      {item.product_name}
                    </td>
                    <td className="border p-2">
                      {item.seller_name}
                    </td>
                    <td className="border p-2">
                      {item.quantity}
                    </td>
                    <td className="border p-2">
                      Rs {item.item_price}
                    </td>
                    <td className="border p-2">
                      {item.item_status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;

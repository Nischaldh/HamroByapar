import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";

const SellerOrders = () => {
  const { token, backendUrl , currency} = useContext(ShopContext); // Assuming you have token and backendUrl in context
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatedStatuses, setUpdatedStatuses] = useState({}); // To track changes

  // Fetch orders for the seller
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/orders/seller-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(response.data);
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(); // Fetch orders when the component mounts
  }, [backendUrl, token]);

  // Handle status change
  const handleStatusChange = (orderId, newStatus) => {
    setUpdatedStatuses((prev) => ({
      ...prev,
      [orderId]: newStatus,
    }));
  };

  // Save status changes
  const handleSaveChanges = async (orderId) => {
    const status = updatedStatuses[orderId];
    if (!status) {
      toast.error("No status change detected.");
      return;
    }

    try {
        const response = await axios.post(
            `${backendUrl}/api/orders/update-status`,
            { order_id: orderId, status },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (response.status === 200) {
            toast.success("Order status updated successfully.");
            
            // ✅ Fetch orders again to reflect updates
            fetchOrders();

            setUpdatedStatuses((prev) => {
                const updatedOrders = { ...prev };
                delete updatedOrders[orderId];
                return updatedOrders;
            });
        }
    } catch (error) {
        console.error("Error updating order status:", error);
        toast.error("Failed to update status.");
    }
};


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-3 text-left">Product Name</th>
              <th className="border p-3 text-left">Product Image</th>
              <th className="border p-3 text-left">Quantity</th>
              <th className="border p-3 text-left">Total Price</th>
              <th className="border p-3 text-left">Buyer Name</th>
              <th className="border p-3 text-left">Order Status</th>
              <th className="border p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.order_id} className="border">
                <td className="border p-3">{order.product_name}</td>
                <td className="border p-3">
                  <img
                    src={order.product_images[0]}
                    alt={order.product_name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                </td>
                <td className="border p-3">{order.quantity}</td>
                <td className="border p-3">{currency} {order.total_amount}</td>
                <td className="border p-3">{order.buyer_name}</td>
                <td className="border p-3">
                  <select
                    value={updatedStatuses[order.order_id] || order.item_status}
                    onChange={(e) =>
                      handleStatusChange(order.order_id, e.target.value)
                    }
                    className="p-2 border rounded-md"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
                <td className="border p-3">
                  <button
                    onClick={() => handleSaveChanges(order.order_id)}
                    className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-md"
                  >
                    Save Changes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerOrders;

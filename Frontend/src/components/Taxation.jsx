import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

const Taxation = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [dueTaxes, setDueTaxes] = useState([]);
  const [taxStatus, setTaxStatus] = useState([]);
  const [selectedTax, setSelectedTax] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [taxAmount, setTaxAmount] = useState(0);
  const [orderId, setOrderId] = useState("");

  // Fetch due taxes and tax status when component mounts
  useEffect(() => {
    const fetchTaxData = async () => {
      try {
        const taxStatusResponse = await axios.get(`${backendUrl}/api/tax/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTaxStatus(taxStatusResponse.data.taxation);

        const dueTaxesResponse = await axios.get(`${backendUrl}/api/tax/due`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDueTaxes(dueTaxesResponse.data.dueTaxes);
      } catch (error) {
        console.error("Error fetching tax data:", error);
        toast.error("Failed to fetch tax data.");
      }
    };

    fetchTaxData();
  }, [backendUrl, token]);

  const handleTaxPayment = async (e) => {
    e.preventDefault();

    if (!orderId || !selectedTax) {
      toast.error("Please select a tax amount.");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/tax/pay`,
        {
          order_id: orderId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setPaymentStatus("Paid");
        toast.success("Tax paid successfully!");
        // Update the due taxes and tax status state immediately
        setDueTaxes(dueTaxes.filter((tax) => tax.order_id !== orderId)); // Remove paid tax from due list
        setTaxStatus((prevStatus) => {
          return prevStatus.map((tax) =>
            tax.order_id === orderId
              ? { ...tax, status: "Paid" }
              : tax
          );
        }); // Update the tax status
        // Reset selected tax and order ID for future payments
        setSelectedTax(null);
        setOrderId("");
      } else {
        toast.error("Tax payment failed.");
      }
    } catch (error) {
      console.error("Error processing tax payment:", error);
      toast.error("Payment failed. Try again later.");
    }
  };

  const handleTaxSelection = (tax) => {
    setSelectedTax(tax.tax_amount);
    setOrderId(tax.order_id);
    setPaymentStatus("Pending"); // Reset payment status when a new tax is selected
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Taxation</h2>

      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-semibold">Tax Status</h3>
        {taxStatus.length > 0 ? (
          <ul>
            {taxStatus.map((tax, index) => (
              <li key={index} className="mb-2">
                Order ID: {tax.order_id} <br /> Tax Amount: Rs {tax.tax_amount}
                <br />
                Product Name: {tax.product_name}  {/* Display product name here */}
                <br />
                Status: 
                <strong className={tax.status === "Paid" ? "text-green-600" : "text-red-600"}>
                  {tax.status}
                </strong>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tax records found.</p>
        )}
      </div>

      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-semibold">Due Taxes</h3>
        {dueTaxes.length > 0 ? (
          <ul>
            {dueTaxes.map((tax, index) => (
              <li
                key={index}
                className="mb-2 cursor-pointer"
                onClick={() => handleTaxSelection(tax)}
              >
                Order ID: {tax.order_id} <br /> Due Tax: Rs {tax.tax_amount}
                <br />
                Product Name: {tax.product_name}  {/* Display product name here */}
              </li>
            ))}
          </ul>
        ) : (
          <p>No pending taxes.</p>
        )}
      </div>

      {selectedTax && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p>
            <strong>Selected Tax:</strong> Rs {selectedTax}
          </p>
          <p>Status: {paymentStatus}</p>
          {paymentStatus === "Pending" && (
            <form onSubmit={handleTaxPayment}>
              <button type="submit" className="bg-black text-white px-6 py-2">
                Pay Tax
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Taxation;

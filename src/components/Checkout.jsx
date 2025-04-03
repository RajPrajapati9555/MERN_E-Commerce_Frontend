import React, { useContext, useEffect, useState } from "react";
import AppContext from "../context/AppContext";
import TableProduct from "./TableProduct";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Checkout = () => {
  const { cart, userAddress, url, user, clearCart } = useContext(AppContext);

  const [qty, setQty] = useState(0);
  const [price, setPrice] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let qty = 0;
    let price = 0;
    if (cart?.items) {
      for (let i = 0; i < cart.items?.length; i++) {
        qty += cart.items[i].qty;
        price += cart.items[i].price;
      }
    }
    setPrice(price);
    setQty(qty);
  }, [cart]);

  const handlePyment = async () => {
    try {
      const orderResponse = await axios.post(`${url}/payment/checkout`, {
        amount: price,
        qty: qty,
        cartItems: cart?.items,
        userShipping: userAddress,
        userId: user._id,
      });
      console.log("order response", orderResponse);
      const { orderId, amount: orderAmount } = orderResponse.data;

      const options = {
        key: "rzp_test_yBT2QOImUXTFvP", // Replace with your Razorpay key_id
        amount: orderAmount * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: "Raj Prajapati",
        description: "TRaj Prajapati",
        order_id: orderId, // This is the order_id created in the backend
        // callback_url: "http://localhost:3000/payment-success", // Your success URL

        handler: async function (response) {
          const paymentData = {
            orderId: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            payment_Signature: response.razorpay_signature,
            amount: orderAmount,
            orderItems: cart?.items,
            userId: user._id,
            userShipping: userAddress,
          };

          const api = await axios.post(
            `${url}/payment//verify-payment`,
            paymentData
          );

          console.log("razorPay response", api.data);
          if (api.data.success) {
            navigate("/orderconfirmation");
            clearCart();
          }
        },

        prefill: {
          name: "Raj Prajapati",
          email: "rprajapati0812@gmail.com",
          contact: "9999999999",
        },
        notes: {
          address: "Gorakhpur",
        },
        theme: {
          color: "#F37254",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="container  my-3">
        <h1 className="text-center">Order Summary </h1>

        <table className="table table-bordered border-primary bg-dark">
          <thead className="bg-dark">
            <tr>
              <th scope="col" className="bg-dark text-light text-center">
                Product Details
              </th>

              <th scope="col" className="bg-dark text-light text-center">
                Shipping Address
              </th>
            </tr>
          </thead>
          <tbody className="bg-dark">
            <tr>
              <td className="bg-dark text-light">
                <TableProduct cart={cart} />
              </td>
              <td className="bg-dark text-light">
                <ul style={{ fontWeight: "bold" }}>
                  <li>Name : {userAddress?.fullName}</li>
                  <li>Phone : {userAddress?.phoneNumber}</li>
                  <li>Country : {userAddress?.country}</li>
                  <li>State : {userAddress?.state}</li>{" "}
                  {/* ✅ Use `state` here */}
                  <li>PinCode : {userAddress?.pincode}</li>
                  <li>Nearby : {userAddress?.address}</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="container text-center my-5">
        <button
          className="btn btn-secondary btn-lg"
          style={{ fontWeight: "bold" }}
          onClick={handlePyment}
        >
          Procced To Pay
        </button>
      </div>
    </>
  );
};

export default Checkout;

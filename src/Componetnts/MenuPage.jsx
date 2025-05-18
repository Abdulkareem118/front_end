import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, Card, Button, Input } from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  PrinterOutlined,
  HistoryOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import toast, { Toaster } from "react-hot-toast";

const { TabPane } = Tabs;

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState({});
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [change, setChange] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios
      .get("https://backend-pos-zps4.onrender.com/api/menu/")
      .then((res) => {
        const categorized = res.data.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        }, {});
        setMenuItems(categorized);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch menu items");
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i._id === item._id);
      if (existingItem) {
        return prevCart.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart!`);
  };

  const handleAddToHistory = async () => {
    try {
      const grandTotal = getGrandTotal();
      await axios.post("https://backend-pos-zps4.onrender.com/api/history", {
        items: cart,
        total: grandTotal,
        tableNumber,
      });
      toast.success("Order placed and history saved!");
      setCart([]);
      setCashReceived("");
      setChange(0);
      setTableNumber("");
    } catch (error) {
      toast.error("Failed to save history");
      console.error(error);
    }
  };

  const handleIncrease = (itemId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrease = (itemId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item._id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const getTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const getServiceTax = () => {
    const baseTotal = getTotal();
    return baseTotal >= 3000 ? baseTotal * 0.05 : 0;
  };

  const getGrandTotal = () => getTotal() + getServiceTax();

  const handlePrint = () => {
    const win = window.open("", "", "width=600,height=700");
    const now = new Date();
    const formattedDateTime = now.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const itemsHTML = cart
      .map(
        (item) => `
        <tr>
          <td>${item.name} (x${item.quantity})</td>
          <td style="text-align: right;">Rs${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    win.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: Arial; padding: 20px; background: #f5f5f5; }
            .receipt { width: 300px; margin: auto; background: white; padding: 20px; text-align: center; }
            h2, h3 { margin: 10px 0; }
            table { width: 100%; margin-top: 15px; border-collapse: collapse; text-align: left; }
            td { padding: 5px 0; font-size: 14px; }
            .total { font-weight: bold; border-top: 1px solid #000; margin-top: 10px; }
            .footer { margin-top: 20px; font-size: 14px; }
            .logo { width: 60px; height: 60px; border-radius: 50%; margin-bottom: 10px; }
            .date-time { font-size: 12px; color: #555; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="date-time"><h1>${formattedDateTime}</h1></div>
            <img src="https://front-end-drab-pi.vercel.app/assets/sunset-Cul1cxVA.jpg" alt="Logo" class="logo" />
            <div style="font-family: 'Great Vibes', cursive; font-size: 28px;">The Sunset Café</div>
            <hr />
            <h2>RECEIPT</h2>
            <hr />
            <h3>Table: ${tableNumber}</h3>
            <table>
              ${itemsHTML}
              <tr><td>Subtotal</td><td style="text-align:right;">Rs${getTotal().toFixed(2)}</td></tr>
              ${
                getServiceTax() > 0
                  ? `<tr><td>Service Tax (5%)</td><td style="text-align:right;">Rs${getServiceTax().toFixed(2)}</td></tr>`
                  : ""
              }
              <tr class="total"><td>Grand Total</td><td style="text-align:right;">Rs${getGrandTotal().toFixed(2)}</td></tr>
              <tr><td>Received Cash</td><td style="text-align:right;">Rs${parseFloat(cashReceived).toFixed(2)}</td></tr>
              <tr><td>Change</td><td style="text-align:right;">Rs${change.toFixed(2)}</td></tr>
            </table>
            <div class="footer"><p>THANK YOU</p></div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const handleCashReceivedChange = (e) => {
    const cash = e.target.value;
    setCashReceived(cash);
    const total = getGrandTotal();
    if (cash && !isNaN(cash)) {
      setChange(cash - total);
    } else {
      setChange(0);
    }
  };

  const renderItems = (category) => {
    const items = menuItems[category]?.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!items || items.length === 0) {
      return <p>No items found in this category.</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {items.map((item) => (
          <Card
            key={item._id}
            title={item.name}
            extra={`Rs. ${item.price}`}
            className="shadow-md min-h-[150px]"
          >
            <Button type="primary" onClick={() => handleAddToCart(item)}>
              Add to Cart
            </Button>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row p-6 gap-6">
      <Toaster />
      <div className="md:w-2/3">
        <h2 className="text-2xl font-bold mb-4">Menu</h2>

        <Input
          placeholder="Search item..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        {loading ? (
          <p>Loading menu...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <Tabs defaultActiveKey={Object.keys(menuItems)[0]}>
            {Object.keys(menuItems).map((key) => (
              <TabPane
                tab={key.charAt(0).toUpperCase() + key.slice(1)}
                key={key}
              >
                {renderItems(key)}
              </TabPane>
            ))}
          </Tabs>
        )}
      </div>

      <div className="md:w-1/3 bg-white p-4 rounded-xl shadow-md h-fit">
        <h3 className="text-xl font-semibold mb-3">Cart Summary</h3>
        <Input
          placeholder="Table Number"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className="mb-4"
        />

        {cart.length === 0 ? (
          <p>No items added yet.</p>
        ) : (
          <>
            <ul className="space-y-2">
              {cart.map((item) => (
                <li
                  key={item._id}
                  className="flex justify-between items-center"
                >
                  <span>{item.name}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="small"
                      icon={<MinusOutlined />}
                      onClick={() => handleDecrease(item._id)}
                    />
                    <span>{item.quantity}</span>
                    <Button
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => handleIncrease(item._id)}
                    />
                  </div>
                  <span>Rs. {item.price * item.quantity}</span>
                </li>
              ))}
            </ul>
            <hr className="my-2" />
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs. {getTotal().toFixed(2)}</span>
            </div>
            {getServiceTax() > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Service Tax (5%)</span>
                <span>Rs. {getServiceTax().toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>Grand Total</span>
              <span>Rs. {getGrandTotal().toFixed(2)}</span>
            </div>

            <Input
              type="number"
              placeholder="Enter Cash Received"
              value={cashReceived}
              onChange={handleCashReceivedChange}
              className="mt-4 mb-2"
            />
            <div className="flex justify-between font-semibold mb-4">
              <span>Change</span>
              <span>Rs. {change.toFixed(2)}</span>
            </div>

            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              className="w-full mb-2"
            >
              Print Receipt
            </Button>
            <Button
              type="primary"
              icon={<HistoryOutlined />}
              onClick={handleAddToHistory}
              className="w-full m-4"
            >
              Place Order
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default MenuPage;

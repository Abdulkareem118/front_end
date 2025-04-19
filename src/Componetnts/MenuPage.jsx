import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Tabs, Card, Button } from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  PrinterOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import toast, { Toaster } from "react-hot-toast";

const { TabPane } = Tabs;

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState({});
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const printRef = useRef();

  useEffect(() => {
    axios
      .get("https://pos-2-wv56.onrender.com/api/menu/")
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

  // History
  const handleAddToHistory = async () => {
    try {
      const total = getTotal();
      await axios.post("https://pos-2-wv56.onrender.com/api/history", {
        items: cart,
        total,
      });
      toast.success("History saved!");
      setCart([]);
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

  const handlePrint = () => {
    const win = window.open("", "", "width=600,height=700");
    const itemsHTML = cart
      .map(
        (item) => `
      <tr>
        <td>${item.name}</td>
        <td style="text-align: right;">Rs${(item.price * item.quantity).toFixed(
          2
        )}</td>
      </tr>
    `
      )
      .join("");

    win.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background: #f5f5f5;
            }
            .receipt {
              width: 300px;
              margin: 0 auto;
              background: white;
              padding: 20px;
              box-shadow: 0px 0px 10px rgba(0,0,0,0.1);
              text-align: center;
            }
            h2, h3 {
              margin: 10px 0;
            }
            table {
              width: 100%;
              margin-top: 15px;
              border-collapse: collapse;
              text-align: left;
            }
            td {
              padding: 5px 0;
              font-size: 14px;
            }
            .total {
              font-weight: bold;
              border-top: 1px solid #000;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 14px;
            }
            .logo {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              object-fit: cover;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <img src="../src/Images/sunset.jpg" alt="Logo" class="logo" />
          
<Text
  type="secondary"
  className="block mb-6 text-lg"
  style={{
    fontFamily: "'Great Vibes', cursive",
    fontSize: '28px',
    color: '#333',
  }}
>
  The Sunset Café
</Text>
            <hr />
            <h2>RECEIPT</h2>
            <hr />
            <table>
              ${itemsHTML}
              <tr class="total">
                <td>Total Amount</td>
                <td style="text-align: right;">Rs${getTotal().toFixed(2)}</td>
              </tr>
            </table>
            <div class="footer">
              <p>THANK YOU</p>
            </div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const renderItems = (category) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      {menuItems[category]?.map((item) => (
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

  return (
    <div className="flex flex-col md:flex-row p-6 gap-6">
      <Toaster />
      <div className="md:w-2/3">
        <h2 className="text-2xl font-bold mb-4">Menu</h2>
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
        <div ref={printRef}>
          <h3 className="text-xl font-semibold mb-3">Cart Summary</h3>
          {cart.length === 0 ? (
            <p>No items added yet.</p>
          ) : (
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
              <hr className="my-2" />
              <li className="flex justify-between font-bold">
                <span>Total</span>
                <span>Rs. {getTotal()}</span>
              </li>
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            className="mt-4 w-full"
          >
            Print Receipt
          </Button>
        )}
        <Button
          type="primary"
          icon={<HistoryOutlined />}
          onClick={handleAddToHistory}
          className="m-4 w-full"
        >
          Add To History
        </Button>
      </div>
    </div>
  );
};

export default MenuPage;

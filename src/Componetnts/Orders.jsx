import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Input, Button, Form, List, Typography, Select, Table, Modal, Space, message } from 'antd';
import Sidebar from './Sidebar';

const { Title, Text } = Typography;
const { Option } = Select;

const Orders = () => {
  const [form] = Form.useForm();
  const [addItemForm] = Form.useForm();
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fetch orders and menu items
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersResponse = await axios.get('http://localhost:8080/api/orders');
        const allOrders = ordersResponse.data;
        setOrders(allOrders.filter(o => o.status === 'Pending'));
        setCompletedOrders(allOrders.filter(o => o.status === 'Completed'));
      } catch (err) {
        console.error(err);
        message.error('Failed to fetch orders');
      }
    };

    const fetchMenuItems = async () => {
      try {
        const menuResponse = await axios.get('http://localhost:8080/api/menu');
        setMenuItems(menuResponse.data);
      } catch (err) {
        console.error(err);
        message.error('Failed to fetch menu items');
      }
    };

    fetchOrders();
    fetchMenuItems();
  }, []);

  const handleSubmit = async (values) => {
    const { tableNumber, itemId, quantity } = values;
    try {
      const response = await axios.post('http://localhost:8080/api/orders', {
        tableNumber,
        itemId,
        quantity,
        menu: menuItems
      });
      setOrders(prev => [...prev, response.data]);
      form.resetFields();
      message.success('Order created successfully');
    } catch (err) {
      console.error(err);
      message.error('Failed to create order');
    }
  };

  const markAsDone = async (orderId) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/orders/${orderId}/complete`);
      setOrders(prev => prev.filter(o => o._id !== orderId));
      setCompletedOrders(prev => [...prev, response.data]);
      message.success('Order marked as completed');
    } catch (err) {
      console.error(err);
      message.error('Failed to update order');
    }
  };

  const openAddItemModal = (orderId) => {
    setEditingOrderId(orderId);
    setIsModalVisible(true);
  };

  const handleAddItem = async (values) => {
    const { itemId, quantity } = values;
    try {
      const response = await axios.post(`http://localhost:8080/api/orders/${editingOrderId}/add-item`, {
        itemId,
        quantity,
        menu: menuItems
      });

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === editingOrderId ? response.data : order
        )
      );

      setIsModalVisible(false);
      addItemForm.resetFields();
      message.success('Item added to order');
    } catch (err) {
      console.error(err);
      message.error('Failed to add item');
    }
  };

  const columns = [
    {
      title: 'Table No',
      dataIndex: 'tableNumber',
      key: 'tableNumber',
    },
    {
      title: 'Items',
      key: 'items',
      render: (_, record) =>
        record.items?.map((item, index) => (
          <div key={index}>{item.itemName} (x{item.quantity})</div>
        )),
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => `Rs ${price}`,
    },
    {
      title: 'Date',
      key: 'date',
      render: (record) => record.completedAt ? new Date(record.completedAt).toLocaleDateString() : '',
    },
    {
      title: 'Time',
      key: 'time',
      render: (record) => record.completedAt ? new Date(record.completedAt).toLocaleTimeString() : '',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '30px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
        The Sunset Cafe - Order Management
      </Title>

      <div className="m-4">
        <Sidebar />
      </div>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Create New Order" style={{ width: 400, margin: '0 auto' }}>
          <Form layout="vertical" form={form} onFinish={handleSubmit}>
            <Form.Item name="tableNumber" label="Table Number" rules={[{ required: true }]}>
              <Input placeholder="Enter table number" />
            </Form.Item>

            <Form.Item name="itemId" label="Select Item" rules={[{ required: true }]}>
              <Select placeholder="Select an item">
                {menuItems.map(item => (
                  <Option key={item._id} value={item._id}>
                    {item.name} - Rs{item.price}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
              <Input type="number" min={1} placeholder="Enter quantity" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Submit Order
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Space size="large" style={{ width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Card title="Pending Orders" style={{ width: 400 }}>
            <List
              dataSource={orders}
              renderItem={(order) => (
                <Card style={{ marginBottom: '10px' }} key={order._id}>
                  <Text strong>Table {order.tableNumber}</Text>
                  <div style={{ marginTop: '8px' }}>
                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <div key={index}>
                          {item.itemName} (x{item.quantity}) - Rs{item.totalPrice}
                        </div>
                      ))
                    ) : (
                      <div>No items</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <Text>Total: Rs{order.totalPrice}</Text>
                    <Text>Status: {order.status}</Text>
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <Button type="primary" size="small" onClick={() => markAsDone(order._id)}>
                      Mark as Done
                    </Button>
                    <Button type="dashed" size="small" onClick={() => openAddItemModal(order._id)}>
                      Add Item
                    </Button>
                  </div>
                </Card>
              )}
            />
          </Card>

          <Card title="Completed Orders" style={{ width: 800 }}>
            <Table
              dataSource={completedOrders}
              columns={columns}
              rowKey={(record) => record._id}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Space>
      </Space>

      <Modal
        title="Add Item to Order"
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          addItemForm.resetFields();
        }}
        footer={null}
      >
        <Form form={addItemForm} layout="vertical" onFinish={handleAddItem}>
          <Form.Item name="itemId" label="Select Item" rules={[{ required: true }]}>
            <Select placeholder="Select an item">
              {menuItems.map(item => (
                <Option key={item._id} value={item._id}>
                  {item.name} - Rs{item.price}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
            <Input type="number" min={1} placeholder="Enter quantity" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add Item
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Orders;

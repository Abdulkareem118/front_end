import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Table, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';

const Inventory = () => {
  const [form] = Form.useForm();
  const [inventory, setInventory] = useState([]);

  const fetchInventory = async () => {
    try {
      const res = await axios.get('https://pos-2-wv56.onrender.com/api/inventory');
      setInventory(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = async (values) => {
    try {
      const res = await axios.post('https://pos-2-wv56.onrender.com/api/inventory', {
        name: values.name,
        stock: values.stock,
      });
      setInventory([...inventory, res.data]);
      form.resetFields();
      toast.success('Item added successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Error adding item!');
    }
  };

  const handleSellQuantityChange = async (value, record) => {
    try {
      const res = await axios.put(`https://pos-2-wv56.onrender.com/api/inventory/${record._id}`, {
        sellQuantity: value,
      });
      const updatedInventory = inventory.map(item => {
        if (item._id === record._id) {
          return res.data;
        }
        return item;
      });
      setInventory(updatedInventory);
    } catch (error) {
      console.error(error);
      toast.error('Error updating sell quantity!');
    }
  };

  const columns = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Total Stock',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Sell Quantity',
      dataIndex: 'sellQuantity',
      key: 'sellQuantity',
      render: (_, record) => (
        <InputNumber
          min={0}
          max={record.stock}
          value={record.sellQuantity}
          onChange={(value) => handleSellQuantityChange(value, record)}
        />
      ),
    },
    {
      title: 'Remaining Stock',
      key: 'remaining',
      render: (_, record) => (
        <span>{record.stock - record.sellQuantity}</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster />
      <div className='m-4'>
        <Sidebar/>
      </div>

      <h1 className="text-3xl font-bold text-center mb-8">STOCK</h1>

      <div className="max-w-md mx-auto">
        <Card title="Add New Item" bordered={false}>
          <Form form={form} layout="vertical" onFinish={handleAddItem}>
            <Form.Item label="Item Name" name="name" rules={[{ required: true, message: 'Please enter item name' }]}>
              <Input placeholder="Enter item name" />
            </Form.Item>

            <Form.Item label="Total Stock" name="stock" rules={[{ required: true, message: 'Please enter total stock quantity' }]}>
              <InputNumber min={1} className="w-full" placeholder="Enter stock" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" icon={<PlusOutlined />} htmlType="submit" className="w-full">
                Add Item
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Inventory" className="mt-8" bordered={false}>
          <Table columns={columns} dataSource={inventory} rowKey="_id" pagination={false} />
        </Card>
      </div>
    </div>
  );
};

export default Inventory;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Input, Button, Select, Form, Table, Popconfirm } from 'antd';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from '../Componetnts/Sidebar';

const { Option } = Select;

const ItemsPage = () => {
  const [formData, setFormData] = useState({ name: '', category: '', price: '', stock: '' });
  const [items, setItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);

  const handleChange = (value, key) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get('https://pos-2-wv56.onrender.com/api/menu');
      setItems(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch items');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.category || !formData.price || !formData.stock) {
        toast.error('Please fill all fields');
        return;
      }

      if (editingItemId) {
        // Update existing item
        await axios.put(`https://pos-2-wv56.onrender.com/api/menu/${editingItemId}`, {
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        });
        toast.success('Item updated successfully!');
        setEditingItemId(null);
      } else {
        // Add new item
        await axios.post('https://pos-2-wv56.onrender.com/api/menu', {
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        });
        toast.success('Item added successfully!');
      }

      setFormData({ name: '', category: '', price: '', stock: '' });
      fetchItems();
    } catch (error) {
      console.error(error);
      toast.error('Operation failed');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      stock: item.stock,
    });
    setEditingItemId(item._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://pos-2-wv56.onrender.com/api/menu/${id}`);
      toast.success('Item deleted');
      fetchItems();
    } catch (error) {
      console.error(error);
      toast.error('Delete failed');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Price (Rs)', dataIndex: 'price', key: 'price' },
    // { title: 'Stock', dataIndex: 'stock', key: 'stock' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this item?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Toaster />
      <Sidebar />
      <h2 className="text-2xl font-bold mb-4">
        {editingItemId ? 'Update Item' : 'Add New Menu Item'}
      </h2>

      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Item Name">
          <Input
            value={formData.name}
            onChange={(e) => handleChange(e.target.value, 'name')}
            placeholder="e.g., Chicken Biryani"
          />
        </Form.Item>

        <Form.Item label="Category">
          <Select
            value={formData.category}
            onChange={(value) => handleChange(value, 'category')}
            placeholder="Select category"
          >
            <Option value="Sweet Bars">Sweet Bar</Option>
            <Option value="salad">Salad</Option>
            <Option value="Hot Bars">Hot Bar</Option>
            <Option value="Chicken Handi"> Chicken Handi</Option>
            <Option value="Pakistani Chicken">Pakistani Chicken</Option>
            <Option value="Chines">Chines</Option>
            <Option value="Mutton Handi">Mutton Handi</Option>
            <Option value="special Mutton">Special Mutton</Option>
            <Option value="Soup">Soup</Option>
            <Option value="Chines Rice">Chines Rice</Option>
            <Option value="BBQ">BBQ</Option>
            <Option value="Cold Bars">Cold Bars</Option>
            <Option value="Appetizer">Appetizer</Option>
            <Option value="Special Nan">Special Nan</Option>
            <Option value="Fish">Fish</Option>
            <Option value="Chow Mein">Chow Mein</Option>
            <Option value="Special Order">Special Order</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Price (Rs)">
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => handleChange(e.target.value, 'price')}
            placeholder="e.g., 250"
          />
        </Form.Item>

        <Form.Item label="Stock (Quantity)">
          <Input
            type="number"
            value={formData.stock}
            onChange={(e) => handleChange(e.target.value, 'stock')}
            placeholder="e.g., 50"
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" className="mt-2 w-full">
          {editingItemId ? 'Update Item' : 'Add Item'}
        </Button>
      </Form>

      <h3 className="text-xl font-semibold mt-8 mb-4">Menu Items</h3>
      <Table
        dataSource={items}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default ItemsPage;

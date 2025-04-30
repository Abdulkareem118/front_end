import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  DatePicker,
  TimePicker,
  Space,
  Form,
  message,
  Typography
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import Sidebar from './Sidebar';

const { Text } = Typography;

const DailyExpenses = () => {
  const [form] = Form.useForm();
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState('');
  const [totalAmount, setTotalAmount] = useState(null);

  // Fetch all expenses when component mounts
  useEffect(() => {
    getExpenses();
  }, []);

  // GET all expenses
  const getExpenses = async () => {
    try {
      const response = await axios.get('https://backend-pos-zps4.onrender.com/api/expensies/');
      setExpenses(response.data);
    } catch (err) {
      message.error('Error fetching expenses');
    }
  };

  // ADD or UPDATE expense
  const onFinish = async (values) => {
    const payload = {
      item: values.item,
      price: parseFloat(values.price),
      date: values.date.format('YYYY-MM-DD'),
      time: values.time.format('HH:mm'),
    };

    try {
      if (editingId) {
        await axios.put(`https://backend-pos-zps4.onrender.com/api/expensies/${editingId}`, payload);
        message.success('Expense updated');
      } else {
        await axios.post('https://backend-pos-zps4.onrender.com/api/expensies', payload);
        message.success('Expense added');
      }
      form.resetFields();
      setEditingId('');
      getExpenses();
    } catch (err) {
      message.error('Something went wrong');
    }
  };

  // Fill form to edit
  const onEdit = (record) => {
    form.setFieldsValue({
      item: record.item,
      price: record.price,
      date: dayjs(record.date),
      time: dayjs(record.time, 'HH:mm'),
    });
    setEditingId(record._id);
  };

  // DELETE expense
  const onDelete = async (id) => {
    try {
      await axios.delete(`https://backend-pos-zps4.onrender.com/api/expensies/${id}`);
      message.success('Deleted successfully');
      getExpenses();
    } catch {
      message.error('Delete failed');
    }
  };

  // TOTAL calculation
  const calculateTotal = () => {
    const total = expenses.reduce((sum, exp) => sum + exp.price, 0);
    setTotalAmount(total);
  };

  const columns = [
    {
      title: 'Item Name',
      dataIndex: 'item',
      key: 'item',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `RS${price}`,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)} type="primary">
            Edit
          </Button>
          <Button icon={<DeleteOutlined />} onClick={() => onDelete(record._id)} type="primary" danger>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Daily Expenses</h2>
      <div className='m-4'>
      <Sidebar/>
      </div>
      
      <Form
        form={form}
        layout="inline"
        onFinish={onFinish}
        style={{ marginBottom: 20 }}
      >
        <Form.Item
          name="item"
          rules={[{ required: true, message: 'Please enter item name' }]}
        >
          <Input placeholder="Item Name" />
        </Form.Item>

        <Form.Item
          name="price"
          rules={[{ required: true, message: 'Please enter price' }]}
        >
          <Input type="number" placeholder="Price" />
        </Form.Item>

        <Form.Item
          name="date"
          rules={[{ required: true, message: 'Please select date' }]}
        >
          <DatePicker />
        </Form.Item>

        <Form.Item
          name="time"
          rules={[{ required: true, message: 'Please select time' }]}
        >
          <TimePicker format="HH:mm" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<PlusOutlined />}
          >
            {editingId ? 'Update' : 'Add'}
          </Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={expenses}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
      />

      <div style={{ marginTop: 20 }}>
        <Button
          type="dashed"
          icon={<DollarOutlined />}
          onClick={calculateTotal}
        >
          Show Total
        </Button>
        {totalAmount !== null && (
          <Text style={{ marginLeft: 16, fontWeight: 'bold' }}>
            Total Amount: RS{totalAmount}
          </Text>
        )}
      </div>
    </div>
  );
};

export default DailyExpenses;

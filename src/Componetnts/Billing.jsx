// src/components/Billing.js
import React from 'react';
import { Card, Table, Button, Typography } from 'antd';
const { Title, Text } = Typography;

const Billing = ({ completedOrders }) => {
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
  ];

  return (
    <Card title="Billing" style={{ width: '100%', marginTop: '20px' }}>
      <Title level={3}>Completed Orders</Title>
      <Table
        dataSource={completedOrders}
        columns={columns}
        rowKey={(record) => record._id}
        pagination={{ pageSize: 5 }}
      />
      <Button type="primary" style={{ marginTop: '20px' }}>
        Generate Invoice
      </Button>
    </Card>
  );
};

export default Billing;

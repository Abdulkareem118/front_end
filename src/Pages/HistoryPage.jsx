import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Card, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Sidebar from '../Componetnts/Sidebar';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get('https://pos-2-wv56.onrender.com/api/history')
      .then((res) => setHistory(res.data))
      .catch((err) => console.error('Failed to fetch history', err));
  }, []);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Sales History', 14, 15);
    doc.setFontSize(12);
    doc.setTextColor(100);

    const tableRows = [];

    history.forEach(entry => {
      const formattedDate = moment(entry.date).format('DD-MM-YYYY hh:mm A');
      const itemsStr = entry.items
        .map(item => `${item.name} x ${item.quantity} = Rs. ${(item.price * item.quantity).toFixed(2)}`)
        .join('\n');
      const total = `Rs. ${entry.total.toFixed(2)}`;

      tableRows.push([formattedDate, itemsStr, total]);
    });

    autoTable(doc, {
      head: [['Date', 'Items', 'Total (Rs.)']],
      body: tableRows,
      startY: 25,
    });

    doc.save('sales_history.pdf');
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD-MM-YYYY hh:mm A'),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <ul className="list-disc pl-4">
          {items.map((item, idx) => (
            <li key={idx}>
              {item.name} × {item.quantity} = Rs. {(item.price * item.quantity).toFixed(2)}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Total (Rs.)',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `Rs. ${total.toFixed(2)}`,
    },
  ];

  return (
    <div className="p-6">
          <div className='m-4'>
      <Sidebar/>
      </div>
      <Card
        title="🕓 Sales History"
        extra={
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadPDF}
            type="primary"
          >
            Download PDF
          </Button>
        }
        className="shadow-lg"
      >
        <Table
          dataSource={history}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default HistoryPage;

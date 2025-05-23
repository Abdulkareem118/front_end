import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Card, Button, Input } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Sidebar from '../Componetnts/Sidebar';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchItem, setSearchItem] = useState('');
  const [totalQuantityForSearch, setTotalQuantityForSearch] = useState(0);
  const [closingTimestamps, setClosingTimestamps] = useState(() => {
    const saved = localStorage.getItem('closings');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeShiftIndex, setActiveShiftIndex] = useState(0);

  useEffect(() => {
    axios.get('https://backend-pos-zps4.onrender.com/api/history')
      .then((res) => setHistory(res.data))
      .catch((err) => console.error('Failed to fetch history', err));
  }, []);

  useEffect(() => {
    axios.get('https://backend-pos-zps4.onrender.com/api/shifts')
      .then(res => {
        setClosingTimestamps(res.data.map(s => s.timestamp));
      })
      .catch(err => console.error('Failed to fetch shifts', err));
  }, []);

  useEffect(() => {
    const shiftData = getShiftData();
    setFilteredHistory(shiftData);
  }, [history, activeShiftIndex]);

  const getShiftData = () => {
    const start = activeShiftIndex === 0 ? new Date(0) : new Date(closingTimestamps[activeShiftIndex - 1]);
    const end = closingTimestamps[activeShiftIndex]
      ? new Date(closingTimestamps[activeShiftIndex])
      : new Date();

    return history.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate < end;
    });
  };

  const handleSearch = () => {
    if (!searchItem.trim()) {
      setFilteredHistory(getShiftData());
      setTotalQuantityForSearch(0);
      return;
    }

    const shiftData = getShiftData();
    const filtered = shiftData.filter(entry =>
      entry.items.some(item =>
        item.name.toLowerCase().includes(searchItem.trim().toLowerCase())
      )
    );

    setFilteredHistory(filtered);

    const totalQuantity = filtered.reduce((acc, entry) => {
      entry.items.forEach(item => {
        if (item.name.toLowerCase().includes(searchItem.trim().toLowerCase())) {
          acc += item.quantity;
        }
      });
      return acc;
    }, 0);

    setTotalQuantityForSearch(totalQuantity);
  };

  const handleClose = () => {
    axios.post('http://localhost:8080/api/shifts')
      .then(res => {
        const newTimestamp = res.data.timestamp;
        const updated = [...closingTimestamps, newTimestamp];
        setClosingTimestamps(updated);
        setActiveShiftIndex(updated.length);
      })
      .catch(err => console.error('Failed to close shift', err));
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Shift #${activeShiftIndex + 1} Sales`, 14, 15);
    doc.setFontSize(12);
    doc.setTextColor(100);

    const shiftSales = getShiftData();
    let totalQuantity = 0;
    let totalAmount = 0;

    const tableRows = shiftSales.map((entry, index) => {
      const formattedDate = moment(entry.date).format('DD-MM-YYYY hh:mm A');
      const itemsStr = entry.items
        .map(item => {
          totalQuantity += item.quantity;
          totalAmount += item.price * item.quantity;
          return `${item.name} x ${item.quantity} = Rs. ${(item.price * item.quantity).toFixed(2)}`
        })
        .join('\n');
      const total = `Rs. ${entry.total.toFixed(2)}`;
      return [index + 1, formattedDate, itemsStr, total];
    });

    doc.text(`Total Items Sold: ${totalQuantity}`, 14, 25);
    doc.text(`Total Sales: Rs. ${totalAmount.toFixed(2)}`, 14, 30);

    autoTable(doc, {
      head: [['Order #', 'Date', 'Items', 'Total (Rs.)']],
      body: tableRows,
      startY: 40,
    });

    doc.save(`shift_${activeShiftIndex + 1}_sales.pdf`);
  };

  const handleNextShift = () => {
    const totalShifts = closingTimestamps.length + 1;
    if (activeShiftIndex < totalShifts - 1) {
      setActiveShiftIndex(activeShiftIndex + 1);
    }
  };

  const handlePrevShift = () => {
    if (activeShiftIndex > 0) {
      setActiveShiftIndex(activeShiftIndex - 1);
    }
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

  const totalQuantity = filteredHistory.reduce((acc, entry) => {
    entry.items.forEach(item => acc += item.quantity);
    return acc;
  }, 0);

  const totalAmount = filteredHistory.reduce((acc, entry) => acc + entry.total, 0);
  const totalShifts = closingTimestamps.length + 1;

  return (
    <div className="p-6">
      <div className="m-4">
        <Sidebar />
      </div>

      <Card
        title="🕓 Sales History"
        extra={
          <Button icon={<DownloadOutlined />} onClick={handleDownloadPDF} type="primary">
            Download PDF
          </Button>
        }
        className="shadow-lg"
      >
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <Button onClick={handleClose} danger>
            Close Shift
          </Button>
          <Button onClick={handlePrevShift} disabled={activeShiftIndex === 0}>
            Previous Shift
          </Button>
          <Button
            onClick={handleNextShift}
            disabled={activeShiftIndex === totalShifts - 1}
          >
            Next Shift
          </Button>
          <div style={{ marginLeft: 'auto', fontWeight: 'bold' }}>
            Viewing Shift: {activeShiftIndex + 1} / {totalShifts}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <Input
            placeholder="Enter Item to Search"
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
            style={{ width: '300px' }}
          />
          <Button type="primary" onClick={handleSearch}>
            Search
          </Button>
        </div>

        {searchItem && (
          <div style={{ marginBottom: '20px' }}>
            <strong>
              Total Quantity for "{searchItem}": {totalQuantityForSearch} Item(s)
            </strong>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <p><strong>Total Items Sold:</strong> {totalQuantity}</p>
          <p><strong>Total Sales:</strong> Rs. {totalAmount.toFixed(2)}</p>

          <Table
            dataSource={filteredHistory}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 50 }}
          />
        </div>
      </Card>
    </div>
  );
};

export default HistoryPage;

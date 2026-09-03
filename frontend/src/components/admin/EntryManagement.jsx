import React, { useState, useEffect, useRef } from 'react';
import { QrCode, CheckCircle, XCircle } from 'lucide-react';
import adminApi from './adminApi';
import DataTable from './DataTable';
import { isRequired } from '../../utils/formValidation';

const EntryManagement = () => {
  const [scanMode, setScanMode] = useState(false);
  const [ticketCode, setTicketCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');
  const inputRef = useRef(null);
  
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchRecords = async (params) => {
    const data = await adminApi.getEntries(params);
    return data;
  };

  const deleteRecord = async (id) => {
    await adminApi.deleteEntry(id);
  };

  const handleCheckIn = async (code) => {
    if (!code) return;
    setScanLoading(true);
    setScanResult(null);
    try {
      const response = await adminApi.checkInEntry(code);
      setScanResult({ success: true, message: response.message, entry: response.entry });
      setRefreshCount(prev => prev + 1);
    } catch (err) {
      setScanResult({ success: false, message: err.response?.data?.error || err.message });
    } finally {
      setScanLoading(false);
      setTicketCode('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const onSubmitScan = (e) => {
    e.preventDefault();
    if (!isRequired(ticketCode)) {
      setScanError('Please scan or enter a ticket code');
      return;
    }
    setScanError('');
    handleCheckIn(ticketCode);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'ticket_code', label: 'Ticket Code' },
    { key: 'visitor_name', label: 'Visitor Name' },
    { key: 'visitor_type', label: 'Type' },
    { key: 'attendance_status', label: 'Status', render: (val) => (
      <span className={`badge ${val === 'CHECKED_IN' ? 'b-ok' : 'b-wa'}`}>
        {val}
      </span>
    )},
    { key: 'check_in_time', label: 'Check-In Time', render: (val) => val ? new Date(val).toLocaleString() : '—' },
    { key: 'created_at', label: 'Created At', render: (val) => new Date(val).toLocaleString() }
  ];

  useEffect(() => {
    if (scanMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [scanMode]);

  return (
    <div className="page on">
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">Scanner Check-In</span>
          <button className={`btn btn-sm ${scanMode ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setScanMode(!scanMode); setScanResult(null); }}>
            <QrCode size={14} style={{ marginRight: 6 }} /> {scanMode ? 'Close Scanner' : 'Open Scanner'}
          </button>
        </div>
        {scanMode && (
          <div style={{ padding: 20, textAlign: 'center', background: 'var(--bg-secondary)' }}>
            <form onSubmit={onSubmitScan} style={{ maxWidth: 400, margin: '0 auto' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input 
                  ref={inputRef}
                  type="text" 
                  className="form-control" 
                  placeholder="Scan or enter ticket code..." 
                  value={ticketCode}
                  onChange={e => { setTicketCode(e.target.value); setScanError(''); }}
                  disabled={scanLoading}
                  autoFocus
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={scanLoading || !ticketCode}>
                  {scanLoading ? 'Checking...' : 'Submit'}
                </button>
              </div>
              {scanError && <div style={{ color: '#ff453b', fontSize: '12px', marginTop: '6px', textAlign: 'left' }}>{scanError}</div>}
            </form>
            
            {scanResult && (
              <div style={{ marginTop: 15, padding: 15, borderRadius: 8, background: scanResult.success ? '#d4edda' : '#f8d7da', color: scanResult.success ? '#155724' : '#721c24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                {scanResult.success ? <CheckCircle size={20} /> : <XCircle size={20} />}
                <strong>{scanResult.message}</strong>
              </div>
            )}
            
            <p style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
              Keep cursor in the text box if using a physical barcode scanner.
            </p>
          </div>
        )}
      </div>

      <DataTable
        key={refreshCount}
        title="Entry Management"
        fetchFn={fetchRecords}
        deleteFn={deleteRecord}
        columns={columns}
        exportTable="entries"
        searchPlaceholder="Search by ticket code or visitor name..."
      />
    </div>
  );
};

export default EntryManagement;

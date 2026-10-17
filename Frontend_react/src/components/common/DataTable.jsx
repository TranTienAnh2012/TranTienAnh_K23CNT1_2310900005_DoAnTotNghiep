import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function DataTable({ columns, data, keyField = 'id', emptyMessage = 'Chưa có dữ liệu nào.' }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    return Object.values(item).some(
      (val) => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Tìm kiếm nhanh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ fontSize: '13px', color: '#64748b' }}>
          Hiển thị <b>{filteredData.length}</b> bản ghi
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width || 'auto' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <tr key={row[keyField]}>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

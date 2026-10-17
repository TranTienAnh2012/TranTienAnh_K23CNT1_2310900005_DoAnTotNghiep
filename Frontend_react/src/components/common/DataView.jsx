import React, { useState } from 'react';
import { Search, Table as TableIcon, List, LayoutGrid, X } from 'lucide-react';

/**
 * DataView Component - Hỗ trợ 3 chế độ xem đa năng tối ưu với Tailwind CSS:
 * 1. 'table' : Bảng dữ liệu chuẩn (Table View)
 * 2. 'list'  : Danh sách thẻ dòng ngang (Row / List View)
 * 3. 'box'   : Lưới thẻ hộp hiện đại (Box / Grid View)
 */
export default function DataView({
  columns = [],
  data = [],
  keyField = 'id',
  defaultView = 'table', // 'table' | 'list' | 'box'
  searchPlaceholder = 'Tìm kiếm nhanh...',
  searchKeys = [], // Các trường dùng để tìm kiếm (nếu rỗng thì tìm toàn bộ)
  renderListItem = null, // Custom render function cho chế độ 'list'
  renderBoxItem = null,  // Custom render function cho chế độ 'box'
  emptyMessage = 'Không tìm thấy dữ liệu phù hợp.',
  actions = null, // Nút thao tác bổ sung trên thanh toolbar (vd: Nút Thêm mới)
  filters = null, // Dropdown lọc bổ sung
  stats = null    // Thống kê nhanh tóm tắt
}) {
  const [viewMode, setViewMode] = useState(defaultView);
  const [searchTerm, setSearchTerm] = useState('');

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredData = data.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();

    if (searchKeys.length > 0) {
      return searchKeys.some((k) => item[k] && String(item[k]).toLowerCase().includes(term));
    }

    return Object.values(item).some(
      (val) => val && typeof val !== 'object' && String(val).toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Stats Bar (nếu có) */}
      {stats && <div className="mb-1">{stats}</div>}

      {/* 2. Controls Toolbar: Search + Filters + View Switcher + Actions */}
      <div className="flex justify-between items-center flex-wrap gap-3 bg-white p-3 sm:px-4 rounded-xl border border-slate-200/90 shadow-sm">
        {/* Left: Search input & Filters */}
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Custom Filters (Dropdowns) */}
          {filters}

          <span className="text-xs text-slate-500 font-medium whitespace-nowrap hidden sm:inline">
            Hiển thị <b className="text-slate-800 font-semibold">{filteredData.length}</b> / {data.length} bản ghi
          </span>
        </div>

        {/* Right: View Switcher (Table / List / Box) + Actions Button */}
        <div className="flex items-center gap-2.5">
          {/* Segmented View Switcher */}
          <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Chế độ Bảng (Table View)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon size={14} />
              <span className="hidden md:inline">Bảng</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="Chế độ Dòng (Row / List View)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List size={14} />
              <span className="hidden md:inline">Dòng</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('box')}
              title="Chế độ Hộp (Box / Grid View)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                viewMode === 'box'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={14} />
              <span className="hidden md:inline">Hộp</span>
            </button>
          </div>

          {/* Action buttons (Thêm mới, ...) */}
          {actions}
        </div>
      </div>

      {/* 3. Content Views */}
      {filteredData.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-12 px-6 text-center text-slate-500 flex flex-col items-center gap-2.5">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
            <Search size={22} />
          </div>
          <div className="text-sm font-semibold text-slate-800">{emptyMessage}</div>
          <div className="text-xs text-slate-400 max-w-sm">
            {searchTerm ? 'Thử tìm kiếm với từ khóa khác hoặc xóa bớt tiêu chí lọc.' : 'Chưa có bản ghi nào trong hệ thống.'}
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* MODE 1: TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 whitespace-nowrap"
                      style={{ width: col.width || 'auto' }}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((row, rIdx) => (
                  <tr
                    key={row[keyField] || rIdx}
                    className="hover:bg-slate-50/80 transition-colors duration-150"
                  >
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="px-4 py-3.5 align-middle text-slate-700 whitespace-nowrap">
                        {col.render ? col.render(row) : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* MODE 2: ROW / LIST VIEW */
        <div className="flex flex-col gap-2.5">
          {filteredData.map((item, idx) => {
            if (renderListItem) {
              return <React.Fragment key={item[keyField] || idx}>{renderListItem(item)}</React.Fragment>;
            }

            // Fallback generic row renderer
            return (
              <div
                key={item[keyField] || idx}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:px-5 flex items-center justify-between gap-4 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-150"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-blue-100">
                    {String(item.ten || item.ho_ten || item.ma || item.id || '#').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {item.ho_ten || item.ten_khoa || item.ten_lop || item.ten_mon || item.ten_hoc_ky || item.username}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">
                      Mã: <b className="text-slate-700">{item.ma_sv || item.ma_gv || item.ma_khoa || item.ma_lop || item.ma_mon || item.id}</b>
                      {item.email && ` • ${item.email}`}
                      {item.khoa_ten && ` • ${item.khoa_ten}`}
                    </div>
                  </div>
                </div>

                {/* Right side items */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {columns.slice(-2).map((col, cIdx) => (
                    <div key={cIdx}>{col.render ? col.render(item) : item[col.accessor]}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* MODE 3: BOX / GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredData.map((item, idx) => {
            if (renderBoxItem) {
              return <React.Fragment key={item[keyField] || idx}>{renderBoxItem(item)}</React.Fragment>;
            }

            // Fallback generic card box renderer
            return (
              <div
                key={item[keyField] || idx}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between gap-3.5 shadow-sm hover:border-blue-400 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base flex-shrink-0 border border-blue-100">
                    {String(item.ten || item.ho_ten || item.ma || item.id || '#').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {item.ho_ten || item.ten_khoa || item.ten_lop || item.ten_mon || item.ten_hoc_ky || item.username}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.ma_sv || item.ma_gv || item.ma_khoa || item.ma_lop || item.ma_mon || `ID: ${item.id}`}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 flex flex-col gap-1 border-t border-slate-100 pt-2.5">
                  {item.email && <div className="truncate">Email: <b className="text-slate-800">{item.email}</b></div>}
                  {item.khoa_ten && <div className="truncate">Khoa: <b className="text-slate-800">{item.khoa_ten}</b></div>}
                  {item.lop_ten && <div className="truncate">Lớp: <b className="text-slate-800">{item.lop_ten}</b></div>}
                  {item.so_tin_chi && <div>Số tín chỉ: <b className="text-slate-800">{item.so_tin_chi} TC</b></div>}
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-2.5">
                  {columns.slice(-1).map((col, cIdx) => (
                    <div key={cIdx}>{col.render ? col.render(item) : item[col.accessor]}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

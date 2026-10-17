import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Table as TableIcon,
  List,
  LayoutGrid,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

/**
 * DataView Component - Hỗ trợ 3 chế độ xem đa năng (Table, List, Box) kèm Phân trang tích hợp:
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
  stats = null,   // Thống kê nhanh tóm tắt
  pageSize = 10,  // Số lượng phần tử trên mỗi trang mặc định
  pageSizeOptions = [10, 20, 50, 100], // Tùy chọn số lượng trên mỗi trang
  enablePagination = true // Bật / tắt phân trang
}) {
  const [viewMode, setViewMode] = useState(defaultView);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  // 1. Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    if (searchKeys.length > 0) {
      return data.filter((item) =>
        searchKeys.some((k) => item[k] && String(item[k]).toLowerCase().includes(term))
      );
    }

    return data.filter((item) =>
      Object.values(item).some(
        (val) => val && typeof val !== 'object' && String(val).toLowerCase().includes(term)
      )
    );
  }, [data, searchTerm, searchKeys]);

  // Reset trang về 1 khi từ khóa tìm kiếm hoặc tổng số phần tử thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, data.length]);

  // 2. Tính toán phân trang
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Dữ liệu hiển thị trên trang hiện tại
  const displayData = useMemo(() => {
    if (!enablePagination) return filteredData;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, enablePagination, startIndex, endIndex]);

  // Tạo danh sách số trang thông minh với dấu ba chấm '...'
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (validPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (validPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', validPage - 1, validPage, validPage + 1, '...', totalPages];
  }, [totalPages, validPage]);

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Stats Bar (nếu có) */}
      {stats && <div className="mb-1">{stats}</div>}

      {/* 2. Controls Toolbar: Search + Filters + View Switcher + Actions */}
      <div className="flex justify-between items-center flex-wrap gap-3 bg-white p-3 sm:px-4 rounded-xl border border-slate-200/90 shadow-sm">
        {/* Left: Search input & Filters */}
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          <div className="relative min-w-[200px] max-w-sm flex-1">
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Custom Filters (Dropdowns) */}
          {filters}

          <span className="text-xs text-slate-500 font-medium whitespace-nowrap hidden sm:inline">
            Tìm thấy <b className="text-slate-800 font-semibold">{totalItems}</b> / {data.length} bản ghi
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
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer ${
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
      {totalItems === 0 ? (
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
                {displayData.map((row, rIdx) => (
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
          {displayData.map((item, idx) => {
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
          {displayData.map((item, idx) => {
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

      {/* 4. Pagination Footer Bar */}
      {enablePagination && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 bg-white p-3.5 sm:px-5 rounded-xl border border-slate-200/90 shadow-sm text-xs text-slate-600">
          {/* Left: Số dòng trên mỗi trang & Thông tin hiển thị */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Hiển thị</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span className="text-slate-500">dòng / trang</span>
            </div>

            <div className="hidden sm:inline-block w-px h-4 bg-slate-200" />

            <span className="text-slate-500 font-medium">
              Đang xem <b className="text-slate-800 font-semibold">{startIndex + 1}</b> -{' '}
              <b className="text-slate-800 font-semibold">{endIndex}</b> /{' '}
              <b className="text-slate-800 font-semibold">{totalItems}</b> bản ghi
            </span>
          </div>

          {/* Right: Nút điều hướng số trang */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={validPage === 1}
              title="Về trang đầu tiên"
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronsLeft size={16} />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validPage === 1}
              title="Trang trước"
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Các nút bấm số trang */}
            <div className="flex items-center gap-1 mx-1">
              {pageNumbers.map((p, idx) =>
                p === '...' ? (
                  <span key={`dots-${idx}`} className="px-2 py-1 text-slate-400 select-none font-bold">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      validPage === p
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validPage === totalPages}
              title="Trang kế tiếp"
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={validPage === totalPages}
              title="Đến trang cuối cùng"
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

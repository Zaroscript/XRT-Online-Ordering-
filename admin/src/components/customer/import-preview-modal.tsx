import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal/modal';
import { Table } from '@/components/ui/table';
import Input from '@/components/ui/input';
import { TrashIcon } from '@/components/icons/trash';
import { CloseIcon } from '@/components/icons/close-icon';
import {
  ImportPreviewModalProps,
  ImportRow,
} from '@/components/customer/types';

// Enhanced custom styles for the import preview table
const tableStyles = `
  .import-preview-table,
  .import-preview-table table {
    width: 100% !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
    padding: 1rem !important;
  }
  .import-preview-table .rc-table-content {
    overflow-x: auto;
    border-radius: 12px !important;
  }
  .import-preview-table th,
  .import-preview-table td {
    padding: 16px 14px !important;
    vertical-align: middle !important;
    box-sizing: border-box !important;
    border-right: 1px solid #f1f5f9 !important;
  }
  .import-preview-table th {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
    border-bottom: 2px solid #e2e8f0 !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    color: #374151 !important;
    text-align: left !important;
    white-space: nowrap !important;
    letter-spacing: 0.025em !important;
    text-transform: uppercase !important;
  }
  .import-preview-table td {
    border-bottom: 1px solid #f1f5f9 !important;
    background: white !important;
    transition: all 0.2s ease !important;
  }
  .import-preview-table tr:hover td {
    background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%) !important;
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.05) !important;
  }
  .import-preview-table tr:last-child td {
    border-bottom: none !important;
  }
  .import-preview-table tr {
    transition: all 0.2s ease !important;
  }
  .cell-wrapper {
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    width: 100% !important;
    min-height: 40px !important;
  }
  .cell-wrapper-center {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    min-height: 40px !important;
  }
  .import-preview-table td:last-child {
    border-right: none !important;
  }
`;

const ImportPreviewModal = ({
  isOpen,
  onClose,
  onConfirm,
  data: initialData,
  isLoading = false,
}: ImportPreviewModalProps) => {
  const { t } = useTranslation();
  const [editableData, setEditableData] = useState<ImportRow[]>([]);

  // Initialize data
  useEffect(() => {
    setEditableData(
      initialData.map((row, index) => ({
        ...row,
        id: `row-${index}`,
      })),
    );
  }, [initialData]);

  const handleCellChange = (
    rowId: string,
    field: keyof ImportRow,
    value: string | number,
  ) => {
    setEditableData((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        return { ...row, [field]: value };
      }),
    );
  };

  const handleDeleteRow = (rowId: string) => {
    setEditableData((prev) => prev.filter((row) => row.id !== rowId));
  };

  const handleConfirm = () => {
    // Check all required fields are present
    const invalidRows = editableData.filter(
      (row) => !row.name || !row.email || !row.phoneNumber,
    );
    if (invalidRows.length > 0) {
      return;
    }
    // Remove the temporary id field before confirming
    const cleanData = editableData.map(({ id, ...rest }) => rest);
    onConfirm(cleanData);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (value: string, record: ImportRow) => (
        <div className="cell-wrapper">
          <Input
            name={`name-${record.id}`}
            value={value}
            onChange={(e) =>
              handleCellChange(record.id, 'name', e.target.value)
            }
            className="!h-11 !min-h-0 !text-sm !rounded-xl !border-gray-200 !bg-white/90 backdrop-blur-sm w-full transition-all duration-300 focus:!border-accent focus:!ring-2 focus:!ring-accent/20 focus:!bg-white shadow-md hover:shadow-lg hover:!border-gray-300 placeholder:!text-gray-400"
            placeholder="Name"
          />
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      render: (value: string, record: ImportRow) => (
        <div className="cell-wrapper">
          <Input
            name={`email-${record.id}`}
            type="email"
            value={value}
            onChange={(e) =>
              handleCellChange(record.id, 'email', e.target.value)
            }
            className="!h-11 !min-h-0 !text-sm !rounded-xl !border-gray-200 !bg-white/90 backdrop-blur-sm w-full transition-all duration-300 focus:!border-accent focus:!ring-2 focus:!ring-accent/20 focus:!bg-white shadow-md hover:shadow-lg hover:!border-gray-300 placeholder:!text-gray-400"
            placeholder="Email"
          />
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 130,
      render: (value: string, record: ImportRow) => (
        <div className="cell-wrapper">
          <Input
            name={`phone-${record.id}`}
            value={value}
            onChange={(e) =>
              handleCellChange(record.id, 'phoneNumber', e.target.value)
            }
            className="!h-11 !min-h-0 !text-sm !rounded-xl !border-gray-200 !bg-white/90 backdrop-blur-sm w-full transition-all duration-300 focus:!border-accent focus:!ring-2 focus:!ring-accent/20 focus:!bg-white shadow-md hover:shadow-lg hover:!border-gray-300 placeholder:!text-gray-400"
            placeholder="Phone"
          />
        </div>
      ),
    },
    {
      title: 'Points',
      dataIndex: 'rewards',
      key: 'rewards',
      width: 80,
      align: 'center' as const,
      render: (value: number, record: ImportRow) => (
        <div className="cell-wrapper-center">
          <Input
            name={`rewards-${record.id}`}
            type="number"
            value={value || 0}
            onChange={(e) =>
              handleCellChange(
                record.id,
                'rewards',
                parseInt(e.target.value) || 0,
              )
            }
            className="!h-11 !min-h-0 !text-sm !rounded-xl !border-gray-200 !bg-white/90 backdrop-blur-sm w-full transition-all duration-300 focus:!border-accent focus:!ring-2 focus:!ring-accent/20 focus:!bg-white shadow-md hover:shadow-lg hover:!border-gray-300 placeholder:!text-gray-400 !text-center"
          />
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      align: 'center' as const,
      render: (_: any, record: ImportRow) => (
        <div className="cell-wrapper-center">
          <button
            type="button"
            onClick={() => handleDeleteRow(record.id)}
            className="p-1.5 text-red-400 hover:text-red-600 rounded hover:bg-red-50"
            title="Remove"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const allRowsValid = editableData.every(
    (row) => row.name && row.email && row.phoneNumber,
  );

  // Count valid and invalid rows
  const validRowsCount = editableData.filter(
    (row) => row.name && row.email && row.phoneNumber,
  ).length;
  const invalidRowsCount = editableData.length - validRowsCount;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <style dangerouslySetInnerHTML={{ __html: tableStyles }} />
      <div className="w-[95vw] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent to-accent/80 px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Import Preview</h3>
                <p className="text-white/80 text-sm mt-0.5">
                  Review and edit your customer data before importing
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <div className="text-white/70 text-xs font-medium uppercase tracking-wide">
                Total Customers
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {editableData.length}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <div className="text-white/70 text-xs font-medium uppercase tracking-wide">
                Ready to Import
              </div>
              <div className="text-2xl font-bold text-emerald-300 mt-1">
                {validRowsCount}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <div className="text-white/70 text-xs font-medium uppercase tracking-wide">
                Needs Attention
              </div>
              <div
                className={`text-2xl font-bold mt-1 ${invalidRowsCount > 0 ? 'text-amber-300' : 'text-emerald-300'}`}
              >
                {invalidRowsCount}
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="px-6 py-5">
          {/* Table Header Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Customer Data
              </span>
              <span className="text-xs text-gray-400">
                (Click any cell to edit)
              </span>
            </div>
            {editableData.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Valid
                </span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Incomplete
                </span>
              </div>
            )}
          </div>

          {/* Enhanced Scrollable Table Container */}
          <div className="max-h-[45vh] overflow-auto rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50/50 to-white shadow-inner">
            {editableData.length > 0 ? (
              <Table
                // @ts-ignore
                columns={columns}
                data={editableData}
                rowKey="id"
                scroll={{ x: 1000 }}
                className="import-preview-table"
                // showHeader={false}
                pagination={false}
                size="middle"
              />
            ) : (
              <div className="text-center py-16 px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h4 className="text-gray-700 font-medium mb-1">
                  No Data Found
                </h4>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  Please select a CSV file with valid customer data including
                  name, email, and phone number columns.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="border-t border-gray-100 bg-gray-50/80 px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!allRowsValid && editableData.length > 0 ? (
                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    {invalidRowsCount} row{invalidRowsCount !== 1 ? 's' : ''}{' '}
                    need attention
                  </span>
                </div>
              ) : editableData.length > 0 ? (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    All rows are valid and ready to import
                  </span>
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="!px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={
                  editableData.length === 0 || !allRowsValid || isLoading
                }
                loading={isLoading}
                className="!px-6 !bg-accent hover:!bg-accent/90"
              >
                <span className="flex items-center gap-2">
                  {!isLoading && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  )}
                  Import {editableData.length} Customer
                  {editableData.length !== 1 ? 's' : ''}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ImportPreviewModal;

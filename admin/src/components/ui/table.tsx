import 'rc-table/assets/index.css';
import React from 'react';
import RcTable from 'rc-table';
export type AlignType = 'left' | 'center' | 'right';

interface TableProps extends React.ComponentProps<typeof RcTable> {
  // Add any additional props if needed
}

// Global warning suppression for rc-table defaultProps
let originalConsoleError: typeof console.error | null = null;
let isSuppressionActive = false;

const suppressTableWarnings = () => {
  if (isSuppressionActive) return;

  originalConsoleError = console.error;
  console.error = (...args) => {
    // Suppress defaultProps warning from rc-table
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('defaultProps will be removed from function components') ||
        args[0].includes('Support for defaultProps will be removed') ||
        args[0].includes('fetchPriority'))
    ) {
      return;
    }
    originalConsoleError?.call(console, ...args);
  };
  isSuppressionActive = true;
};

const Table: React.FC<TableProps> = (props) => {
  React.useEffect(() => {
    suppressTableWarnings();
    return () => {
      // Restore original console.error when component unmounts (optional)
      if (originalConsoleError && isSuppressionActive) {
        console.error = originalConsoleError;
        isSuppressionActive = false;
      }
    };
  }, []);

  return <RcTable {...props} />;
};

export { Table };

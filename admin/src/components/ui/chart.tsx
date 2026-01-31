import dynamic from 'next/dynamic';

const Charts = dynamic(() => import('react-apexcharts'), { ssr: false });

const Chart = ({ width, height, ...props }: any) => {
  // Ensure width and height are valid numbers, not NaN
  const safeWidth = width && !isNaN(Number(width)) ? width : undefined;
  const safeHeight = height && !isNaN(Number(height)) ? height : '350';

  return <Charts {...props} width={safeWidth} height={safeHeight} />;
};

export default Chart;

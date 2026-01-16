import classNames from 'classnames';
import { twMerge } from 'tailwind-merge';

const PageHeading = ({
  title,
  className,
  ...props
}: {
  title: string;
  className?: string;
}) => {
  return (
    <h2
      className={twMerge(
        classNames('text-lg font-semibold text-heading', className),
      )}
      {...props}
    >
      {title}
    </h2>
  );
};

export default PageHeading;

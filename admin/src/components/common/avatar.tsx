import React from 'react';
import cn from 'classnames';
import { twMerge } from 'tailwind-merge';

const classes = {
  base: 'inline-flex items-center justify-center flex-shrink-0 border text-accent border-border-100 bg-accent/10 overflow-hidden relative',
  size: {
    sm: '32px',
    DEFAULT: '40px',
    lg: '48px',
    xl: '56px',
  },
  fontSize: {
    sm: 'text-xs',
    DEFAULT: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  },
  rounded: {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },
};

type AvatarProps = {
  src?: string;
  name: string;
  initials?: string;
  size?: keyof typeof classes.size;
  customSize?: string;
  rounded?: keyof typeof classes.rounded;
  onClick?: () => void;
  className?: string;
};

const CHECK_VALID_CUSTOM_SIZE = /(\d*px)?/g;

function getInitials(name: string) {
  if (!name) return 'GU';
  const words = name.split(' ');
  const initials = words.map((word) => word[0]);
  return initials.slice(0, 2).join('').toUpperCase();
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'DEFAULT',
  initials,
  customSize,
  rounded = 'full',
  onClick,
  className,
  ...rest
}) => {
  const [isError, setError] = React.useState(false);

  // Separate props for div and image elements
  const { divProps } = React.useMemo(() => {
    // List of props that should never be passed to a DOM element
    const domPropBlacklist = [
      'fetchPriority',
      'fetchpriority',
      'loading',
      'lazyBoundary',
      'lazyRoot',
      'onLoadingComplete',
      'unoptimized',
      'priority', // Already handled as a separate prop
    ];

    const cleanDivProps: any = {};
    Object.keys(rest).forEach((key) => {
      if (!domPropBlacklist.includes(key)) {
        cleanDivProps[key] = (rest as any)[key];
      }
    });

    return { divProps: cleanDivProps };
  }, [rest]);

  // checking customSize value
  if (customSize?.match(CHECK_VALID_CUSTOM_SIZE)) {
    const checkedCustomSizeValue =
      customSize?.match(CHECK_VALID_CUSTOM_SIZE) ?? [];
    if (checkedCustomSizeValue[0] === '') {
      console.warn(
        'customSize prop value is not valid. Please set customSize prop like -> customSize="50px"',
      );
    }
  }

  if (src && !isError) {
    return (
      <div
        className={twMerge(
          cn(
            classes.base,
            classes.rounded[rounded],
            onClick && 'cursor-pointer',
            className,
          ),
        )}
        style={{
          width: customSize ?? classes.size[size],
          height: customSize ?? classes.size[size],
        }}
        onClick={onClick}
        {...divProps}
      >
        <img
          alt={name}
          src={src}
          className="h-full w-full object-cover"
          onError={() => setError(() => true)}
        />
      </div>
    );
  }
  return (
    <span
      title={name}
      className={twMerge(
        cn(
          classes.base,
          classes.fontSize[size],
          classes.rounded[rounded],
          'font-semibold',
          onClick && 'cursor-pointer',
          className,
        ),
      )}
      style={{
        width: customSize ?? classes.size[size],
        height: customSize ?? classes.size[size],
      }}
      onClick={onClick}
    >
      {initials || getInitials(name)}
    </span>
  );
};

export default Avatar;

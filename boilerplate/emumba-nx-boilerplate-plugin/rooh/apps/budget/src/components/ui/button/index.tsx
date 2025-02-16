import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  className?: string;
}

const MyButton: React.FC<Props> = ({ text, className, ...props }) => {
  return (
    <button
      style={{
        cursor: 'pointer',
        color: 'white',
        backgroundColor: '#007bff',
        borderRadius: '5px',
        border: 'none',
        padding: '10px 20px',
      }}
      className={className}
      {...props}
    >
      {text}
    </button>
  );
};

export default MyButton;

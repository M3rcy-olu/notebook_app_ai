import React from 'react';

/**
 * A simple slider component
 * @param {Object} props - Component props
 * @param {number} props.value - Current value
 * @param {function} props.onChange - Change handler
 * @param {number} [props.min=0] - Minimum value
 * @param {number} [props.max=100] - Maximum value
 * @param {number} [props.step=1] - Step value
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element} Slider component
 */
const Slider = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className = '',
  ...props
}) => {
  // Handle both array and single value
  const sliderValue = Array.isArray(value) ? value[0] : value;
  
  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    if (onValueChange) {
      onValueChange([newValue]);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={sliderValue}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        {...props}
      />
    </div>
  );
};

export default Slider;

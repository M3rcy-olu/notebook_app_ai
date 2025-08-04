import React, { useState, useRef, useEffect, useContext } from 'react';
import ReactDOM from 'react-dom';

const DropdownContext = React.createContext({});

export function DropdownMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const toggleDropdown = () => {
    console.log('toggleDropdown called, current isOpen:', isOpen); // Debug log
    setIsOpen(!isOpen);
  };
  const closeDropdown = () => {
    console.log('closeDropdown called'); // Debug log
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log('handleClickOutside called, target:', event.target); // Debug log
      
      // Check if the click is on a dropdown menu item (which should not close the dropdown)
      const isDropdownItem = event.target.closest('[role="menuitem"]');
      if (isDropdownItem) {
        console.log('Click is on dropdown item, not closing'); // Debug log
        return;
      }
      
      // Check if the click is within the dropdown content (portal)
      const dropdownContent = document.querySelector('[data-dropdown-content]');
      if (dropdownContent && dropdownContent.contains(event.target)) {
        console.log('Click is within dropdown content, not closing'); // Debug log
        return;
      }
      
      // Check if the click is within the original dropdown container
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        console.log('Click outside detected, closing dropdown'); // Debug log
        closeDropdown();
      }
    };

    if (isOpen) {
      console.log('Adding click outside listener'); // Debug log
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      console.log('Removing click outside listener'); // Debug log
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <DropdownContext.Provider value={{ isOpen, toggleDropdown, closeDropdown, triggerRef }}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { 
              isOpen, 
              toggleDropdown, 
              closeDropdown,
              ref: child.type === DropdownMenuTrigger ? triggerRef : null
            });
          }
          return child;
        })}
      </DropdownContext.Provider>
    </div>
  );
}

export const DropdownMenuTrigger = React.forwardRef(({ children, isOpen, toggleDropdown, ...props }, ref) => {
  // Check if the child is our Button component or any button element
  const child = React.Children.only(children);
  const isButtonChild = React.isValidElement(child) && (
    child.type === 'button' || 
    child.type?.displayName === 'Button' ||
    child.type?.name === 'Button'
  );
  
  if (isButtonChild) {
    // Filter out non-DOM props that shouldn't be passed to the button element
    const { closeDropdown, ...domProps } = props;
    
    // If child is a button, clone it and add our props
    return React.cloneElement(child, {
      ref,
      onClick: (e) => {
        console.log('DropdownMenuTrigger button clicked'); // Debug log
        e.preventDefault();
        e.stopPropagation();
        toggleDropdown?.();
        // Call the original onClick if it exists
        child.props.onClick?.(e);
      },
      'aria-expanded': isOpen,
      'aria-haspopup': 'true',
      ...domProps
    });
  }
  
  // Otherwise, render as a button
  return (
    <button
      ref={ref}
      onClick={(e) => {
        console.log('DropdownMenuTrigger regular button clicked'); // Debug log
        e.preventDefault();
        e.stopPropagation();
        toggleDropdown?.();
      }}
      className="focus:outline-none"
      aria-expanded={isOpen}
      aria-haspopup="true"
      {...props}
    >
      {children}
    </button>
  );
});

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

// Create a portal target div if it doesn't exist
const createPortalRoot = () => {
  const portalRoot = document.createElement('div');
  portalRoot.id = 'dropdown-portal-root';
  document.body.appendChild(portalRoot);
  return portalRoot;
};

// Get or create the portal root
let portalRoot = document.getElementById('dropdown-portal-root') || createPortalRoot();

export function DropdownMenuContent({ children, isOpen, className = '' }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  // Get the trigger element and closeDropdown from context
  const { triggerRef: contextTriggerRef, closeDropdown } = useContext(DropdownContext);
  
  // Update position when dropdown opens or trigger position changes
  useEffect(() => {
    if (!isOpen || !contextTriggerRef?.current) return;
    
    const updatePosition = () => {
      const triggerRect = contextTriggerRef.current.getBoundingClientRect();
      setPosition({
        top: triggerRect.bottom + window.scrollY,
        left: triggerRect.left + window.scrollX,
      });
    };
    
    updatePosition();
    
    // Update position on window resize/scroll
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, contextTriggerRef]);
  
  if (!isOpen) {
    console.log('DropdownMenuContent: not rendering, isOpen is false'); // Debug log
    return null;
  }
  
  console.log('DropdownMenuContent: rendering dropdown content'); // Debug log

  const content = (
    <div 
      ref={contentRef}
      data-dropdown-content
      className={`fixed z-[9999] mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => {
        console.log('DropdownMenuContent clicked'); // Debug log
        e.stopPropagation();
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -5px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
      <div className="py-1">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { closeDropdown });
          }
          return child;
        })}
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, portalRoot);
}

export function DropdownMenuItem({ children, onSelect, closeDropdown, className = '' }) {
  console.log('DropdownMenuItem rendered with onSelect:', !!onSelect, 'closeDropdown:', !!closeDropdown); // Debug log
  
  const handleClick = (e) => {
    console.log('DropdownMenuItem handleClick called'); // Debug log
    e.preventDefault();
    e.stopPropagation();
    console.log('DropdownMenuItem clicked, calling onSelect'); // Debug log
    onSelect?.(e);
    console.log('onSelect called, closing dropdown'); // Debug log
    closeDropdown?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors duration-150 ${className}`}
      role="menuitem"
    >
      {children}
    </button>
  );
}

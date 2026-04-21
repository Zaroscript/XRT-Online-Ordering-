import React from 'react'
import NavLinks from './NavLinks'
import { useCart } from '../../../context/CartContext';
import { formatPhone } from '../../../utils/phoneUtils';
const SubNav = (props) => {
  const { orderType, setOrderType, deliveryDetails, setShowDeliveryModal } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  
  const selectOrderType = (type) => {
    if (type === 'delivery') {
      setOrderType(type);
      setShowDeliveryModal(true);
      setIsDropdownOpen(false);
      return;
    }
    setOrderType(type);
    setIsDropdownOpen(false);
  };

  const currentOrderType = orderType === 'delivery' ? 'Delivery' : 'Pick up';

  return (
    <div className='header-container relative hidden lg:flex' style={{ backgroundColor: 'var(--color-secondary)' }}>
        <NavLinks className={'flex gap-[30px] py-[20px] '} style={{ color: 'var(--color-secondary-contrast)' }} />

        {/* Status Badge moved to Top_Navbar */}

        <div className="right_side flex items-center gap-4">

          {/* Order Type Dropdown */}
          <div className="relative group/type">
             <div 
              onClick={toggleDropdown}
              className="flex items-center gap-2 cursor-pointer bg-black/10 px-3 py-1.5 rounded-full hover:bg-black/20 transition-colors select-none"
            >
               <div className="w-[28px] h-[28px] rounded-full bg-white/10 flex items-center justify-center text-white" style={{ color: 'var(--color-secondary-contrast)' }}>
                  {orderType === 'delivery' ? (
                     <i className="fa-solid fa-truck text-xs"></i>
                  ) : (
                     <i className="fa-solid fa-bag-shopping text-xs"></i>
                  )}
               </div>
               <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-secondary-contrast)' }}>
                 {currentOrderType}
               </span>
               <i className={`fa-solid fa-chevron-down text-xs opacity-70 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--color-secondary-contrast)' }}></i>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 py-1">
                <button
                  onClick={() => selectOrderType('pickup')}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-(--primary)/5 transition-colors ${orderType !== 'delivery' ? 'bg-(--primary)/10' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-(--primary)/10 flex items-center justify-center text-(--primary)">
                     <i className="fa-solid fa-bag-shopping text-xs"></i>
                  </div>
                  <span className="text-gray-700 font-semibold text-sm">Pick up</span>
                  {orderType !== 'delivery' && <i className="fa-solid fa-check text-(--primary) ml-auto text-xs"></i>}
                </button>
                
                <button
                  onClick={() => selectOrderType('delivery')}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors ${orderType === 'delivery' ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                     <i className="fa-solid fa-truck text-xs"></i>
                  </div>
                  <span className="text-gray-700 font-semibold text-sm">Delivery</span>
                  {orderType === 'delivery' && <i className="fa-solid fa-check text-(--primary) ml-auto text-xs"></i>}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center group">
          <div className="rounded-full w-[35px] h-[35px] bg-white/20 flex items-center justify-center shadow-[0_4px_18px_rgba(0,0,0,0.04)] group-hover:cursor-pointer" style={{ color: 'var(--color-secondary-contrast)' }}>
            <i className="fa-solid fa-headset"></i>
          </div>
          <h5 className='pl-[5px] font-bold group-hover:cursor-pointer' style={{ color: 'var(--color-secondary-contrast)' }}>{formatPhone(props.phone)}</h5>
        </div>
        </div>
    </div>
  )
}

export default SubNav
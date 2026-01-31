import React from 'react'
import NavLinks from './NavLinks'
import { useCart } from '../../../context/CartContext';

const SubNav = (props) => {
  const { orderType, setOrderType, deliveryDetails, setShowDeliveryModal } = useCart();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const selectOrderType = (type) => {
    if (type === 'delivery' && !deliveryDetails) {
      setShowDeliveryModal(true);
      setIsOpen(false);
      return;
    }
    setOrderType(type);
    setIsOpen(false);
  };

  const currentOrderType = orderType === 'delivery' ? 'Delivery' : 'Pick up';

  return (
    <div className='header-container hidden lg:flex  bg-[#3D6642]'>
        <NavLinks className={'flex gap-[30px] bg-[#3D6642] py-[20px] '}/>


        <div className="right_side flex items-center gap-6">
          {/* Order Type Dropdown */}
          <div className="relative group/type">
            <div 
              onClick={toggleDropdown}
              className="flex items-center gap-2 cursor-pointer bg-[#315235] px-3 py-1.5 rounded-full hover:bg-[#28442b] transition-colors select-none"
            >
               <div className="w-[28px] h-[28px] rounded-full bg-[#D9E8DB]/20 flex items-center justify-center text-[#FFA900]">
                  {orderType === 'delivery' ? (
                     <i className="fa-solid fa-truck text-xs"></i>
                  ) : (
                     <i className="fa-solid fa-bag-shopping text-xs"></i>
                  )}
               </div>
               <span className="text-[#FFA900] text-sm font-bold uppercase tracking-wider">
                 {currentOrderType}
               </span>
               <i className={`fa-solid fa-chevron-down text-[#FFA900] text-xs opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 py-1">
                <button
                  onClick={() => selectOrderType('pickup')}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-green-50 transition-colors ${orderType !== 'delivery' ? 'bg-green-50/50' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[var(--primary)]">
                     <i className="fa-solid fa-bag-shopping text-xs text-[#3D6642]"></i>
                  </div>
                  <span className="text-gray-700 font-semibold text-sm">Pick up</span>
                  {orderType !== 'delivery' && <i className="fa-solid fa-check text-green-600 ml-auto text-xs"></i>}
                </button>
                
                <button
                  onClick={() => selectOrderType('delivery')}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors ${orderType === 'delivery' ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                     <i className="fa-solid fa-truck text-xs"></i>
                  </div>
                  <span className="text-gray-700 font-semibold text-sm">Delivery</span>
                  {orderType === 'delivery' && <i className="fa-solid fa-check text-green-600 ml-auto text-xs"></i>}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center group">
          <div className="rounded-full w-[35px] h-[35px] bg-[#D9E8DB] flex items-center justify-center shadow-[0_4px_18px_rgba(0,0,0,0.04)] group-hover:cursor-pointer">
            <i className="fa-duotone fa-regular fa-user-headset text-[#3D6642]"></i>
          </div>
          <h5 className='pl-[5px] text-[#FFA900] font-bold group-hover:cursor-pointer'>{props.phone}</h5>
        </div>
        </div>
    </div>
  )
}

export default SubNav
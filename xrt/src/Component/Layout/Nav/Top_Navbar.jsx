import { Phone, Mail } from 'lucide-react';
import '@/assets/style/header.css';
import { formatPhone } from '@/utils/phoneUtils';
import { useStoreStatus } from '@/hooks/useStoreStatus';

export default function Top_Navbar(props) {
  const { isOpen: storeIsOpen } = useStoreStatus();

  return (
    <>
      <div className='bg-header-bg/10 py-[8px] flex header-container relative nav'>
        <h6 className='text-header-text/60 lg:text-[14px] md:text-[12px] text-[9px]'>{props.address}</h6>

        {/* Center: Store Open/Closed Status Badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-header-bg/20 border border-header-text/10 select-none pointer-events-auto shadow-sm">
            <span className={`w-2 h-2 rounded-full ${storeIsOpen ? 'bg-(--primary) animate-pulse' : 'bg-red-500'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${storeIsOpen ? 'text-(--primary)' : 'text-red-700'}`}>
              {storeIsOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>

        <a href={`tel:${props.phone}`} className='block md:hidden'>
          <div className="right_side flex items-center cursor-pointer group">
            <div className=" mr-[8px]  mt-[4px] w-[28px] md:w-[32px] lg:w-[35px] h-[28px] md:h-[32px] lg:h-[35px] background_icon ">
              <Phone strokeWidth={3} className="text-(--primary)" size={16} />
            </div>
            <h5 className='text-header-text/60 font-normal lg:text-[14px] md:text-[12px] text-[9px] duration-500 group-hover:text-(--primary-hover)'>{formatPhone(props.phone)}</h5>
          </div>
        </a>
        <a href={`mailto:${props.email}`} className="hidden md:block">
          <div className="right_side flex items-center cursor-pointer group">
            <div className=" mr-[8px] mt-[4px] w-[28px] md:w-[32px] lg:w-[35px] h-[28px] md:h-[32px] lg:h-[35px] background_icon">
              <Mail strokeWidth={3} className="text-(--primary)" size={16} />
            </div>
            <h5 className='text-header-text/60 font-normal lg:text-[14px] md:text-[12px] text-[9px] duration-500 group-hover:text-(--primary-hover)'>{props.email}</h5>
          </div>
        </a>
      </div>
    </>
  );
}

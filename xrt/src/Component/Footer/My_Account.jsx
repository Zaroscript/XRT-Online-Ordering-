import { Link } from 'react-router-dom'
import { MY_ACCOUNT } from '../../config/constants'

export default function My_Account() {
  return (
    <>
        {MY_ACCOUNT.map((info, index) => (
            <li key={index} className="text-[#E1E1E1] py-[6px] text-[15px] transition-colors duration-200">
                <Link 
                  to={info.path} 
                  className="cursor-pointer block"
                  onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
                  onMouseLeave={(e) => e.target.style.color = ''}
                >
                  {info.name}
                </Link>
            </li>
        ))}
    </>
  )
}

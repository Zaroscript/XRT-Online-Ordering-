import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 64*16;

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(undefined);

    useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

    const onChange = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);

    // setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
}, []);

return !!isMobile;
}

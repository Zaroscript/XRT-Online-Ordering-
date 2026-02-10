import { useSiteSettingsQuery } from "../../api";

export default function LocationSection() {
  const { data: settings } = useSiteSettingsQuery();
  const contactDetails = settings?.contactDetails;
  
  const address = [
    contactDetails?.location?.street_address,
    contactDetails?.location?.city,
    contactDetails?.location?.state,
    contactDetails?.location?.zip, 
    contactDetails?.location?.country
  ].filter(Boolean).join(", ");

  const encodedAddress = encodeURIComponent(address || "Franklin, MA");

  return (
    <section className="py-16 bg-white transition-colors duration-300 ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
           
            className="text-3xl font-bold text-gray-900  sm:text-4xl"
          >
            Find Us on the <span className="text-secondary">Map</span>
          </h2>
          <p
            
            className="mt-4 text-lg text-gray-600  max-w-2xl mx-auto"
          >
            Visit our office or get in touch with our team for any inquiries.
          </p>
        </div>

        <div
          className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 "
         
        >
          <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-t-2xl overflow-hidden">
            <iframe
              src={`https://maps.google.com/maps?q=${encodedAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              aria-label={`Interactive map showing location in ${address}`}
              title={`Location - ${address}`}
              className="w-full h-full"
            />
            <noscript>
              <div className="flex items-center justify-center h-full bg-gray-100 ">
                <p className="text-gray-600 dark:text-gray-400 text-center px-4">
                  Interactive map requires JavaScript. Please enable JavaScript to view the map, or 
                  <a 
                    href={`https://maps.google.com?q=${encodedAddress}`}
                    className="text-secondary hover:underline ml-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    click here to open in Google Maps
                  </a>
                </p>
              </div>
            </noscript>
          </div>

          
        </div>
      </div>
    </section>
  );
}

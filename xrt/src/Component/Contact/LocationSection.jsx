export default function LocationSection() {
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d23668.88642766028!2d-71.43857895000001!3d42.0827645!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e4b5d3c4b3b3b3%3A0x123456789abcdef!2sFranklin%2C%20MA%2002038!5e0!3m2!1sen!2sus!4v1703123456789"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              aria-label="Interactive map showing XRT Tech Headquarters location in Franklin, MA 02038"
              title="XRT Tech Headquarters Location - Franklin, MA 02038"
              className="w-full h-full"
            />
            <noscript>
              <div className="flex items-center justify-center h-full bg-gray-100 ">
                <p className="text-gray-600 dark:text-gray-400 text-center px-4">
                  Interactive map requires JavaScript. Please enable JavaScript to view the map, or 
                  <a 
                    href="https://maps.google.com?q=Franklin+MA+02038" 
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

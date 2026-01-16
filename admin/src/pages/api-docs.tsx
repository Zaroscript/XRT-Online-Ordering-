
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import Head from "next/head";

// Dynamically import SwaggerUI to disable SSR (Client-side only)
const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center min-h-screen">Loading API Documentation...</div>
});

const ApiDocsPage = () => {
    return (
        <>
            <Head>
                <title>API Documentation - XRT Admin</title>
                <meta name="description" content="XRT System API Documentation" />
            </Head>
            <div className="bg-white min-h-screen">
                <SwaggerUI
                    url="/swagger.json"
                    docExpansion="none"
                    defaultModelsExpandDepth={-1} // Hide models by default for cleaner view
                />
            </div>
        </>
    );
};

export default ApiDocsPage;

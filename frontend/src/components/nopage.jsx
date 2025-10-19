import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import NoPage404 from "../assets/404-not.jpg";

const NoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Log the 404 for debugging
  useEffect(() => {
    console.warn(`404 Error: Route not found - ${location.pathname}`);
  }, [location.pathname]);

  const handleGoHome = () => {
    // Use React Router navigation instead of window.location
    navigate("/dashboard", { replace: true });
  };

  const handleGoBack = () => {
    // Go back to previous page
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-6 p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <img src={NoPage404} alt="404 Not Found" className="w-1/2 max-w-md h-auto" />
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold max-w-2xl bg-gradient-to-r from-black via-teal-600 to-gray-800 bg-clip-text text-transparent">
          Oops... Page Not Found! 🫣
        </h1>
        <p className="text-lg text-gray-600 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="text-sm text-gray-500 font-mono">
          Route: {location.pathname}
        </p>
      </div>
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={handleGoBack}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors shadow-lg"
        >
          ← Go Back
        </button>
        <button
          onClick={handleGoHome}
          className="bg-gradient-to-r from-blue-500 to-blue-900 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-3 rounded-lg transition-all shadow-lg hover:scale-105"
        >
          🏠 Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NoPage;

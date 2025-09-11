import NoPage404 from "../assets/404-not.jpg";
// import { Button } from "./ui/button";

const NoPage = () => {
  return (
    <div className="flex items-center justify-center flex-col gap-4">
      <img src={NoPage404} alt="404 Not Found" className="w-1/2 h-auto" />
      <h1 className="text-5xl md:text-7xl font-bold max-w-2xl bg-gradient-to-r from-black via-teal-600 to-gray-800 bg-clip-text text-transparent">
        Ooppss... Not Yet Implemented! 🫣
      </h1>
      <button
        variant="outline"
        className="bg-gradient-to-r from-blue-500 to-blue-900 hover:scale-105 shadow-2xl text-white  hover:text-white p-8"
        onClick={() => (window.location.href = "/dashboard")}
      >
        Go Back Home
      </button>
    </div>
  );
};

export default NoPage;

// @ts-nocheck
import Sidebar from "../../components/Sidebar/sidebar";

export default function Profile() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 p-6 bg-slate-100">
        <h1 className="text-3xl font-bold text-slate-800">Profile</h1>
        <p className="mt-4 text-slate-600">
          Welcome to your study profile page 🚀
        </p>
      </main>
    </div>
  );
}

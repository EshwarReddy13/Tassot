import { Link } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Project Management</h1>
      <Link
        to="/login"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Go to Login
      </Link>
    </div>
  );
}

export default App;
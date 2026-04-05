import { useAuth } from "../Context/AuthContext";
import NoteComparison from "../Components/NoteComparison.tsx";

const Home = () => {
  const { user } = useAuth();
  return (
    <div>
      {user ? (
        <div>
          <NoteComparison />
        </div>
      ) : (
        <div>Sign up</div>
      )}
    </div>
  );
};

export default Home;

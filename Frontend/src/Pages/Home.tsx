import { useAuth } from "../Context/AuthContext";
const Home = () => {
  const { user } = useAuth();
  return (
    <>
      <p className="flex flex-col items-center">
        "email":{user?.email},"name:"{user?.name},"id:" {user?.id}
      </p>
    </>
  );
};

export default Home;

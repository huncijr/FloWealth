import { useAuth } from "../Context/AuthContext";
const Home = () => {
  const { user } = useAuth();
  return (
    <div>
      <p className="flex flex-col items-center text-main-foreground">
        "email":{user?.email},"name:"{user?.name},"id:" {user?.id}
      </p>
      <div className="absolute right-0 top-0"></div>
    </div>
  );
};

export default Home;

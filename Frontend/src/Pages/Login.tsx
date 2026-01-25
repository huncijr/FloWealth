import { useState } from "react";
import { GoogleLoginButton } from "../Components/GoogleProvider";

const Login = () => {
  const [user, setUser] = useState<any>(null);

  return (
    <div className="">
      {user ? (
        <div className="flex flex-col py-5">
          <span>Welcome, {user.name} !</span>
          <span>Your email: {user.email}</span>
          <span>Your nickname: {user.given_name}</span>
          {user.message}
          <span></span>
          <span></span>
        </div>
      ) : (
        /* Pass the handler function as a prop to the button component */
        <GoogleLoginButton OnUserLoaded={setUser} />
      )}
    </div>
  );
};

export default Login;

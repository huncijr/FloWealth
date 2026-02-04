import { GoogleLogin } from "@react-oauth/google";
import { api } from "../../api/axiosInstance";
import { useAuth } from "../../Context/AuthContext";
import useDarkMode from "../Mode";

export const GoogleLoginButton = () => {
  const { isDark } = useDarkMode();
  const { setUser } = useAuth();
  const handleGoogleSuccess = async (credentialResponse: any) => {
    const tokenid = credentialResponse.credential;
    try {
      const response = await api.post("/Googleregister", {
        googletoken: tokenid,
      });
      console.log(response.data);
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {}
  };
  return (
    <>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.log("Google Login Failed!")}
        theme={isDark ? "filled_black" : ""}
        shape="pill"
        size="large"
        text="continue_with"
        useOneTap
      />
    </>
  );
};

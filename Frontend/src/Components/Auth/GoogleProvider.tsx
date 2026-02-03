import { GoogleLogin } from "@react-oauth/google";
import { api } from "../../api/axiosInstance";
import { useAuth } from "../../Context/AuthContext";

export const GoogleLoginButton = () => {
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
        useOneTap
      />
    </>
  );
};

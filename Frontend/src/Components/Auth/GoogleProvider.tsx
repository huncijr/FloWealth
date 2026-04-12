import { GoogleLogin } from "@react-oauth/google";
import { api } from "../../api/axiosInstance";
import { useAuth } from "../../Context/AuthContext";
import useDarkMode from "../Mode";

export const GoogleLoginButton = ({ isDisabled }: { isDisabled: boolean }) => {
  const { isDark } = useDarkMode();
  const { setUser } = useAuth();
  const handleGoogleSuccess = async (credentialResponse: any) => {
    const tokenid = credentialResponse.credential;
    try {
      const response = await api.post("/Googleregister", {
        googletoken: tokenid,
      });
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {}
  };
  if (isDisabled) {
    return (
      <div className="opacity-50 pointer-events-none">
        <GoogleLogin
          onSuccess={() => {}}
          onError={() => {}}
          theme={isDark ? "filled_black" : "outline"}
          shape="pill"
          size="large"
          text="continue_with"
          useOneTap
        />
      </div>
    );
  }
  return (
    <>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.log("Google Login Failed!")}
        theme={isDark ? "filled_black" : "outline"}
        shape="pill"
        size="large"
        text="continue_with"
        useOneTap
      />
    </>
  );
};

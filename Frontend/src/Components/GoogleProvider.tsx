import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { verifyGoogleToken } from "../api/VerifyUser";

export const GoogleLoginButton = ({
  // Callback function to send the tokenId back to the parent component
  OnUserLoaded,
}: {
  OnUserLoaded: (user: any) => void;
}) => {
  const handleSuccess = async (credentialsResponse: CredentialResponse) => {
    const token = credentialsResponse.credential;
    if (token) {
      try {
        const backendResponse = await verifyGoogleToken(token);
        // If Google authentication is successful, pass the token to the parent
        OnUserLoaded(backendResponse);
      } catch (error) {
        console.error(error);
      }
    }
  };
  return (
    <>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Google Login Failed!")}
      />
    </>
  );
};

import { GoogleLogin } from "@react-oauth/google";
export const GoogleLoginButton = ({
  onTokenReceived,
}: {
  onTokenReceived: (token: string) => void;
}) => {
  return (
    <>
      <GoogleLogin
        onSuccess={(res) => res.credential && onTokenReceived(res.credential)}
        onError={() => console.log("Google Login Failed!")}
      />
    </>
  );
};

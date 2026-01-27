import { useEffect, useState } from "react";
import { GoogleLoginButton } from "../Components/Auth/GoogleProvider";
import VerifySecurity from "../Components/Auth/CloudFlareProvider";
import {
  Button,
  Input,
  Label,
  InputOTP,
  REGEXP_ONLY_DIGITS,
} from "@heroui/react";
import { api } from "../api/axiosInstance";
const Login = () => {
  const [googletoken, setGoogleToken] = useState<String>("");
  const [cloudflaretoken, setCloudFlareToken] = useState<String>("");
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState<string>("");
  const [verification, setVerification] = useState<boolean>(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/register", {
        googletoken,
        cloudflaretoken,
        email,
      });
      console.log(response.data);
      setUser(response.data);

      if (!user.isGoogleUser) {
        setVerification(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    console.log(verification);
  }, [verification]);

  return (
    <div className="">
      {user ? (
        <div className="flex flex-col justify-center items-center min-h-screen">
          {verification ? (
            <div className="flex flex-col py-5">
              <span>Welcome, {user.name} !</span>
              <span>Your email: {user.email}</span>
              <span>Your nickname: {user.given_name}</span>
              {user.message}
              <span></span>
              <span></span>
            </div>
          ) : (
            <div>
              <Label> Verify account</Label>
              <p> We've sent the code to {user.email}</p>
              <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS}>
                <InputOTP.Group>
                  <InputOTP.Slot index={0} />
                  <InputOTP.Slot index={1} />
                  <InputOTP.Slot index={2} />
                  <InputOTP.Separator />
                  <InputOTP.Slot index={3} />
                  <InputOTP.Slot index={4} />
                  <InputOTP.Slot index={5} />
                </InputOTP.Group>
              </InputOTP>
              <p>Didn't received the code?</p>
              <span className="underline">Resend</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center py-10 gap-2">
          <form onSubmit={(e) => handleRegister(e)}>
            <GoogleLoginButton onTokenReceived={setGoogleToken} />
            <div className="flex flex-col gap-1 py-3">
              <Label>Email</Label>
              <Input
                placeholder="Enter Your Email..."
                type="email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <Label>Name</Label>
              <Input placeholder="Enter Your Name..." type="text" />
              <Label>Nickname</Label>
              <Input placeholder="Enter Your Nickname..." type="text" />
              <Label>Password</Label>
              <Input placeholder="Enter Your Password..." type="password" />
              <Label>Repeat password</Label>
              <Input placeholder="Repeat Your Password..." type="password" />
            </div>
            <VerifySecurity onTokenReceived={setCloudFlareToken} />
            <Button type="submit" isDisabled={!cloudflaretoken}>
              Submit
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Login;

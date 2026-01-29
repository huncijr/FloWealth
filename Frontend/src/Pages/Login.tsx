import { useEffect, useState } from "react";
import { GoogleLoginButton } from "../Components/Auth/GoogleProvider";
import VerifySecurity from "../Components/Auth/CloudFlareProvider";
import {
  Button,
  Input,
  Label,
  InputOTP,
  REGEXP_ONLY_DIGITS,
  Spinner,
} from "@heroui/react";
import { api } from "../api/axiosInstance";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
const Login = () => {
  const [googletoken, setGoogleToken] = useState<String>("");
  const [cloudflaretoken, setCloudFlareToken] = useState<String>("");
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmpassword, setConfirmPassword] = useState<string>("");

  const [verification, setVerification] = useState<boolean>(false);
  const [otpvalue, setOTPValue] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [issubmiting, setIsSubmiting] = useState<boolean>(false);
  const [showpassword, setShowPassword] = useState<boolean>(false);
  const [confirmshowpassword, setConfirmShowPassword] =
    useState<boolean>(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!googletoken) {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      if (!data.email || !data.password || !data.name) {
        console.log("nincs minden kitoltve");
        return;
      }
    }
    try {
      const response = await api.post("/register", {
        googletoken,
        cloudflaretoken,
        email,
        name,
        password,
      });
      console.log(response.data);
      const userData = response.data as Record<string, any>;
      console.log(userData);
      if (userData.success) {
        setUser(response.data);
        setError("Success");
      }

      //if user registered with Google
      if (userData.isGoogleUser) {
        setVerification(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    console.log(verification);
    console.log(otpvalue);
  }, [verification, otpvalue]);
  useEffect(() => {
    console.log(email);
  }, [email]);

  useEffect(() => {
    console.log(user);
  }, [user]);

  const handleOTPsubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmiting(true);
      setError("");
      const response = await api.post("/authenticate", { email, otpvalue });
      console.log(response.data);
      if (response.data.success) {
        setTimeout(() => {
          setUser(response.data);
          setError("Success");
          setVerification(true);
        }, 3000);
      } else {
        setError("Something happened, Please try again later!");
      }
    } catch (error) {
      setError("Invalid code. Please try again !");
    } finally {
      setIsSubmiting(false);
    }
  };

  //Resending OTP
  const LinkResend = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setIsSubmiting(true);
      setError("");
      const response = await api.post("/resendOTP", {
        name,
        email,
        password,
      });
      if (response.data.success) {
        setTimeout(() => {
          setUser(response.data);
          setError("Success");
          setVerification(true);
        }, 3000);
      }
    } catch (error) {
    } finally {
      setIsSubmiting(false);
    }
  };
  return (
    <div className="">
      {user ? (
        <div className="flex flex-col justify-center items-center min-h-screen">
          {verification ? (
            <div className="flex flex-col py-5">
              <span>Welcome, {user.name} !</span>
              <span>Your email: {user.email}</span>
              {user.message}
              <span></span>
              <span></span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <form onSubmit={(e) => handleOTPsubmit(e)}>
                <Label> Verify account</Label>
                <p> We've sent the code to {user.email}</p>
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={otpvalue}
                  onChange={(val) => {
                    setOTPValue(val);
                  }}
                >
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
                <span
                  className={`${error === "Success" ? "text-green-900" : "text-red-800"}`}
                  data-visible={!!error}
                >
                  {error}
                </span>
                <p>Didn't received the code?</p>
                <span
                  className="underline cursor-pointer"
                  onClick={(e) => {
                    LinkResend(e);
                    setOTPValue("");
                  }}
                >
                  Resend
                </span>
                <Button
                  isDisabled={otpvalue.length != 6}
                  isPending={issubmiting}
                  type="submit"
                >
                  {issubmiting ? (
                    <>
                      <Spinner color="current" />
                      Submiting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center py-10 gap-2">
          <form onSubmit={handleRegister}>
            <GoogleLoginButton onTokenReceived={setGoogleToken} />
            <div className="flex flex-col gap-1 py-3">
              <Label>Email</Label>
              <Input
                name="email"
                placeholder="Enter Your Email..."
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
              <Label>Name</Label>
              <Input
                placeholder="Enter Your Name..."
                type="text"
                name="name"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
              <Label>Password</Label>
              <div onClick={() => setShowPassword(!showpassword)}>
                {showpassword ? <LockKeyhole /> : <LockKeyholeOpen />}
              </div>
              <Input
                name="password"
                placeholder="Enter Your Password..."
                type={showpassword ? "password" : "text"}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <Label>Repeat password</Label>
              <div onClick={() => setConfirmShowPassword(!confirmshowpassword)}>
                {confirmshowpassword ? <LockKeyhole /> : <LockKeyholeOpen />}
              </div>
              <Input
                name="password"
                placeholder="Repeat Your Password..."
                type={confirmshowpassword ? "password" : "text"}
                value={confirmpassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
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

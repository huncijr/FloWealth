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
import { useAuth, type UserData } from "../Context/AuthContext";

const Login = () => {
  const [googletoken, setGoogleToken] = useState<String>("");
  const [cloudflaretoken, setCloudFlareToken] = useState<String>("");
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmpassword, setConfirmPassword] = useState<string>("");
  const [tempUser, setTempUser] = useState<UserData | null>(null);
  const [verification, setVerification] = useState<boolean>(false);
  const [otpvalue, setOTPValue] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [issubmiting, setIsSubmiting] = useState<boolean>(false);
  const [showpassword, setShowPassword] = useState<boolean>(false);
  const [confirmshowpassword, setConfirmShowPassword] =
    useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setVerification(true);
    }
  }, [user]);
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
      const userData = response.data as Record<string, any>;
      console.log(userData);
      if (userData.success) {
        //if user registered with Google
        if (userData.isGoogleUser) {
          setUser(userData.user);
          setVerification(true);
        } else {
          setTempUser(userData.message);
          setVerification(false);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    console.log(verification);
    console.log(tempUser);
  }, [verification, tempUser]);

  useEffect(() => {
    console.log(user);
  }, [user]);

  const handleOTPsubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmiting(true);
      setError("");
      const response = await api.post("/authenticate", { email, otpvalue });
      console.log(response.data.user);
      if (response.data.success) {
        setTimeout(() => {
          setUser(response.data.user);
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
        setUser(response.data.user);
        setError("Success");
        setVerification(true);
      }
    } catch (error) {
    } finally {
      setIsSubmiting(false);
    }
  };
  return (
    <div className="">
      {/* CASE 1: Full authentication complete (e.g., Google login or OTP verified) */}
      {user && verification ? (
        <div className="flex flex-col justify-center items-center min-h-screen">
          <div className="flex flex-col py-5">
            <span>Welcome, {user.name} !</span>
            <span>Your email: {user.email}</span>
            <span>Your ID: {user.id}</span>
          </div>
        </div>
      ) : /* CASE 2: Account created but needs email verification (OTP) */
      tempUser && !verification ? (
        <div className="flex flex-col justify-center items-center min-h-screen">
          <div className="flex flex-col gap-2">
            <form onSubmit={(e) => handleOTPsubmit(e)}>
              <Label> Verify account</Label>
              <p> We've sent the code to {tempUser.email}</p>
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                value={otpvalue}
                onChange={(val) => setOTPValue(val)}
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
              <p>Didn't receive the code?</p>
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
                isDisabled={otpvalue.length !== 6}
                isPending={issubmiting}
                type="submit"
              >
                {issubmiting ? (
                  <>
                    <Spinner color="current" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </div>
        </div>
      ) : (
        /* CASE 3: Initial state - Registration form */
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
              <div
                className="cursor-pointer"
                onClick={() => setShowPassword(!showpassword)}
              >
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
              <div
                className="cursor-pointer"
                onClick={() => setConfirmShowPassword(!confirmshowpassword)}
              >
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

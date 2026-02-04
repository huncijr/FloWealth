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
  Switch,
  FieldError,
  TextField,
  Alert,
} from "@heroui/react";
import { api } from "../api/axiosInstance";
import {
  LockKeyhole,
  LockKeyholeOpen,
  UserRoundPlus,
  UserRoundSearch,
  User,
  Mail,
} from "lucide-react";
import {
  CheckPassword,
  CheckConfirmPassword,
  ValidateName,
} from "../Components/FormChecker";
import { useAuth, type UserData } from "../Context/AuthContext";
import CustomCarousel from "../Components/CustomCarousel";

const Login = () => {
  const [googletoken] = useState<String>("");
  const [registertoken, SetRegisterToken] = useState<String>("");
  const [logintoken, SetLoginToken] = useState<String>("");

  const { user, setUser } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [loginemail, setLoginEmail] = useState<string>("");
  const [loginpassword, setLoginPassword] = useState<string>("");
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
  const [isswitch, setIsSwitch] = useState<boolean>(false);
  useEffect(() => {
    if (user) {
      setVerification(true);
    }
  }, [user]);
  const [logintoast, setLoginToast] = useState<boolean>(false);

  const togglelogin = {
    off: UserRoundPlus,
    on: UserRoundSearch,
    selectedControlClass: "bg-primary",
  };
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("I got called");
    e.preventDefault();
    if (!googletoken) {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      if (!data.email || !data.password || !data.name) {
        console.log("Not all user input form registered!");
        return;
      }
    }
    try {
      const response = await api.post("/register", {
        googletoken,
        cloudflaretoken: registertoken,
        email,
        name,
        password,
      });
      const userData = response.data as Record<string, any>;
      console.log(userData);
      if (userData.success) {
        //if user registered with Google
        setTempUser(userData.message);
        setVerification(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await api.post("/login", {
        email: loginemail,
        password: loginpassword,
        cloudflaretoken: logintoken,
      });
      const userData = response.data;
      console.log(userData);
      if (userData.success) {
        setUser(userData.user);
      }
    } catch (error) {
      setLoginToast(true);
      setTimeout(() => {
        setLoginToast(false);
      }, 2000);
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
    <div className="min-h-screen">
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
        <div
          className="mt-25 w-full sm:w-[80%] md:w-[75%] lg:w-[80%] mx-auto overflow-hidden min-h-[700px] border-2 
                        rounded-lg relative flex flex-col md:flex-row"
        >
          <div
            className="h-[200px] md:h-auto md:flex-[0.4] flex items-center 
            justify-center bg-gray-700 border-b-2 md:border-b-0 md:border-r-2 border-secondary overflow-hidden"
          >
            <CustomCarousel />
          </div>
          <div className=" p-4 flex justify-end md:absolute md:top-3 md:right-4 md:mb-0">
            <Switch
              defaultSelected
              size="lg"
              isSelected={isswitch}
              onChange={() => setIsSwitch(!isswitch)}
            >
              {({ isSelected }) => {
                const IconOn = togglelogin.on;
                const IconOff = togglelogin.off;
                return (
                  <>
                    <Switch.Control
                      className={
                        isSelected ? togglelogin.selectedControlClass : ""
                      }
                    >
                      <Switch.Thumb>
                        <Switch.Icon>
                          {isSelected ? (
                            <IconOn className="size-3 text-inherit opacity-100" />
                          ) : (
                            <IconOff className="size-3 text-inherit opacity-70" />
                          )}
                        </Switch.Icon>
                      </Switch.Thumb>
                    </Switch.Control>
                  </>
                );
              }}
            </Switch>
          </div>
          <div className="flex flex-1 md:flex-[.6]  flex-col gap-5 items-center p-6 md:p-10 sm:mt-5  ">
            <h2 className="Nanum-Gothic tracking-widest text-3xl md:text-4xl transition-all lg:text-5xl font-bold border-x-2 px-5 border-secondary text-center">
              {isswitch ? "WELCOME BACK!" : "REGISTER"}
            </h2>
            <div className="w-full max-w-[300px] md:max-w-[400px] lg:max-w-[500px]">
              <div className="flex justify-center">
                <GoogleLoginButton />
              </div>
              <div className="flex items-center w-full my-2">
                <div className="flex items-center w-full my-2">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-4 text-sm text-gray-500 font-medium tracking-wider">
                    or
                  </span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>
              </div>

              {isswitch ? (
                <div className="w-full">
                  {" "}
                  <form onSubmit={handleLogin}>
                    <div className="flex flex-col justify-center gap-2">
                      <Label>Email</Label>
                      <Input
                        name="email"
                        placeholder="Enter Your Email"
                        value={loginemail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                      <Label>Password</Label>
                      <div className="flex items-center  w-full gap-2">
                        <div
                          className="cursor-pointer "
                          onClick={() => setShowPassword(!showpassword)}
                        >
                          {showpassword ? <LockKeyhole /> : <LockKeyholeOpen />}
                        </div>
                        <div className="flex-1">
                          <Input
                            name="password"
                            placeholder="Enter Your Password"
                            value={loginpassword}
                            type={showpassword ? "password" : "text"}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="flex justify-center py-3">
                        <VerifySecurity onTokenReceived={SetLoginToken} />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" isDisabled={!registertoken}>
                          Submit
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <form onSubmit={handleRegister}>
                    <div className="flex flex-col gap-1 py-3">
                      <TextField
                        isRequired
                        name="email"
                        type="email"
                        validate={(value) => {
                          if (
                            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
                              value,
                            )
                          ) {
                            return "Please enter a valid email adress!";
                          }
                          return undefined;
                        }}
                      >
                        <Label>Email</Label>
                        <div className="flex items-center w-full gap-2">
                          <Mail />
                          <div className="flex-1">
                            <Input
                              name="email"
                              placeholder="Enter Your Email..."
                              type="email"
                              onChange={(e) => setEmail(e.target.value)}
                              value={email}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <FieldError className="text-danger text-sm" />
                      </TextField>
                      <TextField
                        isRequired
                        type="text"
                        name="name"
                        validate={(value) => ValidateName(value)}
                      >
                        <Label>Name</Label>
                        <div className="flex items-center w-full gap-2">
                          <User />
                          <div className="flex-1 ">
                            <Input
                              placeholder="Enter Your Name..."
                              type="text"
                              name="name"
                              onChange={(e) => setName(e.target.value)}
                              value={name}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <FieldError className="text-danger text-sm" />
                      </TextField>
                      <TextField
                        isRequired
                        name="password"
                        type="password"
                        validate={(value) => CheckPassword(value)}
                      >
                        <Label>Password</Label>
                        <div className="flex items-center w-full gap-2">
                          <div
                            className="cursor-pointer"
                            onClick={() => setShowPassword(!showpassword)}
                          >
                            {showpassword ? (
                              <LockKeyhole />
                            ) : (
                              <LockKeyholeOpen />
                            )}
                          </div>
                          <div className="flex-1">
                            <Input
                              name="password"
                              placeholder="Enter Your Password..."
                              type={showpassword ? "password" : "text"}
                              onChange={(e) => setPassword(e.target.value)}
                              value={password}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div className="absolute -right-3 cursor-pointer z-10"></div>
                        <FieldError className="text-danger text-sm" />
                      </TextField>

                      <TextField
                        isRequired
                        name="password"
                        type="password"
                        validate={(value) =>
                          CheckConfirmPassword(password, value)
                        }
                      >
                        <Label>Repeat password</Label>
                        <div className="flex items-center w-full gap-2">
                          <div
                            className="cursor-pointer"
                            onClick={() =>
                              setConfirmShowPassword(!confirmshowpassword)
                            }
                          >
                            {confirmshowpassword ? (
                              <LockKeyhole />
                            ) : (
                              <LockKeyholeOpen />
                            )}
                          </div>
                          <div className="flex-1">
                            <Input
                              name="password"
                              placeholder="Repeat Your Password..."
                              type={confirmshowpassword ? "password" : "text"}
                              value={confirmpassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              className="w-full"
                            />
                          </div>
                        </div>
                        <FieldError className="text-danger text-sm" />
                      </TextField>
                      <div className="flex justify-center py-3">
                        <VerifySecurity onTokenReceived={SetRegisterToken} />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" isDisabled={!registertoken}>
                          Submit
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {logintoast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 ">
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Username or password is not correct</Alert.Title>
            </Alert.Content>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default Login;

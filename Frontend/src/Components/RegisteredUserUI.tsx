import { Avatar, Button, Card, Modal, Tabs } from "@heroui/react";
import { useAuth } from "../Context/AuthContext";
import { api } from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import {
  Bug,
  CircleUserRound,
  Github,
  HelpCircle,
  Link,
  LogOut,
  Mail,
  RefreshCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ShowTutorial from "./ShowTutorial";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);

    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

const RegisteredUser = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [showtutorial, setShowTutorial] = useState(false);

  const [tokens, setTokens] = useState<{
    tokensUsed: number;
    maxTokens: number;
  } | null>(null);

  const [ismodal, setIsModal] = useState<boolean>(false);
  const [spinning, setSpinnig] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const email =
    "mailto:flowealthwebapp@gmail.com?subject=Bug Report - FloWealth";

  const isSmUp = useMediaQuery("(min-width: 640px)");

  const getInitial = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toLocaleUpperCase();
    }
    return name.slice(0, 2).toLocaleUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await api.post("/signout");
      setUser(null);
      navigate("/home", { replace: true });
    } catch (error) {}
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete("/deleteUser");
      setUser(null);
      navigate("/home", { replace: true });
    } catch (error) {}
  };

  const handleGetTokenUsage = async () => {
    if (isDisabled) return;
    setSpinnig(true);
    setIsDisabled(true);
    try {
      const response = await api.get("/getaitokens", {
        headers: { "Cache-control": "no-cache" },
        params: { t: Date.now() },
      });
      if (response.data.success) {
        setTokens(response.data.data);
      }
    } catch (error) {
    } finally {
      setSpinnig(false);
    }
  };

  useEffect(() => {
    if (isDisabled) {
      setTimeout(() => {
        setIsDisabled(false);
      }, 5000);
    }
  }, [isDisabled]);
  useEffect(() => {
    handleGetTokenUsage();
  }, []);
  const percentage = useMemo(() => {
    return tokens ? (tokens.tokensUsed / tokens.maxTokens) * 100 : 0;
  }, [tokens]);

  return (
    <div className="p-10 sm:p-20">
      <div className=" flex flex-col registeredui-slidefade registeredui-slidefade-stagger">
        <div className="flex items-center gap-4">
          <Avatar>
            {user?.picture ? (
              <Avatar.Image src={user.picture} alt="Profile" />
            ) : (
              <Avatar.Fallback className="bg-secondary text-white font-bold">
                {getInitial(user?.name || "U")}
              </Avatar.Fallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <h2 className="text-4xl font-bold tracking-wider Abril-Fatface">
              {user?.name}
            </h2>
            <p className="text-sm opacity-75">{user?.email}</p>
          </div>
        </div>
        <div className="w-full h-[2px] bg-linear-to-r from-transparent via-secondary to-transparent mt-4"></div>

        <div className="mt-10 pr-4">
          <Tabs
            orientation={isSmUp ? "vertical" : "horizontal"}
            variant="secondary"
          >
            <Tabs.ListContainer
              className={`p-3 rounded-xl px-2 ${isSmUp ? "overflow-x-hidden" : "overflow-x-auto "}`}
            >
              <Tabs.List
                aria-label="Vertical tabs"
                className="p-3 rounded-xl px-2 overflow-x-hidden"
              >
                <Tabs.Tab
                  id="account"
                  className=" justify-between sm:justify-start flex flex-1 sm:px-4 py-6 sm:py-3 rounded-lg mb-3
                   bg-content1 hover:bg-secondary/30 bg-gray-300 dark:bg-gray-900 
                   data-[selected=true]:bg-secondary data-[selected=true]:text-white text-sm"
                >
                  Account
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab
                  id="tokens"
                  className=" justify-between sm:justify-start flex flex-1 sm:px-4 py-6 sm:py-3  rounded-lg mb-3
                   bg-content1 hover:bg-secondary/30 bg-gray-300 dark:bg-gray-900 
                   data-[selected=true]:bg-secondary data-[selected=true]:text-white"
                >
                  Token Usage
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab
                  id="feedback"
                  className=" justify-between sm:justify-start flex flex-1 sm:px-4 py-6  sm:py-3 rounded-lg mb-3
                   bg-content1 hover:bg-secondary/30 bg-gray-300 dark:bg-gray-900 
                   data-[selected=true]:bg-secondary data-[selected=true]:text-white"
                >
                  Feedback
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
            <Tabs.Panel id="account" className="min-w-0 overflow-hidden">
              <div className="flex flex-col items-center gap-4">
                {/* Avatar - nagyobb, szebb */}
                <Avatar
                  size="lg"
                  className="w-28 h-28 ring-2 ring-secondary/50"
                >
                  {user?.picture ? (
                    <Avatar.Image src={user.picture} />
                  ) : (
                    <Avatar.Fallback className="bg-secondary text-white font-bold text-2xl">
                      {getInitial(user?.name || "U")}
                    </Avatar.Fallback>
                  )}
                </Avatar>

                {/* User Info */}
                <div className="flex flex-col items-center">
                  <h2 className="text-2xl font-bold Abril-Fatface">
                    {user?.name}
                  </h2>
                  <p className="text-sm opacity-70">{user?.email}</p>

                  {/* Badge */}
                  <div
                    className={`flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-xs
        ${user?.isGoogleUser ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                  >
                    {user?.isGoogleUser ? (
                      <CircleUserRound size={14} />
                    ) : (
                      <Mail size={14} />
                    )}
                    {user?.isGoogleUser ? "Google Account" : "Email Account"}
                  </div>
                </div>
                <Button
                  variant="tertiary"
                  onClick={() => setShowTutorial(true)}
                  className="flex w-full max-w-[200px] "
                >
                  Get started guide <HelpCircle />
                </Button>

                <div className="relative w-full py-5">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-secondary/70 to-transparent" />
                  <div className="mt-1 h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 rotate-45 bg-primary shadow-[0_0_18px_rgba(206,150,19,0.7)]" />
                  </div>
                </div>
                {/* Sign Out Button */}
                <div className="flex flex-col items-center sm:flex-row gap-2 ">
                  <Button
                    variant="primary"
                    onClick={handleSignOut}
                    className=" justify-start"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut />
                      <span className="font-medium">Sign Out from Account</span>
                    </div>
                  </Button>

                  {/* Delete Account Button */}
                  <Button
                    variant="danger"
                    onClick={() => setIsModal(true)}
                    className=" justify-start"
                  >
                    <div className="flex items-center gap-2">
                      <Trash2 />
                      <span className="font-medium">Delete Account</span>
                    </div>
                  </Button>
                </div>
              </div>
            </Tabs.Panel>

            <Tabs.Panel id="tokens">
              <div className="flex flex-col items-center gap-4">
                {/* Header with Sparkles */}
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    FloWealth AI Tokens
                  </h3>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md bg-gray-100 dark:bg-gray-900 p-4 rounded-lg ">
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="font-bold">Used</span>
                    <span className="text-primary font-bold">
                      {tokens?.tokensUsed?.toLocaleString() ?? 0} /{" "}
                      {tokens?.maxTokens?.toLocaleString() ?? 15000}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-center text-sm mt-2 opacity-70">
                    {percentage.toFixed(1)}% used
                  </p>
                </div>

                {/* Info Sidebar */}
                <div className="mt-6 w-full max-w-md bg-content2 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-sm">
                    <motion.div
                      animate={spinning ? { rotate: 360 } : { rotate: 0 }}
                      transition={{ duration: 0.5 }}
                      className={`cursor-pointer  ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={handleGetTokenUsage}
                      style={{ pointerEvents: isDisabled ? "none" : "auto" }}
                    >
                      <RefreshCcw className="w-4 h-4 text-secondary" />
                    </motion.div>
                    <span className="font-medium">Resets:</span>
                    <span className="opacity-70">Tomorrow at midnight</span>
                  </div>
                </div>
              </div>
            </Tabs.Panel>
            <Tabs.Panel
              id="feedback"
              className="p-4 sm:p-6 w-full min-w-0 overflow-x-hidden"
            >
              <div className="overflow-x-auto snap-x snap-mandatory">
                <div className="flex mb-5 justify-center items-center gap-2 ">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-bold">Contact Us</h3>
                </div>
                <div
                  className="min-w-0 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch w-full
              "
                >
                  {/* Bug Report Card */}
                  <Card className="w-full border border-divider">
                    <Card.Header
                      className=" grid grid-cols-[auto,1fr]  sm:grid-cols-[auto,1fr,auto]  items-center  gap-4  p-4  w-full
                  "
                    >
                      <div className="p-3 bg-danger-100 rounded-full">
                        <Bug className="w-6 h-6 text-danger" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold">Bug Report</p>
                        <p className="text-sm text-default-500 break-words">
                          Found a bug? Help us fix it!
                        </p>
                      </div>

                      <Button
                        className="w-full sm:w-auto sm:justify-self-end"
                        variant="primary"
                        size="sm"
                        onPress={() =>
                          window.open(
                            "https://github.com/huncijr/FloWealth/issues",
                            "_blank",
                          )
                        }
                      >
                        Report
                      </Button>
                    </Card.Header>
                  </Card>

                  {/* GitHub Card */}
                  <Card
                    className="w-full border border-divider cursor-pointer"
                    onClick={() =>
                      window.open(
                        "https://github.com/huncijr/FloWealth",
                        "_blank",
                      )
                    }
                  >
                    <Card.Header
                      className="grid grid-cols-[auto,1fr] sm:grid-cols-[auto,1fr,auto] items-center  gap-4   p-4 w-full
                  "
                    >
                      <div className="p-3 bg-success-100 rounded-full">
                        <Github className="w-6 h-6 text-success" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold">Contribute</p>
                        <p className="text-sm break-words">
                          github.com/huncijr
                        </p>
                      </div>

                      <Link
                        className="w-full sm:w-auto sm:justify-self-end"
                        href="https://github.com/huncijr"
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View
                      </Link>
                    </Card.Header>
                  </Card>

                  {/* Email Card */}
                  <Card className="w-full border border-divider">
                    <Card.Header
                      className="grid grid-cols-[auto,1fr] sm:grid-cols-[auto,1fr,auto] items-center gap-4 p-4 w-full
                  "
                    >
                      <div className="p-3 bg-primary-100 rounded-full">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold">
                          Have an Issue or an Idea ?
                        </p>
                        <p className="text-sm break-words">Contact us!</p>
                        <p className="text-sm opacity-50 break-words">
                          flowealthwebapp@gmail.com
                        </p>
                      </div>

                      <Button
                        className="w-full sm:w-auto sm:justify-self-end"
                        variant="primary"
                        size="sm"
                        onPress={() => window.open(email)}
                      >
                        Send
                      </Button>
                    </Card.Header>
                  </Card>
                </div>
              </div>
            </Tabs.Panel>
          </Tabs>
        </div>
        {ismodal && (
          <Modal isOpen={ismodal} onOpenChange={(open) => setIsModal(open)}>
            <Modal.Backdrop className="" variant="blur">
              <Modal.Container>
                <Modal.Dialog className="">
                  <Modal.Header className="items-center text-center">
                    <Modal.Icon className="rounded-full bg-red-700">
                      <Trash2 />
                    </Modal.Icon>
                    <Modal.Heading>
                      Are you sure you want to delete your account ?
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body className="text-center">
                    <p>
                      This action will delete all of the themes&notes and the
                      action is irreversible. Be aware of that!
                    </p>
                  </Modal.Body>
                  <Modal.Footer className="flex flex-col">
                    <Button variant="danger" onClick={handleDeleteAccount}>
                      Delete My Account !
                    </Button>
                    <Button variant="ghost" onClick={() => setIsModal(false)}>
                      Close
                    </Button>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
        )}
      </div>
      <ShowTutorial
        isopen={showtutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
};

export default RegisteredUser;

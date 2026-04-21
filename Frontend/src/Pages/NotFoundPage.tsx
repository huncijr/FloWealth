import { Button, Card, CardHeader } from "@heroui/react";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";
const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center"
      >
        <Card className="min-w-md sm:min-w-2xl">
          <CardHeader className="flex flex-col items-center ">
            <div className="relative mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="relative p-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full border border-primary/30"
              >
                <SearchX className="w-20 h-20 " />
              </motion.div>
            </div>
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-6xl Nanum-Gothic  font-black Artifika text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary drop-shadow-[0_0_40px_rgba(206,150,19,0.6)]"
            >
              404
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl Oswald tracking-wide mt-4 mb-8 text-gray-600 dark:text-gray-300"
            >
              Oops! Page not found
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                className="relative overflow-hidden bg-linear-to-r text-black dark:text-white from-primary via-secondary to-primary/90 backdrop-blur-md transition-all duration-300 
            hover:from-primary/90 hover:via-secondary/90 hover:to-secondary/80 hover:shadow-[0_0_25px_rgba(206,150,19,0.4) hover:scale-[1.1]"
                onClick={() => navigate("/Home")}
              >
                Take me home
              </Button>
            </motion.div>
          </CardHeader>
        </Card>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;

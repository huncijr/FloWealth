import { useAuth } from "../Context/AuthContext";
import NoteComparison from "../Components/NoteComparison.tsx";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import useDarkMode from "../Components/Mode.tsx";

const Home = () => {
  const { user } = useAuth();
  const { isDark } = useDarkMode();
  ("Our AI instantly scans your receipts and extracts key information.");
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  if (user) {
    return <NoteComparison />;
  }

  const text1 =
    "Our AI instantly scans your receipts and extracts key information. No more manual entry - just snap a photo and let FloWealth do therest. Track prices, compare stores, and never miss a detail.";
  const text2 =
    "Side-by-side comparison of your spending notes. See which store offers better prices, track estimation accuracy, and make smarter shopping decisions based on real data.";

  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);

  return (
    <div className={isDark ? "dark" : ""}>
      {/* HERO SECTION */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
        {/* Floating shapes - glow entrance animation */}

        {/* Floating shapes - SM alatt: sarokba | SM felett: szétszórva */}
        <div className="absolute pointer-events-none top-0 left-0 w-[200px] h-[500px] md:top-[-100px] md:left-[-50px] md:w-[500px] md:h-[500px] rounded-full bg-primary/40 md:bg-primary/50 blur-[60px] md:blur-[100px] animate-glow-enter" />

        <div className="absolute pointer-events-none top-0 right-0 w-[250px] h-[250px] md:top-[15%] md:right-[-80px] md:w-[400px] md:h-[400px] rounded-full bg-secondary/40 md:bg-secondary/50 blur-[50px] md:blur-[80px] animate-glow-enter-delayed" />

        <div className="absolute pointer-events-none bottom-0 left-0 w-[250px] h-[250px] md:top-[40%] md:left-[5%] md:w-[250px] md:h-[250px] rounded-full bg-primary/30 md:bg-primary/30 blur-[50px] md:blur-[60px] animate-glow-enter" />

        <div className="absolute pointer-events-none bottom-0 right-0 w-[350px] h-[400px] md:bottom-[30%] md:right-[10%] md:w-[350px] md:h-[350px] rounded-full bg-secondary/30 md:bg-secondary/40 blur-[60px] md:blur-[90px] animate-glow-enter-delayed" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative text-center"
        >
          <div className="relative inline-block ">
            <div className="absolute inset-3 pt-12 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 border-2 border-gray-900/10 dark:border-gray-200/10 bubble-ring"></div>
              <div className="w-16 h-16 border-2 border-gray-900/10 dark:border-gray-200/10 bubble-ring"></div>
              <div className="w-16 h-16 border-2 border-gray-900/10 dark:border-gray-200/10 bubble-ring"></div>
              <div className="w-16 h-16 border-2 border-gray-900/10 dark:border-gray-200/10 bubble-ring"></div>
            </div>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-7xl font-black mb-6 
              bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent 
              drop-shadow-[0_0_40px_rgba(206,150,19,0.6)]"
          >
            FloWealth
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl  max-w-xl mx-auto mb-8"
          >
            Track your expenses effortlessly with AI-powered receipt scanning.
            Get instant insights and compare your spending habits.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-4 justify-center"
          >
            <div className="flex gap-4">
              <Link to="/Account">
                <button className="cursor-pointer px-8 py-3 bg-linear-to-r from-primary to-secondary text-white font-bold rounded-xl hover:scale-105 transition-transform">
                  Get Started
                </button>
              </Link>
              <button
                onClick={scrollToFeatures}
                className="cursor-pointer px-8 py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/10 transition-colors"
              >
                Learn More
              </button>
            </div>
            <ArrowDown className="w-10 h-10 " />
          </motion.div>
        </motion.div>
      </section>

      {/* DECORATIVE SEPARATOR 1 */}
      <div className="divider-decoration">
        <div className="divider-line-left" />
        <div className="divider-icon">
          <Plus className="w-4 h-4 text-primary" />
        </div>
        <div className="divider-line-right" />
      </div>

      {/* FEATURE SECTION 1 - Video left, Text right */}
      <section id="features" className="py-20 relative ">
        {/* Floating shapes - glow entrance animation */}
        <div className="absolute pointer-events-none top-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/30 blur-[100px] animate-glow-enter" />
        <div className="absolute pointer-events-none top-[20%] right-[5%] w-[300px] h-[300px] rounded-full bg-secondary/30 blur-[80px] animate-glow-enter-delayed" />
        <div className="absolute pointer-events-none bottom-[20%] left-[10%] w-[150px] h-[150px] rounded-full bg-primary/25 blur-[70px] animate-glow-enter" />
        <div className="absolute pointer-events-none top-[50%] right-[25%] w-[180px] h-[180px] rounded-full bg-secondary/20 blur-[50px] animate-glow-enter-delayed" />
        <div className="absolute pointer-events-none bottom-0 right-[15%] w-[200px] h-[200px] rounded-full bg-primary/30 blur-[60px] animate-glow-enter" />

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto px-4 relative "
        >
          {/* Video */}
          <div className="relative rounded-2xl  shadow-2xl">
            <div className="absolute -inset-[2px] bg-gradient-to-br from-primary to-secondary rounded-2xl" />
            <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
              <video autoPlay muted loop playsInline className="w-full">
                <source src="/demo-scan.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-black ">Real-time AI Analysis</h2>
            </div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-wrap gap-x-2 "
            >
              {words1.map((word, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: i * 0.05,
                        duration: 0.3,
                      },
                    },
                  }}
                  className="text-lg leading-relaxed"
                >
                  {word}{" "}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* DECORATIVE SEPARATOR 2 - Pulse rings with floating shapes */}
      <div className="separator-wrapper py-10">
        <div className="separator-line" />
        <div className="separator-ring" />
        <div className="separator-ring" />
        <div className="separator-ring" />
        <div className="separator-diamond" />
        <div className="absolute pointer-events-none top-[40%] right-[20%] w-[500px] h-[500px] rounded-full bg-secondary/20 blur-[30px] animate-float-delayed" />
      </div>

      {/* FEATURE SECTION 2 - Text left, Video right */}
      <section className="py-20 relative overflow-hidden">
        {/* Floating shapes - glow entrance animation */}
        <div className="absolute pointer-events-none top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-secondary/35 blur-[90px] animate-glow-enter" />
        <div className="absolute pointer-events-none bottom-[25%] left-[5%] w-[280px] h-[280px] rounded-full bg-primary/30 blur-[80px] animate-glow-enter-delayed" />
        <div className="absolute pointer-events-none top-[40%] left-[30%] w-[200px] h-[200px] rounded-full bg-secondary/25 blur-[60px] animate-glow-enter" />
        <div className="absolute pointer-events-none bottom-0 right-[30%] w-[180px] h-[180px] rounded-full bg-primary/20 blur-[50px] animate-glow-enter-delayed" />
        <div className="absolute pointer-events-none top-[60%] right-[40%] w-[160px] h-[160px] rounded-full bg-secondary/30 blur-[70px] animate-glow-enter" />

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto px-4 relative "
        >
          {/* Text */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-secondary" />
              <h2 className="text-3xl font-black ">Compare Notes</h2>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-wrap gap-x-2 "
            >
              {words2.map((word2, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: i * 0.05,
                        duration: 0.3,
                      },
                    },
                  }}
                  className="text-lg leading-relaxed"
                >
                  {word2}{" "}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Video */}
          <div className="relative rounded-2xl  shadow-2xl">
            <div className="absolute -inset-[2px] bg-gradient-to-br from-primary to-secondary rounded-2xl" />
            <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
              <video autoPlay muted loop playsInline className="w-full">
                <source src="/demo-compare.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </motion.div>
      </section>

      {/* DECORATIVE SEPARATOR 3 - Wave with dots */}
      <div className="separator-wrapper py-10">
        <div className="separator-line" />
        <div className="separator-dot" style={{ top: "30%", left: "15%" }} />
        <div className="separator-dot" style={{ top: "50%", left: "35%" }} />
        <div className="separator-dot" style={{ top: "40%", left: "50%" }} />
        <div className="separator-dot" style={{ top: "60%", left: "65%" }} />
        <div className="separator-dot" style={{ top: "30%", right: "15%" }} />
        <div className="absolute pointer-events-none top-[10%] left-[25%] w-[120px] h-[120px] rounded-full bg-primary/15 blur-[50px] animate-glow-soft" />
        <div className="absolute pointer-events-none bottom-[20%] right-[25%] w-[100px] h-[100px] rounded-full bg-secondary/15 blur-[40px] animate-glow" />
      </div>

      {/* CTA SECTION */}
      <section className="py-24 relative ">
        {/* Floating shapes around CTA - glow entrance animation */}
        <div className="absolute pointer-events-none top-[20%] left-[10%] w-[450px] h-[350px] rounded-full bg-primary/30 blur-[80px] animate-glow-enter" />
        <div className="absolute pointer-events-none bottom-[30%] right-[5%] w-[500px] h-[400px] rounded-full bg-secondary/25 blur-[90px] animate-glow-enter-delayed" />
        <div className="absolute pointer-events-none top-[50%] left-[10%] w-[150px] h-[150px] rounded-full bg-primary/20 blur-[50px] animate-glow-enter" />
        <div className="absolute pointer-events-none top-[30%] right-[30%] w-[180px] h-[180px] rounded-full bg-secondary/15 blur-[60px] animate-glow-enter-delayed" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col  items-center text-center relative "
        >
          <motion.div
            initial={{
              scale: 0,
              opacity: 0,
              rotate: 0,
            }}
            whileInView={{
              scale: 1,
              opacity: 1,
              rotate: 360,
            }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              rotate: { duration: 0.8, ease: "easeInOut" },
            }}
            className="relative w-32 h-32 mx-auto mb-6"
          >
            {/* Background glow */}
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-[30px] animate-glow-soft" />

            {/* Rotating ring */}
            <div className="absolute inset-2 rounded-full border-2 border-primary/50 animate-rotate-slow" />

            {/* Center icon */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready to Start Tracking?
          </h2>

          <p className="text-lg max-w-md mx-auto mb-8">
            Create your free account and get instant access to AI-powered
            receipt analysis and smart spending insights.
          </p>
          <Link
            to="/Account"
            className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-primary to-secondary  font-bold rounded-xl hover:scale-105 transition-transform"
          >
            Create Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;

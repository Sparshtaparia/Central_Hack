import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "@/assets/logo.png";
import loaderGif from "@/assets/loader.gif";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"logo" | "loader" | "done">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("loader"), 1500);
    const t2 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[hsl(220,15%,12%)]"
        >
          <AnimatePresence mode="wait">
            {phase === "logo" && (
              <motion.div
                key="logo"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="flex flex-col items-center"
              >
                <img src={logoImg} alt="Sanchay" className="w-48 h-48 object-contain" />
              </motion.div>
            )}
            {phase === "loader" && (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <img src={loaderGif} alt="Loading" className="w-24 h-24" />
                <p className="font-pixel text-primary text-lg tracking-wider">Loading...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

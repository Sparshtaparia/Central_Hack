import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookOpen, Award, Users, Zap, ArrowRight, Flame, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";

const features = [
  { icon: BookOpen, title: "Learn Finance", desc: "Bite-sized video lessons on savings, investing & more", color: "bg-primary/15 text-primary" },
  { icon: Zap, title: "Earn XP", desc: "Complete lessons and quizzes to level up", color: "bg-secondary/15 text-secondary" },
  { icon: Award, title: "Win Rewards", desc: "Redeem XP for real Amazon & Flipkart vouchers", color: "bg-xp/15 text-xp" },
  { icon: Users, title: "Compete", desc: "Climb leaderboard and maintain daily streaks", color: "bg-accent/15 text-accent" },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden">
  {/* Background video */}
  <video
    autoPlay
    muted
    loop
    playsInline
    className="absolute inset-0 w-full h-full object-cover"
  >
    <source src="/src/assets/hero.mp4" type="video/mp4" />
  </video>

  {/* Dark overlay for readability */}
  <div className="absolute inset-0 bg-black/40" />

  {/* Content */}
  <div className="relative z-10 max-w-lg mx-auto px-6 text-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
    

        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="relative max-w-lg mx-auto px-6 pt-12 pb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.img
              src={logoImg}
              alt="Sanchay"
              className="w-28 h-28 mx-auto mb-4 object-contain"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            />
            <h1 className="font-pixel text-4xl text-foreground leading-tight mb-1">
              sanchay
            </h1>
            <div className="inline-block bg-primary/80 px-4 py-1 rounded mb-4">
              <span className="font-pixel text-sm text-primary-foreground tracking-widest">Nivesh Marg</span>
            </div>
            <p className="text-base text-muted-foreground mb-8 max-w-xs mx-auto">
              Learn finance, earn rewards, grow your wealth — one lesson at a time 🌱
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth">
                <Button size="lg" className="rounded-2xl bg-primary text-primary-foreground font-bold text-base px-8 shadow-warm hover:bg-primary/90 transition-colors w-full sm:w-auto">
                  Get Started <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="rounded-2xl font-bold text-base px-8 border-primary text-primary hover:bg-primary/10 w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        </motion.div>
  </div>
</header>

      {/* Features */}
      <section className="max-w-lg mx-auto px-6 py-10">
        <h2 className="font-pixel text-xl text-foreground text-center mb-8">How it works</h2>
        <div className="grid grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-4 text-center"
            >
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mx-auto mb-3`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-foreground mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-lg mx-auto px-6 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl bg-primary p-8 shadow-warm"
        >
          <Flame className="w-10 h-10 text-primary-foreground mx-auto mb-3" />
          <h2 className="font-pixel text-xl text-primary-foreground mb-2">Start your streak today!</h2>
          <p className="text-primary-foreground/80 text-sm mb-5">Join thousands of learners building financial literacy</p>
          <Link to="/auth">
            <Button size="lg" variant="outline" className="rounded-2xl font-bold bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/30">
              Sign Up Free
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

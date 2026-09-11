import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay }}
      className={`glass rounded-lg p-5 ${className}`}
    >
      {children}
    </motion.section>
  );
}

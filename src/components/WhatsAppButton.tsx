import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";

type Props = {
  href: string;
  label?: string;
  disabled?: boolean;
  onClick?: () => void;
};

export function WhatsAppButton({ href, label = "Solicitar via WhatsApp", disabled, onClick }: Props) {
  if (disabled) {
    return (
      <button
        disabled
        className="w-full inline-flex items-center justify-center gap-2 h-14 rounded-full bg-secondary text-muted-foreground font-semibold cursor-not-allowed"
      >
        <MessageCircle className="h-5 w-5" /> {label}
      </button>
    );
  }
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      className="w-full inline-flex items-center justify-center gap-2 h-14 rounded-full bg-gradient-pink text-primary-foreground font-semibold shadow-petal"
    >
      <MessageCircle className="h-5 w-5" /> {label}
    </motion.a>
  );
}

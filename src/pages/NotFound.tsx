import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        
        <h1 className="mb-2 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          Página não encontrada
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          A rota <code className="rounded bg-muted px-2 py-1 text-primary">{location.pathname}</code> não existe.
        </p>
        
        <Button asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;

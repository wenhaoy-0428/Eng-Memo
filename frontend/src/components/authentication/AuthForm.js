import { useMediaQuery } from "@mui/material";
import Paper from "@mui/material/Paper";
import { motion } from "framer-motion";

function AuthForm({ children, handleSubmit, gallery, className }) {
  const isLargeScreen = useMediaQuery("(min-width: 768px)");

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`flex justify-center items-center w-full h-full ${className}`}
    >
      <Paper elevation={2} className="flex max-w-[90%] w-[800px]">
        {/* gallery */}
        {isLargeScreen ? <div className="basis-full">{gallery}</div> : null}
        {/* form content */}
        <form
          className="flex flex-col gap-y-6 p-8 basis-full"
          onSubmit={handleSubmit}
        >
          {children}
        </form>
      </Paper>
    </motion.div>
  );
}

export default AuthForm;

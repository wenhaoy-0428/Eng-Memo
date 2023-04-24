import { useMediaQuery } from "@mui/material";
import Paper from "@mui/material/Paper";

function AuthForm({ children, handleSubmit, gallery, className }) {
  const isLargeScreen = useMediaQuery("(min-width: 768px)");

  return (
    <div
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
    </div>
  );
}

export default AuthForm;

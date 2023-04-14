import Paper from "@mui/material/Paper";

function AuthForm({ children, handleSubmit }) {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <form className="max-w-[90%] w-[400px]" onSubmit={handleSubmit}>
        <Paper elevation={2} className="flex flex-col gap-y-6 w-full p-8">
          {children}
        </Paper>
      </form>
    </div>
  );
}

export default AuthForm;

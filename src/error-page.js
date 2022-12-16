import { useRouteError } from "react-router-dom";

/**
 * A generic error page that is displayed when user routes into an invalid path.
 */
function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}

export default ErrorPage;

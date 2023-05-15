import { useEffect, useState } from "react";
import { LinearProgress } from "@mui/material";

export default function withLoading(OriginalComponent) {
  return function (props) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
      if (props.loader) {
        setIsLoading(true);
        try {
          setData(props.loader());
        } catch (e) {
          throw e;
        } finally {
          setIsLoading(false);
        }
      }
    }, []);

    const getData = () => {
      return data;
    };

    return isLoading ? (
      <LinearProgress />
    ) : (
      <OriginalComponent {...props} getData={getData} />
    );
  };
}

import { Avatar, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { useState } from "react";

import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AvatarUploading from "./AvatarUploading";
import { useUser } from "../../contexts/UserContext";

function ProfileFiled({ name, value, children, disable }) {
  const [selected, setSelected] = useState(false);

  const animate_field = {
    init: {
      opacity: 0,
    },
    show: {
      opacity: [0, 0, 0, 0, 1],
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      layout
      style={selected && { position: "absolute", width: "100%", height: "100%" }}
      transition={{
        layout: {
          duration: 0.4,
        },
      }}
    >
      <Paper
        variant="outlined"
        className="w-full h-full"
        onClick={() => {
          !disable && setSelected(true);
        }}
      >
        {/* default filed */}

        {!selected ? (
          <motion.div
            whileTap={{ scale: 0.97 }}
            key="filed"
            layout="position"
            className={`flex justify-between w-full h-full p-3 ${!disable && "hover:bg-gray-100 hover:cursor-pointer"}`}
            variants={animate_field}
            animate="show"
            initial="init"
            style={{ opacity: 0 }}
          >
            <div className=" text-gray-500">{name}</div>
            <div>{value}</div>
          </motion.div>
        ) : (
          <motion.div className="w-full h-full" variants={animate_field} initial="init" animate="show">
            <div className="absolute top-0 right-0 translate-x-[50%] translate-y-[-50%] bg-gray-100 rounded-full">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(false);
                }}
              >
                <CloseIcon />
              </IconButton>
            </div>
            {children}
          </motion.div>
        )}
      </Paper>
    </motion.div>
  );
}

export default function Profile() {
  const { user } = useUser();
  return (
    <div className="Profile w-[80%] max-w-[400px] h-full row-span-4 grid grid-cols-1 gap-3 content-start font-NotoSansSC text-lg relative">
      <ProfileFiled name="Username" value={user.name} disable></ProfileFiled>
      <ProfileFiled name="Email" value={user.email} disable></ProfileFiled>
      <ProfileFiled name="Password" value="*********" disable></ProfileFiled>
      <ProfileFiled name="Avatar" value={<Avatar alt={user.name} src={user.avatar} />}>
        <AvatarUploading />
      </ProfileFiled>
    </div>
  );
}

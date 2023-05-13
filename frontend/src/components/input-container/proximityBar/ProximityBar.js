import { Paper } from "@mui/material";
import axios from "axios";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { useEffect, useState } from "react";
import HighLightTexts from "../../common/highlightTexts";

const API_SEARCH_WORDS = "/api/search-words/";
const API_SEARCH_TAGS = "/api/search-tags/";

function Tag({ children, filter, search, inputRef, tagRef }) {
  // set value of inputField to the word of the matched record
  const handlerOnClick = () => {
    switch (filter) {
      case "Word":
        inputRef.current.value = children;
        break;
      case "Tag":
        tagRef.current.value = children;
        break;
      default:
        console.error("You should not be here!");
    }
  };

  const animate_tag = {
    hidden: {
      y: 30,
      transition: {
        duration: 0.3,
      },
    },
    show: {
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <Reorder.Item
      variants={animate_tag}
      initial="hidden"
      animate="show"
      exit="hidden"
    >
      <motion.div
        className="hover:cursor-pointer"
        whileTap={{ scale: 0.9 }}
        onClick={handlerOnClick}
      >
        <Paper className="px-2 py-1 font-NotoSansSCR text-gray-500 ">
          {(() => {
            switch (filter) {
              case "Word":
                return (
                  <HighLightTexts search={search}>{children}</HighLightTexts>
                );
              case "Tag":
                return (
                  <HighLightTexts
                    highlightColor="#22C55E"
                    search={search}
                    start="#"
                  >
                    {children}
                  </HighLightTexts>
                );
              default:
                return null;
            }
          })()}
        </Paper>
      </motion.div>
    </Reorder.Item>
  );
}

/**
 * A proximity Bar that contains all the matching results.
 * @param search: The substring that is used to find matches results.
 * @param inputRef: The reference to the inputBar
 * @param tagRef: The reference to the tagField
 * @param filter: The type of the search "Word" | "Tag"
 */
export default function ProximityBar({ search, inputRef, filter, tagRef }) {
  //! The reason not to use normal variables directly is that Tag as the children of ProximityBar is rendered first
  //! before useEffect of ProximityBar is called to fetch matches. Hence, search can be newly inputted while tags are still stale.
  const [tags, setTags] = useState([]);
  const [_search, setSearch] = useState(search);
  const [_filter, setFilter] = useState(filter);

  // function used to fetch matched words
  const searchMatchingWords = async () => {
    let data = {
      word: search,
    };
    try {
      let response = await axios.post(API_SEARCH_WORDS, data);
      setFilter(filter);
      setSearch(search);
      setTags(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  const searchMatchingTags = async () => {
    let data = {
      tag: search,
    };
    try {
      let response = await axios.post(API_SEARCH_TAGS, data);
      setFilter(filter);
      setSearch(search);
      setTags(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  // side effect that will fetch matched records
  useEffect(() => {
    if (search !== "") {
      switch (filter) {
        case "Word":
          searchMatchingWords();
          break;
        case "Tag":
          searchMatchingTags();
          break;
        default:
          console.error("You shouldn't be here");
      }
    } else {
      setTags([]);
    }
  }, [search]);

  return (
    <div className="relative w-full h-[40px]">
      <Reorder.Group
        as="ul"
        values={tags}
        axis="x"
        onReorder={setTags}
        className="flex px-[1px] py-1 gap-x-3 my-1 overflow-hidden list-none h-full"
      >
        <AnimatePresence wait>
          {tags.map((tag) => (
            <Tag
              key={tag}
              search={_search}
              filter={_filter}
              inputRef={inputRef}
              tagRef={tagRef}
            >
              {tag}
            </Tag>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      <div className="absolute bg-gradient-to-r top-0 left-0 from-transparent to-white via-transparent h-full w-full pointer-events-none" />
    </div>
  );
}

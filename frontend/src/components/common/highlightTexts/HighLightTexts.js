/**
 * An HOC that highlights the original text with specific substring
 * @param search: the matching substring
 * @param children: The original texts
 * @param highlightColor: The color to highlight the matching part
 * @param start: symbol to add at the beginning of the whole texts
 */
export default function HighLightTexts({
  search = "",
  children,
  highlightColor = "#3B82F6",
  start = "@",
}) {
  // startIndex of the matching part
  const startIndex = children.toLowerCase().indexOf(search.toLowerCase());
  // endIndex of the matching part
  const endIndex = startIndex + search.length;
  // divide children into three substrings where only the matching part will be colored.
  const prelude = children.slice(0, startIndex);
  const match = children.slice(startIndex, endIndex);
  const postlude = children.slice(endIndex);

  return (
    <>
      {startIndex > -1 ? (
        <>
          <span className="font-bold" style={{ color: highlightColor }}>
            {start}
          </span>
          <span>{prelude}</span>
          <span className="font-bold" style={{ color: highlightColor }}>
            {match}
          </span>
          <span>{postlude}</span>
        </>
      ) : (
        <span>{children}</span>
      )}
    </>
  );
}

export default function Cell({ children, className, marked = false }) {
  return (
    <div
      className={`w-full text-center ${className} flex flex-col items-center justify-center`}
    >
      <div className="w-[40px] h-[40px] p-1">{children}</div>
      {marked && (
        <div className=" bg-blue-400 rounded-full w-[5px] h-[5px]"></div>
      )}
    </div>
  );
}

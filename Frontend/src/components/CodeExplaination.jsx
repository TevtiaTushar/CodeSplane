import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CodeExplaination = ({ explaination }) => {
  return (
    <div className="w-full max-w-4xl mt-6 bg-gray-50 p-6 rounded-2xl shadow-lg text-black">
      <h2>Explaination</h2>
      <Markdown remarkPlugins={remarkGfm}>{explaination}</Markdown>
    </div>
  );
};

export default CodeExplaination;

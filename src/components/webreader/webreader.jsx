import { useState } from "react";
import styles from "../style.module.css";
import {
  Download,
  Image,
  FileVideo,
  FileCode,
  Music,
  File,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export default function WebReader({ theme, textTheme }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState(null);
  const [filter, setFilter] = useState("all");

  const extractResources = async () => {
    if (!url) return;

    setLoading(true);
    setResources(null);

    try {
      const response = await fetch("/api/extract-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error("Error:", error);
      setResources({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const downloadResource = async (resourceUrl, filename) => {
    try {
      const response = await fetch("/api/download-resource", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: resourceUrl }),
      });

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename || "download";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case "image":
        return <Image className="w-5 h-5" />;
      case "video":
        return <FileVideo className="w-5 h-5" />;
      case "font":
        return <FileCode className="w-5 h-5" />;
      case "audio":
        return <Music className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const filteredResources =
    resources?.resources?.filter(
      (r) => filter === "all" || r.type === filter
    ) || [];

  const resourceCounts =
    resources?.resources?.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {}) || {};

  return (
    <div
      style={{
        border: `2px solid ${theme}`,
        color: textTheme,
        backgroundColor: `${theme}90`,
      }}
      className={`h-full border- rounded-xl  flex flex-col`}
    >
      <div
        style={{
          backgroundColor: theme,
          color: textTheme,
        }}
        className="h-14 items-center justify-center flex w-full"
      >
        <div className="text-xl font-bold uppercase">WEB ANALYZER</div>
      </div>

      <div className="flex gap-4 p-4">
        <div className="w-full flex flex-col gap-2">
          <input
            type="text"
            value={url}
            style={{
              color: textTheme,
              outline: `1px solid ${textTheme}90`,
              backgroundColor: theme,
            }}
            className="placeholder:opacity-20 w-full font-bold bg-transparent h-9  p-2 rounded "
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL:"
            onKeyDown={(e) => e.key === "Enter" && extractResources()}
          />
        </div>
        <Button
          style={{ color: theme, backgroundColor: textTheme }}
          onClick={extractResources}
          disabled={loading || !url}
          className="h-9 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Reading...
            </>
          ) : (
            "READ"
          )}
        </Button>
      </div>

      {resources?.error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200">
          Error: {resources.error}
        </div>
      )}

      {resources?.resources && (
        <>
          <div className="flex gap-2 flex-wrap px-2">
            {Object.entries(resourceCounts).map(([type, count]) => (
              <button
                style={{
                  backgroundColor: filter === type ? theme : "",
                  border:
                    filter === type
                      ? `1px solid ${textTheme}`
                      : `1px solid ${textTheme}50`,
                }}
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize`}
              >
                {type}s ({count})
              </button>
            ))}
          </div>

          <div
            style={{ "--theme": textTheme }}
            className={cn(
              styles.scrollContainer,
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 flex-1 gap-4 overflow-y-auto p-4"
            )}
          >
            {filteredResources.map((resource, index) => (
              <div
                style={{ backgroundColor: theme, color: textTheme }}
                key={index}
                className={cn(
                  filter === "font" && "h-32",
                  "backdrop-blur-lg rounded-xl p-4 border hover:scale-105 transition-all"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-purple-300">
                    {getResourceIcon(resource.type)}
                    <span className="text-sm font-semibold capitalize">
                      {resource.type}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {filter != "font" && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-4 h-4 text-white" />
                      </a>
                    )}
                    <button
                      onClick={() =>
                        downloadResource(resource.url, resource.filename)
                      }
                      className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {resource.type === "image" && (
                  <div className="flex flex-col h-16 object-contain ">
                    <img
                      src={resource.url}
                      alt={resource.filename}
                      className="object-contain h-full w-full cursor-pointer"
                      loading="lazy"
                    />
                  </div>
                )}

                <p
                  className="text-white text-sm font-mono truncate"
                  title={resource.filename}
                >
                  {resource.filename}
                </p>
                <p className="text-purple-300 text-xs mt-1">
                  {resource.size || "Size unknown"}
                </p>
              </div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center text-purple-300 py-12">
              No {filter !== "all" ? filter + "s" : "resources"} found
            </div>
          )}
        </>
      )}
    </div>
  );
}

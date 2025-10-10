import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { useColorMode } from "@docusaurus/theme-common";

type SSEConsoleProps = {
  loop?: boolean;
  speedMs?: number;
  title?: string;
  className?: string;
};

const DEFAULT_LINES: string[] = [
  "event: open",
  "",
  "event: token",
  'data: {"text":"Hello"}',
  "",
  "event: token",
  'data: {"text":" world"}',
  "",
  "event: token",
  'data: {"text":"!"}',
  "",
  "event: close",
];

export default function SSEConsole({
  loop = true,
  speedMs = 900,
  title = "console",
  className,
}: SSEConsoleProps): React.ReactElement {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const [index, setIndex] = React.useState<number>(0);
  const [lines, setLines] = React.useState<string[]>([]);
  const [playing, setPlaying] = React.useState<boolean>(true);

  const reset = React.useCallback(() => {
    setIndex(0);
    setLines([]);
    setPlaying(true);
  }, []);

  React.useEffect(() => {
    if (!playing) return;
    if (index >= DEFAULT_LINES.length) {
      if (loop) {
        const id = setTimeout(() => reset(), speedMs * 2);
        return () => clearTimeout(id);
      }
      return;
    }
    const id = setTimeout(() => {
      setLines((prev) => [...prev, DEFAULT_LINES[index]]);
      setIndex((i) => i + 1);
    }, speedMs);
    return () => clearTimeout(id);
  }, [index, playing, loop, reset, speedMs]);

  const borderColor = isDark
    ? "rgba(100, 100, 100, 0.3)"
    : "rgba(171, 210, 255, 0.6)";

  return (
    <Paper
      elevation={0}
      className={className}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        border: `1px solid ${borderColor}`,
        bgcolor: isDark ? "rgba(25, 25, 25, 0.85)" : "rgba(246, 249, 253, 1)",
      }}
      aria-label="SSE console animation"
      role="region"
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 0.75,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
          {title}
        </Typography>
        <Button
          size="small"
          onClick={reset}
          aria-label="Replay SSE animation"
          sx={{ textTransform: "none", minWidth: 0, px: 1 }}
        >
          Replay
        </Button>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 1.5,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
          fontSize: 13,
          lineHeight: 1.5,
          color: isDark ? "#e6edf3" : "#0b2948",
        }}
      >
        {lines.map((line, i) => (
          <ConsoleLine key={i} text={line} />
        ))}
        {index < DEFAULT_LINES.length && (
          <BlinkCursor color={isDark ? "#e6edf3" : "#0b2948"} />
        )}
      </Box>
    </Paper>
  );
}

function ConsoleLine({ text }: { text: string }): React.ReactElement {
  if (!text) return <div style={{ height: 4 }} />;
  const isEvent = text.startsWith("event:");
  const isData = text.startsWith("data:");
  return (
    <div>
      {isEvent ? (
        <span>
          <span style={{ color: "#6f8bbd", fontWeight: 600 }}>event</span>
          <span>: </span>
          <span style={{ color: "#2aa198" }}>{text.replace("event: ", "")}</span>
        </span>
      ) : isData ? (
        <span>
          <span style={{ color: "#6f8bbd", fontWeight: 600 }}>data</span>
          <span>: </span>
          <JsonColor text={text.replace("data: ", "")} />
        </span>
      ) : (
        <span>{text}</span>
      )}
    </div>
  );
}

function JsonColor({ text }: { text: string }): React.ReactElement {
  // Best-effort tiny highlighter for the simple JSON strings provided
  // Expect inputs like: {"text":"Hello"}
  return (
    <span>
      {text.split(/([{}:\",]+)/).map((part, idx) => {
        if (part === '"') return <span key={idx}>"</span>;
        if (part === ":") return <span key={idx}>: </span>;
        if (part === ",") return <span key={idx}>, </span>;
        if (part === "{" || part === "}")
          return <span key={idx}>{part}</span>;
        if (!part) return <span key={idx} />;
        // keys or string values
        const isKey = /text/.test(part);
        const isString = /Hello| world|!/.test(part);
        if (isKey) return <span key={idx} style={{ color: "#b58900" }}>{part}</span>;
        if (isString) return <span key={idx} style={{ color: "#268bd2" }}>{part}</span>;
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}

function BlinkCursor({ color }: { color: string }): React.ReactElement {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 8,
        height: 16,
        marginLeft: 2,
        background: color,
        verticalAlign: "-2px",
        animation: "sseBlink 1s step-end infinite",
      }}
    />
  );
}


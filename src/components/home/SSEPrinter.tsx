import React from "react";
import { Box, Paper, Button, Tooltip, IconButton, Popover, Typography } from "@mui/material";
import { useColorMode } from "@docusaurus/theme-common";
import TerminalIcon from "@mui/icons-material/Terminal";

type SSEPrinterProps = {
  text?: string;
  charDelayMs?: number;
  loop?: boolean;
  className?: string;
};

const DEFAULT_TEXT =
  "Lihil streams responses via Server-Sent Events.\n" +
  "This text prints letter by letter to simulate token streaming. " +
  "Each token arrives and renders instantly, ideal for chat UIs and long generations.";

export default function SSEPrinter({
  text = DEFAULT_TEXT,
  charDelayMs = 35,
  loop = false,
  className,
}: SSEPrinterProps): React.ReactElement {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const [idx, setIdx] = React.useState<number>(0);
  const [playing, setPlaying] = React.useState<boolean>(true);
  const [sseAnchor, setSseAnchor] = React.useState<HTMLElement | null>(null);

  const reset = React.useCallback(() => {
    setIdx(0);
    setPlaying(true);
  }, []);

  React.useEffect(() => {
    if (!playing) return;
    if (idx >= text.length) {
      if (loop) {
        const id = setTimeout(() => reset(), 1200);
        return () => clearTimeout(id);
      }
      return;
    }
    const id = setTimeout(() => setIdx((v) => v + 1), charDelayMs);
    return () => clearTimeout(id);
  }, [idx, playing, loop, reset, charDelayMs, text.length]);

  const borderColor = isDark
    ? "rgba(100, 100, 100, 0.3)"
    : "rgba(171, 210, 255, 0.6)";

  const shown = text.slice(0, idx);
  const sseLines = React.useMemo(() => buildSSELines(text), [text]);
  const sseOpen = Boolean(sseAnchor);
  const handleOpenSSE = (e: React.MouseEvent<HTMLElement>) => setSseAnchor(e.currentTarget);
  const handleCloseSSE = () => setSseAnchor(null);

  return (
    <Paper
      elevation={0}
      className={className}
      sx={{
        border: `1px solid ${borderColor}`,
        borderRadius: 2,
        bgcolor: isDark ? "rgba(25,25,25,0.85)" : "rgba(246,249,253,1)",
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 2.5 },
      }}
      aria-label="SSE printing animation"
      role="region"
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, mb: 1 }}>
        <Tooltip title="Show SSE events">
          <IconButton size="small" onClick={handleOpenSSE} aria-label="Show SSE events">
            <TerminalIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Button
          size="small"
          onClick={reset}
          aria-label="Replay printing animation"
          sx={{ textTransform: "none", minWidth: 0, px: 1 }}
        >
          Replay
        </Button>
      </Box>
      <Box
        sx={{
          minHeight: 120,
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: 15,
          lineHeight: 1.7,
          color: isDark ? "#e6edf3" : "#0b2948",
          whiteSpace: "pre-wrap",
        }}
        aria-live="off"
      >
        {shown}
        {idx < text.length && (
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 8,
              height: 18,
              marginLeft: 2,
              background: isDark ? "#e6edf3" : "#0b2948",
              verticalAlign: "-3px",
              animation: "sseBlink 1s step-end infinite",
            }}
          />
        )}
      </Box>
      <Popover
        open={sseOpen}
        anchorEl={sseAnchor}
        onClose={handleCloseSSE}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { p: 1.5, maxWidth: 500, maxHeight: 600, overflow: "auto" } } }}
      >
        <Typography variant="caption" sx={{ display: "block", mb: 1, color: "text.secondary" }}>
          SSE sent to frontend
        </Typography>
        <Box
          component="pre"
          sx={{
            m: 0,
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: 13,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
          }}
        >
          {sseLines.join("\n")}
        </Box>
      </Popover>
    </Paper>
  );
}

function buildSSELines(text: string): string[] {
  const lines: string[] = [];
  lines.push("event: open");
  const tokens = text.match(/\S+\s*/g) ?? [text];
  for (const tok of tokens) {
    const data = JSON.stringify(tok);
    lines.push("event: token");
    lines.push(`data: {"text":${data}}`);
  }
  lines.push("event: close");
  return lines;
}

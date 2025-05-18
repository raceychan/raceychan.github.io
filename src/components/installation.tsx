import Link from "@docusaurus/Link";
import { Box, Typography, Button } from "@mui/material";
import { useColorMode } from "@docusaurus/theme-common";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

type InstallSectionProps = {
  command: string;
  packageName: string;
  totalKB: number;
  primaryColor?: string;
};

export default function InstallSection({
  command,
  packageName,
  totalKB,
  primaryColor,
}: InstallSectionProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  const [typed, setTyped] = useState("");
  const fullCommand = command;

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Typewriter effect
    let i = 0;
    const typeTimer = setInterval(() => {
      setTyped(fullCommand.slice(0, i + 1));
      i++;
      if (i === fullCommand.length) clearInterval(typeTimer);
    }, 80);

    return () => clearInterval(typeTimer);
  }, []);

  useEffect(() => {
    // Fake progress bar
    if (typed === fullCommand) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 5; // Random-ish progress
        });
      }, 150);
    }
  }, [typed]);

  const primaryBg = isDark ? "#1c1c1e" : "#f5f5f7";
  const textColor = isDark ? "#f0f0f0" : "#000";
  const accentColor = primaryColor; // Baby blue

  const progressKB = (progress / 100) * 83.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        Get Started in Seconds
      </Typography>

      <Typography variant="body1" paragraph sx={{ mb: 3 }}>
        Lihil is designed for simplicity without sacrificing power. Install with
        pip and start building your next Python web application.
      </Typography>

      <Box
        sx={{
          bgcolor: primaryBg,
          color: textColor,
          p: 2,
          borderRadius: 2,
          fontFamily: "monospace",
          fontSize: "0.9rem",
          mb: 3,
          border: `1px solid ${isDark ? "#333" : "#e0e0e0"}`,
          boxShadow: isDark
            ? "0 2px 10px rgba(0,0,0,0.3)"
            : "0 2px 6px rgba(0,0,0,0.05)",
          whiteSpace: "pre-line",
        }}
      >
        <div>
          <span style={{ color: accentColor }}>$</span> <span>{typed}</span>
          {typed.length < fullCommand.length && (
            <span className="cursor">|</span>
          )}
        </div>

        {typed === fullCommand && (
          <>
            <div style={{ marginTop: "1em", color: "#000000" }}>
              Collecting {packageName}
            </div>
            <div style={{ color: "#000000" }}>Downloading {packageName}</div>
            <div
              style={{
                position: "relative",
                height: 8,
                margin: "8px 0",
                background: isDark ? "#333" : "#ddd",
                borderRadius: 4,
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: accentColor,
                  borderRadius: 4,
                  transition: "width 0.2s ease-out",
                }}
              />
            </div>
            <div style={{ color: "#bbb" }}>
              {"   "}
              {progressKB.toFixed(1)}/{totalKB} 23.7 KB/s eta 0:00:4
            </div>
            {progress >= 100 && (
              <div style={{ color: "#000000", marginTop: "0.5em" }}>
                Successfully installed {packageName}
              </div>
            )}
          </>
        )}
      </Box>



      <style>
        {`
          .cursor {
            display: inline-block;
            width: 1ch;
            animation: blink 1s steps(2, start) infinite;
          }
          @keyframes blink {
            0%, 100% { opacity: 1 }
            50% { opacity: 0 }
          }
        `}
      </style>
    </motion.div>
  );
}

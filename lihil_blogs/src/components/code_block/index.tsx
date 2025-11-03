import React from "react";
import { Paper } from "@mui/material";
import { Highlight, type Language } from "prism-react-renderer";
import { useColorMode } from "@docusaurus/theme-common";
import { nordTheme } from "@site/src/theme/Prism/NordTheme";
import styles from "./index.module.css";
import clsx from "clsx";

interface CodeBlockProps {
  children: string;
  className?: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  fixedHeight?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  className,
  language = "python", // Default language is Python
  title,
  showLineNumbers = false,
  fixedHeight = false,
}) => {
  // Extract language from className if provided
  let extractedLanguage = language;
  if (className) {
    const match = /language-(\w+)/.exec(className);
    if (match) {
      extractedLanguage = match[1];
    }
  }

  // Remove trailing newline if it exists
  const code = children.trim();
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === "dark";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: isDarkTheme
          ? "rgba(25, 25, 25, 0.8)"
          : "rgba(226, 232, 240, 1)", // Slightly darker background for better contrast
        borderRadius: 2,
        border: isDarkTheme
          ? "1px solid rgba(100, 100, 100, 0.3)"
          : "1px solid rgba(171, 210, 255, 0.6)", // More visible border
        boxShadow: isDarkTheme ? "none" : "0 2px 6px rgba(0, 0, 0, 0.08)", // Light shadow in light mode for depth
        ...(fixedHeight && {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }),
      }}
    >
      <div 
        className={styles.codeBlockContainer}
        style={{
          ...(fixedHeight && {
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }),
        }}
      >
        {title && <div className={styles.codeBlockTitle}>{title}</div>}
        <div
          style={{
            ...(fixedHeight && {
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }),
          }}
        >
          <Highlight
            theme={nordTheme}
            code={code}
            language={extractedLanguage as Language}
          >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre 
                className={clsx(className, styles.codeBlock)} 
                style={{
                  ...style,
                  ...(fixedHeight && {
                    flex: 1,
                    overflow: "auto",
                    margin: 0,
                    maxHeight: "100%",
                  }),
                }}
              >
                {tokens.map((line, i) => (
                  <div
                    key={i}
                    {...getLineProps({ line, key: i })}
                    className={styles.codeLine}
                  >
                    {showLineNumbers && (
                      <span className={styles.lineNumber}>{i + 1}</span>
                    )}
                    <span className={styles.lineContent}>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token, key })} />
                      ))}
                    </span>
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>
      </div>
    </Paper>
  );
};

export default CodeBlock;

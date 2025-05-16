import React from "react";
import { Highlight, type Language } from "prism-react-renderer";
import { nordTheme } from "@site/src/theme/Prism/NordTheme";
import styles from "./index.module.css";
import clsx from "clsx";

interface CodeBlockProps {
  children: string;
  className?: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  className,
  language = "python", // Default language is Python
  title,
  showLineNumbers = false,
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

  return (
    <div className={styles.codeBlockContainer}>
      {title && <div className={styles.codeBlockTitle}>{title}</div>}
      <Highlight
        theme={nordTheme}
        code={code}
        language={extractedLanguage as Language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={clsx(className, styles.codeBlock)} style={style}>
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
  );
};

export default CodeBlock;

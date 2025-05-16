import React from "react";
import Link from "@docusaurus/Link";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  useTheme,
} from "@mui/material";
import { useColorMode } from "@docusaurus/theme-common";
// Import from react-code-blocks
import CodeBlock from "@site/src/components/code_block";

type HeroProps = {
  title: string;
  tagline: string;
};

const codeString = `from lihil import Lihil

app = Lihil("my_app")

@app.route('/hello/{name}')
async def hello(name: str):
    return {"message": f"Hello, {name}!"}

if __name__ == "__main__":
    app.run()`;

function HeroSection({ title, tagline }: HeroProps) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === "dark";

  // Python code sample
  return (
    <Box
      sx={{
        bgcolor: isDarkTheme ? "transparent" : "white",
        pt: 10,
        pb: 8,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box sx={{ mb: 4 }}>
              <Chip
                label="Fast. Robust. Simple."
                size="small"
                sx={{
                  bgcolor: isDarkTheme
                    ? "rgba(171, 210, 255, 0.15)"
                    : "rgba(171, 210, 255, 0.3)",
                  color: isDarkTheme ? "#82b1ff" : "#0066cc",
                  fontWeight: "medium",
                  mb: 2,
                }}
              />
              <Typography
                component="h1"
                variant="h2"
                fontWeight="bold"
                gutterBottom
              >
                {title}
              </Typography>
              <Typography
                variant="h5"
                component="p"
                color="text.secondary"
                sx={{ mb: 4 }}
              >
                {tagline}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  component={Link}
                  to="/docs/"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: isDarkTheme ? "#82b1ff" : "#0066cc",
                    fontWeight: "medium",
                    px: 4,
                    "&:hover": {
                      bgcolor: isDarkTheme ? "#5d8aec" : "#004999",
                    },
                  }}
                >
                  Get Started
                </Button>
                <Button
                  component={Link}
                  to="https://github.com/raceychan/lihil"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: isDarkTheme ? "#82b1ff" : "#0066cc",
                    color: isDarkTheme ? "#82b1ff" : "#0066cc",
                    fontWeight: "medium",
                    px: 4,
                  }}
                >
                  GitHub
                </Button>
              </Box>
            </Box>
          </Grid>
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
            }}
          >
            <CodeBlock language="python" title="example.py" showLineNumbers>
              {codeString}
            </CodeBlock>
          </Paper>
        </Grid>
      </Container>
    </Box>
  );
}

export default HeroSection;

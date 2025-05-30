import React from "react";
import Link from "@docusaurus/Link";
import { Box, Container, Typography, Button, Grid, Chip } from "@mui/material";
import { useColorMode } from "@docusaurus/theme-common";
import CodeBlock from "@site/src/components/code_block";
import GitHubIcon from "@mui/icons-material/GitHub";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

type HeroProps = {
  title: string;
  tagline: string;
};

type GreetingProps = HeroProps & {
  isDarkTheme: boolean;
};

const codeString = `from lihil import Lihil, Text, Annotated

lhl = Lihil()

@lhl.get('/hello/{name}')
def hello(name: str):
    return {"message": f"Hello, {name}!"}

if __name__ == "__main__":
    lhl.run(__file__)`;

function Greeting({ title, tagline, isDarkTheme }: GreetingProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Chip
        label="Performant. Productive. Professional."
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
      <Typography component="h1" variant="h2" fontWeight="bold" gutterBottom>
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
          startIcon={<RocketLaunchIcon />}
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
          startIcon={<GitHubIcon />}
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
  );
}

function HeroSection({ title, tagline }: HeroProps) {
  const { colorMode } = useColorMode();
  const isDarkTheme = colorMode === "dark";

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
      <Container>
        <Grid container spacing={8} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Greeting
              title={title}
              tagline={tagline}
              isDarkTheme={isDarkTheme}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <CodeBlock language="python" title="example.py" showLineNumbers>
              {codeString}
            </CodeBlock>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default HeroSection;

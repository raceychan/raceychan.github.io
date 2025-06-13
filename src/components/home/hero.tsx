import React from "react";
import Link from "@docusaurus/Link";
import { Box, Container, Typography, Button, Grid, Chip } from "@mui/material";
import { useColorMode } from "@docusaurus/theme-common";
import CodeBlock from "@site/src/components/code_block";
import RotatingDisplay from "@site/src/components/rotating_display";
import GitHubIcon from "@mui/icons-material/GitHub";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

type HeroProps = {
  title: string;
  tagline: string;
};

type GreetingProps = HeroProps & {
  isDarkTheme: boolean;
};

const openai_example =
{
  title: "openai",
  language: "python",
  code: `from lihil import Lihil, Route, Stream
from openai import OpenAI
from openai.types.chat import ChatCompletionChunk as Chunk
from openai.types.chat import ChatCompletionUserMessageParam as MessageIn

gpt = Route("/gpt", deps=[OpenAPI])

def message_encoder(chunk: Any) -> bytes:
    if not chunk.choices:
        return b""
    return chunk.choices[0].delta.content.encode() or b""

@gpt.sub("/messages").post(encoder=message_encoder)
async def add_new_message(
    client: OpenAPI, question: MessageIn, model: str
) -> Stream[Chunk]:
    async for chunk in client.responses.create(
      messages=[question], model=model, stream=True
    ):
        yield chunk
  `
}



// const codeExamples = [
//   {
//     title: "Hello World",
//     language: "python",
//     code: `from lihil import Lihil, Route, HTML

// lhl = Lihil()

// @lhl.sub("/hello/{name}").get
// def hello(name: str) -> HTML:
//     return "<p> Hello, {name}! </p>"

// if __name__ == "__main__":
//     lhl.run(__file__)`
//   },
//   {
//     title: "API with Validation",
//     language: "python",
//     code: `from lihil import Lihil, Route, JSON
// from pydantic import BaseModel

// lhl = Lihil()

// class User(BaseModel):
//     name: str
//     email: str
//     age: int

// @lhl.post("/users")
// def create_user(user: User) -> JSON:
//     # Auto validation & serialization
//     return {"id": 123, "user": user}

// lhl.run(__file__)`
//   },
//   {
//     title: "Dependency Injection",
//     language: "python",
//     code: `from lihil import Lihil
// from sqlalchemy.orm import Session

// users = Route("/users")

// def get_db() -> Session:
//     return session

// @users.sub("{user_id}").get(deps=[get_db])
// def get_user(user_id: int, db: Session) -> dict:
//     return db.query(User).filter(
//         User.id == user_id
//     ).first()`
//   },
// ];

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
          <Grid size={{ xs: 12, md: 5 }}>
            <Greeting
              title={title}
              tagline={tagline}
              isDarkTheme={isDarkTheme}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <CodeBlock title={"openai"}>{openai_example.code}</CodeBlock>
            {/* <CodeBlock language/> */}
            {/* <RotatingDisplay
              items={codeExamples.map((example, index) => (
                <CodeBlock
                  key={index}
                  language={example.language}
                  title={example.title}
                  showLineNumbers
                  fixedHeight
                >
                  {example.code}
                </CodeBlock>
              ))}
              autoRotateInterval={6000}
            /> */}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default HeroSection;

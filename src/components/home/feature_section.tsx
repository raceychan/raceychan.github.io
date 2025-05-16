import React from "react";
import { Box, Typography, Container } from "@mui/material";

type FeatureItem = {
  image: string;
  description: React.ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    image: require("@site/static/img/performant_pic.png").default,
    description: (
      <>
        Blazing fast across tasks and conditions. Lihil ranks among the fastest
        Python web frameworks, outperforming comparable ASGI frameworks by
        50%–100%.
      </>
    ),
  },
  {
    image: require("@site/static/img/professional_pic.png").default,
    description: (
      <>
        Designed for productivity from day one. Lihil comes with middlewares
        essential for enterprise development—authentication, authorization,
        event publishing, etc.
      </>
    ),
  },
  {
    image: require("@site/static/img/productive_pic.png").default,
    description: (
      <>
        Battery-Included to get started fast—without giving up flexibility.
        Ergonomic API with strong typing and built-in solutions for common
        problems. Lihil born to save your time
        <br />
      </>
    ),
  },
];

function FeatureBox({ image, description }: FeatureItem) {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Box
          component="img"
          src={image}
          sx={{
            width: 240,
            height: 240,
            objectFit: "contain",
          }}
        />
      </Box>

      <Typography
        variant="h5"
        color="text.secondary"
        sx={{
          maxWidth: "90%",
          mx: "auto",
          lineHeight: 1.7,
        }}
      >
        {description}
      </Typography>
    </Box>
  );
}

function Reasoning() {
  return (
    <Box sx={{ textAlign: "center", mb: 6 }}>
      <Typography component="h2" variant="h3" fontWeight="bold" gutterBottom>
        Why Choose Lihil?
      </Typography>
      <Typography
        variant="h6"
        component="p"
        color="text.secondary"
        sx={{ mb: 2, maxWidth: "800px", mx: "auto" }}
      >
        Built for developers who need both performance and productivity
      </Typography>
    </Box>
  );
}

function FeatureSection() {
  return (
    <Box sx={{ bgcolor: "white", py: 8 }}>
      <Container maxWidth="lg">
        <Reasoning />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          {FeatureList.map((feature, idx) => (
            <Box
              key={idx}
              sx={{
                width: "33.3333%", // 3 items in one row
                boxSizing: "border-box",
                px: 2,
              }}
            >
              <FeatureBox {...feature} />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default FeatureSection;

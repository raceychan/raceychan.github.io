import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  Container,
} from "@mui/material";

import RuleIcon from "@mui/icons-material/Rule";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import WifiIcon from "@mui/icons-material/Wifi";
import DescriptionIcon from "@mui/icons-material/Description";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import SendIcon from "@mui/icons-material/Send";
import ScienceIcon from "@mui/icons-material/Science";
import MemoryIcon from "@mui/icons-material/Memory";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const features = [
  {
    title: "Param Parsing & Validation",
    icon: <RuleIcon fontSize="large" color="primary" />, // import RuleIcon from @mui/icons-material
    description:
      "Automatically parse & validate request data from path, query, headers, and body with msgspec – 12x faster and 25x more memory efficient than Pydantic.",
  },
  {
    title: "Powerful Dependency Injection",
    icon: <SettingsEthernetIcon fontSize="large" color="primary" />, // import SettingsEthernetIcon
    description:
      "Inject dependencies based on type hints. Supports factories, async, scopes, and singletons – all lightning fast.",
  },
  {
    title: "WebSocket",
    icon: <WifiIcon fontSize="large" color="primary" />, // import WifiIcon
    description:
      "Handle WebSocket connections with clean, type-safe APIs. Easily test using the built-in WebSocket test client.",
  },
  {
    title: "OpenAPI & Error Docs",
    icon: <DescriptionIcon fontSize="large" color="primary" />, // import DescriptionIcon
    description:
      "Auto-generate OpenAPI docs and problem details. Custom exceptions are turned into clear API responses.",
  },
  {
    title: "Authentication & Authorization",
    icon: <LockPersonIcon fontSize="large" color="primary" />, // import LockPersonIcon
    description:
      "Built-in support for JWT and OAuth2. Auth objects are type-safe and serializable.",
  },
  {
    title: "Message System",
    icon: <SendIcon fontSize="large" color="primary" />, // import SendIcon
    description:
      "Built-in event system to publish and handle events, both in-process and out-of-process, efficiently.",
  },
  {
    title: "Great Testability",
    icon: <ScienceIcon fontSize="large" color="primary" />, // import ScienceIcon
    description:
      "Built-in test client for endpoints, routes, and middlewares – no extra setup required.",
  },
  {
    title: "Memory efficient",
    icon: <MemoryIcon fontSize="large" color="primary" />, // import MemoryIcon
    description:
      "Optimized for minimal memory usage. GC overhead is reduced, making services more stable under load.",
  },
  {
    title: "AI-Ready",
    icon: <SmartToyIcon fontSize="large" color="primary" />, // import SmartToyIcon
    description:
      "Designed with AI in mind. Built-in support for SSE, MCP, and remote handlers coming soon.",
  },
];

export default function FeatureSection() {
  return (
    <Box sx={{ py: 10, px: 4, backgroundColor: "rgba(171, 210, 255, 0.05)" }}>
      <Container maxWidth="lg">
        <Box sx={{ maxWidth: 960, mx: "auto", textAlign: "center", mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Why Choose <strong>lihil</strong>?
          </Typography>
          <Typography variant="h6" color="textSecondary">
            A clean, powerful Python web framework built for modern apps.
          </Typography>
        </Box>

        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          justifyContent="center"
        >
          {features.map((feature, index) => (
            <Grid size={{ xs: 4, sm: 4, md: 4 }} key={index}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  textAlign: "center",
                  p: 2,
                  transition:
                    "transform 0.2s, box-shadow 0.2s, background-color 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                    backgroundColor: "rgba(171, 210, 255, 0.05)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontSize: "1.25rem", fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  <Divider
                    sx={{
                      my: 2,
                      mx: "auto",
                      width: "40px",
                      backgroundColor: "primary.main",
                    }}
                  />
                  <Typography variant="body1" color="textSecondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

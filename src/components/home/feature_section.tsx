import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  Container,
} from "@mui/material";
import Translate from "@docusaurus/Translate";

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
    title: <Translate id="homepage.features.paramParsing.title">Param Parsing & Validation</Translate>,
    icon: <RuleIcon fontSize="large" color="primary" />,
    description: <Translate id="homepage.features.paramParsing.description">Automatically parse & validate request data from path, query, headers, and body with msgspec – 12x faster and 25x more memory efficient than Pydantic.</Translate>,
  },
  {
    title: <Translate id="homepage.features.dependencyInjection.title">Powerful Dependency Injection</Translate>,
    icon: <SettingsEthernetIcon fontSize="large" color="primary" />,
    description: <Translate id="homepage.features.dependencyInjection.description">Inject dependencies based on type hints. Supports factories, async, scopes, and singletons – all lightning fast.</Translate>,
  },
  {
    title: <Translate id="homepage.features.webSocket.title">WebSocket</Translate>,
    icon: <WifiIcon fontSize="large" color="primary" />,
    description: <Translate id="homepage.features.webSocket.description">Handle WebSocket connections with clean, type-safe APIs. Easily test using the built-in WebSocket test client.</Translate>,
  },
  {
    title: <Translate id="homepage.features.openAPI.title">OpenAPI & Error Docs</Translate>,
    icon: <DescriptionIcon fontSize="large" color="primary" />,
    description: <Translate id="homepage.features.openAPI.description">Auto-generate OpenAPI docs and problem details. Custom exceptions are turned into clear API responses.</Translate>,
  },
  {
    title: <Translate id="homepage.features.auth.title">Authentication & Authorization</Translate>,
    icon: <LockPersonIcon fontSize="large" color="primary" />,
    description: <Translate id="homepage.features.auth.description">Built-in support for JWT and OAuth2. Auth objects are type-safe and serializable.</Translate>,
  },
  {
    title: <Translate id="homepage.features.messageSystem.title">Message System</Translate>,
    icon: <SendIcon fontSize="large" color="primary" />,
    description: <Translate id="homepage.features.messageSystem.description">Built-in event system to publish and handle events, both in-process and out-of-process, efficiently.</Translate>,
  },
  {
    title: <Translate id="homepage.features.testability.title">Great Testability</Translate>,
    icon: <ScienceIcon fontSize="large" color="primary" />,
    description: <Translate id="homepage.features.testability.description">Built-in test client for endpoints, routes, and middlewares – no extra setup required.</Translate>,
  },
  {
    title: <Translate id="homepage.features.memoryEfficient.title">Memory efficient</Translate>,
    icon: <MemoryIcon fontSize="large" color="primary" />,
    description: <Translate id="homepage.features.memoryEfficient.description">Optimized for minimal memory usage. GC overhead is reduced, making services more stable under load.</Translate>,
  },
  {
    title: <Translate id="homepage.features.aiReady.title">AI-Ready</Translate>,
    icon: <SmartToyIcon fontSize="large" color="primary" />,
    description: <Translate id="homepage.features.aiReady.description">Designed with AI in mind. Built-in support for SSE, MCP, and remote handlers coming soon.</Translate>,
  },
];

export default function FeatureSection() {
  return (
    <Box sx={{ py: 10, px: 4, backgroundColor: "rgba(171, 210, 255, 0.05)" }}>
      <Container maxWidth="lg">
        <Box sx={{ maxWidth: 960, mx: "auto", textAlign: "center", mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            <Translate id="homepage.features.title">
              Why Choose lihil?
            </Translate>
          </Typography>
          <Typography variant="h6" color="textSecondary">
            <Translate id="homepage.features.subtitle">
              A clean, powerful Python web framework built for modern apps.
            </Translate>
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

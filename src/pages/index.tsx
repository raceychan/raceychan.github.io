import React from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Divider,
} from "@mui/material";

import FeatureSection from "../components/home/feature_section";
import HeroSection from "../components/home/hero";
import QuickStart from "@site/src/components/home/quick_start";
import CommunitySection from "../components/home/community";

function MetricsSection() {
  return (
    <Box sx={{ bgcolor: "rgba(171, 210, 255, 0.05)", py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center">
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h3" fontWeight="bold" color="primary">
                50%+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Faster than other ASGI webframeworks
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h3" fontWeight="bold" color="primary">
                100%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Test Covered and strictly typed
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h3" fontWeight="bold" color="primary">
                &gt;40K
              </Typography>
              <Typography variant="body1" color="text.secondary">
                RPS(per cpu)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function InviteSection() {
  return (
    <Box
      sx={{
        bgcolor: "rgba(171, 210, 255, 0.2)",
        py: 8,
        textAlign: "center",
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Ready to build something amazing?
        </Typography>
        <Typography
          variant="body1"
          sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
        >
          Join the growing community of developers using Lihil to build fast,
          robust, and scalable web applications.
        </Typography>
        <Button
          component={Link}
          to="/docs/installation"
          variant="contained"
          size="large"
          sx={{
            bgcolor: "#0066cc",
            fontWeight: "medium",
            px: 4,
            "&:hover": {
              bgcolor: "#004999",
            },
          }}
        >
          Get Started Now
        </Button>
      </Container>
    </Box>
  );
}

export default function Home(): React.ReactNode {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <HeroSection title={siteConfig.title} tagline={siteConfig.tagline} />
      <Divider/>
      <MetricsSection />
      <Divider/>
      <QuickStart />
      <Divider/>
      <FeatureSection />
      <Divider/>
      <CommunitySection />
      <Divider/>
      <InviteSection />
    </Layout>
  );
}

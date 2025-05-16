import React from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import { Box, Container, Typography, Button, Grid } from "@mui/material";

import FeatureSection from "../components/home/feature_section";
import HeroSection from "../components/home/hero";
import QuickStart from "@site/src/components/home/quick_start";
import CommunitySection from "../components/home/community";

function MetricsSection() {
  return (
    <Box sx={{ bgcolor: "rgba(171, 210, 255, 0.05)", py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={4} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h3" fontWeight="bold" color="primary">
                50%+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Faster than comparable ASGI frameworks
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h3" fontWeight="bold" color="primary">
                100%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Type-safe API
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h3" fontWeight="bold" color="primary">
                &lt;1ms
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Response time for simple requests
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default function Home(): React.ReactNode {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <HeroSection
        title={siteConfig.title}
        tagline={siteConfig.tagline}
      ></HeroSection>
      <MetricsSection />
      <FeatureSection />
      <QuickStart />

      {/* Community Section */}
      <CommunitySection />

      {/* Footer CTA */}
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
            paragraph
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
    </Layout>
  );
}

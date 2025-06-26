import React from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import Translate from "@docusaurus/Translate";
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
import QuickStartSection from "@site/src/components/home/quick_start";
import CommunitySection from "../components/home/community";

function MetricsSection() {
  return (
    <Box sx={{ bgcolor: "rgba(171, 210, 255, 0.05)", py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center">
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h3" fontWeight="bold" color="primary">
                50%-100%
              </Typography>

              <Typography variant="body1" color="text.secondary">
                <Translate id="homepage.metrics.performance.description">
                  Faster than other ASGI frameworks, more for larger app.
                </Translate>{" "}
                <Link href="https://github.com/raceychan/lhl_bench">
                  <Translate id="homepage.metrics.performance.benchmarks">
                    benchmarks
                  </Translate>
                </Link>
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h3" fontWeight="bold" color="primary">
                100%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <Translate id="homepage.metrics.testCoverage.description">
                  Test Covered and strictly typed
                </Translate>
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h3" fontWeight="bold" color="primary">
                &gt; 45K
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <Translate id="homepage.metrics.rps.description">
                  RPS(per CPU thread)
                </Translate>
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
          <Translate id="homepage.invite.title">
            Ready to build something amazing?
          </Translate>
        </Typography>
        <Typography
          variant="body1"
          sx={{ mb: 4, maxWidth: "600px", mx: "auto" }}
        >
          <Translate id="homepage.invite.description">
            Join the growing community of developers using Lihil to build fast,
            robust, and scalable web applications.
          </Translate>
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
          <Translate id="homepage.invite.button">
            Get Started Now
          </Translate>
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
      <Divider />
      <MetricsSection />
      <Divider />
      <QuickStartSection />
      <Divider />
      <FeatureSection />
      <Divider />
      <CommunitySection />
      <Divider />
      <InviteSection />
    </Layout>
  );
}

import React from "react";
import { useState, useEffect } from "react";

import Link from "@docusaurus/Link";
import { Box, Container, Typography, Button, Grid, Paper } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import ForumIcon from "@mui/icons-material/Forum"; // Good for "Discord"
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism"; // Good for "Contribute"

export default function CommunitySection() {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://pypi.org/pypi/lihil/json")
      .then((res) => res.json())
      .then((data) => setVersion(data.info.version))
      .catch((err) => {
        console.error("Failed to fetch version:", err);
        setVersion("unknown");
      });
  }, []);

  return (
    <Box sx={{ bgcolor: "white", py: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={6}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Join the Community
            </Typography>
            <Typography variant="body1" paragraph>
              Lihil is backed by a growing community of Python developers. Get
              support, contribute, and help shape the future of fast Python web
              development.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 3 }}>
              <Button
                component={Link}
                startIcon={<GitHubIcon />}
                to="https://github.com/raceychan/lihil"
                variant="outlined"
                sx={{
                  borderColor: "#0066cc",
                  color: "#0066cc",
                }}
              >
                GitHub
              </Button>
              <Button
                component={Link}
                startIcon={<ForumIcon />}
                to="https://discord.gg/3JQxSKnZ"
                variant="outlined"
                sx={{
                  borderColor: "#0066cc",
                  color: "#0066cc",
                }}
              >
                Discord
              </Button>
              <Button
                component={Link}
                startIcon={<VolunteerActivismIcon />}
                to="https://github.com/raceychan/lihil/blob/master/CONTRIBUTING.md"
                variant="outlined"
                sx={{
                  borderColor: "#0066cc",
                  color: "#0066cc",
                }}
              >
                Contribute
              </Button>
            </Box>
          </Grid>
          <Grid size={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                bgcolor: "rgba(171, 210, 255, 0.1)",
                borderRadius: 2,
                border: "1px solid rgba(171, 210, 255, 0.2)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                align="center"
              >
                Latest Release
              </Typography>
              <Typography
                variant="h4"
                fontWeight="bold"
                color="primary"
                align="center"
                gutterBottom
              >
                {version ?? "Loading..."}
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  component={Link}
                  to="https://github.com/raceychan/lihil/releases"
                  variant="contained"
                  sx={{
                    bgcolor: "#0066cc",
                    fontWeight: "medium",
                    "&:hover": {
                      bgcolor: "#004999",
                    },
                  }}
                >
                  Release Notes
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

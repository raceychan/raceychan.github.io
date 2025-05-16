import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Paper,
  Divider,
  Avatar,
  Chip
} from '@mui/material';

type FeatureItem = {
  title: string;
  image: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Performant',
    image: require('@site/static/img/performant_pic.png').default,
    description: (
      <>
        Blazing fast across tasks and conditions—Lihil ranks among the fastest Python web frameworks, outperforming comparable ASGI frameworks by 50%–100%.
      </>
    ),
  },
  {
    title: 'Professional',
    image: require('@site/static/img/professional_pic.png').default,
    description: (
      <>
        Lihil comes with middlewares essential for enterprise development—authentication, authorization, event publishing, etc.
        <br />
        Designed for productivity from day one with support for TDD and DDD.
      </>
    ),
  },
  {
    title: 'Productive',
    image: require('@site/static/img/productive_pic.png').default,
    description: (
      <>
        A rich API with strong typing, built-in solutions for common problems, and OpenAPI doc generation.
        <br />
        Everything to get started fast—without giving up flexibility.
      </>
    ),
  },
];

function Feature({title, image, description}: FeatureItem) {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        borderRadius: 2,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box 
        sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        <Avatar 
          src={image} 
          alt={title} 
          sx={{ 
            width: 48, 
            height: 48, 
            mr: 2, 
            bgcolor: 'rgba(171, 210, 255, 0.15)'
          }}
        />
        <Typography component="h3" variant="h5" fontWeight="bold">
          {title}
        </Typography>
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  
  return (
    <Layout
      title={siteConfig.title}
      description={siteConfig.tagline}>
      
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'white',
          pt: 10,
          pb: 8,
          position: 'relative',
          overflow: 'hidden',
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
                    bgcolor: 'rgba(171, 210, 255, 0.3)', 
                    color: '#0066cc', 
                    fontWeight: 'medium',
                    mb: 2
                  }} 
                />
                <Typography 
                  component="h1" 
                  variant="h2" 
                  fontWeight="bold" 
                  gutterBottom
                >
                  {siteConfig.title}
                </Typography>
                <Typography 
                  variant="h5" 
                  component="p" 
                  color="text.secondary" 
                  sx={{ mb: 4 }}
                >
                  {siteConfig.tagline}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button 
                    component={Link} 
                    to="/docs/intro" 
                    variant="contained" 
                    size="large"
                    sx={{ 
                      bgcolor: '#0066cc',
                      fontWeight: 'medium',
                      px: 4,
                      '&:hover': {
                        bgcolor: '#004999',
                      }
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
                      borderColor: '#0066cc',
                      color: '#0066cc',
                      fontWeight: 'medium',
                      px: 4
                    }}
                  >
                    GitHub
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  bgcolor: 'rgba(171, 210, 255, 0.1)', 
                  borderRadius: 2,
                  border: '1px solid rgba(171, 210, 255, 0.2)'
                }}
              >
                <Typography 
                  component="pre" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.9rem', 
                    fontWeight: 'medium',
                    color: '#0066cc',
                    overflow: 'auto'
                  }}
                >
{`from lihil import Lihil

app = Lihil("my_app")

@app.route('/hello/{name}')
async def hello(name: str):
    return {"message": f"Hello, {name}!"}

if __name__ == "__main__":
    app.run()`}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Metrics Section */}
      <Box sx={{ bgcolor: 'rgba(171, 210, 255, 0.05)', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={4} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" color="primary">
                  50%+
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Faster than comparable ASGI frameworks
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" color="primary">
                  100%
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Type-safe API
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Box sx={{ textAlign: 'center' }}>
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

      {/* Features Section */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              component="h2" 
              variant="h3" 
              fontWeight="bold" 
              gutterBottom
            >
              Why Choose Lihil?
            </Typography>
            <Typography 
              variant="h6" 
              component="p" 
              color="text.secondary" 
              sx={{ mb: 2, maxWidth: '800px', mx: 'auto' }}
            >
              Built for developers who need both performance and productivity
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {FeatureList.map((feature, idx) => (
              <Grid key={idx} item xs={12} sm={4}>
                <Feature {...feature} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Quick Start Section */}
      <Box sx={{ bgcolor: 'rgba(171, 210, 255, 0.05)', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Get Started in Seconds
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                Lihil is designed for simplicity without sacrificing power. Install with pip and start building your next Python web application.
              </Typography>
              <Box
                sx={{
                  bgcolor: '#111',
                  color: 'white',
                  p: 3,
                  borderRadius: 2,
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  mb: 3,
                }}
              >
                <code>pip install lihil</code>
              </Box>
              <Button 
                component={Link} 
                to="/docs/installation" 
                variant="outlined"  
                sx={{ 
                  borderColor: '#0066cc',
                  color: '#0066cc',
                  fontWeight: 'medium',
                }}
              >
                Installation Guide
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  bgcolor: 'white', 
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                }}
              >
                <Typography component="h3" variant="h6" fontWeight="bold" gutterBottom>
                  Create a REST API in minutes
                </Typography>
                <Typography 
                  component="pre" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.9rem',
                    overflow: 'auto'
                  }}
                >
{`# app.py
from lihil import Lihil, HTTPException
from pydantic import BaseModel

app = Lihil("todo_api")

class TodoItem(BaseModel):
    id: int
    title: str
    completed: bool = False

todos = []

@app.get("/todos")
async def get_todos():
    return todos

@app.post("/todos")
async def create_todo(item: TodoItem):
    todos.append(item)
    return item

if __name__ == "__main__":
    app.run()`}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Community Section */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Join the Community
              </Typography>
              <Typography variant="body1" paragraph>
                Lihil is backed by a growing community of Python developers. Get support, contribute, and help shape the future of fast Python web development.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
                <Button 
                  component={Link} 
                  to="https://github.com/raceychan/lihil" 
                  variant="outlined" 
                  sx={{ 
                    borderColor: '#0066cc',
                    color: '#0066cc',
                  }}
                >
                  GitHub
                </Button>
                <Button 
                  component={Link} 
                  to="/community/discord" 
                  variant="outlined"
                  sx={{ 
                    borderColor: '#0066cc',
                    color: '#0066cc',
                  }}
                >
                  Discord
                </Button>
                <Button 
                  component={Link} 
                  to="/docs/contributing" 
                  variant="outlined"
                  sx={{ 
                    borderColor: '#0066cc',
                    color: '#0066cc',
                  }}
                >
                  Contribute
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  bgcolor: 'rgba(171, 210, 255, 0.1)', 
                  borderRadius: 2,
                  border: '1px solid rgba(171, 210, 255, 0.2)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom align="center">
                  Latest Release
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary" align="center" gutterBottom>
                  v1.0.0
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button 
                    component={Link} 
                    to="/docs/changelog" 
                    variant="contained"
                    sx={{ 
                      bgcolor: '#0066cc',
                      fontWeight: 'medium',
                      '&:hover': {
                        bgcolor: '#004999',
                      }
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

      {/* Footer CTA */}
      <Box 
        sx={{ 
          bgcolor: 'rgba(171, 210, 255, 0.2)', 
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Ready to build something amazing?
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
            Join the growing community of developers using Lihil to build fast, robust, and scalable web applications.
          </Typography>
          <Button 
            component={Link} 
            to="/docs/intro" 
            variant="contained" 
            size="large"
            sx={{ 
              bgcolor: '#0066cc',
              fontWeight: 'medium',
              px: 4,
              '&:hover': {
                bgcolor: '#004999',
              }
            }}
          >
            Get Started Now
          </Button>
        </Container>
      </Box>
    </Layout>
  );
}
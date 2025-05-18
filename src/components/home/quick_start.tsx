import { Grid, Box, Typography, Container, Button } from "@mui/material";

import CodeBlock from "@site/src/components/code_block";

import React from "react";
import InstallSection from "@site/src/components/installation";
import InventoryIcon from "@mui/icons-material/Inventory2";
import Link from "@docusaurus/Link";

export default function QuickStart() {
  const quick_start_code = `
from lihil import Lihil, HTTPException, Struct

lhl = Lihil("todo_api")

class TodoItem(Struct):
    id: int
    title: str
    completed: bool = False


@lhl.get("/todos")
async def get_todos():
    return todos

@lhl.post("/todos")
async def create_todo(item: TodoItem, todo_repo: TodoRepo):
    todo_repo.add(item)
    return item

if __name__ == "__main__":
    lhl.run()`;
  return (
    <Box sx={{ bgcolor: "rgba(255, 255, 255, 0.05)", py: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems="center">
          <Grid size={6}>
            <InstallSection
              command={'pip install "lihil[standard]"'}
              packageName="lihil"
              totalKB={83.5}
              primaryColor={"#66bfff"}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                component={Link}
                startIcon={<InventoryIcon />}
                to="/docs/installation"
                variant="contained"
                sx={{
                  fontWeight: "medium",
                  textTransform: "none",
                }}
              >
                Install
              </Button>
            </Box>
          </Grid>

          <Grid size={6}>
            <Typography
              component="h3"
              variant="h6"
              fontWeight="bold"
              gutterBottom
            >
              Create a REST API in minutes
            </Typography>
            <CodeBlock title={"app.py"}>{quick_start_code}</CodeBlock>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

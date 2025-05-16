import { Grid, Box, Typography, Paper } from "@mui/material";

import CodeBlock from "@site/src/components/code_block";

import React from "react";
import InstallSection from "@site/src/components/installation";

export default function QuickStart() {
  const quick_start_code = `# app.py
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
    <Box
      sx={{ bgcolor: "rgba(171, 210, 255, 0.05)", py: 8 }}
      maxWidth={"lg"}
      mx={"auto"}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid size={6}>
          <InstallSection
            command={'pip install "lihil[standard]"'}
            packageName="lihil"
            totalKB={83.5}
            primaryColor={"#66bfff"}
          />
        </Grid>

        <Grid size={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "white",
              borderRadius: 2,
              border: "1px solid rgba(0, 0, 0, 0.05)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Typography
              component="h3"
              variant="h6"
              fontWeight="bold"
              gutterBottom
            >
              Create a REST API in minutes
            </Typography>
            <CodeBlock>{quick_start_code}</CodeBlock>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

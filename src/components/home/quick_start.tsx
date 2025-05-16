import { Grid, Box, Typography, Paper } from "@mui/material";

import CodeBlock from "@site/src/components/code_block";

import React from "react";
import InstallSection from "@site/src/components/installation";

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
    <Box sx={{ bgcolor: "rgba(171, 210, 255, 0.05)", py: 8 }} mx={"auto"}>
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
    </Box>
  );
}

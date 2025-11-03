import argparse
import logging
import re
from datetime import datetime
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


ROOT_DIR = Path.cwd()
BLOG_DIR = ROOT_DIR / "blog"

# Global content template
CONTENT = """---
slug: {slug}
title: {title}
authors: {authors}
tags: {tags}
toc_min_heading_level: {toc_min}
toc_max_heading_level: {toc_max}
---
"""


def to_kebab_case(string: str) -> str:
    """
    Convert a string to kebab-case, properly handling acronyms.

    Examples:
        HTTPException -> http-exception
        UserAPI -> user-api
        OAuth2PasswordBearer -> o-auth2-password-bearer
    """
    if not string:
        return string

    result = ""
    in_acronym = False

    for i, char in enumerate(string):
        if char.isupper():
            if (i > 0 and not string[i - 1].isupper()) or i == 0:
                if i > 0:  # Don't add hyphen at the beginning
                    result += "-"
                result += char.lower()
                in_acronym = True

            elif in_acronym and (i == len(string) - 1 or not string[i + 1].isupper()):
                result += char.lower()
                in_acronym = False
            else:
                result += char.lower()
        else:
            if i > 0 and string[i - 1].isupper() and not in_acronym:
                result = result[:-1] + "-" + result[-1] + char
            else:
                result += char
            in_acronym = False

    result = re.sub(r"[\s_]+", "-", result)
    return result


def generate_blog_post(
    title: str,
    authors: list[str],
    tags: list[str],
    date: str | None = None,
    toc_min: int = 2,
    toc_max: int = 5,
    content_body: str = "",
    images: list[str] = None,
    json_output: bool = False,
):
    images = images or []
    date_str = date or datetime.now().strftime("%Y-%m-%dT%H:%M")
    slug = to_kebab_case(title)
    dir_name = f"{date_str}-{slug}"
    blog_dir = BLOG_DIR / dir_name
    blog_dir.mkdir(parents=True, exist_ok=True)

    # Create frontmatter
    frontmatter_content = CONTENT.format(
        slug=slug,
        title=title,
        authors=authors,
        tags=tags,
        toc_min=toc_min,
        toc_max=toc_max,
    )
    
    # Combine frontmatter with body content
    full_content = frontmatter_content + "\n" + content_body

    # Create content.md file
    content_file = blog_dir / "content.md"
    content_file.write_text(full_content, encoding="utf-8")
    
    # Create placeholder files for images
    created_files = ["content.md"]
    for image_name in images:
        image_file = blog_dir / image_name
        if not image_file.exists():
            image_file.touch()  # Create empty file
            created_files.append(image_name)
    
    if json_output:
        import json
        result = {
            "success": True,
            "message": "Blog post created successfully",
            "dir_name": dir_name,
            "path": str(content_file.relative_to(ROOT_DIR)),
            "created_files": created_files
        }
        print(json.dumps(result))
    else:
        logger.info(f"Blog post created at: {content_file}")
        if images:
            logger.info(f"Image placeholders created: {', '.join(images)}")
    
    return {
        "dir_name": dir_name,
        "path": str(content_file),
        "created_files": created_files
    }


def main():
    parser = argparse.ArgumentParser(description="Utility script")
    subparsers = parser.add_subparsers(dest="command")

    # Blog subcommand
    blog_parser = subparsers.add_parser("blog", help="Generate a Docusaurus blog post")
    blog_parser.add_argument("title", help="Title of the blog post")
    blog_parser.add_argument(
        "--authors",
        nargs="*",
        default="[raceychan]",
        help="Author name (default: 'default')",
    )
    blog_parser.add_argument("--tags", nargs="*", type=str, help="List of tags")
    blog_parser.add_argument(
        "--date", help="ISO 8601 date (e.g. 2025-05-28T10:00). Default: now"
    )
    blog_parser.add_argument(
        "--toc_min_heading_level",
        type=int,
        default=2,
        help="TOC min heading level (default: 2)",
    )
    blog_parser.add_argument(
        "--toc_max_heading_level",
        type=int,
        default=5,
        help="TOC max heading level (default: 5)",
    )
    blog_parser.add_argument(
        "--content",
        type=str,
        default="",
        help="Blog post content body",
    )
    blog_parser.add_argument(
        "--images",
        nargs="*",
        type=str,
        default=[],
        help="List of image filenames to create as placeholders",
    )
    blog_parser.add_argument(
        "--json",
        action="store_true",
        help="Output result in JSON format",
    )

    args = parser.parse_args()

    if args.command == "blog":
        generate_blog_post(
            title=args.title,
            authors=args.authors,
            tags=args.tags,
            date=args.date,
            toc_min=args.toc_min_heading_level,
            toc_max=args.toc_max_heading_level,
            content_body=args.content,
            images=args.images,
            json_output=args.json,
        )
    else:
        parser.print_help()


if __name__ == "__main__":
    main()

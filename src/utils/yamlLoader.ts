// In a real implementation, you would need to fetch these files from your server
// For now, we'll provide the static data but structure it for easy future enhancement

export interface Author {
  id: string;
  name: string;
  title: string;
  url: string;
  image_url: string;
  page?: boolean;
  socials?: {
    x?: string;
    github?: string;
  };
}

export interface Tag {
  id: string;
  label: string;
  permalink: string;
  description: string;
}

// This would ideally fetch from your YAML files via an API endpoint
export async function loadAuthors(): Promise<Author[]> {
  // In development, you could make an API call to read the YAML file
  // For now, we'll return the static data
  return [
    {
      id: 'raceychan',
      name: 'raceychan',
      title: 'author of lihil, a developer.',
      url: 'https://github.com/raceychan',
      image_url: 'https://github.com/raceychan.png',
      page: true,
      socials: {
        x: 'raceychan',
        github: 'raceychan',
      },
    },
  ];
}

export async function loadTags(): Promise<Tag[]> {
  // In development, you could make an API call to read the YAML file
  // For now, we'll return the static data
  return [
    {
      id: 'web-development',
      label: 'web development',
      permalink: '/web-development',
      description: 'Best practices of webdevlopment',
    },
    {
      id: 'authentication',
      label: 'authentication',
      permalink: '/authentication',
      description: 'Authentication and authorization in web applications',
    },
    {
      id: 'python',
      label: 'python',
      permalink: '/python',
      description: 'general dicussion about programming in python',
    },
  ];
}

// Helper function to suggest new authors/tags based on input
export function suggestNewAuthor(input: string): Partial<Author> {
  const id = input.toLowerCase().replace(/\s+/g, '');
  return {
    id,
    name: input,
    title: 'Author', // Could be filled in by user
    url: `https://github.com/${id}`,
    image_url: `https://github.com/${id}.png`,
  };
}

export function suggestNewTag(input: string): Partial<Tag> {
  const id = input.toLowerCase().replace(/\s+/g, '-');
  return {
    id,
    label: input,
    permalink: `/${id}`,
    description: `Posts about ${input}`,
  };
}
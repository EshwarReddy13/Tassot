import ProjectCard from './ProjectCard';

export default {
  title: 'Components/ProjectCard',
  component: ProjectCard,
  parameters: {
    docs: {
      description: {
        component: 'A card component for displaying project information with hover effects and interactive elements.',
      },
    },
  },
  argTypes: {
    project: {
      description: 'Project object containing all project data',
      control: { type: 'object' },
    },
    onEdit: {
      description: 'Callback function when edit button is clicked',
      action: 'edit clicked',
    },
    onDelete: {
      description: 'Callback function when delete button is clicked',
      action: 'delete clicked',
    },
    onPin: {
      description: 'Callback function when pin button is clicked',
      action: 'pin clicked',
    },
  },
  tags: ['autodocs'],
};

// Sample project data
const sampleProject = {
  id: '1',
  name: 'Sample Project',
  description: 'This is a sample project description that shows how the card looks with content.',
  status: 'active',
  progress: 75,
  members: [
    { id: '1', name: 'John Doe', avatar: 'https://via.placeholder.com/32' },
    { id: '2', name: 'Jane Smith', avatar: 'https://via.placeholder.com/32' },
  ],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20'),
  isPinned: false,
};

export const Default = {
  args: {
    project: sampleProject,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default project card with all features enabled.',
      },
    },
  },
};

export const Pinned = {
  args: {
    project: {
      ...sampleProject,
      isPinned: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Project card in pinned state.',
      },
    },
  },
};

export const LongDescription = {
  args: {
    project: {
      ...sampleProject,
      description: 'This is a very long project description that should be truncated to show how the card handles overflow text. It goes on and on to demonstrate the text truncation behavior.',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Project card with a long description to show text truncation.',
      },
    },
  },
};

export const NoMembers = {
  args: {
    project: {
      ...sampleProject,
      members: [],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Project card with no team members.',
      },
    },
  },
};

export const HighProgress = {
  args: {
    project: {
      ...sampleProject,
      progress: 95,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Project card with high completion progress.',
      },
    },
  },
}; 
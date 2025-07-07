import SignUpPageView from './SignupPage';

export default {
  title: 'Pages/SignUp',
  component: SignUpPageView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive signup page with email/password and social authentication options. Features real-time password validation, accessibility compliance, and responsive design.',
      },
    },
  },
  argTypes: {
    // Since this is a page component, we don't have props to control
    // But we can document the component behavior
  },
  tags: ['autodocs'],
};

// Default story showing the signup page
export const Default = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'The default signup page with all form fields and validation.',
      },
    },
  },
};

// Story showing the page in a mobile viewport
export const Mobile = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Signup page optimized for mobile devices with responsive layout.',
      },
    },
  },
};

// Story showing the page in a tablet viewport
export const Tablet = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Signup page on tablet devices showing the responsive design.',
      },
    },
  },
}; 
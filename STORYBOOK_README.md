# Storybook Documentation

## What is Storybook?

Storybook is a development environment for UI components. It allows you to:
- Browse a component library
- View different states of each component
- Interactively develop and test components
- Document your components automatically

## Getting Started

### Running Storybook

```bash
npm run storybook
```

This will start Storybook on `http://localhost:6006`

### Building Storybook

```bash
npm run build-storybook
```

This creates a static build of Storybook that can be deployed.

## Project Structure

```
.storybook/
├── main.js          # Storybook configuration
├── preview.js       # Global decorators and parameters
└── vitest.setup.js  # Test setup for Vitest

src/
├── components/
│   ├── login/
│   │   └── signupPage.stories.jsx    # Stories for signup page
│   └── projects/
│       └── shared/
│           └── projectCard.stories.jsx # Stories for project card
```

## Creating Stories

### Basic Story Structure

```jsx
import YourComponent from './YourComponent';

export default {
  title: 'Category/ComponentName',
  component: YourComponent,
  parameters: {
    docs: {
      description: {
        component: 'Description of your component',
      },
    },
  },
  argTypes: {
    // Define your props here
    propName: {
      description: 'Description of the prop',
      control: { type: 'text' }, // or 'select', 'boolean', etc.
    },
  },
  tags: ['autodocs'], // Auto-generate documentation
};

export const Default = {
  args: {
    // Your props here
  },
};
```

### Story Variants

Create multiple stories to show different states:

```jsx
export const Loading = {
  args: {
    loading: true,
  },
};

export const Error = {
  args: {
    error: 'Something went wrong',
  },
};
```

## Features Available

### 1. **Interactive Controls**
- Modify component props in real-time
- Test different states and configurations

### 2. **Accessibility Testing**
- Built-in a11y addon checks for accessibility issues
- View violations in the "Accessibility" tab

### 3. **Responsive Testing**
- Test components on different screen sizes
- Use the viewport toolbar to switch between devices

### 4. **Documentation**
- Auto-generated documentation from your stories
- Markdown support for detailed explanations

### 5. **Testing Integration**
- Vitest integration for component testing
- Run tests directly from Storybook

## Best Practices

### 1. **Organize Stories by Category**
```
title: 'Pages/SignUp'        // For page components
title: 'Components/Button'   // For reusable components
title: 'Forms/Input'         // For form elements
```

### 2. **Use Descriptive Names**
```jsx
export const WithLongText = { ... }
export const LoadingState = { ... }
export const ErrorState = { ... }
```

### 3. **Document Props Thoroughly**
```jsx
argTypes: {
  variant: {
    description: 'The visual style variant of the button',
    control: { type: 'select' },
    options: ['primary', 'secondary', 'danger'],
  },
}
```

### 4. **Add Context with Parameters**
```jsx
parameters: {
  docs: {
    description: {
      story: 'This story shows the component in a loading state',
    },
  },
  viewport: {
    defaultViewport: 'mobile1',
  },
}
```

## Useful Addons

- **@storybook/addon-a11y**: Accessibility testing
- **@storybook/addon-vitest**: Component testing
- **@storybook/addon-docs**: Enhanced documentation
- **@storybook/addon-controls**: Interactive controls

## Tips

1. **Use the Canvas tab** to interact with your components
2. **Use the Docs tab** to see auto-generated documentation
3. **Use the Accessibility tab** to check for a11y issues
4. **Use the Controls panel** to test different prop combinations
5. **Use the Viewport toolbar** to test responsive design

## Next Steps

1. Create stories for your existing components
2. Add more interactive controls for complex components
3. Write tests for your components using the Vitest integration
4. Customize the theme and branding of Storybook
5. Deploy Storybook for team collaboration

## Resources

- [Storybook Documentation](https://storybook.js.org/)
- [Storybook Addons](https://storybook.js.org/addons/)
- [Component Testing Guide](https://storybook.js.org/docs/writing-tests/) 
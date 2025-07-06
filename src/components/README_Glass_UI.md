# Glass Morphism UI Utilities

This document explains how to use the glass morphism utilities available in our design system.

## Available Glass Classes

### Primary Glass Effects

#### `.glass-primary`
- **Use for**: Main cards, primary containers
- **Effect**: Strong glass effect with gradient background
- **Properties**: 16px blur, 180% saturation, strong shadow

#### `.glass-secondary`
- **Use for**: Secondary containers, nested elements
- **Effect**: Medium glass effect
- **Properties**: 12px blur, 160% saturation, medium shadow

#### `.glass-tertiary`
- **Use for**: Subtle backgrounds, minor elements
- **Effect**: Light glass effect
- **Properties**: 8px blur, 140% saturation, light shadow

### Specialized Glass Components

#### `.glass-card`
- **Use for**: Main content cards
- **Effect**: Primary glass effect with rounded corners and hover animation
- **Features**: Built-in hover effects, pre-styled borders

#### `.glass-nav`
- **Use for**: Navigation elements
- **Effect**: Strong glass effect optimized for navigation
- **Properties**: 20px blur, 200% saturation

#### `.glass-modal`
- **Use for**: Modal dialogs, overlays
- **Effect**: Strongest glass effect for prominent overlays
- **Properties**: 24px blur, 200% saturation, strong shadow

#### `.glass-input`
- **Use for**: Form inputs
- **Effect**: Subtle glass effect with focus states
- **Features**: Built-in focus styling with accent color

#### `.glass-button`
- **Use for**: Buttons with glass effect
- **Effect**: Medium glass effect with hover animations
- **Features**: Built-in hover effects and transitions

### Utility Classes

#### `.glass-hover`
- **Use for**: Adding hover effects to existing glass elements
- **Effect**: Enhances borders and shadows on hover

## Usage Examples

### Basic Glass Card
```jsx
<div className="glass-card p-6">
  <h2>Card Title</h2>
  <p>Card content with beautiful glass morphism effect</p>
</div>
```

### Glass Navigation
```jsx
<nav className="glass-nav p-4">
  <button className="glass-button px-4 py-2">Home</button>
  <button className="glass-button px-4 py-2">About</button>
</nav>
```

### Glass Form
```jsx
<form className="glass-card p-8">
  <input 
    type="text" 
    className="glass-input w-full px-4 py-3 rounded-xl"
    placeholder="Enter your name"
  />
  <button className="glass-button px-6 py-3 rounded-xl">
    Submit
  </button>
</form>
```

### Glass Modal
```jsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm">
  <div className="glass-modal rounded-2xl p-8 max-w-md mx-auto">
    <h3>Modal Title</h3>
    <p>Modal content</p>
    <button className="glass-button">Close</button>
  </div>
</div>
```

## Theme Support

All glass utilities automatically adapt to light and dark themes:

- **Light Theme**: Uses white-based glass effects
- **Dark Theme**: Uses subtle white overlays on dark backgrounds

## Browser Support

Glass morphism effects use:
- `backdrop-filter` (modern browsers)
- `-webkit-backdrop-filter` (Safari support)
- Graceful degradation for older browsers

## Performance Notes

- Glass effects use GPU acceleration
- Animations respect `prefers-reduced-motion`
- Optimized for smooth 60fps performance

## Accessibility

- All glass elements maintain proper contrast ratios
- Focus states are clearly visible
- Compatible with screen readers
- Keyboard navigation friendly

## Best Practices

1. **Don't overuse**: Use glass effects sparingly for maximum impact
2. **Layer hierarchy**: Use different glass levels to create depth
3. **Content readability**: Ensure text remains readable on glass backgrounds
4. **Performance**: Avoid nesting too many glass elements
5. **Consistency**: Use the same glass level for similar UI elements

## Migration from Solid Backgrounds

Replace solid backgrounds with glass equivalents:

```jsx
// Before
<div className="bg-bg-card border border-border-secondary">

// After
<div className="glass-card">
```

```jsx
// Before
<button className="bg-bg-secondary hover:bg-bg-tertiary">

// After
<button className="glass-button">
``` 
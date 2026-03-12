import type { Preview } from '@storybook/sveltekit';

import '../src/app.css';

const themeItems = ['light', 'dark'];

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Force the preview theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: themeItems
      }
    }
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === 'dark' ? 'dark' : 'light';

      if (typeof document !== 'undefined') {
        const root = document.documentElement;

        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        root.style.colorScheme = theme;
      }

      return Story();
    }
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
		layout: 'fullscreen'
  }
};

export default preview;

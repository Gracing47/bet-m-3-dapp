# BETM3 Design-System Implementierung

Diese Dokumentation beschreibt, wie das BETM3 Design-System in der Praxis implementiert wird, mit Fokus auf Tailwind CSS Konfiguration und Best Practices.

## Tailwind Konfiguration

### 1. Farbpalette einrichten

Die Farbpalette des Design-Systems wird in der `tailwind.config.js` Datei definiert:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6', // Blau-500
          light: '#60A5FA',   // Blau-400
          dark: '#2563EB',    // Blau-600
        },
        secondary: {
          DEFAULT: '#10B981', // Grün-500
          light: '#34D399',   // Grün-400
          dark: '#059669',    // Grün-600
        },
        warning: '#F59E0B',   // Amber-500
        danger: '#EF4444',    // Rot-500
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
    },
  },
};
```

### 2. Typografie konfigurieren

```js
// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  theme: {
    extend: {
      // Farben hier...
      
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        // Anpassungen, falls nötig
      },
    },
  },
};
```

### 3. Schatten und Abstände

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      // Farben und Typografie hier...
      
      boxShadow: {
        // Anpassungen, falls nötig
      },
      spacing: {
        // Anpassungen, falls nötig
      },
    },
  },
};
```

## Komponenten-Implementierung

### 1. Button-Komponente

Unsere Button-Komponente verwendet die im Design-System definierten Varianten:

```tsx
// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    className = '',
    variant = 'primary', 
    size = 'md', 
    fullWidth = false,
    loading = false,
    icon,
    iconPosition = 'left',
    disabled,
    ...props 
  }, ref) => {
    // Basis-Styles
    let styles = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200';
    
    // Varianten-Styles
    if (variant === 'primary') {
      styles += ' bg-primary text-white hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2';
    } else if (variant === 'secondary') {
      styles += ' bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:ring-offset-2';
    } else if (variant === 'ghost') {
      styles += ' bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2';
    } else if (variant === 'danger') {
      styles += ' bg-danger text-white hover:bg-red-600 focus:ring-2 focus:ring-danger focus:ring-offset-2';
    }
    
    // Größen-Styles
    if (size === 'sm') {
      styles += ' text-sm px-3 py-1.5 h-8';
    } else if (size === 'md') {
      styles += ' text-sm px-4 py-2 h-10';
    } else if (size === 'lg') {
      styles += ' text-base px-5 py-2.5 h-12';
    }
    
    // Volle Breite
    if (fullWidth) {
      styles += ' w-full';
    }
    
    // Deaktiviert/Loading
    if (disabled || loading) {
      styles += ' opacity-50 cursor-not-allowed';
    }
    
    // Benutzerdefinierte Klasse
    styles += ` ${className}`;
    
    return (
      <button
        className={styles}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg 
            className="mr-2 h-4 w-4 animate-spin" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        
        {icon && iconPosition === 'left' && !loading && (
          <span className="mr-2">{icon}</span>
        )}
        
        {children}
        
        {icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 2. Card-Komponente

```tsx
// src/components/ui/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    children, 
    className = '', 
    shadow = 'md',
    padding = 'md',
    border = true,
    ...props 
  }, ref) => {
    // Basis-Styles
    let styles = 'bg-white rounded-lg';
    
    // Schatten-Styles
    if (shadow === 'none') {
      styles += '';
    } else if (shadow === 'sm') {
      styles += ' shadow-sm';
    } else if (shadow === 'md') {
      styles += ' shadow';
    } else if (shadow === 'lg') {
      styles += ' shadow-lg';
    }
    
    // Padding-Styles
    if (padding === 'none') {
      styles += '';
    } else if (padding === 'sm') {
      styles += ' p-3';
    } else if (padding === 'md') {
      styles += ' p-4';
    } else if (padding === 'lg') {
      styles += ' p-6';
    }
    
    // Border-Styles
    if (border) {
      styles += ' border border-gray-200';
    }
    
    // Benutzerdefinierte Klasse
    styles += ` ${className}`;
    
    return (
      <div
        ref={ref}
        className={styles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ 
  children, 
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => (
  <div className={`border-b border-gray-200 pb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ 
  children, 
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ 
  children, 
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => (
  <div className={`py-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ 
  children, 
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => (
  <div className={`border-t border-gray-200 pt-4 ${className}`} {...props}>
    {children}
  </div>
);
```

## Mobile-First Entwicklung

### 1. Responsive Layout-Beispiel

```tsx
// Beispiel für ein responsives Grid-Layout
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {bets.map(bet => (
    <BetCard key={bet.id} {...bet} />
  ))}
</div>
```

### 2. Container-Komponente

```tsx
// src/components/ui/Container.tsx
import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  padding?: boolean;
  centered?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  maxWidth = 'lg',
  padding = true,
  centered = true,
  ...props
}) => {
  let containerClass = '';
  
  // Max-Width-Klassen
  switch (maxWidth) {
    case 'xs':
      containerClass += ' max-w-xs';
      break;
    case 'sm':
      containerClass += ' max-w-sm';
      break;
    case 'md':
      containerClass += ' max-w-md';
      break;
    case 'lg':
      containerClass += ' max-w-lg';
      break;
    case 'xl':
      containerClass += ' max-w-xl';
      break;
    case '2xl':
      containerClass += ' max-w-2xl';
      break;
    case 'full':
      containerClass += ' max-w-full';
      break;
    case 'none':
      break;
    default:
      containerClass += ' max-w-lg';
  }
  
  // Padding
  if (padding) {
    containerClass += ' px-4 sm:px-6 md:px-8';
  }
  
  // Zentrierung
  if (centered) {
    containerClass += ' mx-auto';
  }
  
  return (
    <div
      className={`w-full ${containerClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
```

## Dark Mode (Zukünftige Implementierung)

Für die zukünftige Implementierung des Dark Mode können wir Tailwind's integrierte Dark Mode-Unterstützung nutzen:

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // oder 'media' für systembasiertes Dark Mode
  theme: {
    extend: {
      // ...
    },
  },
};
```

Beispiel für Dark Mode-Styling:

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Dieser Text passt sich dem Dark Mode an
</div>
```

## Performance-Optimierungen

### 1. JIT-Modus aktivieren

```js
// tailwind.config.js
module.exports = {
  mode: 'jit',
  // ...
};
```

### 2. PurgeCSS konfigurieren

```js
// tailwind.config.js
module.exports = {
  purge: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  // ...
};
```

### 3. Wiederholte Klassen mit @apply extrahieren

```css
/* In Ihrer globalen CSS-Datei */
@layer components {
  .card-hover {
    @apply hover:shadow-lg transition-all duration-200 hover:-translate-y-1;
  }
  
  .input-base {
    @apply w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary;
  }
}
```

## Ressourcen

- [Tailwind CSS Dokumentation](https://tailwindcss.com/docs)
- [Tailwind UI - Offizielle Komponenten](https://tailwindui.com)
- [Headless UI - Zugängliche UI-Komponenten](https://headlessui.dev)
- [Heroicons - Passende Icon-Bibliothek](https://heroicons.com) 
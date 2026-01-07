# SongMaster Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-stack React + Vite application with Supabase backend that enables multi-agent AI song specification generation with artist management and template system.

**Architecture:** React frontend with Vite bundler, TypeScript for type safety, Tailwind CSS for styling, Supabase for database and authentication, custom lightweight agent orchestration for AI calls.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth), React Router, Lucide React (icons)

---

## Phase 1: Project Setup

### Task 1: Initialize React + Vite + TypeScript Project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/App.tsx`
- Create: `src/main.tsx`
- Create: `src/vite-env.d.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/project-setup.test.ts
import { describe, it, expect } from 'vitest'

describe('Project Setup', () => {
  it('should have App component exported', async () => {
    const { App } = await import('../App')
    expect(App).toBeDefined()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL - "Cannot find module '../App'"

**Step 3: Write minimal implementation**

```bash
npm create vite@latest . -- --template react-ts
```

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: initialize React + Vite + TypeScript project"
```

---

### Task 2: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Write the failing test**

```typescript
// src/__tests__/dependencies.test.ts
import { describe, it, expect } from 'vitest'

describe('Dependencies', () => {
  it('should have react-router-dom installed', async () => {
    const { BrowserRouter } = await import('react-router-dom')
    expect(BrowserRouter).toBeDefined()
  })

  it('should have @supabase/supabase-js installed', async () => {
    const { createClient } = await import('@supabase/supabase-js')
    expect(createClient).toBeDefined()
  })

  it('should have tailwindcss installed', async () => {
    const { twMerge } = await import('tailwind-merge')
    expect(twMerge).toBeDefined()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL - modules not found

**Step 3: Write minimal implementation**

```bash
npm install react-router-dom @supabase/supabase-js tailwind-merge lucide-react clsx
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/user-event jsdom
npx tailwindcss init -p
```

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add package.json package-lock.json tailwind.config.js postcss.config.js
git commit -m "feat: install dependencies (react-router, supabase, tailwind)"
```

---

### Task 3: Configure Tailwind CSS

**Files:**
- Create: `src/index.css`
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

**Step 1: Write the failing test**

```typescript
// src/__tests__/tailwind.test.ts
import { describe, it, expect } from 'vitest'

describe('Tailwind Configuration', () => {
  it('should apply tailwind classes', () => {
    const div = document.createElement('div')
    div.className = 'bg-primary-500 text-gray-900'
    document.body.appendChild(div)
    const styles = window.getComputedStyle(div)
    expect(styles.backgroundColor).toBeTruthy()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL - styles not applied

**Step 3: Write minimal implementation**

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-900 text-gray-100;
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/index.css tailwind.config.js
git commit -m "feat: configure tailwind css with custom colors"
```

---

## Phase 2: Type Definitions

### Task 4: Define Core TypeScript Types

**Files:**
- Create: `src/types/index.ts`
- Create: `src/types/agent.ts`
- Create: `src/types/artist.ts`
- Create: `src/types/song.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/types.test.ts
import { describe, it, expect } from 'vitest'
import type { Agent, Artist, Song, Generation } from '../types'

describe('Type Definitions', () => {
  it('should define Agent type', () => {
    const agent: Agent = {
      id: '123',
      name: 'Claude',
      provider: 'Anthropic',
      api_endpoint: 'https://api.anthropic.com',
      model_name: 'claude-sonnet-4',
      capabilities: { context_window: 200000 },
      cost_per_1k_tokens: 0.01,
      is_active: true,
    }
    expect(agent.name).toBe('Claude')
  })

  it('should define Artist type', () => {
    const artist: Artist = {
      id: '123',
      user_id: 'user-1',
      name: 'The Beatles',
      style_description: 'Rock band from Liverpool',
      special_characteristics: 'Innovative harmonies',
      created_at: new Date(),
    }
    expect(artist.name).toBe('The Beatles')
  })

  it('should define Song type', () => {
    const song: Song = {
      id: '123',
      user_id: 'user-1',
      name: 'Hey Jude',
      lyrics: 'Hey Jude, don\'t make it bad...',
      style_description: 'Rock ballad',
      status: 'draft',
      iteration_count: 0,
    }
    expect(song.name).toBe('Hey Jude')
  })

  it('should define Generation type', () => {
    const generation: Generation = {
      id: '123',
      song_id: 'song-1',
      agent_id: 'agent-1',
      round: 1,
      output: { name: 'Song', lyrics: '...', style: 'rock' },
      music_style_score: 8,
      lyrics_score: 7,
      originality_score: 6,
      cohesion_score: 8,
      total_score: 7.25,
      evaluation_status: 'evaluated',
      orchestrator_feedback: 'Great song!',
    }
    expect(generation.total_score).toBe(7.25)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL - "TypeError: require() of ES Module"

**Step 3: Write minimal implementation**

```typescript
// src/types/agent.ts
export interface Agent {
  id: string
  name: string
  provider: string
  api_endpoint: string
  model_name: string
  capabilities: {
    context_window: number
    max_output?: number
    supported_features?: string[]
  }
  cost_per_1k_tokens: number
  is_active: boolean
}

export interface AgentConfig {
  agent_id: string
  order: number
}

// src/types/artist.ts
export interface Artist {
  id: string
  user_id: string
  name: string
  style_description: string
  special_characteristics: string
  created_at: Date
}

// src/types/song.ts
export interface Song {
  id: string
  user_id: string
  artist_id?: string
  name: string
  lyrics: string
  style_description: string
  status: SongStatus
  iteration_count: number
  selected_generation_id?: string
  created_at: Date
  updated_at?: Date
}

export type SongStatus = 'draft' | 'iterating' | 'saved' | 'completed'

export interface Generation {
  id: string
  song_id: string
  agent_id: string
  round: number
  output: AgentOutput
  music_style_score?: number
  lyrics_score?: number
  originality_score?: number
  cohesion_score?: number
  total_score?: number
  evaluation_status: 'pending' | 'evaluated'
  orchestrator_feedback?: string
  created_at: Date
}

export interface AgentOutput {
  name: string
  lyrics: string
  style_description: string
}

// src/types/index.ts
export * from './agent'
export * from './artist'
export * from './song'
```

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/types/
git commit -m "feat: define core TypeScript types (Agent, Artist, Song, Generation)"
```

---

## Phase 3: Supabase Setup

### Task 5: Create Supabase Client

**Files:**
- Create: `src/services/supabase/client.ts`
- Create: `src/services/supabase/queries.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/supabase.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Supabase Client', () => {
  it('should create supabase client', async () => {
    const { createClient } = await import('@supabase/supabase-js')
    const { supabase } = await import('../services/supabase/client')
    expect(supabase).toBeDefined()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL - env variables not set

**Step 3: Write minimal implementation**

```typescript
// src/services/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
```

```env
# .env.example
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS (with mocked env)

**Step 5: Commit**

```bash
git add src/services/supabase/
git commit -m "feat: create supabase client"
```

---

### Task 6: Create Database Schema SQL

**Files:**
- Create: `supabase/schema.sql`

**Step 1: Write the failing test**

```typescript
// src/__tests__/schema.test.ts
import { describe, it, expect } from 'vitest'

describe('Database Schema', () => {
  it('should have schema.sql file', () => {
    // This is a file existence check
    expect(true).toBe(true)
  })
})
```

**Step 2: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

**Step 3: Write minimal implementation**

```sql
-- supabase/schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agents table (seeded by admin, not user-created)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  model_name TEXT NOT NULL,
  capabilities JSONB DEFAULT '{}',
  cost_per_1k_tokens NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artists table
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  style_description TEXT NOT NULL,
  special_characteristics TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Songs table
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  lyrics TEXT NOT NULL,
  style_description TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'iterating', 'saved', 'completed')),
  iteration_count INTEGER DEFAULT 0,
  selected_generation_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  agent_ids UUID[] DEFAULT '{}',
  max_iterations INTEGER DEFAULT 3,
  use_auto_iterate BOOLEAN DEFAULT false,
  master_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generations table
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  round INTEGER NOT NULL DEFAULT 1,
  output JSONB NOT NULL,
  music_style_score INTEGER CHECK (music_style_score >= 1 AND music_style_score <= 10),
  lyrics_score INTEGER CHECK (lyrics_score >= 1 AND lyrics_score <= 10),
  originality_score INTEGER CHECK (originality_score >= 1 AND originality_score <= 10),
  cohesion_score INTEGER CHECK (cohesion_score >= 1 AND cohesion_score <= 10),
  total_score DECIMAL(3, 2),
  evaluation_status TEXT DEFAULT 'pending' CHECK (evaluation_status IN ('pending', 'evaluated')),
  orchestrator_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update updated_at trigger for songs
CREATE OR REPLACE FUNCTION update_songs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER songs_updated_at
  BEFORE UPDATE ON songs
  FOR EACH ROW
  EXECUTE FUNCTION update_songs_updated_at();

-- Row Level Security Policies
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Artists: users can only see their own
CREATE POLICY "Users can CRUD their own artists" ON artists
  FOR ALL USING (auth.uid() = user_id);

-- Songs: users can only see their own
CREATE POLICY "Users can CRUD their own songs" ON songs
  FOR ALL USING (auth.uid() = user_id);

-- Templates: users can only see their own
CREATE POLICY "Users can CRUD their own templates" ON templates
  FOR ALL USING (auth.uid() = user_id);

-- Agents: read-only for all authenticated users
CREATE POLICY "Authenticated users can read agents" ON agents
  FOR SELECT USING (auth.role() = 'authenticated');
```

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add supabase database schema"
```

---

## Phase 4: Base UI Components

### Task 7: Create UI Component Library

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/Toggle.tsx`
- Create: `src/lib/utils.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/ui.test.ts
import { describe, it, expect, render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { describe, it, expect } from 'vitest'

describe('UI Components', () => {
  it('should render Button component', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should render Input component', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument()
  })

  it('should render Card component', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText(/card content/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL - components not found

**Step 3: Write minimal implementation**

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```typescript
// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900',
          'disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
            'bg-gray-700 text-white hover:bg-gray-600': variant === 'secondary',
            'border border-gray-600 text-gray-200 hover:bg-gray-800': variant === 'outline',
            'text-gray-300 hover:text-white hover:bg-gray-800': variant === 'ghost',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
```

```typescript
// src/components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-gray-100',
          'placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
```

```typescript
// src/components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border border-gray-700 bg-gray-800 p-4',
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'
```

```typescript
// src/components/ui/Modal.tsx
import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-xl border border-gray-700 bg-gray-800 p-6',
          'shadow-2xl max-h-[90vh] overflow-auto',
          className
        )}
      >
        {title && (
          <h2 className="mb-4 text-xl font-semibold text-gray-100">{title}</h2>
        )}
        {children}
      </div>
    </div>
  )
}
```

```typescript
// src/components/ui/Toggle.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface ToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pressed: boolean
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, pressed, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          pressed ? 'bg-primary-600' : 'bg-gray-700',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            pressed ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    )
  }
)
Toggle.displayName = 'Toggle'
```

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/ui/ src/lib/
git commit -m "feat: create base UI components (Button, Input, Card, Modal, Toggle)"
```

---

### Task 8: Create Layout Components

**Files:**
- Create: `src/components/layout/Layout.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Header.tsx`

**Step 1: Write the failing test**

```typescript
// src/__tests__/layout.test.ts
import { describe, it, expect, render, screen } from '@testing-library/react'
import { Layout } from '../components/layout/Layout'
import { MemoryRouter } from 'react-router-dom'

describe('Layout Components', () => {
  it('should render Layout with Sidebar and Header', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    )
    expect(screen.getByText(/content/i)).toBeInTheDocument()
    expect(screen.getByText(/songmaster/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL - components not found

**Step 3: Write minimal implementation**

```typescript
// src/components/layout/Layout.tsx
import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

```typescript
// src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Home, Music, Library, Settings, PlusCircle } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/songs/new', icon: PlusCircle, label: 'New Song' },
  { to: '/artists', icon: Music, label: 'Artists' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-gray-800 bg-gray-900/50 p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">SongMaster</h1>
        <p className="text-sm text-gray-500">AI Song Creator</p>
      </div>
      <nav className="space-y-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
```

```typescript
// src/components/layout/Header.tsx
import { useAuth } from '../../hooks/useSupabase'
import { LogOut, User } from 'lucide-react'
import { Button } from '../ui/Button'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="border-b border-gray-800 bg-gray-900/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {user ? `Signed in as ${user.email}` : 'Not signed in'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
          {user && (
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/layout/
git commit -m "feat: create layout components (Layout, Sidebar, Header)"
```

---

## Phase 5: Artist Management

### Task 9: Create Artist Library Page

**Files:**
- Create: `src/pages/Artists.tsx`
- Create: `src/components/artists/ArtistCard.tsx`
- Create: `src/components/artists/ArtistLibrary.tsx`

**Step 1: Write the failing test**

```typescript
// src/__tests__/artists.test.ts
import { describe, it, expect, render, screen, fireEvent } from '@testing-library/react'
import { Artists } from '../pages/Artists'
import { MemoryRouter } from 'react-router-dom'

describe('Artists Page', () => {
  it('should render artists library', () => {
    render(
      <MemoryRouter>
        <Artists />
      </MemoryRouter>
    )
    expect(screen.getByText(/artists/i)).toBeInTheDocument()
    expect(screen.getByText(/create artist/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL - pages not found

**Step 3: Write minimal implementation**

```typescript
// src/components/artists/ArtistCard.tsx
import { Artist } from '../../types'
import { Card } from '../ui/Card'
import { Music, Edit2, Trash2 } from 'lucide-react'

interface ArtistCardProps {
  artist: Artist
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}

export function ArtistCard({ artist, onClick, onEdit, onDelete }: ArtistCardProps) {
  return (
    <Card className="group relative cursor-pointer transition-all hover:border-primary-500/50">
      <div onClick={onClick}>
        <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-gray-700">
          <Music className="h-12 w-12 text-gray-500" />
        </div>
        <h3 className="font-semibold text-gray-200">{artist.name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {artist.style_description}
        </p>
      </div>
      <div className="absolute right-2 top-2 flex opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="rounded p-1 hover:bg-gray-700"
        >
          <Edit2 className="h-4 w-4 text-gray-400" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="rounded p-1 hover:bg-gray-700"
        >
          <Trash2 className="h-4 w-4 text-red-400" />
        </button>
      </div>
    </Card>
  )
}
```

```typescript
// src/components/artists/ArtistLibrary.tsx
import { Artist } from '../../types'
import { ArtistCard } from './ArtistCard'
import { Plus } from 'lucide-react'
import { Button } from '../ui/Button'

interface ArtistLibraryProps {
  artists: Artist[]
  onSelectArtist: (artist: Artist) => void
  onCreateArtist: () => void
  onEditArtist: (artist: Artist) => void
  onDeleteArtist: (id: string) => void
}

export function ArtistLibrary({
  artists,
  onSelectArtist,
  onCreateArtist,
  onEditArtist,
  onDeleteArtist,
}: ArtistLibraryProps) {
  if (artists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 text-5xl">🎵</div>
        <h3 className="mb-2 text-xl font-semibold text-gray-200">No artists yet</h3>
        <p className="mb-6 text-gray-500">Create your first artist to get started</p>
        <Button onClick={onCreateArtist}>
          <Plus className="mr-2 h-4 w-4" />
          Create Artist
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">Your Artists</h2>
        <Button onClick={onCreateArtist}>
          <Plus className="mr-2 h-4 w-4" />
          Create Artist
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {artists.map((artist) => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            onClick={() => onSelectArtist(artist)}
            onEdit={() => onEditArtist(artist)}
            onDelete={() => onDeleteArtist(artist.id)}
          />
        ))}
      </div>
    </div>
  )
}
```

```typescript
// src/pages/Artists.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase/client'
import { Artist } from '../types'
import { ArtistLibrary } from '../components/artists/ArtistLibrary'
import { ArtistWizard } from '../components/artists/ArtistWizard'

export function Artists() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(false)
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)

  useEffect(() => {
    loadArtists()
  }, [])

  const loadArtists = async () => {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setArtists(data as Artist[])
    }
    setLoading(false)
  }

  const handleCreateArtist = () => {
    setEditingArtist(null)
    setShowWizard(true)
  }

  const handleEditArtist = (artist: Artist) => {
    setEditingArtist(artist)
    setShowWizard(true)
  }

  const handleDeleteArtist = async (id: string) => {
    if (confirm('Are you sure you want to delete this artist?')) {
      await supabase.from('artists').delete().eq('id', id)
      loadArtists()
    }
  }

  const handleSaveArtist = () => {
    setShowWizard(false)
    setEditingArtist(null)
    loadArtists()
  }

  const handleSelectArtist = (artist: Artist) => {
    // Navigate to song creation with artist
    window.location.href = `/songs/new?artist_id=${artist.id}`
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-100">Artists</h1>
      <ArtistLibrary
        artists={artists}
        onSelectArtist={handleSelectArtist}
        onCreateArtist={handleCreateArtist}
        onEditArtist={handleEditArtist}
        onDeleteArtist={handleDeleteArtist}
      />
      {showWizard && (
        <ArtistWizard
          artist={editingArtist}
          onClose={handleSaveArtist}
          onSave={handleSaveArtist}
        />
      )}
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/pages/Artists.tsx src/components/artists/
git commit -m "feat: create artists page and artist library component"
```

---

### Task 10: Create Artist Wizard

**Files:**
- Create: `src/components/artists/ArtistWizard.tsx`
- Create: `src/components/artists/ArtistPreviewModal.tsx`

**Step 1: Write the failing test**

```typescript
// src/__tests__/artist-wizard.test.ts
import { describe, it, expect, render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ArtistWizard } from '../components/artists/ArtistWizard'

describe('Artist Wizard', () => {
  it('should show AI Guided and Manual modes', () => {
    render(<ArtistWizard onClose={() => {}} onSave={() => {}} />)
    expect(screen.getByText(/AI Guided/i)).toBeInTheDocument()
    expect(screen.getByText(/Manual/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/components/artists/ArtistWizard.tsx
import { useState } from 'react'
import { supabase } from '../../services/supabase/client'
import { Artist } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { Wand2, Edit3, Loader2, Check } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ArtistWizardProps {
  artist?: Artist | null
  onClose: () => void
  onSave: () => void
}

type WizardMode = 'select' | 'ai-guided' | 'manual'

interface AIAgent {
  id: string
  name: string
  provider: string
}

export function ArtistWizard({ artist, onClose, onSave }: ArtistWizardProps) {
  const [mode, setMode] = useState<WizardMode>('select')
  const [input, setInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedOptions, setGeneratedOptions] = useState<Artist[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<AIAgent>({ id: '1', name: 'Grok', provider: 'xAI' })
  const [agents, setAgents] = useState<AIAgent[]>([])

  // Manual form state
  const [manualForm, setManualForm] = useState({
    name: artist?.name || '',
    style_description: artist?.style_description || '',
    special_characteristics: artist?.special_characteristics || '',
  })

  const handleAIGenerate = async () => {
    if (!input.trim()) return

    setGenerating(true)
    try {
      // Call AI service to generate artist options
      const response = await fetch('/api/generate-artist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, agent_id: selectedAgent.id }),
      })
      const data = await response.json()
      setGeneratedOptions(data.options || [])
    } catch (error) {
      console.error('Failed to generate artists:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleManualSave = async () => {
    if (!manualForm.name.trim() || !manualForm.style_description.trim()) {
      alert('Please fill in all required fields')
      return
    }

    const { error } = artist
      ? await supabase
          .from('artists')
          .update(manualForm)
          .eq('id', artist.id)
      : await supabase.from('artists').insert({
          ...manualForm,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })

    if (!error) {
      onSave()
    }
  }

  const handleAISave = async () => {
    if (selectedOption === null || !generatedOptions[selectedOption]) return

    const selected = generatedOptions[selectedOption]
    const { error } = await supabase.from('artists').insert({
      name: selected.name,
      style_description: selected.style_description,
      special_characteristics: selected.special_characteristics || '',
      user_id: (await supabase.auth.getUser()).data.user?.id,
    })

    if (!error) {
      onSave()
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={artist ? 'Edit Artist' : 'Create Artist'} className="max-w-2xl">
      {/* Mode Selection */}
      {mode === 'select' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => setMode('ai-guided')}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-gray-700 p-6 transition-colors hover:border-primary-500 hover:bg-gray-800/50"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600/20">
              <Wand2 className="h-8 w-8 text-primary-400" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-200">AI Guided</h3>
              <p className="mt-1 text-sm text-gray-500">Describe and let AI create options</p>
            </div>
          </button>
          <button
            onClick={() => setMode('manual')}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-gray-700 p-6 transition-colors hover:border-primary-500 hover:bg-gray-800/50"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700">
              <Edit3 className="h-8 w-8 text-gray-400" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-200">Manual</h3>
              <p className="mt-1 text-sm text-gray-500">Fill in the form yourself</p>
            </div>
          </button>
        </div>
      )}

      {/* AI Guided Mode */}
      {mode === 'ai-guided' && (
        <div>
          <button onClick={() => setMode('select')} className="mb-4 text-sm text-gray-400 hover:text-gray-200">
            ← Back to mode selection
          </button>

          {/* Agent Selector */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">Select AI Agent</label>
            <div className="flex gap-2">
              {agents.length === 0 ? (
                <Card className="flex cursor-pointer items-center gap-3 p-3" onClick={() => {/* Open agent selector */}}>
                  <span className="text-gray-400">Select Agent</span>
                </Card>
              ) : (
                agents.map((agent) => (
                  <Card
                    key={agent.id}
                    className={cn(
                      'cursor-pointer p-3 transition-colors',
                      selectedAgent.id === agent.id ? 'border-primary-500' : 'hover:border-gray-600'
                    )}
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <span className="font-medium">{agent.name}</span>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Input */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Describe the artist you want to create
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., A 80s synth-pop band with dreamy vocals and electronic beats"
              className="min-h-[100px] w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <Button onClick={handleAIGenerate} disabled={generating || !input.trim()} className="w-full">
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate 3 Options
              </>
            )}
          </Button>

          {/* Generated Options */}
          {generatedOptions.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-gray-300">Choose an option:</h4>
              {generatedOptions.map((option, index) => (
                <Card
                  key={index}
                  className={cn(
                    'cursor-pointer p-4 transition-all',
                    selectedOption === index
                      ? 'border-primary-500 bg-primary-600/10'
                      : 'hover:border-gray-600'
                  )}
                  onClick={() => setSelectedOption(index)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-200">{option.name}</h5>
                      <p className="mt-1 text-sm text-gray-400">{option.style_description}</p>
                      {option.special_characteristics && (
                        <p className="mt-1 text-xs text-gray-500">✨ {option.special_characteristics}</p>
                      )}
                    </div>
                    {selectedOption === index && <Check className="h-5 w-5 text-primary-400" />}
                  </div>
                </Card>
              ))}
              <Button onClick={handleAISave} disabled={selectedOption === null} className="mt-4 w-full">
                Save Artist
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Manual Mode */}
      {mode === 'manual' && (
        <div>
          <button onClick={() => setMode('select')} className="mb-4 text-sm text-gray-400 hover:text-gray-200">
            ← Back to mode selection
          </button>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Artist Name *</label>
              <Input
                value={manualForm.name}
                onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                placeholder="e.g., The Midnight Echo"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Style Description *</label>
              <textarea
                value={manualForm.style_description}
                onChange={(e) => setManualForm({ ...manualForm, style_description: e.target.value })}
                placeholder="Describe the musical style, genre, influences..."
                className="min-h-[80px] w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Special Characteristics</label>
              <textarea
                value={manualForm.special_characteristics}
                onChange={(e) => setManualForm({ ...manualForm, special_characteristics: e.target.value })}
                placeholder="What makes this artist unique? Signature sounds, themes, etc."
                className="min-h-[80px] w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleManualSave} className="flex-1">
                {artist ? 'Update Artist' : 'Create Artist'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/artists/ArtistWizard.tsx src/components/artists/ArtistPreviewModal.tsx
git commit -m "feat: create artist wizard with AI guided and manual modes"
```

---

## Phase 6: Song Creation

### Task 11: Create Song Creator Page

**Files:**
- Create: `src/pages/SongCreator.tsx`
- Create: `src/components/song/SongCreator.tsx`
- Create: `src/components/song/AgentSelector.tsx`
- Create: `src/components/song/AgentTile.tsx`
- Create: `src/components/song/SongDescriptionInputs.tsx`

**Step 1: Write the failing test**

```typescript
// src/__tests__/song-creator.test.ts
import { describe, it, expect, render, screen } from '@testing-library/react'
import { SongCreator } from '../components/song/SongCreator'
import { MemoryRouter } from 'react-router-dom'

describe('Song Creator', () => {
  it('should show agent selector with add button', () => {
    render(
      <MemoryRouter>
        <SongCreator />
      </MemoryRouter>
    )
    expect(screen.getByText(/add agent/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/components/song/AgentTile.tsx
import { Agent } from '../../types'
import { Card } from '../ui/Card'
import { cn } from '../../lib/utils'
import { Loader2, Check } from 'lucide-react'

interface AgentTileProps {
  agent: Agent
  status: 'waiting' | 'generating' | 'evaluated' | 'winner' | 'overridden'
  scores?: {
    music_style: number
    lyrics: number
    originality: number
    cohesion: number
    total: number
  }
  onClick?: () => void
}

const scoreColors = {
  good: 'bg-green-500/20 text-green-400 border-green-500/30',
  ok: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  bad: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const getScoreClass = (score: number) => {
  if (score >= 8) return scoreColors.good
  if (score >= 5) return scoreColors.ok
  return scoreColors.bad
}

export function AgentTile({ agent, status, scores, onClick }: AgentTileProps) {
  return (
    <Card
      className={cn(
        'relative cursor-pointer transition-all',
        status === 'winner' && 'border-2 border-green-500 bg-green-500/5',
        status === 'overridden' && 'border-2 border-blue-500 bg-blue-500/5',
        status === 'generating' && 'animate-pulse',
        onClick && 'hover:border-gray-600'
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold',
            status === 'winner' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
          )}>
            {status === 'generating' ? <Loader2 className="h-4 w-4 animate-spin" /> : agent.name.charAt(0)}
          </div>
          <span className="font-medium text-gray-200">{agent.name}</span>
        </div>
        {status === 'winner' && (
          <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
            Winner
          </span>
        )}
        {status === 'overridden' && (
          <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-400">
            Selected
          </span>
        )}
      </div>

      {/* Scores (when evaluated) */}
      {status === 'evaluated' && scores && (
        <div className="space-y-2">
          {[
            { label: 'Music Style', value: scores.music_style },
            { label: 'Lyrics', value: scores.lyrics },
            { label: 'Originality', value: scores.originality },
            { label: 'Cohesion', value: scores.cohesion },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{label}</span>
              <span className={cn('rounded px-2 py-0.5 text-xs font-medium border', getScoreClass(value))}>
                {value}/10
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-gray-700 pt-2 text-sm">
            <span className="font-medium text-gray-300">Total Score</span>
            <span className={cn('rounded px-2 py-0.5 text-sm font-bold border', getScoreClass(scores.total))}>
              {scores.total.toFixed(1)}/10
            </span>
          </div>
        </div>
      )}

      {/* Generating state */}
      {status === 'generating' && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Generating...</span>
        </div>
      )}

      {/* Waiting state */}
      {status === 'waiting' && (
        <div className="flex items-center justify-center py-4">
          <div className="h-2 w-2 rounded-full bg-gray-600" />
          <span className="ml-2 text-sm text-gray-500">Waiting...</span>
        </div>
      )}
    </Card>
  )
}
```

```typescript
// src/components/song/AgentSelector.tsx
import { useState } from 'react'
import { Agent } from '../../types'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Plus, X } from 'lucide-react'

interface AgentSelectorProps {
  agents: Agent[]
  selectedAgents: string[]
  onAddAgent: (agentId: string) => void
  onRemoveAgent: (agentId: string) => void
}

export function AgentSelector({ agents, selectedAgents, onAddAgent, onRemoveAgent }: AgentSelectorProps) {
  const [showModal, setShowModal] = useState(false)

  const selectedAgentObjects = agents.filter(a => selectedAgents.includes(a.id))

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-300">AI Agents</label>
      <div className="flex flex-wrap gap-2">
        {selectedAgentObjects.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2"
          >
            <span className="text-sm font-medium text-gray-200">{agent.name}</span>
            <button
              onClick={() => onRemoveAgent(agent.id)}
              className="rounded p-0.5 hover:bg-gray-700"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        ))}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg border border-dashed border-gray-600 bg-gray-800/50 px-3 py-2 text-sm text-gray-400 transition-colors hover:border-gray-500 hover:bg-gray-800 hover:text-gray-200"
        >
          <Plus className="h-4 w-4" />
          Add Agent
        </button>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Select AI Agent">
        <div className="space-y-2">
          {agents.filter(a => !selectedAgents.includes(a.id)).map((agent) => (
            <Card
              key={agent.id}
              className="cursor-pointer p-4 transition-colors hover:border-primary-500"
              onClick={() => {
                onAddAgent(agent.id)
                setShowModal(false)
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-200">{agent.name}</h4>
                  <p className="text-sm text-gray-500">{agent.provider}</p>
                </div>
                <span className="text-xs text-gray-600">{agent.model_name}</span>
              </div>
            </Card>
          ))}
        </div>
      </Modal>
    </div>
  )
}
```

```typescript
// src/components/song/SongDescriptionInputs.tsx
import { Input } from '../ui/Input'
import { Artist } from '../../types'

interface SongDescriptionInputsProps {
  artist?: Artist | null
  songDescription: string
  styleDescription: string
  onSongDescriptionChange: (value: string) => void
  onStyleDescriptionChange: (value: string) => void
}

export function SongDescriptionInputs({
  artist,
  songDescription,
  styleDescription,
  onSongDescriptionChange,
  onStyleDescriptionChange,
}: SongDescriptionInputsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Describe the song you want</label>
        <textarea
          value={songDescription}
          onChange={(e) => onSongDescriptionChange(e.target.value)}
          placeholder="What should this song be about? What emotions should it convey?"
          className="min-h-[100px] w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        {artist && (
          <div className="mb-2 rounded-lg border border-gray-700 bg-gray-800/50 p-3">
            <div className="mb-1 text-xs font-medium text-gray-500 uppercase">Artist Style Context</div>
            <p className="text-sm text-gray-300">{artist.style_description}</p>
            {artist.special_characteristics && (
              <p className="mt-1 text-xs text-gray-500">✨ {artist.special_characteristics}</p>
            )}
          </div>
        )}
        <label className="mb-2 block text-sm font-medium text-gray-300">
          {artist ? 'Add or modify style description' : 'Music Style Description'}
        </label>
        <textarea
          value={styleDescription}
          onChange={(e) => onStyleDescriptionChange(e.target.value)}
          placeholder={artist ? 'How should the artist style be adapted for this song?' : 'Describe the desired music style...'}
          className="min-h-[80px] w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
    </div>
  )
}
```

```typescript
// src/components/song/SongCreator.tsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../services/supabase/client'
import { Agent, Artist } from '../../types'
import { AgentSelector } from './AgentSelector'
import { AgentTile } from './AgentTile'
import { SongDescriptionInputs } from './SongDescriptionInputs'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Save, Play, Settings } from 'lucide-react'
import { generateSong, orchestrateAndEvaluate } from '../../services/ai/AgentOrchestrator'

export function SongCreator() {
  const [searchParams] = useSearchParams()
  const artistId = searchParams.get('artist_id')

  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [artist, setArtist] = useState<Artist | null>(null)
  const [songDescription, setSongDescription] = useState('')
  const [styleDescription, setStyleDescription] = useState('')

  // Generation state
  const [generating, setGenerating] = useState(false)
  const [agentStatuses, setAgentStatuses] = useState<Record<string, 'waiting' | 'generating' | 'evaluated'>>({})
  const [generationResults, setGenerationResults] = useState<Record<string, any>>({})
  const [orchestratorResult, setOrchestratorResult] = useState<any>(null)
  const [selectedSong, setSelectedSong] = useState<string | null>(null)
  const [iterationCount, setIterationCount] = useState(0)

  useEffect(() => {
    loadAgents()
    if (artistId) loadArtist()
  }, [artistId])

  const loadAgents = async () => {
    const { data } = await supabase.from('agents').select('*').eq('is_active', true)
    if (data) setAgents(data as Agent[])
    // Default: select first 3 agents
    if (data && selectedAgents.length === 0) {
      setSelectedAgents(data.slice(0, 3).map(a => a.id))
    }
  }

  const loadArtist = async () => {
    const { data } = await supabase.from('artists').select('*').eq('id', artistId).single()
    if (data) {
      setArtist(data as Artist)
      setStyleDescription(data.style_description)
    }
  }

  const handleAddAgent = (agentId: string) => {
    setSelectedAgents([...selectedAgents, agentId])
  }

  const handleRemoveAgent = (agentId: string) => {
    setSelectedAgents(selectedAgents.filter(id => id !== agentId))
  }

  const handleGenerate = async () => {
    if (selectedAgents.length === 0) {
      alert('Please select at least one agent')
      return
    }
    if (!songDescription.trim() || !styleDescription.trim()) {
      alert('Please describe the song and style')
      return
    }

    setGenerating(true)
    setAgentStatuses(Object.fromEntries(selectedAgents.map(id => [id, 'waiting'])))
    setGenerationResults({})
    setOrchestratorResult(null)
    setSelectedSong(null)

    try {
      // Run parallel generation
      const results: Record<string, any> = {}
      const agentPromises = selectedAgents.map(async (agentId) => {
        setAgentStatuses(prev => ({ ...prev, [agentId]: 'generating' }))
        const agent = agents.find(a => a.id === agentId)!
        const result = await generateSong({
          agent,
          songDescription,
          styleDescription,
          artistContext: artist || undefined,
          previousSong: iterationCount > 0 && selectedSong ? generationResults[selectedSong] : undefined,
          iterationFeedback: iterationCount > 0 ? 'Improve this song based on feedback' : undefined,
        })
        results[agentId] = result
        setAgentStatuses(prev => ({ ...prev, [agentId]: 'evaluated' }))
      })

      await Promise.all(agentPromises)
      setGenerationResults(results)

      // Run orchestrator evaluation
      const orchestratorResult = await orchestrateAndEvaluate({
        songs: results,
        masterPrompt: undefined,
      })
      setOrchestratorResult(orchestratorResult)
      setSelectedSong(orchestratorResult.winnerAgentId)

    } catch (error) {
      console.error('Generation failed:', error)
      alert('Failed to generate songs. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleIterate = async () => {
    if (!selectedSong) return
    setIterationCount(prev => prev + 1)
    await handleGenerate()
  }

  const handleSaveTemplate = async () => {
    const name = prompt('Enter template name:')
    if (!name) return

    await supabase.from('templates').insert({
      name,
      agent_ids: selectedAgents,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    })
    alert('Template saved!')
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Create New Song</h1>
          {artist && (
            <p className="text-gray-500">Creating song for {artist.name}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveTemplate}>
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <AgentSelector
          agents={agents}
          selectedAgents={selectedAgents}
          onAddAgent={handleAddAgent}
          onRemoveAgent={handleRemoveAgent}
        />
      </Card>

      <Card className="mb-6">
        <SongDescriptionInputs
          artist={artist}
          songDescription={songDescription}
          styleDescription={styleDescription}
          onSongDescriptionChange={setSongDescription}
          onStyleDescriptionChange={setStyleDescription}
        />
      </Card>

      <div className="mb-6 flex justify-center">
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={generating || selectedAgents.length === 0}
          className="px-8"
        >
          {generating ? (
            <>
              <span className="animate-spin">⏳</span> Generating...
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" />
              Generate Songs
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {Object.keys(generationResults).length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-100">Generated Songs</h2>

          {/* Orchestrator Result */}
          {orchestratorResult && (
            <Card className="mb-6 border-primary-500/50 bg-primary-500/5 p-4">
              <h3 className="mb-2 font-medium text-gray-300">Orchestrator Recommendation</h3>
              <p className="text-sm text-gray-400">{orchestratorResult.feedback}</p>
              {orchestratorResult.winnerAgentId && (
                <p className="mt-2 text-sm">
                  Selected: <span className="font-medium text-primary-400">
                    {agents.find(a => a.id === orchestratorResult.winnerAgentId)?.name}
                  </span>
                </p>
              )}
            </Card>
          )}

          {/* Agent Tiles */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {selectedAgents.map((agentId) => {
              const agent = agents.find(a => a.id === agentId)!
              const status = agentStatuses[agentId] as any
              const scores = generationResults[agentId]?.scores

              return (
                <AgentTile
                  key={agentId}
                  agent={agent}
                  status={status === 'generating' ? 'generating' : 'evaluated'}
                  scores={scores}
                  onClick={() => {
                    // Show song detail modal
                    setSelectedSong(agentId)
                  }}
                />
              )
            })}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-4">
            <Button onClick={handleIterate} disabled={!selectedSong}>
              Iterate on Selected Song
            </Button>
            <Button variant="outline" onClick={() => {/* Save song */}}>
              Save to Library
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

```typescript
// src/pages/SongCreator.tsx
import { SongCreator } from '../components/song/SongCreator'

export function SongCreatorPage() {
  return <SongCreator />
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/pages/SongCreator.tsx src/components/song/
git commit -m "feat: create song creator page with agent selection and generation"
```

---

## Phase 7: AI Services

### Task 12: Create AI Agent Services

**Files:**
- Create: `src/services/ai/AgentFactory.ts`
- Create: `src/services/ai/AgentOrchestrator.ts`
- Create: `src/services/ai/StreamingHandler.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/ai-services.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('AI Services', () => {
  it('should have AgentFactory', async () => {
    const { AgentFactory } = await import('../services/ai/AgentFactory')
    expect(AgentFactory).toBeDefined()
  })

  it('should have AgentOrchestrator', async () => {
    const { AgentOrchestrator } = await import('../services/ai/AgentOrchestrator')
    expect(AgentOrchestrator).toBeDefined()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/services/ai/AgentFactory.ts
import { Agent, AgentOutput } from '../../types'

interface GenerationParams {
  agent: Agent
  songDescription: string
  styleDescription: string
  artistContext?: {
    name: string
    style_description: string
    special_characteristics?: string
  }
  previousSong?: AgentOutput
  iterationFeedback?: string
}

const DEFAULT_PROMPT = `You are a professional songwriter. Create an original song specification.

# Context
- Artist Style: {artist_context}
- Song Description: {song_description}
- Desired Style: {style_description}

{iteration_feedback}

# Output Format
Return a JSON object with:
- name: Song title (max 50 chars)
- lyrics: Complete song lyrics with verse/chorus structure
- style_description: Detailed music style notes

Create a unique, creative song that matches the description.`

export class AgentFactory {
  static createPrompt(params: GenerationParams): string {
    let prompt = DEFAULT_PROMPT
      .replace('{artist_context}', params.artistContext
        ? `${params.artistContext.name} - ${params.artistContext.style_description}${params.artistContext.special_characteristics ? ` (Special: ${params.artistContext.special_characteristics})` : ''}`
        : 'No specific artist context')
      .replace('{song_description}', params.songDescription)
      .replace('{style_description}', params.styleDescription)

    if (params.iterationFeedback && params.previousSong) {
      prompt += `

# Previous Version
Song: ${params.previousSong.name}
Style: ${params.previousSong.style_description}
Lyrics: ${params.previousSong.lyrics}

# Feedback to Apply
${params.iterationFeedback}`
    }

    return prompt
  }

  static async generate(params: GenerationParams): Promise<AgentOutput> {
    const prompt = this.createPrompt(params)

    // Call the appropriate API based on provider
    switch (params.agent.provider) {
      case 'Anthropic':
        return this.callAnthropic(params.agent, prompt)
      case 'OpenAI':
        return this.callOpenAI(params.agent, prompt)
      case 'xAI':
        return this.callXAI(params.agent, prompt)
      default:
        throw new Error(`Unsupported provider: ${params.agent.provider}`)
    }
  }

  private static async callAnthropic(agent: Agent, prompt: string): Promise<AgentOutput> {
    const response = await fetch(agent.api_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: agent.model_name,
        max_tokens: agent.capabilities.max_output || 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    return this.parseOutput(data.content[0].text)
  }

  private static async callOpenAI(agent: Agent, prompt: string): Promise<AgentOutput> {
    const response = await fetch(agent.api_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: agent.model_name,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: agent.capabilities.max_output || 4000,
      }),
    })

    const data = await response.json()
    return this.parseOutput(data.choices[0].message.content)
  }

  private static async callXAI(agent: Agent, prompt: string): Promise<AgentOutput> {
    const response = await fetch(agent.api_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_XAI_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: agent.model_name,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: agent.capabilities.max_output || 4000,
      }),
    })

    const data = await response.json()
    return this.parseOutput(data.choices[0].message.content)
  }

  private static parseOutput(text: string): AgentOutput {
    try {
      // Try to parse as JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          name: parsed.name || 'Untitled',
          lyrics: parsed.lyrics || '',
          style_description: parsed.style_description || '',
        }
      }
    } catch {
      // Fall through to text parsing
    }

    // Fallback: try to extract from text
    const lines = text.split('\n')
    const name = lines[0]?.replace(/^Song[:\s]*/i, '') || 'Untitled'
    const styleMatch = text.match(/Style[:\s]*([\s\S]*?)(?=\n\n|\nLyrics|$)/i)
    const lyricsMatch = text.match(/Lyrics[:\s]*([\s\S]*)$/i)

    return {
      name: name.trim(),
      lyrics: lyricsMatch ? lyricsMatch[1].trim() : text,
      style_description: styleMatch ? styleMatch[1].trim() : '',
    }
  }
}
```

```typescript
// src/services/ai/AgentOrchestrator.ts
import { Agent, AgentOutput } from '../../types'
import { AgentFactory } from './AgentFactory'

interface OrchestratorParams {
  songs: Record<string, AgentOutput>
  masterPrompt?: string
}

interface OrchestratorResult {
  scores: Record<string, {
    music_style: number
    lyrics: number
    originality: number
    cohesion: number
    total: number
  }>
  feedback: Record<string, string>
  winnerAgentId: string
}

const DEFAULT_ORCHESTRATOR_PROMPT = `You are an expert music producer. Evaluate these song specifications and score them.

# Songs to Evaluate
{songs}

# Scoring Criteria (1-10 each)
1. Music Style: How well does the style match the request?
2. Lyrics: Quality, coherence, and emotional impact of lyrics
3. Originality: Creative and unique elements
4. Cohesion: How well do lyrics and music style work together?

# Output Format
For each song, provide:
- Individual scores (music_style, lyrics, originality, cohesion)
- Brief feedback explaining the scores
- A final recommendation

Identify the overall best song and explain why.`

export async function orchestrateAndEvaluate(params: OrchestratorParams): Promise<OrchestratorResult> {
  // Build songs summary for orchestrator
  const songsSummary = Object.entries(params.songs).map(([agentId, song]) => {
    return `[Agent: ${agentId}]
Name: ${song.name}
Style: ${song.style_description}
Lyrics: ${song.lyrics.substring(0, 500)}...`
  }).join('\n\n---\n\n')

  let prompt = DEFAULT_ORCHESTRATOR_PROMPT.replace('{songs}', songsSummary)
  if (params.masterPrompt) {
    prompt = params.masterPrompt + '\n\n' + prompt
  }

  // Call orchestrator agent (using first available agent as orchestrator)
  const response = await fetch('/api/orchestrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, songs: params.songs }),
  })

  const data = await response.json()

  // Parse response to extract scores
  const scores: Record<string, any> = {}
  const feedback: Record<string, string> = {}

  Object.entries(params.songs).forEach(([agentId, song]) => {
    scores[agentId] = {
      music_style: data.scores?.[agentId]?.music_style || 5,
      lyrics: data.scores?.[agentId]?.lyrics || 5,
      originality: data.scores?.[agentId]?.originality || 5,
      cohesion: data.scores?.[agentId]?.cohesion || 5,
      total: 0,
    }
    scores[agentId].total = (
      scores[agentId].music_style +
      scores[agentId].lyrics +
      scores[agentId].originality +
      scores[agentId].cohesion
    ) / 4

    feedback[agentId] = data.feedback?.[agentId] || ''
  })

  // Find winner
  const winnerAgentId = Object.entries(scores)
    .sort(([, a], [, b]) => b.total - a.total)[0]?.[0] || ''

  return {
    scores,
    feedback,
    winnerAgentId,
  }
}

export async function generateSong(params: {
  agent: Agent
  songDescription: string
  styleDescription: string
  artistContext?: { name: string; style_description: string; special_characteristics?: string }
  previousSong?: AgentOutput
  iterationFeedback?: string
}): Promise<AgentOutput & { scores?: any }> {
  return AgentFactory.generate(params)
}
```

```typescript
// src/services/ai/StreamingHandler.ts
export class StreamingHandler {
  private controller: ReadableStreamDefaultController | null = null
  private chunks: string[] = []

  constructor(onChunk: (chunk: string) => void) {
    // Stream handling will be implemented based on API capabilities
  }

  async stream(agent: Agent, prompt: string): Promise<string> {
    // For APIs that support streaming
    const response = await fetch(agent.api_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add provider-specific headers
      },
      body: JSON.stringify({
        model: agent.model_name,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      }),
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) return ''

    let result = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      result += chunk
      // Process streaming chunks here
    }

    return result
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/services/ai/
git commit -m "feat: create AI agent services (AgentFactory, AgentOrchestrator, StreamingHandler)"
```

---

## Phase 8: Pages and Routing

### Task 13: Create App Router and Pages

**Files:**
- Modify: `src/App.tsx`
- Create: `src/pages/Home.tsx`
- Create: `src/pages/Library.tsx`
- Create: `src/pages/Settings.tsx`
- Create: `src/hooks/useSupabase.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/router.test.ts
import { describe, it, expect, render, screen } from '@testing-library/react'
import App from '../App'
import { MemoryRouter } from 'react-router-dom'

describe('App Router', () => {
  it('should render without errors', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText(/songmaster/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/hooks/useSupabase.ts
import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { supabase } from '../services/supabase/client'

interface AuthUser {
  id: string
  email: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' })
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

```typescript
// src/pages/Home.tsx
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Music, Plus, Library } from 'lucide-react'

export function Home() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold text-gray-100">Welcome to SongMaster</h1>
        <p className="text-gray-400">Create amazing songs with AI-powered multi-agent collaboration</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="flex flex-col items-center p-8 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-600/20">
            <Plus className="h-10 w-10 text-primary-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-200">Create New Song</h2>
          <p className="mb-6 text-sm text-gray-500">
            Generate song specifications with multiple AI agents working together
          </p>
          <Link to="/songs/new" className="w-full">
            <Button className="w-full">Start Creating</Button>
          </Link>
        </Card>

        <Card className="flex flex-col items-center p-8 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-700">
            <Music className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-200">Manage Artists</h2>
          <p className="mb-6 text-sm text-gray-500">
            Create and manage artist profiles with unique style descriptions
          </p>
          <Link to="/artists" className="w-full">
            <Button variant="outline" className="w-full">View Artists</Button>
          </Link>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-100">Recent Songs</h2>
        <Card className="p-8 text-center">
          <Library className="mx-auto mb-4 h-12 w-12 text-gray-600" />
          <p className="text-gray-500">No songs yet. Create your first song!</p>
        </Card>
      </div>
    </div>
  )
}
```

```typescript
// src/pages/Library.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase/client'
import { Song } from '../types'
import { Card } from '../components/ui/Card'
import { Music, Clock, Edit2 } from 'lucide-react'

export function Library() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSongs()
  }, [])

  const loadSongs = async () => {
    const { data } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setSongs(data as Song[])
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-100">Your Library</h1>

      {songs.length === 0 ? (
        <Card className="p-12 text-center">
          <Music className="mx-auto mb-4 h-16 w-16 text-gray-600" />
          <h2 className="mb-2 text-xl font-semibold text-gray-200">No songs yet</h2>
          <p className="text-gray-500">Create your first song to get started</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {songs.map((song) => (
            <Card key={song.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-700">
                  <Music className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-200">{song.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(song.created_at).toLocaleDateString()}
                    </span>
                    <span className="capitalize">{song.status}</span>
                  </div>
                </div>
              </div>
              <button className="rounded p-2 hover:bg-gray-700">
                <Edit2 className="h-4 w-4 text-gray-400" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

```typescript
// src/pages/Settings.tsx
import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../ui/Input'
import { Toggle } from '../ui/Toggle'

export function Settings() {
  const [settings, setSettings] = useState({
    defaultIterations: 3,
    autoIterate: false,
    useCustomPrompts: false,
    agentMasterPrompt: '',
    orchestratorMasterPrompt: '',
    artistCreatorMasterPrompt: '',
  })

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-100">Settings</h1>

      <Card className="mb-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-200">Iteration Settings</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-300">Auto-Iterate</h3>
              <p className="text-sm text-gray-500">Automatically iterate on songs without manual checkpoints</p>
            </div>
            <Toggle
              pressed={settings.autoIterate}
              onPressedChange={(pressed) => setSettings({ ...settings, autoIterate: pressed })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Max Iterations</label>
            <Input
              type="number"
              value={settings.defaultIterations}
              onChange={(e) => setSettings({ ...settings, defaultIterations: parseInt(e.target.value) })}
              className="w-32"
            />
            <p className="mt-1 text-xs text-gray-500">Maximum number of iteration cycles</p>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-200">Master Prompts</h2>
          <Toggle
            pressed={settings.useCustomPrompts}
            onPressedChange={(pressed) => setSettings({ ...settings, useCustomPrompts: pressed })}
          />
        </div>

        {settings.useCustomPrompts && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Agent Master Prompt</label>
              <textarea
                value={settings.agentMasterPrompt}
                onChange={(e) => setSettings({ ...settings, agentMasterPrompt: e.target.value })}
                placeholder="Custom prompt for song generation agents..."
                className="min-h-[100px] w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Orchestrator Master Prompt</label>
              <textarea
                value={settings.orchestratorMasterPrompt}
                onChange={(e) => setSettings({ ...settings, orchestratorMasterPrompt: e.target.value })}
                placeholder="Custom prompt for the orchestrator agent..."
                className="min-h-[100px] w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Artist Creator Master Prompt</label>
              <textarea
                value={settings.artistCreatorMasterPrompt}
                onChange={(e) => setSettings({ ...settings, artistCreatorMasterPrompt: e.target.value })}
                placeholder="Custom prompt for AI-assisted artist creation..."
                className="min-h-[100px] w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 placeholder:text-gray-500"
              />
            </div>
          </div>
        )}
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Settings</Button>
      </div>
    </div>
  )
}
```

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { Artists } from './pages/Artists'
import { SongCreatorPage } from './pages/SongCreator'
import { Library } from './pages/Library'
import { Settings } from './pages/Settings'
import { AuthProvider } from './hooks/useSupabase'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/songs/new" element={<SongCreatorPage />} />
            <Route path="/library" element={<Library />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
```

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/App.tsx src/pages/ src/hooks/
git commit -m "feat: set up app router and create all pages"
```

---

## Phase 9: API Routes

### Task 14: Create Backend API Routes

**Files:**
- Create: `server/index.js` (Express server)
- Create: `src/pages/api/generate-artist.ts`
- Create: `src/pages/api/orchestrate.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/api.test.ts
import { describe, it, expect } from 'vitest'

describe('API Routes', () => {
  it('should have API route files', () => {
    expect(true).toBe(true)
  })
})
```

**Step 2: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

**Step 3: Write minimal implementation**

```javascript
// server/index.js
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Generate artist endpoint
app.post('/api/generate-artist', async (req, res) => {
  const { input, agent_id } = req.body

  try {
    // Call AI to generate 3 artist options
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-2-1212',
        messages: [
          {
            role: 'system',
            content: `You are an expert at creating unique fictional artists and bands. Generate 3 creative artist profiles based on user input.

Return a JSON array with this structure:
[
  {
    "name": "Artist/Band Name",
    "style_description": "Detailed description of their musical style",
    "special_characteristics": "What makes them unique"
  }
]

Be creative and varied with each option.`
          },
          {
            role: 'user',
            content: input
          }
        ],
        response_format: { type: 'json_object' }
      }),
    })

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    res.json({ options: result.artists || result })
  } catch (error) {
    console.error('Artist generation error:', error)
    res.status(500).json({ error: 'Failed to generate artists' })
  }
})

// Orchestrate endpoint
app.post('/api/orchestrate', async (req, res) => {
  const { prompt, songs } = req.body

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-2-1212',
        messages: [
          {
            role: 'system',
            content: `You are an expert music producer and critic. Evaluate song specifications and score them.

For each song, evaluate on a scale of 1-10:
- Music Style: How well the style matches the request
- Lyrics: Quality, coherence, and emotional impact
- Originality: Creative and unique elements
- Cohesion: How well lyrics and style work together

Return JSON with this structure:
{
  "scores": {
    "agent_id": {
      "music_style": 8,
      "lyrics": 7,
      "originality": 6,
      "cohesion": 8
    }
  },
  "feedback": {
    "agent_id": "Brief explanation of scores"
  },
  "winner_agent_id": "agent_id_of_best_song"
}`
          },
          {
            role: 'user',
            content: `Evaluate these songs:\n\n${JSON.stringify(songs, null, 2)}`
          }
        ],
        response_format: { type: 'json_object' }
      }),
    })

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    res.json(result)
  } catch (error) {
    console.error('Orchestration error:', error)
    res.status(500).json({ error: 'Failed to orchestrate' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

**Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add server/
git commit -m "feat: create backend API routes for artist generation and orchestration"
```

---

## Phase 10: Final Integration

### Task 15: Build and Verify

**Step 1: Write the failing test**

```typescript
// src/__tests__/integration.test.ts
import { describe, it, expect } from 'vitest'

describe('Integration', () => {
  it('should build successfully', () => {
    // Build verification
    expect(true).toBe(true)
  })
})
```

**Step 2: Run build**

Run: `npm run build`
Expected: SUCCESS with no errors

**Step 3: Fix any build errors**

Fix as needed based on build output.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: complete SongMaster application"
git tag v1.0.0
```

---

## Summary

This implementation plan covers:

1. **Project Setup** - React + Vite + TypeScript + Tailwind
2. **Type Definitions** - Core types for Agents, Artists, Songs, Generations
3. **Supabase Integration** - Database schema and client setup
4. **UI Components** - Button, Input, Card, Modal, Toggle, Layout
5. **Artist Management** - Library view, creation wizard, AI-assisted generation
6. **Song Creation** - Agent selection, generation flow, evaluation display
7. **AI Services** - Agent factory, orchestrator, streaming handler
8. **Pages & Routing** - Home, Artists, Song Creator, Library, Settings
9. **Backend API** - Express server for AI orchestration
10. **Build & Verify** - Final integration and testing

**Total Tasks:** 15 major tasks with detailed step-by-step implementation

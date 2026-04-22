import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded font-heading tracking-widest uppercase transition-all duration-150 ease-bolt-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 transform active:scale-98',
  {
    variants: {
      variant: {
        // --- STANDARD PRIMITIVES ---
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',

        // --- RARITY VARIANTS ---
        common: 'bg-rarity-common text-black border border-rarity-common/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:brightness-110',
        uncommon: 'bg-rarity-uncommon text-black border border-rarity-uncommon/20 hover:shadow-[0_0_20px_rgba(30,255,0,0.4)] hover:brightness-110',
        rare: 'bg-rarity-rare text-white border border-rarity-rare/20 hover:shadow-[0_0_20px_rgba(0,112,221,0.4)] hover:brightness-110',
        epic: 'bg-rarity-epic text-white border border-rarity-epic/20 hover:shadow-[0_0_20px_rgba(163,53,238,0.4)] hover:brightness-110',
        legendary: 'bg-rarity-legendary text-white border border-rarity-legendary/20 hover:shadow-[0_0_20px_rgba(255,128,0,0.4)] hover:brightness-110',
        artifact: 'bg-rarity-artifact text-black border border-rarity-artifact/20 hover:shadow-[0_0_20px_rgba(230,204,128,0.4)] hover:brightness-110',

        // --- FORGE SPECIFIC (Sci-Fi) ---
        plasma:
          'bg-rarity-legendary text-white border border-rarity-legendary/20 hover:shadow-[0_0_20px_rgba(255,128,0,0.4)] hover:brightness-110',
        magma:
          'bg-rarity-legendary text-white border border-rarity-legendary/20 hover:shadow-[0_0_20px_rgba(255,128,0,0.4)] hover:brightness-110', // Legacy mapping

        pulse:
          'bg-rarity-rare text-white border border-rarity-rare/20 hover:shadow-[0_0_20px_rgba(0,112,221,0.4)] hover:brightness-110',
        rune: 'bg-rarity-rare text-white border border-rarity-rare/20 hover:shadow-[0_0_20px_rgba(0,112,221,0.4)] hover:brightness-110', // Legacy mapping

        gold: 'bg-rarity-gold text-black border border-rarity-gold/20 hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:brightness-110',
        cyan: 'bg-cyan-600 text-white border border-cyan-400/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110',
        venom:
          'bg-rarity-uncommon text-black border border-rarity-uncommon/20 hover:shadow-[0_0_20px_rgba(30,255,0,0.4)] hover:brightness-110',
        beast:
          'bg-rarity-legendary text-white border border-rarity-legendary/20 hover:shadow-[0_0_20px_rgba(255,128,0,0.4)] hover:border-rarity-legendary/50',
      },
      size: {
        default: 'h-10 px-6 py-2 text-sm',
        sm: 'h-9 rounded px-4 text-xs',
        lg: 'h-12 rounded px-8 text-base',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
);

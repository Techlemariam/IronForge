import { cva } from "class-variance-authority";

export const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded font-heading tracking-widest uppercase transition-all duration-150 ease-bolt-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 transform active:scale-98",
    {
        variants: {
            variant: {
                // --- STANDARD PRIMITIVES ---
                default: "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90",
                outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",

                // --- FORGE SPECIFIC (Sci-Fi) ---
                plasma: "bg-gradient-to-r from-orange-600 to-orange-500 text-white border border-orange-400/20 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:brightness-110",
                magma: "bg-gradient-to-r from-orange-600 to-orange-500 text-white border border-orange-400/20 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:brightness-110", // Legacy mapping

                pulse: "bg-gradient-to-r from-sky-600 to-sky-500 text-white border border-sky-400/20 hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:brightness-110",
                rune: "bg-gradient-to-r from-sky-600 to-sky-500 text-white border border-sky-400/20 hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:brightness-110", // Legacy mapping

                gold: "bg-gradient-to-r from-yellow-600 to-yellow-500 text-white border border-yellow-400/20 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:brightness-110",
                cyan: "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white border border-cyan-400/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110",
                venom: "bg-gradient-to-r from-green-600 to-green-500 text-white border border-green-400/20 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:brightness-110",
                beast: "bg-gradient-to-r from-red-900 to-red-800 text-white border border-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:border-red-500/50",
            },
            size: {
                default: "h-10 px-6 py-2 text-sm",
                sm: "h-9 rounded px-4 text-xs",
                lg: "h-12 rounded px-8 text-base",
                icon: "h-10 w-10",
            },
            fullWidth: {
                true: "w-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            fullWidth: false,
        },
    }
);

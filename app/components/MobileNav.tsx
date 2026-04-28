"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

type MobileNavProps = {
  children: React.ReactNode;
};

const MobileNav = ({ children }: MobileNavProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex items-center gap-2 md:hidden">
      

      <button
        type="button"
        className="btn flex items-center justify-center p-3"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Zapri meni" : "Odpri meni"}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute right-0 top-full mt-2 flex min-w-56 flex-col gap-3 rounded-lg bg-foreground p-4 shadow-2xl"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default MobileNav;

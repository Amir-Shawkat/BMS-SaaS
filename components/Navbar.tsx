'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";


const navItems = [
    {label: "Library", href: "/"},
    {label: "Add New", href: "/books/new"},
    {label: "Pricing", href: "/subscriptions"},
]

const Navbar = () => {
    const pathName = usePathname();



    const { user, isSignedIn, isLoaded } = useUser();

  // Don't render auth buttons until Clerk is loaded
    if (!isLoaded) return null;
  
    
    
    return (
        <header className="w-full fixed z-50 bg-(--bg-primary)">
            <div className="wrapper navbar-height py-4 flex justify-between items center">
                <Link href="/" className="flex gap-0.5 items-center">
                    <Image src="/assets/logo.png" alt="Bookified Logo" width={42} height={26} loading="eager" />
                    <span className="logo-text">Bookified</span>
                </Link>

                <nav className="w-fit flex gap-7.5 items-center">
                    {navItems.map(({label, href}) => {
                        const isActive = pathName === href || (href !== "/" && pathName?.startsWith(href));

                        return (
                            <Link
                                key={label}
                                href={href}
                                className={cn('nav-link-base', isActive ? 'nav-link-active' : 'text-black hover:opacity-70')}
                            >
                                {label}
                            </Link>

                        )
                    })}

                    <div className="flex gap-7.5 items-center">
                        {/* If the user is SIGNED IN */}
                        {isSignedIn ? (
                            <div className="nav-user-link">
                                <UserButton />
                                
                                {user?.firstName && (
                                    <Link href="/subscriptions" className="nav-user-name">
                                        {user.firstName}
                                    </Link>
                                )}
                            </div>
                        ) : (
                            /* If the user is SIGNED OUT */
                            <SignInButton mode="modal">
                                <button type="button" className="text-black font-semibold hover:opacity-70">
                                    Sign In
                                </button>
                            </SignInButton>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;

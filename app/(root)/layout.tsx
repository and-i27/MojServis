import NavBar from "@/components/ui/NavBar";
;

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <main className="h-screen justify-between flex flex-col">
            <NavBar />
            
            {children}

        </main>
    )
}

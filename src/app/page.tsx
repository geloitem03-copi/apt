import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Building2, House } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-xl font-bold">RentalApp</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your <span className="text-primary">Home</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse available apartments and rooms for rent
            </p>
          </div>

          <div className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                className="pl-12"
                placeholder="Search by name or location..."
                type="text"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/apartments/b8f81390-6ac4-4797-8b40-5f074b6d2493">
              <div className="border rounded-xl overflow-hidden hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group h-full flex flex-col">
                <div className="h-48 bg-secondary/20 flex items-center justify-center">
                  <Building2 className="h-20 w-20 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    tinungan
                  </h3>
                  <div className="flex items-start gap-2 mt-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      mangahan apartment
                    </p>
                  </div>
                  <p className="text-muted-foreground text-sm mt-3 line-clamp-2 flex-1">
                    dsvdfadffd
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <House className="h-4 w-4" />
                        <span>1 floors</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span>2 available</span>
                      </div>
                    </div>
                    <span className="text-primary font-medium">From ₱4,000/mo</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © 2025 RentalApp. Built for the Philippine rental market.
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

      <main className="flex-1 flex items-center justify-center">
        <div className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Rental Management Made Simple</h2>
            <p className="text-xl text-muted-foreground">
              The modernSaaS platform for landlords and tenants in the Philippines
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>For Landlords</CardTitle>
                <CardDescription>Manage properties, units, and tenants</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Create and manage properties</li>
                  <li>• Track units and occupancy</li>
                  <li>• View payments online</li>
                  <li>• Assign tenants to units</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>For Tenants</CardTitle>
                <CardDescription>View rent, bills, and make payments</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• View assigned unit</li>
                  <li>• Track rent and bills</li>
                  <li>• Upload payment proof</li>
                  <li>• Payment history</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low Cost</CardTitle>
                <CardDescription>Optimized for Philippine market</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Free tier available</li>
                  <li>• No credit card needed</li>
                  <li>• Scalable pricing</li>
                  <li>• Cloud-based (no servers)</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/register">
              <Button size="lg">Start Free Today</Button>
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